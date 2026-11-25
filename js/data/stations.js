/* Ligne B · The 23 stations, in line order. lv = CEFR level; c = line colour.
   Loaded before js/app.js; these top-level constants are shared with it. */
"use strict";
const STATIONS=[
  {id:"passe",name:"Le passé",sub:"PC vs imparfait",lv:"B1",c:"#FFCD00"},
  {id:"pronoms",name:"Pronoms",sub:"le, lui, y, en",lv:"B1",c:"#003CA6"},
  {id:"negation",name:"Négation",sub:"jamais, rien, mieux",lv:"B1",c:"#00AEEF"},
  {id:"relatifs",name:"Relatifs",sub:"qui, que, dont",lv:"B1",c:"#837902"},
  {id:"hypotheses",name:"Futur & si",sub:"plans, regrets",lv:"B1",c:"#CF009E"},
  {id:"subjonctif",name:"Subjonctif",sub:"triggers",lv:"B1+",c:"#FF7E2E"},
  {id:"prepositions",name:"Verbes + à/de",sub:"à, de, au, en",lv:"B1+",c:"#A3D977"},
  {id:"connecteurs",name:"Connecteurs",sub:"argue, link",lv:"B2",c:"#6ECA97"},
  {id:"raconter",name:"Raconter",sub:"reported speech",lv:"B2",c:"#FA9ABA"},
  {id:"causatif",name:"Faire faire",sub:"causative, questions",lv:"B2",c:"#5B6C8F"},
  {id:"frequents",name:"Mots fréquents",sub:"~360 core words",lv:"B1–B2",c:"#C9910D"},
  {id:"vocabulaire",name:"Vocabulaire",sub:"6 exam topics",lv:"B1–B2",c:"#E19BDF"},
  {id:"expressions",name:"Expressions",sub:"20 idioms",lv:"B2",c:"#B6BD00"},
  {id:"boss",name:"Boss B2",sub:"last traps",lv:"B2",c:"#704B1C"},
  {id:"delf",name:"Atelier DELF",sub:"write + check",lv:"B1–B2",c:"#007852"},
  {id:"terminus",name:"Terminus B",sub:"B mock exam",lv:"B2",c:"#62259D"},
  {id:"nuances",name:"Nuances",sub:"concession, condition",lv:"C1",c:"#0B7A75"},
  {id:"relief",name:"Mise en relief",sub:"emphasis, style",lv:"C1",c:"#C0392B"},
  {id:"litteraire",name:"Temps littéraires",sub:"passé simple",lv:"C1–C2",c:"#34495E"},
  {id:"motjuste",name:"Le mot juste",sub:"precise verbs",lv:"C1–C2",c:"#9A7D0A"},
  {id:"expressionsc",name:"Expressions C",sub:"20 idioms",lv:"C1–C2",c:"#D35400"},
  {id:"lecture",name:"Lecture",sub:"read and understand",lv:"B2–C1",c:"#2E86C1"},
  {id:"dalf",name:"Atelier DALF",sub:"synthèse, essai",lv:"C1–C2",c:"#1B4F72"},
  {id:"terminusc",name:"Terminus C",sub:"C mock exam",lv:"C2",c:"#1a1a1a"}
];
const CIDS=new Set(STATIONS.filter(x=>x.lv[0]==="C").map(x=>x.id));
