/* Ligne B · app logic. Content lives in js/data/*.js */
(function(){
"use strict";


/* ---------- storage ---------- */
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
const hot=(window.claude&&window.claude.hot)||null;
const hotData=(hot&&hot.data)||{};
const state={
  cleared:new Set(hotData.cleared||store.get("frB.cleared",[])),
  stats:hotData.stats||store.get("frB.stats",{}),          // {stationId:{a:attempts,c:correct}}
  mistakes:new Set(hotData.mistakes||store.get("frB.mistakes",[])) // "bank:index"
};
/* ---------- day numbers (local calendar days) ---------- */
const dayNum=(t=new Date())=>Math.floor(Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())/864e5);
const dayLabel=d=>{const n=d-dayNum();return n<=0?"today":n===1?"tomorrow":`in ${n} days`};
/* mistakes come back on a schedule: now → +1 day → +3 days, then they're done */
const mistSched=store.get("lb-mist",{});
state.mistakes.forEach(id=>{if(!mistSched[id])mistSched[id]={b:0,d:dayNum()}});
const MIST_GAP=[1,3];
const mistDue=()=>[...state.mistakes].filter(id=>(mistSched[id]||{d:0}).d<=dayNum());
const save=()=>{store.set("lb-mist",mistSched);store.set("frB.cleared",[...state.cleared]);store.set("frB.stats",state.stats);store.set("frB.mistakes",[...state.mistakes])};
try{hot&&hot.snapshot(()=>({cleared:[...state.cleared],stats:state.stats,mistakes:[...state.mistakes]}))}catch(e){}
const acc=k=>{const s=state.stats[k];return s&&s.a?s.c/s.a:null};

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fr=t=>`<button class="fr" data-say="${esc(t)}">${esc(t)}</button>`;
let toastT;
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("show"),2800)}
function speak(text,rate){
  try{
    const s=window.speechSynthesis;if(!s||!window.SpeechSynthesisUtterance)throw 0;
    s.cancel();
    const u=new SpeechSynthesisUtterance(text.replace(/[«»…→]/g," ").replace(/\(.*?\)/g," "));
    u.lang="fr-FR";u.rate=rate||.9;
    const v=s.getVoices().find(v=>/^fr(-|_|$)/i.test(v.lang));if(v)u.voice=v;
    s.speak(u);
  }catch(e){toast("Audio isn't available in this browser.")}
}
try{window.speechSynthesis&&window.speechSynthesis.getVoices()}catch(e){}
document.addEventListener("click",e=>{const b=e.target.closest("[data-say]");if(b)speak(b.dataset.say||b.textContent)});
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

/* ---------- English layer ---------- */
function addGlosses(root){
  (root||document).querySelectorAll("button.fr").forEach(b=>{
    if(b.dataset.glossed)return;const en=EN[b.textContent.trim()];if(!en)return;
    b.dataset.glossed="1";b.insertAdjacentHTML("afterend",`<span class="gloss sent">(${esc(en)})</span>`);
  });
}
function setEnglish(on){
  document.body.classList.toggle("no-en",!on);
  const t=$("#enToggle");t.setAttribute("aria-pressed",on);t.textContent="English: "+(on?"on":"off");
  store.set("frB.en",on);
}

/* ---------- progress ---------- */
let hereId=null;
function renderProgress(){
  $("#route").innerHTML=STATIONS.map((s,i)=>`<li style="--c:${s.c}" class="${state.cleared.has(s.id)?"done":""}"><a href="#${s.id}"><span class="dot">${state.cleared.has(s.id)?"✓":i+1}</span><span class="lbl">${s.name}</span><span class="sub">${s.sub}</span><span class="lvl">${s.lv}</span>${acc(s.id)!==null?`<span class="m"><b>${Math.round(acc(s.id)*100)}%</b> of ${state.stats[s.id].a}</span>`:""}</a></li>`).join("");
  $("#stTotal").textContent=STATIONS.length;
  const en=$("#errN");if(en)en.textContent=mistDue().length;
  const cn=$("#cardsN");if(cn&&typeof srsCounts==="function")cn.textContent=srsCounts().total;
  const hint=$("#hubHint");
  if(hint){
    const tried=STATIONS.filter(s=>state.stats[s.id]&&state.stats[s.id].a>=3).sort((a,b)=>acc(a.id)-acc(b.id));
    const fresh=STATIONS.find(s=>BANKS[s.id]&&!state.stats[s.id]);
    hint.innerHTML=tried.length&&acc(tried[0].id)<.8?`Weakest so far: <a href="#${tried[0].id}">${tried[0].name}</a> (${Math.round(acc(tried[0].id)*100)}%). The daily mix leans towards it.`:
      fresh?`Next new ground: <a href="#${fresh.id}">${fresh.name}</a>. The daily mix favours stations you haven't tried.`:"Every station tried. Keep the mix and your mistakes list going daily.";
  }
  $("#stops").innerHTML=STATIONS.map((s,i)=>`<li><a href="#${s.id}" style="--c:${s.c}" class="${state.cleared.has(s.id)?"done":""}${s.id===hereId?" here":""}" data-id="${s.id}" title="${i+1}. ${s.name}"><i></i><span>${s.name}</span></a></li>`).join("");
  $("#clearedCount").textContent=state.cleared.size;
  renderMobileNav();
  if(typeof renderToday==="function"&&$("#tsDone"))try{renderToday()}catch(e){}
  document.querySelectorAll(".clear-btn").forEach(b=>{const on=state.cleared.has(b.dataset.station);b.setAttribute("aria-pressed",on);b.textContent=on?"✓ Station cleared":"Mark station cleared"});
}
function setCleared(id,on){on?state.cleared.add(id):state.cleared.delete(id);save();renderProgress()}
document.addEventListener("click",e=>{
  const b=e.target.closest(".clear-btn");if(!b)return;
  const id=b.dataset.station;setCleared(id,!state.cleared.has(id));
  const n=STATIONS.length;
  if(state.cleared.has(id))toast(state.cleared.size===n?`Ligne B complète ! All ${n} stations cleared.`:`Station cleared · ${state.cleared.size} of ${n}`);
});
if("IntersectionObserver" in window){
  const io=new IntersectionObserver(ents=>ents.forEach(en=>{if(en.isIntersecting){hereId=en.target.id;document.querySelectorAll(".stops a").forEach(a=>a.classList.toggle("here",a.dataset.id===hereId));updateNavHere();rememberHere()}}),{rootMargin:"-45% 0px -50% 0px"});
  document.querySelectorAll(".station,#entrainement,header.hero").forEach(s=>io.observe(s));
}

/* ---------- drill engine ---------- */
/* ---------- typed answers ---------- */
const itemOK=store.get("lb-itemok",{});                    // "bank:index" -> times answered right
let ansMode=store.get("lb-ansmode","auto");
const TYPE_ACCENTS=["é","è","ê","à","â","ç","ù","û","î","ô","ï","œ"];
const normAns=s=>String(s).normalize("NFC").toLowerCase().replace(/[’`]/g,"'").replace(/\s+([?!:;])/g,"$1").replace(/\s+/g," ").replace(/[.?!\s]+$/,"").trim();
const noAcc=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
function canType(it){
  if(it.type==="typed")return true;
  if(!it.q.includes("___")||/means|which is/i.test(it.q)||["vocabulaire","expressions","expressionsc","frequents","dalf"].includes(it.k))return false;
  return it.o[0]!=="(nothing)"&&it.o[0].length<=24;
}
function useTyped(it){
  if(it.type==="typed")return true;
  if(!canType(it)||ansMode==="mc")return false;
  return ansMode==="typed"||(itemOK[it.k+":"+it.i]||0)>=2;
}
function checkTyped(it,val){
  const answers=it.type==="typed"?it.a:[it.o[0]];
  const v=normAns(val);
  if(answers.some(a=>normAns(a)===v))return "right";
  if(v&&answers.some(a=>noAcc(normAns(a))===noAcc(v)))return "accent";
  return "wrong";
}

const MOBILE_Q=matchMedia("(max-width:700px)");
window.LigneB={checkTyped,normAns};   // used by tests/run.js
function drill(el,getItems,opts={}){
  let items,idx,score,answered;
  function start(){items=getItems();idx=0;score=0;if(!items.length){el.innerHTML=opts.empty||"<p>Nothing to practise here yet.</p>";return}show()}
  function show(){
    if(idx>=items.length){
      const pass=opts.pass?score>=opts.pass:score>=Math.ceil(items.length*.7);
      el.innerHTML=`<div class="score">${score} / ${items.length}</div>
        <p style="margin-top:8px">${opts.doneText?opts.doneText(score,items.length):pass?"Solid. This structure is yours.":"Read the cards above once more, then go again. The questions reshuffle. Missed ones are saved to <b>Mes erreurs</b>."}</p>
        <button class="btn solid" type="button" data-act="again">Go again</button>`;
      opts.onDone&&opts.onDone(score,items.length);
      return;
    }
    const it=items[idx];answered=false;
    const qHtml=esc(it.q).replace("___",'<span class="gap">…</span>');
    el.innerHTML=`<div class="drill-top"><span>Question ${idx+1} of ${items.length}${it.tag?` · ${esc(it.tag)}`:""}</span><span>${score} correct</span></div>
      <div class="bar"><i style="width:${idx/items.length*100}%"></i></div>
      <p class="drill-q" style="margin-top:12px">${qHtml}</p>
      ${useTyped(it)?`<div class="typed"><input type="text" class="typed-in" id="ti-${el.dataset.drill||"hub"}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type your answer"><button class="btn solid" type="button" data-act="check">Check</button></div>
      <div class="accents" data-for="ti-${el.dataset.drill||"hub"}">${TYPE_ACCENTS.map(a=>`<button class="acc" type="button" tabindex="-1">${a}</button>`).join("")}</div>`
      :`<div class="opts">${shuffle(it.o.map((o,j)=>({o,j}))).map(x=>`<button class="opt" type="button" data-j="${x.j}">${esc(x.o)}</button>`).join("")}</div>`}
      ${it.en?`<button class="btn tr-btn en-only" type="button" data-act="tr">Translate the sentence</button><p class="gloss block" data-tr hidden>${esc(it.en)}</p>`:""}
      <div class="feedback" aria-live="polite"></div>`;
    const ti=el.querySelector(".typed-in");if(ti&&!MOBILE_Q.matches&&el.dataset.focus)ti.focus({preventScroll:true});
  }
  el.addEventListener("click",e=>{
    if(e.target.closest('[data-act="again"]')){start();return}
    if(e.target.closest('[data-act="next"]')){idx++;show();return}
    if(e.target.closest('[data-act="tr"]')){const p=el.querySelector("[data-tr]");if(p){p.hidden=false;e.target.closest('[data-act="tr"]').remove()}return}
    const chk=e.target.closest('[data-act="check"]');
    const b=e.target.closest(".opt");if((!b&&!chk)||answered)return;
    const it=items[idx];let ok,note="";
    if(chk){
      const inp=el.querySelector(".typed-in");if(!inp.value.trim()){inp.focus();return}
      const r=checkTyped(it,inp.value);ok=r!=="wrong";inp.disabled=true;chk.disabled=true;
      inp.classList.add(ok?"right":"wrong");
      const ans=it.type==="typed"?it.a[0]:it.o[0];
      note=r==="accent"?`<p class="typed-note">Almost: check the accents. The answer is <b>${esc(ans)}</b>${/[.?!]$/.test(ans)?"":"."}</p>`:r==="wrong"?`<p class="typed-note">You typed <s>${esc(inp.value)}</s>. The answer is <b>${esc(ans)}</b>${/[.?!]$/.test(ans)?"":"."}</p>`:"";
    }else{ok=+b.dataset.j===0}
    answered=true;if(ok)score++;
    record(it,ok);
    if(ok){itemOK[it.k+":"+it.i]=(itemOK[it.k+":"+it.i]||0)+1;store.set("lb-itemok",itemOK)}
    if(b)el.querySelectorAll(".opt").forEach(o=>{o.disabled=true;if(+o.dataset.j===0)o.classList.add("right");else if(o===b)o.classList.add("wrong")});
    const full=it.say||(it.type==="typed"?(/[.?!]$/.test(it.a[0])?it.a[0]:""):"")||((it.type!=="typed"&&it.q.includes("___")&&!/[«→]|I want/.test(it.q))?it.q.replace(/\s*\(.*?\)/g,"").replace("___",it.o[0]==="(nothing)"?"":it.o[0]).replace(/\s{2,}/g," ").replace(/ ([.,])/g,"$1").replace(/' /g,"'"):"");
    const trBtn=el.querySelector('[data-act="tr"]'),trP=el.querySelector("[data-tr]");if(trBtn)trBtn.remove();if(trP)trP.remove();
    el.querySelector(".feedback").innerHTML=`${note}<span class="verdict ${ok?"y":"n"}">${ok?"Correct":"Not quite"}</span>${esc(it.e)}
      ${full?`<div style="margin-top:6px">${fr(full)}</div>`:""}
      ${it.en?`<p class="gloss block">${esc(it.en)}</p>`:""}
      <div class="drill-next"><button class="btn solid" type="button" data-act="next">${idx+1<items.length?"Next":"See score"}</button></div>`;
    el.querySelector('[data-act="next"]').focus({preventScroll:true});
  });
  el.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.classList.contains("typed-in")){e.preventDefault();const c=el.querySelector('[data-act="check"]');if(c&&!c.disabled)c.click();else{const n=el.querySelector('[data-act="next"]');if(n)n.click()}}});
  start();
}
function record(it,ok){
  const s=state.stats[it.k]||(state.stats[it.k]={a:0,c:0});s.a++;if(ok)s.c++;
  if(it.noMist){save();renderProgress();return}
  const id=it.k+":"+it.i,today=dayNum();
  if(!ok){state.mistakes.add(id);mistSched[id]={b:0,d:today}}
  else if(state.mistakes.has(id)){
    const m=mistSched[id]||{b:0,d:today};
    if(m.d<=today){                       // only a due review moves it on
      if(m.b>=MIST_GAP.length){state.mistakes.delete(id);delete mistSched[id]}
      else mistSched[id]={b:m.b+1,d:today+MIST_GAP[m.b]};
    }
  }
  save();renderProgress();
}

/* ---------- generated banks: vocabulary + idioms ---------- */
function pickOthers(all,right,n){return shuffle(all.filter(x=>x!==right)).slice(0,n)}
const VOCAB_ALL=VOCAB.flatMap(g=>g.w.map(w=>({fr:w[0],en:w[1],t:g.t})));
const VOCAB_EN=VOCAB_ALL.map(v=>v.en);
BANKS.vocabulaire=VOCAB_ALL.map(v=>({q:`« ${v.fr} » means…`,o:[v.en,...pickOthers(VOCAB_EN,v.en,2)],e:`Topic: ${v.t}.`,say:v.fr}));
const IDIOM_EN=IDIOMS.map(x=>x[1]);
const IDIOMC_EN=IDIOMS_C.map(x=>x[1]);
BANKS.expressionsc=IDIOMS_C.map(x=>({q:`« ${x[0]} » means…`,o:[x[1],...pickOthers(IDIOMC_EN,x[1],2)],e:`Word for word: "${x[2]}".`,say:x[0]}));
BANKS.expressions=IDIOMS.map(x=>({q:`« ${x[0]} » means…`,o:[x[1],...pickOthers(IDIOM_EN,x[1],2)],e:`Word for word: "${x[2]}".`,say:x[0]}));
/* frequent words: bank, list, known tracking */
const FQ=Object.entries(FREQ).flatMap(([cat,ws])=>ws.map(w=>({fr:w[0],en:w[1],note:w[2]||"",cat})));
STATIONS.find(s=>s.id==="frequents").sub=FQ.length+" core words";
BANKS.frequents=FQ.map(w=>{
  const same=FQ.filter(x=>x.cat===w.cat).map(x=>x.en);
  return {q:`« ${w.fr} » means…`,o:[w.en,...pickOthers(same,w.en,2)],e:w.note?(w.note[0]==="!"?"False friend: "+w.note.slice(1).trim():w.note):`${w.cat}.`,say:w.fr.replace(/\s*\(.*?\)/g,"")};
});
const known=new Set(store.get("frB.known",[]));
const fqUI={cat:"Tout",q:"",hide:false};
const fqNorm=s=>s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
function renderFQ(){
  const q=fqNorm(fqUI.q.trim());
  const cats=Object.keys(FREQ).filter(c=>fqUI.cat==="Tout"||c===fqUI.cat);
  let shown=0;
  $("#fqList").innerHTML=cats.map(c=>{
    const rows=FQ.filter(w=>w.cat===c&&(!fqUI.hide||!known.has(w.fr))&&(!q||fqNorm(w.fr).includes(q)||fqNorm(w.en).includes(q)));
    shown+=rows.length;if(!rows.length)return "";
    const nk=FQ.filter(w=>w.cat===c&&known.has(w.fr)).length,tot=FQ.filter(w=>w.cat===c).length;
    return `<div class="fq-cat">${c} <span>· ${nk} / ${tot} known</span></div><div class="fq-grid">${rows.map(w=>{
      const id="fq-"+FQ.indexOf(w),ff=w.note[0]==="!";
      return `<div class="fq-row${known.has(w.fr)?" known":""}"><input type="checkbox" id="${id}" data-fr="${esc(w.fr)}" ${known.has(w.fr)?"checked":""} aria-label="I know ${esc(w.fr)}">
        <div><div class="w"><button class="fr" data-say="${esc(w.fr.replace(/\s*\(.*?\)/g,""))}">${esc(w.fr)}</button></div>
        <div class="m">${esc(w.en)}</div>${w.note?`<div class="note">${ff?`<span class="ff-tag">False friend</span>${esc(w.note.slice(1).trim())}`:esc(w.note)}</div>`:""}</div></div>`}).join("")}</div>`;
  }).join("");
  $("#fqEmpty").hidden=shown>0;
  $("#fqKnown").textContent=known.size;$("#fqTotal").textContent=FQ.length;$("#fqBar").style.width=(known.size/FQ.length*100)+"%";
}
$("#fqCats").innerHTML=["Tout",...Object.keys(FREQ)].map(c=>`<button class="chip" type="button" data-cat="${c}" aria-pressed="${c==="Tout"}">${c==="Tout"?"All":c}${c==="Tout"?"":` <span class="gloss">${{Verbes:"verbs",Noms:"nouns",Adjectifs:"adjectives",Adverbes:"adverbs",Expressions:"phrases"}[c]}</span>`}</button>`).join("");
$("#fqCats").addEventListener("click",e=>{const c=e.target.closest("[data-cat]");if(!c)return;fqUI.cat=c.dataset.cat;$("#fqCats").querySelectorAll("[data-cat]").forEach(b=>b.setAttribute("aria-pressed",b===c));renderFQ()});
$("#fqSearch").addEventListener("input",e=>{fqUI.q=e.target.value;renderFQ()});
$("#fqHide").addEventListener("change",e=>{fqUI.hide=e.target.checked;renderFQ()});
$("#fqList").addEventListener("change",e=>{
  const c=e.target.closest("input[data-fr]");if(!c)return;
  c.checked?known.add(c.dataset.fr):known.delete(c.dataset.fr);store.set("frB.known",[...known]);
  c.closest(".fq-row").classList.toggle("known",c.checked);
  if(fqUI.hide&&c.checked)setTimeout(renderFQ,350);else{$("#fqKnown").textContent=known.size;$("#fqBar").style.width=(known.size/FQ.length*100)+"%"}
});
renderFQ();

$("#vocabGrid").innerHTML=VOCAB.map(g=>`<div class="card"><h3>${esc(g.t)}</h3><table class="vocab small"><tbody>${g.w.map(w=>`<tr><td>${fr(w[0])}</td><td>${esc(w[1])}</td></tr>`).join("")}</tbody></table></div>`).join("");
$("#idiomGridC").innerHTML=IDIOMS_C.map(x=>`<div class="card idiom"><h3>${fr(x[0])}</h3><p style="margin:4px 0 2px">${esc(x[1])}</p><p class="lit" style="margin:0">literally "${esc(x[2])}"</p></div>`).join("");
$("#idiomGrid").innerHTML=IDIOMS.map(x=>`<div class="card idiom"><h3>${fr(x[0])}</h3><p style="margin:4px 0 2px">${esc(x[1])}</p><p class="lit" style="margin:0">literally "${esc(x[2])}"</p></div>`).join("");

/* ---------- all items ---------- */
const nameOf=k=>(STATIONS.find(s=>s.id===k)||{}).name||k;
const ALL=[];Object.keys(BANKS).forEach(k=>BANKS[k].forEach((q,i)=>ALL.push(Object.assign({k,i,tag:nameOf(k),en:(DRILL_EN[k]||[])[i]||""},q))));
const byId=id=>ALL.find(x=>x.k+":"+x.i===id);

document.querySelectorAll("[data-drill]").forEach(el=>{
  const k=el.dataset.drill;
  if(k==="exam"){
    drill(el,()=>shuffle(ALL.filter(x=>x.k!=="frequents"&&!CIDS.has(x.k))).slice(0,15),{pass:12,onDone:(s)=>{if(s>=12){setCleared("terminus",true);toast(`${s}/15 · Terminus cleared. Félicitations, niveau B en vue !`)}}});
  }else if(k==="examc"){
    drill(el,()=>shuffle(ALL.filter(x=>CIDS.has(x.k))).slice(0,15),{pass:12,onDone:(s)=>{if(s>=12){setCleared("terminusc",true);toast(`${s}/15 · Terminus C cleared. Chapeau bas !`)}}});
  }else if(k==="frequents"){
    drill(el,()=>{const pool=ALL.filter(x=>x.k==="frequents"),fresh=pool.filter(x=>!known.has(FQ[x.i].fr));return shuffle(fresh.length>=15?fresh:pool).slice(0,15)},
      {doneText:(s,n)=>s>=12?"Good. Tick the words you now know in the list above, and the next round will skip them.":"Missed words are saved to My mistakes. Go again for a new set."});
  }else drill(el,()=>shuffle(ALL.filter(x=>x.k===k)));
});

/* daily mix: weight stations by weakness, missed items count double */
function dailyMix(n){
  const w=it=>{const a=acc(it.k);const base=a===null?2.2:1+(1-a)*4;const miss=state.mistakes.has(it.k+":"+it.i);
    // the big word list would swamp the mix: scale it down unless the word was missed
    const bulk=it.k==="frequents"&&!miss?(known.has(FQ[it.i].fr)?0.02:0.12):1;
    // C questions stay rare until you've tried a C station yourself
    const cw=CIDS.has(it.k)&&!miss&&!triedC?0.15:1;
    return base*(miss?2:1)*bulk*cw};
  const triedC=[...CIDS].some(id=>state.stats[id]);
  const pool=ALL.map(it=>({it,w:w(it)})),out=[];
  while(out.length<n&&pool.length){
    const tot=pool.reduce((s,p)=>s+p.w,0);let r=Math.random()*tot,i=0;
    while(i<pool.length-1&&(r-=pool[i].w)>0)i++;
    out.push(pool.splice(i,1)[0].it);
  }
  return out;
}

/* ---------- conjugator ---------- */
const ETRE_V=new Set(["aller","venir","arriver","partir","entrer","sortir","monter","descendre","rester","tomber","retourner","rentrer","passer","naître","mourir","devenir","revenir","repartir"]);
// "~" = prefix before the key (comprendre → com + prendre)
const IRR={
  "être":{ils:"",nous:"ét",fut:"ser",pp:"été",subj:["sois","sois","soit","soyons","soyez","soient"]},
  "avoir":{ils:"",nous:"av",fut:"aur",pp:"eu",subj:["aie","aies","ait","ayons","ayez","aient"]},
  "aller":{ils:"",nous:"all",fut:"ir",pp:"allé",subj:["aille","ailles","aille","allions","alliez","aillent"]},
  "pouvoir":{ils:"",nous:"pouv",fut:"pourr",pp:"pu",subj:["puisse","puisses","puisse","puissions","puissiez","puissent"]},
  "savoir":{ils:"",nous:"sav",fut:"saur",pp:"su",subj:["sache","saches","sache","sachions","sachiez","sachent"]},
  "vouloir":{ils:"",nous:"voul",fut:"voudr",pp:"voulu",subj:["veuille","veuilles","veuille","voulions","vouliez","veuillent"]},
  "devoir":{ils:"doiv",nous:"dev",fut:"devr",pp:"dû"},
  "recevoir":{ils:"reçoiv",nous:"recev",fut:"recevr",pp:"reçu"},
  "voir":{ils:"voi",nous:"voy",fut:"verr",pp:"vu"},
  "croire":{ils:"croi",nous:"croy",fut:"croir",pp:"cru"},
  "boire":{ils:"boiv",nous:"buv",fut:"boir",pp:"bu"},
  "lire":{ils:"lis",nous:"lis",fut:"lir",pp:"lu"},
  "vivre":{ils:"viv",nous:"viv",fut:"vivr",pp:"vécu"},
  "naître":{ils:"naiss",nous:"naiss",fut:"naîtr",pp:"né"},
  "mourir":{ils:"meur",nous:"mour",fut:"mourr",pp:"mort"},
  "courir":{ils:"cour",nous:"cour",fut:"courr",pp:"couru"},
  "partir":{ils:"part",nous:"part",fut:"partir",pp:"parti"},
  "sortir":{ils:"sort",nous:"sort",fut:"sortir",pp:"sorti"},
  "dormir":{ils:"dorm",nous:"dorm",fut:"dormir",pp:"dormi"},
  "sentir":{ils:"sent",nous:"sent",fut:"sentir",pp:"senti"},
  "servir":{ils:"serv",nous:"serv",fut:"servir",pp:"servi"},
  "envoyer":{ils:"envoi",nous:"envoy",fut:"enverr",pp:"envoyé"},
  "faire":{ils:"~fass",nous:"~fais",fut:"~fer",pp:"~fait",subj:["~fasse","~fasses","~fasse","~fassions","~fassiez","~fassent"]},
  "prendre":{ils:"~prenn",nous:"~pren",fut:"~prendr",pp:"~pris"},
  "venir":{ils:"~vienn",nous:"~ven",fut:"~viendr",pp:"~venu"},
  "tenir":{ils:"~tienn",nous:"~ten",fut:"~tiendr",pp:"~tenu"},
  "mettre":{ils:"~mett",nous:"~mett",fut:"~mettr",pp:"~mis"},
  "dire":{ils:"~dis",nous:"~dis",fut:"~dir",pp:"~dit"},
  "crire":{ils:"~criv",nous:"~criv",fut:"~crir",pp:"~crit"},
  "duire":{ils:"~duis",nous:"~duis",fut:"~duir",pp:"~duit"},
  "aître":{ils:"~aiss",nous:"~aiss",fut:"~aîtr",pp:"~u"},
  "vrir":{ils:"~vr",nous:"~vr",fut:"~vrir",pp:"~vert"},
  "frir":{ils:"~fr",nous:"~fr",fut:"~frir",pp:"~fert"}
};
const PFX_OK=new Set(["faire","prendre","venir","tenir","mettre","dire","crire","duire","aître","vrir","frir"]);
const SUBJ_P=["que je","que tu","qu'il","que nous","que vous","qu'ils"];
const P=["je","tu","il","nous","vous","ils"];
const IMP_E=["ais","ais","ait","ions","iez","aient"],FUT_E=["ai","as","a","ons","ez","ont"],SUB_E=["e","es","e","ions","iez","ent"];
const AV_IMP=["avais","avais","avait","avions","aviez","avaient"],ET_IMP=["étais","étais","était","étions","étiez","étaient"];
const AV_CON=["aurais","aurais","aurait","aurions","auriez","auraient"],ET_CON=["serais","serais","serait","serions","seriez","seraient"];
const vowel=f=>/^[aeiouéèêâîôûyh]/i.test(f);
function withP(i,f,subj){
  if(subj){if(i===0&&vowel(f))return "que j'"+f;if((i===2||i===5)&&false)return"";return SUBJ_P[i]+" "+f}
  return i===0&&vowel(f)?"j'"+f:P[i]+" "+f;
}
function analyse(inf){
  if(IRR[inf]&&!PFX_OK.has(inf))return Object.assign({er:false},IRR[inf]);
  const key=Object.keys(IRR).filter(k=>PFX_OK.has(k)&&inf.endsWith(k)).sort((a,b)=>b.length-a.length)[0];
  if(key){
    const pre=inf.slice(0,-key.length),d=IRR[key],r=s=>s.replace("~",pre);
    return {er:false,ils:r(d.ils),nous:r(d.nous),fut:r(d.fut),pp:r(d.pp),subj:d.subj&&d.subj.map(r)};
  }
  if(/er$/.test(inf)&&inf.length>2){const st=inf.slice(0,-2);return {er:true,ils:st,nous:st,fut:inf,pp:st+"é"}}
  if(/oir$/.test(inf))return null;
  if(/ir$/.test(inf)&&inf.length>2){const st=inf.slice(0,-2);return {er:false,ils:st+"iss",nous:st+"iss",fut:inf,pp:st+"i"}}
  if(/re$/.test(inf)&&inf.length>2){const st=inf.slice(0,-2);return {er:false,ils:st,nous:st,fut:inf.slice(0,-1),pp:st+"u"}}
  return null;
}
function fixEr(st,end,er){
  if(!er)return st+end;
  if(/^[ao]/.test(end)){if(/g$/.test(st))return st+"e"+end;if(/c$/.test(st))return st.slice(0,-1)+"ç"+end}
  return st+end;
}
function conjugate(raw){
  const inf=raw.trim().toLowerCase().replace(/^(se |s')/,"");
  const a=analyse(inf);if(!a)return null;
  const etre=ETRE_V.has(inf);
  const agree=i=>etre?a.pp+(["(e)","(e)","(e)","(e)s","(e)(s)","(e)s"][i]):a.pp;
  return P.map((_,i)=>({
    imp:withP(i,fixEr(a.nous,IMP_E[i],a.er)),
    pqp:withP(i,(etre?ET_IMP:AV_IMP)[i])+" "+agree(i),
    fut:withP(i,a.fut+FUT_E[i]),
    con:withP(i,a.fut+IMP_E[i]),
    cp:withP(i,(etre?ET_CON:AV_CON)[i])+" "+agree(i),
    sub:withP(i,a.subj?a.subj[i]:fixEr((i===3||i===4)?a.nous:a.ils,SUB_E[i],a.er),true)
  })).concat([{etre}]);
}
const LBL=["je","tu","il / elle / on","nous","vous","ils / elles"];
function runConj(){
  const out=$("#conjOut"),r=conjugate($("#conjIn").value);
  if(!r){out.innerHTML="<p>Type an infinitive ending in -er, -ir or -re (or -oir for the common irregulars).</p>";return}
  const etre=r.pop().etre;
  const narrow=matchMedia("(max-width:700px)").matches;
  const t=(cols)=>narrow&&cols.length>2?t(cols.slice(0,2))+t(cols.slice(2)):`<div class="scroll"><table class="conj"><thead><tr><th></th>${cols.map(c=>`<th>${c[0]}</th>`).join("")}</tr></thead><tbody>${r.map((x,i)=>`<tr><td>${LBL[i]}</td>${cols.map(c=>`<td>${fr(x[c[1]])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  out.innerHTML=(etre?`<p class="small muted">Uses <b>être</b> in compound tenses, so the participle agrees.</p>`:"")+
    `<span class="eyebrow">Telling the past</span>`+t([["Imparfait <span class='gloss block'>was doing / used to do</span>","imp"],["Plus-que-parfait <span class='gloss block'>had done</span>","pqp"]])+
    `<span class="eyebrow" style="margin-top:14px">Plans, wishes, regrets</span>`+t([["Futur <span class='gloss block'>will do</span>","fut"],["Conditionnel <span class='gloss block'>would do</span>","con"],["Cond. passé <span class='gloss block'>would have done</span>","cp"],["Subjonctif <span class='gloss block'>(that) … do, after il faut que…</span>","sub"]]);
}
$("#conjIn").addEventListener("input",runConj);
matchMedia("(max-width:700px)").addEventListener("change",runConj);
const chipsEl=$("#conjChips");
chipsEl.innerHTML=["parler","manger","finir","attendre","être","avoir","aller","faire","venir","pouvoir","comprendre","écrire","connaître"].map(w=>`<button class="chip" type="button">${w}</button>`).join("");
chipsEl.addEventListener("click",e=>{const c=e.target.closest(".chip");if(c){$("#conjIn").value=c.textContent;runConj()}});
runConj();

/* ---------- accent keys ---------- */
const ACCENTS=["é","è","ê","à","â","ç","ù","û","î","ï","ô","œ","ë","«","»"];
document.querySelectorAll(".accents").forEach(b=>{b.innerHTML=ACCENTS.map(a=>`<button class="acc" type="button" tabindex="-1">${a}</button>`).join("")});
document.addEventListener("mousedown",e=>{if(e.target.closest(".acc"))e.preventDefault()});
document.addEventListener("click",e=>{
  const a=e.target.closest(".acc");if(!a)return;
  const t=document.getElementById(a.parentElement.dataset.for);if(!t)return;
  const s=t.selectionStart??t.value.length,en=t.selectionEnd??s,ch=a.textContent;
  t.value=t.value.slice(0,s)+ch+t.value.slice(en);t.focus();t.setSelectionRange(s+ch.length,s+ch.length);
  t.dispatchEvent(new Event("input"));
});

/* ---------- conjugation sprint ---------- */
const SPRINT_VERBS=["parler","manger","finir","attendre","choisir","répondre","arriver","rester","être","avoir","aller","faire","venir","pouvoir","vouloir","savoir","devoir","prendre","comprendre","mettre","dire","écrire","lire","voir","partir","sortir","connaître","boire","vivre","recevoir"];
const TENSES=[["Imparfait","imp",1,"was doing"],["Futur","fut",1,"will do"],["Conditionnel","con",1,"would do"],["Subjonctif","sub",1,"that … do"],["Plus-que-parfait","pqp",0,"had done"],["Cond. passé","cp",0,"would have done"]];
const VERB_EN={parler:"to speak",manger:"to eat",finir:"to finish",attendre:"to wait",choisir:"to choose",répondre:"to answer",arriver:"to arrive",rester:"to stay",être:"to be",avoir:"to have",aller:"to go",faire:"to do / make",venir:"to come",pouvoir:"can",vouloir:"to want",savoir:"to know",devoir:"must",prendre:"to take",comprendre:"to understand",mettre:"to put",dire:"to say",écrire:"to write",lire:"to read",voir:"to see",partir:"to leave",sortir:"to go out",connaître:"to know (a person / place)",boire:"to drink",vivre:"to live",recevoir:"to receive"};
const sprintState={on:new Set(TENSES.filter(t=>t[2]).map(t=>t[1])),score:0,tries:0,streak:0,best:store.get("frB.best",0)};
const strip=s=>s.toLowerCase().replace(/’/g,"'").trim().replace(/\s+/g," ").replace(/^(que |qu')?(je |j'|tu |il |elle |on |nous |vous |ils |elles )/,"");
const deacc=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"");
function sprint(el){
  el.innerHTML=`<div class="tchecks">${TENSES.map(t=>`<label><input type="checkbox" value="${t[1]}" ${sprintState.on.has(t[1])?"checked":""}> ${t[0]} <span class="gloss">${t[3]}</span></label>`).join("")}</div>
  <div class="drill-top"><span id="spStat"></span><span id="spBest"></span></div>
  <p class="sp-q" id="spQ"></p>
  <div class="row"><input type="text" id="spIn" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type the verb form, e.g. prendrions"><button class="btn solid" type="button" id="spGo">Check</button><button class="btn" type="button" id="spSkip">Skip</button></div>
  <div class="accents" data-for="spIn">${ACCENTS.slice(0,13).map(a=>`<button class="acc" type="button" tabindex="-1">${a}</button>`).join("")}</div>
  <div class="feedback" id="spFb"></div>
  <p class="small muted" style="margin-top:10px">Type just the verb (with its auxiliary for compound tenses). The pronoun is optional. Press Enter to check, Enter again for the next one.</p>`;
  let cur=null,done=false;
  const stat=()=>{$("#spStat").textContent=`${sprintState.score} / ${sprintState.tries} correct · streak ${sprintState.streak}`;$("#spBest").textContent=`best streak ${sprintState.best}`};
  function next(){
    const ts=TENSES.filter(t=>sprintState.on.has(t[1]));
    if(!ts.length){$("#spQ").innerHTML="Tick at least one tense.";cur=null;return}
    const v=SPRINT_VERBS[Math.floor(Math.random()*SPRINT_VERBS.length)],t=ts[Math.floor(Math.random()*ts.length)],p=Math.floor(Math.random()*6);
    const rows=conjugate(v);rows.pop();
    cur={v,t,p,full:rows[p][t[1]]};done=false;
    $("#spQ").innerHTML=`<span class="lvl">${t[0]}</span> &nbsp;${t[1]==="sub"?"que ":""}${LBL[p]} · <b>${v}</b> <span class="gloss">(${VERB_EN[v]||""}, ${t[3]})</span>`;
    $("#spIn").value="";$("#spFb").innerHTML="";$("#spIn").focus({preventScroll:true});stat();
  }
  function check(){
    if(!cur)return;
    if(done){next();return}
    const ans=strip($("#spIn").value);if(!ans)return;
    const core=strip(cur.full);
    const rx=new RegExp("^"+core.replace(/[.*+?^${}|[\]\\]/g,"\\$&").replace(/\(e\)/g,"e?").replace(/\(s\)/g,"s?")+"$");
    let ok=rx.test(ans),near=false;
    if(!ok&&new RegExp("^"+deacc(rx.source).replace(/\\\^/,"")).test(deacc(ans))){ok=true;near=true}
    sprintState.tries++;if(ok){sprintState.score++;sprintState.streak++;if(sprintState.streak>sprintState.best){sprintState.best=sprintState.streak;store.set("frB.best",sprintState.best)}}else sprintState.streak=0;
    done=true;
    $("#spFb").innerHTML=`<span class="verdict ${ok?"y":"n"}">${ok?(near?"Almost":"Correct"):"Not quite"}</span>${near?"Right form, but check the accents: ":ok?"":"The answer is "}${fr(cur.full)}<div style="margin-top:10px"><button class="btn solid" type="button" id="spNext">Next</button></div>`;
    stat();
  }
  el.querySelector(".tchecks").addEventListener("change",e=>{const c=e.target;c.checked?sprintState.on.add(c.value):sprintState.on.delete(c.value);next()});
  el.addEventListener("click",e=>{if(e.target.id==="spGo")check();else if(e.target.id==="spSkip"||e.target.id==="spNext")next()});
  $("#spIn").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();check()}});
  next();
}

/* ---------- practice hub ---------- */
function mistEmpty(){
  const later=[...state.mistakes].map(id=>(mistSched[id]||{d:0}).d).filter(d=>d>dayNum()).sort((a,b)=>a-b);
  return later.length?`<p><b>Nothing due right now.</b> ${later.length} mistake${later.length>1?"s are":" is"} scheduled to come back, the next one ${dayLabel(later[0])}. A mistake leaves the list once you've answered it right three times: now, the next day, and three days later.</p>`
    :"<p><b>No saved mistakes.</b> Every question you miss lands here and comes back on a schedule (now, the next day, three days later) until it sticks.</p>"}

/* ---------- flashcards: spaced repetition for words, phrases and idioms ---------- */
const SRS_GAP=[0,1,3,7,16,35,90];            // days until the next review, by box
const srs=store.get("lb-srs",{});            // id -> {b:box, d:due day}
const srsCfg=store.get("lb-srs-cfg",{perDay:10,date:0,newToday:0});
const CARDS=[
  ...FQ.map(w=>({id:"w:"+w.fr,fr:w.fr,en:w.en,src:"Mots fréquents"})),
  ...VOCAB_ALL.map(v=>({id:"v:"+v.fr,fr:v.fr,en:v.en,src:"Vocabulaire · "+v.t})),
  ...IDIOMS.map(x=>({id:"i:"+x[0],fr:x[0],en:x[1],src:"Expressions"})),
  ...IDIOMS_C.map(x=>({id:"c:"+x[0],fr:x[0],en:x[1],src:"Expressions C"}))];
const cardById=Object.fromEntries(CARDS.map(c=>[c.id,c]));
function srsNewLeft(){const t=dayNum();if(srsCfg.date!==t){srsCfg.date=t;srsCfg.newToday=0}return Math.max(0,srsCfg.perDay-srsCfg.newToday)}
function srsCounts(){
  const t=dayNum(),due=Object.entries(srs).filter(([id,c])=>c.d<=t&&cardById[id]).length;
  const fresh=Math.min(srsNewLeft(),CARDS.filter(c=>!srs[c.id]&&!(c.id[0]==="w"&&known.has(c.fr))).length);
  return {due,fresh,total:due+fresh};
}
function srsSave(){store.set("lb-srs",srs);store.set("lb-srs-cfg",srsCfg)}
function flashcards(el){
  const t=dayNum();
  const due=Object.entries(srs).filter(([id,c])=>c.d<=t&&cardById[id]).sort((a,b)=>a[1].d-b[1].d).map(([id])=>cardById[id]);
  const fresh=CARDS.filter(c=>!srs[c.id]&&!(c.id[0]==="w"&&known.has(c.fr))).slice(0,srsNewLeft());
  const queue=[...due,...fresh];let done=0,shown=false;
  function next(){
    if(!queue.length){
      const upcoming=Object.values(srs).filter(c=>c.d===t+1).length;
      el.innerHTML=`<div class="score">${done ? "✓" : "–"}</div><p style="margin-top:8px">${done?`Done for today: ${done} card${done>1?"s":""} reviewed.`:"No cards due right now."} ${upcoming?`${upcoming} card${upcoming>1?"s":""} come back tomorrow.`:""}</p>
        <p class="small muted">New cards per day: <select id="srsPer">${[5,10,20,30].map(n=>`<option ${n===srsCfg.perDay?"selected":""}>${n}</option>`).join("")}</select> · ${Object.keys(srs).length} of ${CARDS.length} cards started</p>`;
      $("#srsPer").addEventListener("change",e=>{srsCfg.perDay=+e.target.value;srsSave();renderProgress();flashcards(el)});
      renderProgress();return;
    }
    const c=queue[0],st=srs[c.id],reverse=st&&st.b>=3;shown=false;
    el.innerHTML=`<div class="drill-top"><span>${st?"Review":"New card"} · ${esc(c.src)}</span><span>${queue.length} left</span></div>
      <div class="fc">
        <p class="fc-dir">${reverse?"Say it in French":"What does it mean?"}</p>
        <div class="fc-front">${reverse?`<span class="fc-en">${esc(c.en)}</span>`:fr(c.fr)}</div>
        <div class="fc-back" hidden>${reverse?fr(c.fr):`<span class="fc-en">${esc(c.en)}</span>`}</div>
      </div>
      <div class="fc-actions"><button class="btn solid" type="button" data-fc="show">Show answer</button></div>`;
    if(!reverse)speak(c.fr);
  }
  function grade(g){
    const c=queue.shift(),st=srs[c.id];
    if(!st){srsCfg.newToday++}
    const b=st?st.b:0;
    if(g==="again"){srs[c.id]={b:1,d:t+1};if(!c.again){c.again=1;queue.push(c)}}
    else if(c.again){srs[c.id]={b:1,d:t+1}}   // failed earlier in this session: see it again tomorrow
    else{const nb=Math.min(SRS_GAP.length-1,(g==="easy"?b+2:b+1)||1);srs[c.id]={b:nb,d:t+SRS_GAP[nb]}}
    done++;srsSave();next();
  }
  el.onclick=e=>{
    const a=e.target.closest("[data-fc]");if(!a)return;
    if(a.dataset.fc==="show"){
      el.querySelector(".fc-back").hidden=false;const c=queue[0],st=srs[c.id],b=st?st.b:0;
      if(st&&st.b>=3)speak(c.fr);
      const gb=Math.min(SRS_GAP.length-1,b+1||1),eb=Math.min(SRS_GAP.length-1,b+2);
      el.querySelector(".fc-actions").innerHTML=`<button class="btn fc-g again" type="button" data-fc="again">Again<small>tomorrow</small></button>
        <button class="btn fc-g good" type="button" data-fc="good">Got it<small>${dayLabel(t+SRS_GAP[gb])}</small></button>
        <button class="btn fc-g easy" type="button" data-fc="easy">Easy<small>${dayLabel(t+SRS_GAP[eb])}</small></button>`;
    }else grade(a.dataset.fc);
  };
  next();
}

/* ---------- listening: dictation and listen-and-choose ---------- */
const hasFrVoice=()=>{try{return speechSynthesis.getVoices().some(v=>/^fr(-|_|$)/i.test(v.lang))}catch(e){return false}};
const LISTEN_POOL=Object.entries(EN).filter(([f])=>/[.!?]$/.test(f)&&!/…/.test(f)&&f.split(/\s+/).length>=3&&f.split(/\s+/).length<=14);
const tokens=s=>(String(s).normalize("NFC").toLowerCase().replace(/[’`]/g,"'").match(/[\p{L}\p{N}]+'?/gu)||[]);
/* word-by-word comparison (longest common subsequence, ignoring accents for matching) */
function compareWords(target,typed){
  const A=tokens(target),B=tokens(typed),n=A.length,m=B.length,K=x=>noAcc(x);
  const L=Array.from({length:n+1},()=>new Array(m+1).fill(0));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)L[i][j]=K(A[i])===K(B[j])?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
  const res=[];let i=0,j=0;
  while(i<n){
    if(j<m&&K(A[i])===K(B[j])){res.push({w:A[i],s:A[i]===B[j]?"ok":"acc",typed:B[j]});i++;j++}
    else if(j<m&&L[i][j+1]>=L[i+1][j])j++;
    else{res.push({w:A[i],s:"miss"});i++}
  }
  return {res,right:res.filter(r=>r.s==="ok").length,total:n,extra:m-res.filter(r=>r.s!=="miss").length};
}
window.LigneB.compareWords=compareWords;
function listening(el){
  let mode=store.get("lb-lmode","dict"),rate=store.get("lb-rate",.85),cur,done=false;
  const voiceNote=()=>hasFrVoice()?"":`<p class="small listen-warn">Your device doesn't seem to have a French voice, so audio may be missing or in the wrong accent. On Android: Settings → System → Languages → Text-to-speech, and add French. On iPhone: Settings → Accessibility → Spoken Content → Voices → French.</p>`;
  function frame(body){
    el.innerHTML=`<div class="row listen-modes"><button class="chip" type="button" data-lm="dict" aria-pressed="${mode==="dict"}">Dictation</button><button class="chip" type="button" data-lm="choose" aria-pressed="${mode==="choose"}">Listen and choose</button>
      <label class="small muted" style="margin-left:auto">Speed <select id="lRate"><option value=".65" ${rate<.7?"selected":""}>slow</option><option value=".85" ${rate>=.7&&rate<.95?"selected":""}>normal</option><option value="1.05" ${rate>=.95?"selected":""}>fast</option></select></label></div>
      ${voiceNote()}${body}`;
    $("#lRate").addEventListener("change",e=>{rate=+e.target.value;store.set("lb-rate",rate)});
  }
  function next(){
    done=false;cur=LISTEN_POOL[Math.floor(Math.random()*LISTEN_POOL.length)];
    if(mode==="dict"){
      frame(`<p class="drill-q">Listen, then type exactly what you hear.</p>
        <div class="row"><button class="btn solid big-play" type="button" data-l="play">▶ Play</button><button class="btn" type="button" data-l="slow">Play slowly</button></div>
        <textarea id="lIn" class="typed-in" style="min-height:80px;margin-top:10px" placeholder="Type the sentence" autocapitalize="off" spellcheck="false"></textarea>
        <div class="accents" data-for="lIn">${TYPE_ACCENTS.map(a=>`<button class="acc" type="button" tabindex="-1">${a}</button>`).join("")}</div>
        <div class="row" style="margin-top:10px"><button class="btn solid" type="button" data-l="check">Check</button><button class="btn" type="button" data-l="skip">Show me</button></div>
        <div class="feedback" aria-live="polite"></div>`);
    }else{
      const wrong=shuffle(LISTEN_POOL.filter(p=>p!==cur)).slice(0,2).map(p=>p[1]);
      frame(`<p class="drill-q">Listen, then pick what it means.</p>
        <div class="row"><button class="btn solid big-play" type="button" data-l="play">▶ Play</button><button class="btn" type="button" data-l="slow">Play slowly</button></div>
        <div class="opts" style="margin-top:12px">${shuffle([cur[1],...wrong]).map(o=>`<button class="opt" type="button" data-ch="${esc(o)}">${esc(o)}</button>`).join("")}</div>
        <div class="feedback" aria-live="polite"></div>`);
    }
    speak(cur[0],rate);
  }
  function showResult(typed){
    done=true;
    const r=compareWords(cur[0],typed||"");
    const marked=r.res.map(x=>x.s==="ok"?`<span class="w-ok">${esc(x.w)}</span>`:x.s==="acc"?`<span class="w-acc" title="you typed ${esc(x.typed)}">${esc(x.w)}</span>`:`<span class="w-miss">${esc(x.w)}</span>`).join(" ");
    const score=typed?`<span class="verdict ${r.right===r.total&&!r.extra?"y":"n"}">${r.right} / ${r.total} words</span>`:"";
    el.querySelector(".feedback").innerHTML=`${score}${typed?`<p class="small muted" style="margin:6px 0">Green: right · amber: accent missing · red: missed${r.extra?` · ${r.extra} extra word${r.extra>1?"s":""} you typed`:""}</p><p class="dict-marked">${marked}</p>`:""}
      <p style="margin-top:8px">${fr(cur[0])}</p><p class="gloss block">${esc(cur[1])}</p>
      <div class="drill-next"><button class="btn solid" type="button" data-l="next">Next sentence</button></div>`;
    logListen(.5);
  }
  el.onclick=e=>{
    const m=e.target.closest("[data-lm]");if(m){mode=m.dataset.lm;store.set("lb-lmode",mode);next();return}
    const a=e.target.closest("[data-l]");const ch=e.target.closest("[data-ch]");
    if(ch&&!done){done=true;const ok=ch.dataset.ch===cur[1];
      el.querySelectorAll("[data-ch]").forEach(o=>{o.disabled=true;if(o.dataset.ch===cur[1])o.classList.add("right");else if(o===ch)o.classList.add("wrong")});
      el.querySelector(".feedback").innerHTML=`<span class="verdict ${ok?"y":"n"}">${ok?"Correct":"Not quite"}</span><p style="margin-top:6px">${fr(cur[0])}</p><div class="drill-next"><button class="btn solid" type="button" data-l="next">Next sentence</button></div>`;
      logListen(.3);return}
    if(!a)return;const act=a.dataset.l;
    if(act==="play")speak(cur[0],rate);
    else if(act==="slow")speak(cur[0],.6);
    else if(act==="check"&&!done){const v=$("#lIn").value.trim();if(!v){$("#lIn").focus();return}showResult(v)}
    else if(act==="skip"&&!done)showResult("");
    else if(act==="next")next();
  };
  el.onkeydown=e=>{if(e.key==="Enter"&&e.target.id==="lIn"&&!e.shiftKey){e.preventDefault();const c=el.querySelector('[data-l="check"]');if(!done)c.click();else el.querySelector('[data-l="next"]').click()}};
  next();
}
/* ---------- speaking: shadowing with recording, timed prompts ---------- */
const canRecord=()=>!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
let recNow=null;   // {rec, stream, timer}
function stopRec(){if(recNow){clearTimeout(recNow.timer);try{recNow.rec.state!=="inactive"&&recNow.rec.stop()}catch(e){}}}
async function startRec(maxSec,onDone){
  stopRec();
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  const rec=new MediaRecorder(stream),chunks=[];
  rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  rec.onstop=()=>{stream.getTracks().forEach(t=>t.stop());recNow=null;onDone(URL.createObjectURL(new Blob(chunks,{type:rec.mimeType||"audio/webm"})))};
  rec.start();recNow={rec,stream,timer:setTimeout(()=>stopRec(),maxSec*1000)};
}
const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
function speaking(el){
  let mode=store.get("lb-smode","shadow"),cur,mine=null,lv=store.get("lb-slv","B1"),pi=0,clock=null;
  const recNote=canRecord()?"":`<p class="small listen-warn">This browser can't record audio here. You can still practise: listen, then say it aloud.</p>`;
  function frame(body){
    clearInterval(clock);stopRec();
    el.innerHTML=`<div class="row listen-modes"><button class="chip" type="button" data-sm="shadow" aria-pressed="${mode==="shadow"}">Shadowing</button><button class="chip" type="button" data-sm="prompt" aria-pressed="${mode==="prompt"}">Speaking prompts</button></div>${recNote}${body}`;
  }
  function shadow(){
    cur=LISTEN_POOL[Math.floor(Math.random()*LISTEN_POOL.length)];mine=null;
    frame(`<p class="drill-q">${fr(cur[0])}</p><p class="gloss block">${esc(cur[1])}</p>
      <ol class="small steps"><li>Listen to the model, twice if you like.</li><li>Record yourself saying it, copying the rhythm and the linking between words.</li><li>Play both and compare. Repeat until they sound alike.</li></ol>
      <div class="row"><button class="btn" type="button" data-s="model">▶ Model</button>
      ${canRecord()?`<button class="btn solid rec-btn" type="button" data-s="rec">● Record</button><button class="btn" type="button" data-s="mine" disabled>▶ Mine</button><button class="btn" type="button" data-s="both" disabled>▶ Model, then mine</button>`:""}</div>
      <p class="small muted" id="sStatus" style="margin-top:8px"></p>
      <div class="drill-next"><button class="btn" type="button" data-s="next">Next sentence</button></div>`);
  }
  function promptView(){
    const P=SPEAK_PROMPTS[lv];pi=pi%P.items.length;mine=null;
    frame(`<div class="row" style="margin-bottom:8px">${Object.keys(SPEAK_PROMPTS).map(k=>`<button class="chip" type="button" data-slv="${k}" aria-pressed="${k===lv}">${k}</button>`).join("")}<button class="btn tr-btn" type="button" data-s="other" style="margin-left:auto">Another topic</button></div>
      <p class="prompt">${esc(P.items[pi])}</p>
      <div class="timer" id="sClock">${fmt(P.prep)}</div>
      <p class="small muted" id="sPhase" style="text-align:center;margin:0 0 10px">Prepare: ${fmt(P.prep)}, then speak: ${fmt(P.talk)}. Practice-length timers; the real exams are longer.</p>
      <div class="row" style="justify-content:center"><button class="btn solid" type="button" data-s="go">Start preparing</button>${canRecord()?`<label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="sRecAns" checked> record my answer</label>`:""}</div>
      <div id="sPlayback" style="margin-top:10px"></div>
      <span class="eyebrow" style="margin-top:12px">${lv} checklist: did you…</span>
      <ul class="checks">${P.check.map(c=>`<li><label style="display:flex;gap:8px;cursor:pointer"><input type="checkbox"> <span>${esc(c)}</span></label></li>`).join("")}</ul>`);
  }
  function run(){
    const P=SPEAK_PROMPTS[lv];let left=P.prep,phase="prep";
    const tick=()=>{
      if(!document.body.contains(el)||!$("#sClock")){clearInterval(clock);stopRec();return}
      $("#sClock").textContent=fmt(left);
      if(left<=0){
        if(phase==="prep"){phase="talk";left=P.talk;$("#sPhase").textContent="Speak now. Keep going until the timer ends.";$("#sClock").classList.add("talk");
          if(canRecord()&&$("#sRecAns")&&$("#sRecAns").checked)startRec(P.talk+2,url=>{$("#sPlayback").innerHTML=`<p class="small">Your answer:</p><audio controls src="${url}" style="width:100%"></audio><p class="small muted">Listen back with the checklist below. Better still, send it to a tutor.</p>`}).catch(()=>toast("Microphone not available."));
          $("#sClock").textContent=fmt(left);}
        else{clearInterval(clock);stopRec();$("#sPhase").textContent="Time's up. Go through the checklist.";$("#sClock").classList.remove("talk");logListen(0);return}
      }
      left--;
    };
    el.querySelector('[data-s="go"]').outerHTML=`<button class="btn" type="button" data-s="stopall">Stop</button>`;
    tick();clock=setInterval(tick,1000);
  }
  el.onclick=async e=>{
    const m=e.target.closest("[data-sm]");if(m){mode=m.dataset.sm;store.set("lb-smode",mode);mode==="shadow"?shadow():promptView();return}
    const l=e.target.closest("[data-slv]");if(l){lv=l.dataset.slv;store.set("lb-slv",lv);pi=0;promptView();return}
    const a=e.target.closest("[data-s]");if(!a)return;const act=a.dataset.s;
    if(act==="model")speak(cur[0],.85);
    else if(act==="next")shadow();
    else if(act==="other"){pi++;promptView()}
    else if(act==="go")run();
    else if(act==="stopall"){clearInterval(clock);stopRec();$("#sPhase").textContent="Stopped.";a.remove()}
    else if(act==="rec"){
      if(recNow){stopRec();return}
      try{await startRec(15,url=>{mine=url;a.textContent="● Record again";a.classList.remove("recording");$("#sStatus").textContent="Recorded. Compare with the model.";el.querySelectorAll('[data-s="mine"],[data-s="both"]').forEach(b=>b.disabled=false)});
        a.textContent="■ Stop";a.classList.add("recording");$("#sStatus").textContent="Recording… tap Stop when you've finished (15 seconds max).";}
      catch(err){toast("Microphone not available. Check the browser's permission for this site.")}
    }
    else if(act==="mine"&&mine)new Audio(mine).play();
    else if(act==="both"&&mine){
      try{const s=window.speechSynthesis;const u=new SpeechSynthesisUtterance(cur[0]);u.lang="fr-FR";u.rate=.85;const v=s.getVoices().find(v=>/^fr(-|_|$)/i.test(v.lang));if(v)u.voice=v;
        u.onend=()=>setTimeout(()=>new Audio(mine).play(),400);s.cancel();s.speak(u)}catch(err){new Audio(mine).play()}
    }
  };
  mode==="shadow"?shadow():promptView();
}

/* listening log: minutes per day, from practice here and from real French you tick off */
function logListen(min){const d=store.get("lb-listen",{}),k=dayNum();d[k]=Math.round(((d[k]||0)+min)*10)/10;store.set("lb-listen",d);renderListenLog()}
function renderListenLog(){
  const el=$("#listenLog");if(!el)return;const d=store.get("lb-listen",{}),t=dayNum();
  let week=0;for(let i=0;i<7;i++)week+=d[t-i]||0;
  let streak=0;while((d[t-streak]||0)>=5)streak++;
  el.innerHTML=`<b>${Math.round(d[t]||0)}</b> min today · <b>${Math.round(week)}</b> min this week${streak?` · ${streak}-day streak (5+ min)`:""}`;
}

function openTab(tab){
  if(typeof stopRec==="function")stopRec();
  const am=document.querySelector(".ans-mode");if(am)am.hidden=!["mix","err"].includes(tab);
  const tb=document.querySelector(`.tab[data-tab="${tab}"]`);if(tb){const row=tb.parentElement;if(tb.offsetLeft<row.scrollLeft||tb.offsetLeft+tb.offsetWidth>row.scrollLeft+row.clientWidth)row.scrollLeft=tb.offsetLeft-14}
  document.querySelectorAll(".tab").forEach(t=>t.setAttribute("aria-selected",t.dataset.tab===tab));
  const panel=$("#hubPanel");panel.innerHTML="<div></div>";const el=panel.firstChild;
  if(tab==="mix")drill(el,()=>dailyMix(10),{doneText:(s,n)=>s>=8?"Strong session. Come back tomorrow for a new mix.":"Your misses are in <b>Mes erreurs</b>. Clear them before tomorrow's mix."});
  else if(tab==="cards")flashcards(el);
  else if(tab==="listen")listening(el);
  else if(tab==="speak")speaking(el);
  else if(tab==="err")drill(el,()=>shuffle(mistDue().map(byId).filter(Boolean)),{empty:mistEmpty(),doneText:()=>state.mistakes.size?`${state.mistakes.size} still to fix. Go again or read their stations.`:"Mistakes list cleared. Bravo !"});
  else sprint(el);
}
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>openTab(t.dataset.tab)));
$("#ansMode").value=ansMode;
document.querySelectorAll("[data-addmin]").forEach(b=>b.addEventListener("click",()=>{logListen(+b.dataset.addmin);toast(`Logged ${b.dataset.addmin} minutes of real French. Bravo !`)}));
renderListenLog();
$("#ansMode").addEventListener("change",e=>{ansMode=e.target.value;store.set("lb-ansmode",ansMode);const cur=document.querySelector('.tab[aria-selected="true"]');if(cur&&["mix","err"].includes(cur.dataset.tab))openTab(cur.dataset.tab);toast(ansMode==="typed"?"You'll type every answer that can be typed.":ansMode==="mc"?"Tap mode: multiple choice everywhere.":"Questions switch to typing after you get them right twice.")});

/* ---------- station numbers and "Next" links follow the STATIONS order ---------- */
STATIONS.forEach((st,i)=>{
  const sec=document.getElementById(st.id);if(!sec)return;
  const r=sec.querySelector(".roundel");if(r)r.textContent=i+1;
  const nx=sec.querySelector(".station-foot .next");if(!nx)return;
  const n=STATIONS[i+1];
  nx.innerHTML=st.id==="terminus"?'Next: <a href="#ligneC">change to Ligne C →</a>':n?`Next: <a href="#${n.id}">${esc(n.name)}</a>`:'<a href="#passe">Back to station 1</a>';
});
(function(){const n=STATIONS.length;const ol=$("#route");if(ol){ol.style.gridTemplateColumns=`repeat(${n},minmax(78px,1fr))`;ol.style.minWidth=n*80+"px"}
  const rt=$("#rmTotal");if(rt)rt.textContent=n;const sg=$("#routeSegs");if(sg)sg.style.gridTemplateColumns=`repeat(${n},1fr)`})();

/* ---------- mobile navigation: station sheet + bottom bar ---------- */
function renderMobileNav(){
  const list=$("#sheetList");if(!list)return;
  list.innerHTML=STATIONS.map((s,i)=>{const done=state.cleared.has(s.id),a=acc(s.id);
    return (s.id==="nuances"?'<li class="sep">Ligne C · C1 → C2</li>':"")+`<li><a href="#${s.id}" data-close style="--c:${s.c}" class="${done?"done":""}${s.id===hereId?" here":""}"><span class="dot">${done?"✓":i+1}</span><span class="t"><b>${s.name}</b><small>${s.sub}</small></span><span class="lvl">${s.lv}</span>${a!==null?`<span class="pc">${Math.round(a*100)}%</span>`:""}</a></li>`}).join("");
  const n=mistDue().length,b=$("#bbErr");if(b){b.textContent=n;b.hidden=!n}
  updateNavHere();
}
function updateNavHere(){
  const t=$("#navHereTxt");if(!t)return;
  const i=STATIONS.findIndex(s=>s.id===hereId);
  t.textContent=hereId==="entrainement"?"Today's practice":i<0?"All stations":`${i+1}. ${STATIONS[i].name}`;
  document.querySelectorAll("#sheetList a").forEach(a=>a.classList.toggle("here",a.getAttribute("href")==="#"+hereId));
}
const sheet=$("#sheet");
function openSheet(){sheet.hidden=false;document.body.classList.add("sheet-open");const h=sheet.querySelector("a.here");(h||sheet.querySelector(".sheet-x")).focus({preventScroll:true});if(h)h.scrollIntoView({block:"center"})}
function closeSheet(){sheet.hidden=true;document.body.classList.remove("sheet-open")}
$("#navHere").addEventListener("click",openSheet);
sheet.addEventListener("click",e=>{if(e.target===sheet||e.target.closest("[data-close]"))closeSheet()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!sheet.hidden)closeSheet()});
document.querySelector(".bottombar").addEventListener("click",e=>{
  const b=e.target.closest("[data-go]");if(!b)return;const go=b.dataset.go;
  if(go==="stations")return openSheet();
  if(go==="top")return scrollTo({top:0});
  const want=go==="mistakes"?"err":"mix";
  const cur=document.querySelector('.tab[aria-selected="true"]');
  if(!cur||cur.dataset.tab!==want)openTab(want);
  $("#entrainement").scrollIntoView();
});

/* ---------- phone layout helpers ---------- */
const MOBILE=matchMedia("(max-width:700px)");
/* today card: continue where you left off */
function renderToday(){
  if(!$("#today"))return;
  const last=store.get("lb-last",null);
  const i=Math.max(0,STATIONS.findIndex(s=>s.id===last));
  const st=STATIONS[i];
  $("#todayGo").href="#"+st.id;
  $("#todayLbl").textContent=last?"Continue":"Start here";
  $("#todayName").textContent=`${i+1}. ${st.name}`;
  $("#tsCleared").textContent=state.cleared.size;$("#tsTotal").textContent=STATIONS.length;
  $("#tsErr").textContent=mistDue().length;
  $("#tsCards").textContent=srsCounts().total;
  const d=store.get("lb-day",{date:"",n:0});const today=new Date().toDateString();
  $("#tsDone").textContent=d.date===today?Math.min(d.n,10):0;
  const sc=srsCounts();
  $("#todayMeta").textContent=(d.date===today&&d.n>=10?"Done for today ✓":"10 questions · about 10 minutes")+(sc.total?` · ${sc.total} flashcards due`:"");
  $("#rmCleared").textContent=state.cleared.size;
  if(typeof bkShow==="function")try{bkShow()}catch(e){}
  $("#routeSegs").innerHTML=STATIONS.map(s=>`<i style="--c:${s.c}" class="${state.cleared.has(s.id)?"done":""}"></i>`).join("");
}
/* count answered questions per day */
document.addEventListener("click",e=>{
  if(!e.target.closest(".opt")||e.target.closest(".opt").disabled)return;
  const today=new Date().toDateString();const d=store.get("lb-day",{date:"",n:0});
  store.set("lb-day",d.date===today?{date:today,n:d.n+1}:{date:today,n:1});
  setTimeout(renderToday,0);
},true);
$("#today").addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(b){e.preventDefault();document.querySelector('.bottombar [data-go="practice"]').click()}});
$(".route-mini").addEventListener("click",openSheet);
$("#aboutBtn").addEventListener("click",()=>{const on=document.body.classList.toggle("show-about");$("#aboutBtn").setAttribute("aria-expanded",on);$("#aboutBtn").textContent=on?"Hide intro ▴":"About this course ▾"});

/* fold-out sections inside stations (collapsed on phones only) */
document.querySelectorAll(".station").forEach(st=>{
  if(!st.querySelector(".card.key"))return;          // stations that are one big tool stay as they are
  const folds=[...st.querySelectorAll(".card:not(.key)"),...[...st.querySelectorAll(".tool")].filter(t=>!t.querySelector("[data-drill]"))];
  folds.forEach(f=>{
    if(f.closest(".hub"))return;
    let heads;
    if(f.classList.contains("tool"))heads=[f.querySelector(".tool-head")];
    else{heads=[];for(const c of f.children){if(c.matches(".eyebrow,h3")&&heads.length<2&&!(heads.length&&heads[0].tagName==="H3"))heads.push(c);else break}if(!heads.length)return}
    f.classList.add("fold","collapsed");
    heads.forEach(h=>h.classList.add("fh"));
    const last=heads[heads.length-1];last.classList.add("fh-last");
    heads.forEach(h=>{h.setAttribute("role","button");h.tabIndex=0;h.setAttribute("aria-expanded","false")});
    const toggle=()=>{if(!MOBILE.matches)return;const c=f.classList.toggle("collapsed");heads.forEach(h=>h.setAttribute("aria-expanded",!c))};
    heads.forEach(h=>{h.addEventListener("click",toggle);h.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}})});
  });
  const drillEl=st.querySelector("[data-drill]");
  if(drillEl){
    const b=document.createElement("button");b.type="button";b.className="jump-drill";b.textContent="Jump to drill ↓";
    b.addEventListener("click",()=>drillEl.closest(".tool").scrollIntoView());
    st.querySelector(".station-head").appendChild(b);
  }
});
/* word lists written inline ("souvent often, hier yesterday…") become a two-column list on phones */
document.querySelectorAll("p").forEach(p=>{
  const gl=p.querySelectorAll(":scope > .gloss:not(.block):not(.sent)");
  if(gl.length<3||p.closest("table"))return;
  const rows=[];let label="",buf="";
  p.childNodes.forEach(n=>{
    if(n.nodeType===1&&n.matches("b,strong")&&!rows.length&&!buf.trim()){label=n.textContent;return}
    if(n.nodeType===1&&n.classList.contains("gloss")&&!n.classList.contains("block")){
      rows.push([buf.replace(/^[\s,;·]+|[\s,;·]+$/g,"").trim(),n.textContent.trim()]);buf="";return}
    buf+=n.textContent;
  });
  const tail=buf.replace(/^[\s,;·.]+|[\s,;·]+$/g,"").trim();
  if(rows.some(r=>!r[0]))return;
  const d=document.createElement("div");d.className="gl-list "+p.className;
  d.innerHTML=(label?`<div class="gl-label">${esc(label.replace(/:$/,""))}</div>`:"")+
    `<dl>${rows.map(r=>`<div><dt>${esc(r[0])}</dt><dd class="gloss">${esc(r[1])}</dd></div>`).join("")}</dl>`+(tail?`<p class="small muted">${esc(tail)}</p>`:"");
  p.classList.add("gl-src");p.after(d);
});
/* a single translation in a list item or table cell goes on its own line (phones) */
document.querySelectorAll("li,td").forEach(c=>{const g=c.querySelectorAll(":scope > .gloss:not(.block)");if(g.length===1)g[0].classList.add("own-line")});
/* remember the station you're in */
function rememberHere(){if(STATIONS.some(s=>s.id===hereId))store.set("lb-last",hereId)}
/* after answering on a phone, bring the explanation into view */
document.addEventListener("click",e=>{
  const o=e.target.closest(".opt");if(!o||!MOBILE.matches)return;
  setTimeout(()=>{const n=o.closest(".tool-body,#hubPanel")?.querySelector(".drill-next");if(n)n.scrollIntoView({block:"nearest"})},60);
});
renderToday();

/* ---------- progress backup ---------- */
const BK_KEYS=k=>/^(frB\.|lb-)/.test(k)&&k!=="lb-backup";
function bkCollect(){const data={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(BK_KEYS(k))data[k]=localStorage.getItem(k)}
  return {app:"ligne-b",v:1,date:new Date().toISOString(),data}}
const b64e=s=>btoa(unescape(encodeURIComponent(s))),b64d=s=>decodeURIComponent(escape(atob(s.replace(/\s+/g,""))));
function bkMark(){store.set("lb-backup",Date.now());bkShow()}
function bkShow(){
  const t=store.get("lb-backup",0),el=$("#bkLast");
  const days=t?Math.floor((Date.now()-t)/864e5):null;
  if(el)el.textContent=t?`Last backup: ${new Date(t).toLocaleDateString()}${days?` (${days} day${days>1?"s":""} ago)`:" (today)"}.`:"No backup yet.";
  const hasProgress=state.cleared.size||Object.keys(state.stats).length||known.size;
  const r=$("#bkRemind");if(r){r.hidden=!(hasProgress&&(days===null||days>=7));$("#bkAge").textContent=days===null?"never":`${days} days ago`}
}
function bkApply(obj){
  if(!obj||obj.app!=="ligne-b"||typeof obj.data!=="object")throw new Error("This isn't a Ligne B backup.");
  const n=Object.keys(obj.data).length;
  if(!confirm(`Restore the backup from ${new Date(obj.date).toLocaleString()}? It replaces the progress in this browser (${n} items).`))return;
  Object.keys(localStorage).filter(BK_KEYS).forEach(k=>localStorage.removeItem(k));
  Object.entries(obj.data).forEach(([k,v])=>{if(BK_KEYS(k))localStorage.setItem(k,v)});
  store.set("lb-backup",Date.now());location.reload();
}
$("#bkFile").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify(bkCollect())],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`ligne-b-progress-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);bkMark();toast("Backup file saved");
});
$("#bkCopy").addEventListener("click",async()=>{
  const code=b64e(JSON.stringify(bkCollect()));
  try{await navigator.clipboard.writeText(code);toast("Backup code copied. Paste it somewhere safe, like a note or an email to yourself.")}
  catch(e){$("#bkCode").value=code;$("#bkCode").closest("details").open=true;$("#bkCode").select();toast("Copy the code from the box below")}
  bkMark();
});
$("#bkPick").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;
  try{bkApply(JSON.parse(await f.text()))}catch(err){toast(err.message.includes("Ligne B")?err.message:"That file couldn't be read as a backup.")}e.target.value=""});
$("#bkRestore").addEventListener("click",()=>{const v=$("#bkCode").value.trim();if(!v)return;
  try{bkApply(JSON.parse(v[0]==="{"?v:b64d(v)))}catch(err){toast(err.message.includes("Ligne B")?err.message:"That code isn't a valid backup.")}});
bkShow();

/* hide the bottom bar while typing so it never covers the keyboard area */
document.addEventListener("focusin",e=>{if(e.target.matches("input[type=text],textarea"))document.body.classList.add("typing")});
let typingT;
document.addEventListener("focusin",()=>clearTimeout(typingT));
document.addEventListener("focusout",()=>{clearTimeout(typingT);typingT=setTimeout(()=>{if(!document.activeElement||!document.activeElement.matches("input[type=text],textarea"))document.body.classList.remove("typing")},400)});
openTab("mix");

/* ---------- B-mètre ---------- */
let bmLevel="B";
const BM_TARGET={B1:160,B2:250,C1:250,C2:700};
let bmTarget=160;
document.querySelectorAll("[data-prompt]").forEach(b=>b.addEventListener("click",()=>{
  const lv=b.dataset.prompt,list=BM_PROMPTS[lv];
  $("#bmPrompt").innerHTML=`<b>${lv}</b> · ${esc(list[Math.floor(Math.random()*list.length)])}`;bmTarget=BM_TARGET[lv];bmLevel=lv;runBM();
}));
const CAT={};
BM.c=BM_C;
[["subj","k-subj"],["op","k-op"],["c","k-c"],["b2","k-b2"],["b1","k-b1"],["rel","k-rel"]].forEach(([k,c])=>BM[k].forEach(p=>{if(!CAT[p])CAT[p]=c}));
Object.keys(BM.over).forEach(p=>CAT[p]="k-over");
// subj triggers and opinions win over shorter overlaps because longer phrases match first
const PHRASES=Object.keys(CAT).sort((a,b)=>b.length-a.length).map(p=>p.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
const COND="[a-zàâçéèêëîïôûùœ]{2,}r(?:ais|ait|ions|iez|aient)";
const BM_RX=new RegExp(`(?<![\\p{L}'])(${PHRASES.join("|")}|${COND})(?![\\p{L}])`,"giu");
function runBM(){
  const raw=$("#bmIn").value.replace(/’/g,"'");
  const words=(raw.match(/[\p{L}'-]+/gu)||[]).length;
  const sentences=Math.max(1,(raw.match(/[.!?]+(\s|$)/g)||[]).length);
  const found={};const add=(c,m)=>{(found[c]=found[c]||new Set()).add(m.toLowerCase())};
  let overCount=0;
  const html=esc(raw).replace(BM_RX,(m)=>{
    const c=CAT[m.toLowerCase()]||"k-cond";add(c,m);if(c==="k-over")overCount++;
    const tip=c==="k-over"?` title="Try: ${esc(BM.over[m.toLowerCase()])}"`:"";
    return `<mark class="${c}"${tip}>${m}</mark>`;
  });
  const RELIEF=/(c'est (?:[^.,;!?]{1,40}?) (?:qui|que|qu')|ce (?:qui|que|qu'|dont) [^.!?]{1,80}?, c'est)/giu;
  const reliefN=(raw.match(RELIEF)||[]).length;
  const nomN=(raw.match(/\b[\p{L}]{4,}(?:tion|sion|ment|ité|ance|ence|ure)s?\b/giu)||[]).filter(w=>!/ment$/i.test(w)).length; // -ment is skipped: mostly adverbs
  $("#bmMarked").innerHTML=html||"<span class='muted'>Start typing…</span>";
  const n=c=>found[c]?found[c].size:0;
  const relB=[...(found["k-rel"]||[])].some(r=>!["qui","où"].includes(r));
  const avg=words/sentences;
  const cMode=bmLevel[0]==="C";
  const SUBJ_C=["encore que","à condition que","pour peu que","pourvu que","en admettant que","quoi que"];
  const subjN=n("k-subj")+[...(found["k-c"]||[])].filter(x=>SUBJ_C.includes(x)).length;
  const checks=cMode?[
    [words>=bmTarget*.9,`Length: ${words} / ${bmTarget} words`],
    [n("k-b1")+n("k-b2")+n("k-c")>=6,`At least 6 different linking words (${n("k-b1")+n("k-b2")+n("k-c")})`],
    [n("k-c")>=3,`At least 3 C-level connectors (${n("k-c")})`],
    [reliefN>=1,`Emphasis: c'est … qui/que or ce qui …, c'est (${reliefN})`],
    [words>0&&nomN/Math.max(words,1)>=.03,`Nominalisations: nouns in -tion, -ité, -ance… (${nomN})`],
    [subjN>=2,`At least 2 subjonctif triggers (${subjN})`],
    [n("k-cond")>=1,"A conditionnel"],
    [words>0&&avg>=15&&avg<=35,`Sentence length: ${words?avg.toFixed(0):0} words on average (aim for 15–35)`],
    [words>0&&overCount/Math.max(words,1)<=.015,`Overused A2 words kept very low (${overCount})`]
  ]:[
    [words>=bmTarget,`Length: ${words} / ${bmTarget} words`],
    [n("k-b1")+n("k-b2")+n("k-c")>=4,`At least 4 different linking words (${n("k-b1")+n("k-b2")+n("k-c")})`],
    [n("k-b2")+n("k-c")>=2,`At least 2 B2-level linking words (${n("k-b2")+n("k-c")})`],
    [n("k-rel")>=2&&relB,"Relative clauses, including dont / ce qui / ce que / lequel"],
    [n("k-cond")>=1,"A conditionnel (hypothesis, suggestion, politeness)"],
    [n("k-subj")>=1,"A subjonctif trigger"],
    [n("k-op")>=1,"An opinion phrase"],
    [words>0&&avg>=10&&avg<=28,`Sentence length: ${words?avg.toFixed(0):0} words on average (aim for 10–28)`],
    [words>0&&overCount/Math.max(words,1)<=.03,`Overused A2 words kept low (${overCount})`]
  ];
  const met=checks.filter(c=>c[0]).length;
  $("#bmChecks").innerHTML=checks.map(c=>`<li class="${c[0]?"ok":""}"><span class="st">${c[0]?"✓":""}</span><span>${c[1]}</span></li>`).join("");
  $("#bmEst").textContent=!words?"–":cMode?(met===checks.length&&bmLevel==="C2"?"C2 features":met>=8?"C1 features":met>=6?"B2+ features":"B2 features"):met>=8?"B2 features":met>=6?"B1+ features":met>=4?"B1 features":"A2 features";
  $("#bmWords").textContent=`${met} / ${checks.length} checks`;
  const tips=[];
  if(cMode){
    if(n("k-c")<3)tips.push("Add C connectors: <b>d'autant plus que</b>, <b>force est de constater que</b>, <b>il n'en demeure pas moins que</b>.");
    if(!reliefN)tips.push("Open a paragraph with <b>Ce qui frappe, c'est…</b> or <b>C'est précisément … qui …</b>");
    if(subjN<2)tips.push("Add a subjonctif: <b>pour peu que</b>, <b>encore que</b> or <b>si … que</b> + subjonctif.");
    if(nomN/Math.max(words,1)<.03)tips.push("Turn a verb into a noun: <em>les prix augmentent</em> → <b>l'augmentation des prix</b>.");
  }
  if(!cMode&&n("k-b2")+n("k-c")<2)tips.push("Swap a <em>mais</em> for <b>cependant</b> or <b>en revanche</b>, and a <em>parce que</em> for <b>puisque</b>.");
  if(!cMode&&n("k-subj")<1)tips.push("Add a sentence with <b>il faut que</b> or <b>bien que</b> + subjonctif.");
  if(n("k-cond")<1)tips.push("Add a hypothesis: <b>Si j'étais…, je proposerais…</b>");
  if(!relB)tips.push("Join two sentences with <b>dont</b> or <b>ce qui</b>.");
  if(overCount)tips.push("Hover the wavy-underlined words for stronger alternatives.");
  $("#bmTips").innerHTML=tips.length?"<b>Next upgrade:</b> "+tips.slice(0,2).join(" "):"";
}
document.querySelectorAll("[data-cgo]").forEach(b=>b.addEventListener("click",()=>{
  document.querySelector(`[data-prompt="${b.dataset.cgo}"]`).click();
  const f=$("#bmIn").closest(".fold");if(f)f.classList.remove("collapsed");
  $("#bmPrompt").scrollIntoView();
}));
$("#bmIn").value=store.get("frB.draft",BM_SAMPLE);
let draftT;
$("#bmIn").addEventListener("input",()=>{runBM();clearTimeout(draftT);draftT=setTimeout(()=>store.set("frB.draft",$("#bmIn").value),400)});
runBM();

/* ---------- level-up rewrites and model texts ---------- */
(function(){
  const el=$("#rewrites");if(!el)return;let i=0;
  function show(){
    const r=REWRITES[i],draft=store.get("lb-rw",{})[i]||"";
    el.innerHTML=`<div class="row" style="margin-bottom:8px">${REWRITES.map((x,j)=>`<button class="chip" type="button" data-rw="${j}" aria-pressed="${j===i}">${esc(x.lv)}</button>`).join("")}</div>
      <p class="prompt"><b>${esc(r.lv)}.</b> ${esc(r.task)}</p>
      <p class="rw-from">${esc(r.from)}</p>
      <label class="lab" for="rwIn">Your version</label>
      <textarea id="rwIn" style="min-height:120px" spellcheck="false">${esc(draft)}</textarea>
      <div class="accents" data-for="rwIn">${TYPE_ACCENTS.map(a=>`<button class="acc" type="button" tabindex="-1">${a}</button>`).join("")}</div>
      <button class="btn solid" type="button" data-rwshow style="margin-top:10px">Compare with a model answer</button>
      <div class="rw-model" hidden>
        <span class="eyebrow" style="margin-top:12px">One possible answer</span>
        <p class="rw-text">${esc(r.model)} <button class="btn tr-btn" type="button" data-sayall="${esc(r.model)}">▶ Listen</button></p>
        <span class="eyebrow">What makes it level up</span>
        <ul class="small">${r.notes.map(n=>`<li>${esc(n)}</li>`).join("")}</ul>
        <p class="small muted">Yours doesn't have to match. Check that it uses the same moves; for correct grammar, ask a teacher or tandem partner.</p>
      </div>`;
  }
  el.addEventListener("click",e=>{
    const c=e.target.closest("[data-rw]");if(c){i=+c.dataset.rw;show();return}
    if(e.target.closest("[data-rwshow]")){el.querySelector(".rw-model").hidden=false;e.target.closest("[data-rwshow]").remove()}
  });
  el.addEventListener("input",e=>{if(e.target.id==="rwIn"){const d=store.get("lb-rw",{});d[i]=e.target.value;store.set("lb-rw",d)}});
  show();
  $("#models").innerHTML=MODELS.map(m=>`<details class="model"><summary><b>${esc(m.lv)}</b> · ${esc(m.task)}</summary>
    <div class="model-text">${m.text.map(p=>`<p>${esc(p)}</p>`).join("")}<button class="btn tr-btn" type="button" data-sayall="${esc(m.text.join(" "))}">▶ Listen to the whole text</button></div>
    <span class="eyebrow">Why it reaches ${esc(m.lv.replace("DELF ",""))}</span><ul class="small">${m.why.map(w=>`<li>${esc(w)}</li>`).join("")}</ul></details>`).join("");
  document.addEventListener("click",e=>{const b=e.target.closest("[data-sayall]");if(b)speak(b.dataset.sayall)});
})();

/* ---------- Lecture: reading texts with questions ---------- */
(function(){
  const box=$("#readings");if(!box)return;
  box.innerHTML=READINGS.map((r,n)=>`<div class="card reading">
    <span class="eyebrow">${esc(r.lv)} · ${esc(r.genre)}</span><h3>${esc(r.title)}</h3>
    <div class="read-text">${r.text.map(p=>`<p>${esc(p)}</p>`).join("")}</div>
    <div class="row"><button class="btn tr-btn" type="button" data-sayall="${esc(r.text.join(" "))}">▶ Listen</button></div>
    <details class="small" style="margin-top:8px"><summary style="cursor:pointer">Glossary</summary><ul>${r.gloss.map(g=>`<li><b>${esc(g[0])}</b>: ${esc(g[1])}</li>`).join("")}</ul></details>
    <div class="tool" style="margin-top:12px"><div class="tool-head"><span class="tag">Questions</span> ${r.qs.length} questions</div><div class="tool-body" data-reading="${n}"></div></div>
  </div>`).join("");
  box.querySelectorAll("[data-reading]").forEach(el=>{const r=READINGS[+el.dataset.reading];
    drill(el,()=>r.qs.map((q,i)=>Object.assign({k:"lecture",i:+el.dataset.reading*10+i,tag:r.title,noMist:true},q)),{doneText:(s,n)=>s===n?"Full marks. You read this at its level.":"Re-read the paragraph each explanation quotes, then try again."})});
})();
/* ---------- DALF synthesis practice ---------- */
(function(){
  const el=$("#synth");if(!el)return;const S=SYNTH;
  el.innerHTML=`<p class="prompt"><b>Topic: ${esc(S.topic)}.</b> ${esc(S.task)}</p>
    ${S.docs.map(d=>`<details class="model" open><summary><b>${esc(d.src)}</b></summary><p class="read-text" style="margin-top:8px">${esc(d.text)}</p></details>`).join("")}
    <label class="lab" for="synIn" style="margin-top:10px">Your synthesis (start with a title)</label>
    <textarea id="synIn" style="min-height:180px" spellcheck="false">${esc(store.get("lb-synth",""))}</textarea>
    <div class="accents" data-for="synIn">${TYPE_ACCENTS.map(a=>`<button class="acc" type="button" tabindex="-1">${a}</button>`).join("")}</div>
    <p class="small muted" id="synCount" style="margin:6px 0"></p>
    <button class="btn solid" type="button" id="synShow">Compare with a model synthesis</button>
    <div id="synModel" hidden>
      <span class="eyebrow" style="margin-top:12px">Model synthesis</span>
      <div class="rw-text"><p><b>${esc(S.modelTitle)}</b></p><p style="margin:0">${esc(S.model)}</p></div>
      <span class="eyebrow" style="margin-top:10px">Check yours against this list</span>
      <ul class="checks">${S.checks.map(c=>`<li><label style="display:flex;gap:8px;cursor:pointer"><input type="checkbox"> <span>${esc(c)}</span></label></li>`).join("")}</ul>
      <p class="small muted">Ticking the list is a self-check. For a real C1 grade, a teacher has to read it.</p>
    </div>`;
  const count=()=>{const v=$("#synIn").value,w=(v.match(/[\p{L}'-]+/gu)||[]).length;$("#synCount").textContent=`${w} words · target about ${S.target} (±10%)`;store.set("lb-synth",v)};
  $("#synIn").addEventListener("input",count);count();
  $("#synShow").addEventListener("click",()=>{$("#synModel").hidden=false;$("#synShow").remove()});
})();

/* ---------- reset ---------- */
let resetArmed=false;
$("#resetAll").addEventListener("click",e=>{
  if(!resetArmed){resetArmed=true;e.target.textContent="Click again to erase everything";setTimeout(()=>{resetArmed=false;e.target.textContent="Erase all my progress"},4000);return}
  state.cleared.clear();state.stats={};state.mistakes.clear();save();known.clear();store.set("frB.known",[]);renderFQ();renderProgress();openTab("mix");
  e.target.textContent="Erase all my progress";resetArmed=false;toast("Progress erased. Fresh start.");
});

/* ---------- English layer init ---------- */
document.querySelectorAll(".station").forEach(s=>{
  const h=s.querySelector(".station-head h2");if(h&&TITLE_EN[s.id])h.insertAdjacentHTML("afterend",`<span class="en-title">${esc(TITLE_EN[s.id])}</span>`);
});
addGlosses();
setEnglish(store.get("frB.en",true));
$("#enToggle").addEventListener("click",()=>setEnglish(document.body.classList.contains("no-en")));

renderProgress();
})();
