/* Ligne B · reading texts (Lecture station) and synthesis practice (Atelier DALF).
   Texts are original. In questions, o[0] is the right answer. */
"use strict";
const READINGS = [
 {lv:"B2", title:"Le télétravail, quatre ans après", genre:"News analysis",
  text:[
   "Quatre ans après la généralisation forcée du télétravail, le bilan est plus nuancé qu'on ne l'imaginait. Les salariés interrogés apprécient presque unanimement le temps gagné sur les trajets et la possibilité de mieux concilier vie professionnelle et vie familiale. Pourtant, une majorité d'entre eux ne souhaite pas travailler entièrement à distance : deux ou trois jours par semaine leur semblent l'équilibre idéal.",
   "Du côté des entreprises, l'enthousiasme est plus mesuré. Si certaines ont profité de la situation pour réduire leurs surfaces de bureaux, d'autres s'inquiètent d'une perte de cohésion entre les équipes, en particulier pour les nouveaux arrivants, qui apprennent leur métier en observant leurs collègues. Le télétravail n'a donc pas remplacé le bureau ; il en a transformé le rôle. On n'y vient plus pour travailler seul devant un écran, mais pour échanger, se former et créer du lien."],
  gloss:[["concilier","to reconcile, balance"],["mesuré","measured, cautious"],["la cohésion","cohesion, team spirit"],["les nouveaux arrivants","newcomers"],["créer du lien","to build relationships"]],
  qs:[
   {q:"What do employees value most about remote work?", o:["Less time commuting and a better work–family balance.","Higher salaries.","Working entirely from home."], e:"« le temps gagné sur les trajets » and « concilier vie professionnelle et vie familiale »."},
   {q:"How many remote days a week do most employees want?", o:["Two or three.","Five.","None."], e:"« deux ou trois jours par semaine leur semblent l'équilibre idéal »."},
   {q:"Why are some companies worried?", o:["Teams may lose cohesion, especially for newcomers.","Offices have become too expensive.","Employees work fewer hours."], e:"« une perte de cohésion … en particulier pour les nouveaux arrivants »."},
   {q:"What is the author's conclusion?", o:["The office hasn't disappeared, but its purpose has changed.","Remote work has failed.","Offices will soon disappear."], e:"« il en a transformé le rôle »."},
   {q:"In « plus nuancé qu'on ne l'imaginait », the word ne…", o:["is an empty ne: nothing is negated.","makes it negative: people didn't imagine it.","is a spelling mistake."], e:"After a comparison, formal French adds an empty ne (see Boss B2)."}]},
 {lv:"C1", title:"Le retour", genre:"Literary extract",
  text:[
   "Lorsqu'il revint au village, après vingt ans d'absence, Antoine eut d'abord le sentiment que rien n'avait changé. La place était toujours bordée des mêmes platanes, et la fontaine continuait de couler avec ce bruit léger qu'il croyait avoir oublié. Il s'assit sur un banc et attendit, sans trop savoir quoi.",
   "Ce ne fut qu'au bout d'une heure qu'il comprit son erreur. Personne ne l'avait reconnu. Les visages qui passaient devant lui lui étaient tous inconnus, et la boulangerie où sa mère l'envoyait chaque matin avait cédé la place à une agence immobilière. Le village n'avait pas changé, non : c'était lui qui n'y avait plus sa place. Il se leva, regarda une dernière fois la fontaine, et reprit la route sans se retourner."],
  gloss:[["bordée de","lined with"],["les platanes","plane trees"],["il s'assit","he sat down (passé simple of s'asseoir)"],["céder la place à","to give way to, be replaced by"],["reprendre la route","to set off again"]],
  qs:[
   {q:"What does Antoine feel at first?", o:["That nothing has changed.","That everything has changed.","That he is unwelcome."], e:"« Antoine eut d'abord le sentiment que rien n'avait changé »."},
   {q:"« Ce ne fut qu'au bout d'une heure qu'il comprit » means…", o:["It was only after an hour that he understood.","He understood within an hour.","After an hour he stopped understanding."], e:"ne … que = only; c'est … que highlights the time."},
   {q:"What replaced the bakery?", o:["An estate agency.","A café.","Nothing: it had closed."], e:"« avait cédé la place à une agence immobilière »."},
   {q:"What is the real change, according to the narrator?", o:["Antoine no longer belongs there.","The village has been rebuilt.","The villagers are hostile to him."], e:"« c'était lui qui n'y avait plus sa place »: an implied meaning, typical of C1 questions."},
   {q:"Which tense carries the main events (revint, s'assit, comprit)?", o:["The passé simple.","The imparfait.","The passé composé."], e:"In literary narration the passé simple moves the story on; the imparfait describes the scene."}]},
 {lv:"C1", title:"Faut-il se méfier de sa mémoire ?", genre:"Popular science",
  text:[
   "Nous avons tendance à considérer nos souvenirs comme des enregistrements fidèles du passé. Les recherches en psychologie cognitive montrent pourtant qu'il n'en est rien : chaque fois que nous nous remémorons un événement, nous le reconstruisons, et cette reconstruction peut l'altérer. Des expériences désormais célèbres ont même permis de créer de toutes pièces de faux souvenirs chez des participants, convaincus d'avoir vécu des scènes qui n'avaient jamais eu lieu.",
   "Faut-il en conclure que notre mémoire n'est pas fiable ? Ce serait aller trop vite. Si elle se trompe sur les détails, elle conserve en général l'essentiel, et sa souplesse présente un avantage : elle nous permet d'intégrer de nouvelles informations et de donner un sens à notre histoire. En revanche, ces travaux invitent à la prudence lorsqu'un témoignage constitue la seule preuve d'un délit."],
  gloss:[["se remémorer","to recall"],["altérer","to alter, distort"],["de toutes pièces","from scratch, entirely made up"],["la souplesse","flexibility"],["un délit","an offence"]],
  qs:[
   {q:"What does research show about memories?", o:["We rebuild them each time we recall them, and may change them.","They are exact recordings of the past.","They fade completely after a few years."], e:"« chaque fois que nous nous remémorons un événement, nous le reconstruisons »."},
   {q:"« Il n'en est rien » means…", o:["That's not the case at all.","There's nothing left of it.","It's nothing new."], e:"A formal way to deny what was just said."},
   {q:"Does the author conclude that memory is unreliable?", o:["No: that would be too hasty, as memory keeps the essentials.","Yes, completely.","The author doesn't say."], e:"« Ce serait aller trop vite. … elle conserve en général l'essentiel »."},
   {q:"What advantage of memory does the author mention?", o:["Its flexibility helps us take in new information and make sense of our lives.","It never forgets details.","It works like a computer."], e:"« sa souplesse présente un avantage »."},
   {q:"When does the author advise caution?", o:["When a witness statement is the only evidence of an offence.","When we remember our childhood.","When we take part in experiments."], e:"The last sentence."}]},
];

const SYNTH = {
 topic:"La semaine de quatre jours",
 docs:[
  {src:"Document 1 · article", text:"Plusieurs entreprises qui ont adopté la semaine de quatre jours font état de résultats encourageants. Selon une expérimentation menée au Royaume-Uni auprès d'une soixantaine d'entreprises, la productivité s'est maintenue, voire améliorée, tandis que les arrêts maladie ont nettement diminué. Les salariés disent mieux dormir et consacrer davantage de temps à leur famille. Pour les dirigeants, l'argument décisif est souvent celui du recrutement : dans les secteurs où la main-d'œuvre manque, offrir un jour de repos supplémentaire permet d'attirer des candidats."},
  {src:"Document 2 · opinion piece", text:"La semaine de quatre jours n'est pas une solution miracle. Dans de nombreux métiers, comme la santé, le commerce ou l'industrie, il est impossible de concentrer le travail sur quatre jours sans embaucher ou sans allonger les journées, au risque d'épuiser les équipes. Par ailleurs, les petites entreprises n'ont pas toujours les moyens de réorganiser leurs plannings. Avant de généraliser le modèle, il conviendrait donc d'en évaluer les effets secteur par secteur."}],
 task:"Write a synthesis of the two documents in about 110 words (the exam version is about 220, from longer documents). Give it a title. No personal opinion, no copied sentences.",
 target:110,
 modelTitle:"La semaine de quatre jours : un modèle prometteur, mais difficile à généraliser",
 model:"La semaine de quatre jours suscite un intérêt croissant, mais son efficacité fait débat. Le premier document en souligne les effets positifs : selon une expérimentation britannique, la productivité se maintient tandis que les absences pour maladie reculent ; les salariés y gagnent en qualité de vie et les employeurs en attractivité. Le second document met en revanche en garde contre une généralisation hâtive : dans les secteurs à activité continue, ce rythme imposerait des embauches ou des journées plus longues, et les petites structures manquent souvent de moyens pour s'adapter. Il ressort de ces documents que ce modèle, s'il est prometteur, ne saurait s'appliquer partout de la même manière.",
 checks:["A neutral title that names the topic and the tension","An opening sentence that sets out the debate","Both documents presented and compared (le premier … le second … en revanche)","Ideas reworded, not copied: « les arrêts maladie ont nettement diminué » → « les absences pour maladie reculent »","No « je », no opinion, no outside examples","A closing sentence that draws out what the documents show together (il ressort de …)","Connectors carry the logic: mais, tandis que, en revanche, s'il est …"]
};
