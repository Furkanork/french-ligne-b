/* Ligne B · Writing checker: task prompts, connector lists by level, and the sample text.
   Loaded before js/app.js; these top-level constants are shared with it. */
"use strict";
const BM_PROMPTS={
  B1:["Vous avez passé un week-end dans une ville que vous ne connaissiez pas. Écrivez à un ami pour raconter ce que vous avez fait et ce que vous en avez pensé. (160 mots)",
      "Sur un forum, quelqu'un demande : « Faut-il interdire les voitures en centre-ville ? » Donnez votre opinion avec des exemples. (160 mots)",
      "Vous avez eu un problème avec un achat en ligne. Écrivez au service client pour expliquer la situation et demander une solution. (160 mots)",
      "Racontez un souvenir d'enfance important pour vous et expliquez pourquoi il compte encore. (160 mots)",
      "Un ami hésite à partir étudier un an à l'étranger. Écrivez-lui pour le conseiller. (160 mots)"],
  B2:["Le télétravail : progrès ou isolement ? Rédigez un essai argumenté. (250 mots)",
      "Vous écrivez au maire de votre ville pour proposer un projet qui rendrait votre quartier plus écologique. (250 mots)",
      "Les réseaux sociaux rendent-ils les jeunes moins heureux ? Écrivez un article pour un magazine. (250 mots)",
      "Faut-il rendre les transports publics gratuits ? Donnez votre point de vue de façon nuancée. (250 mots)",
      "Apprendre une langue étrangère est-il encore utile à l'heure de la traduction automatique ? (250 mots)"],
  C1:["Essai argumenté : la croissance économique est-elle compatible avec la protection de l'environnement ? (250 mots)",
      "Essai : faut-il limiter l'usage de l'intelligence artificielle à l'école ? (250 mots)",
      "Courrier des lecteurs : vous réagissez à un article selon lequel lire des romans ne sert plus à rien. (250 mots)",
      "Essai : le travail doit-il rester au centre de nos vies ? (250 mots)"],
  C2:["Article argumenté : la mondialisation menace-t-elle la diversité culturelle ? (700 mots)",
      "Tribune pour un grand quotidien : faut-il réformer en profondeur l'école ? (700 mots)",
      "Discours devant un conseil municipal sur la place de la voiture en ville. (700 mots)"]
};
const BM_C=["quand bien même","pour peu que","à condition que","au cas où","d'autant plus que","faute de","sous prétexte que","dans la mesure où","de sorte que","dès lors","encore que","ai beau","as beau","a beau","avons beau","avez beau","ont beau","quoi que","pourvu que","en admettant que","force est de constater","il n'en demeure pas moins","toujours est-il","n'empêche que","de surcroît","en l'occurrence","a fortiori","somme toute","quoi qu'il en soit","à cet égard","il convient de","eu égard à","au demeurant","en somme","dans cette optique","à l'inverse","il va sans dire","autrement dit","en d'autres termes","il ressort de","s'accordent à"];
const BM={
  b1:["d'abord","ensuite","enfin","parce que","car","donc","alors","mais","par contre","par exemple","même si","en plus","aussi","du coup","après","puis"],
  b2:["cependant","pourtant","en revanche","alors que","tandis que","bien que","quoique","certes","malgré","puisque","étant donné que","vu que","grâce à","en raison de","par conséquent","c'est pourquoi","si bien que","ainsi","afin de","afin que","pour que","tout d'abord","en premier lieu","pour conclure","en conclusion","notamment","c'est-à-dire","en effet","de plus","en outre","par ailleurs","d'une part","d'autre part","non seulement","en définitive","néanmoins","toutefois","au contraire","quant à"],
  rel:["dont","ce qui","ce que","ce dont","lequel","laquelle","lesquels","lesquelles","auquel","auxquels","duquel","qui","où"],
  subj:["il faut que","il faudrait que","bien que","pour que","afin que","avant que","sans que","à moins que","jusqu'à ce que","je veux que","je voudrais que","il est important que","il est essentiel que","il est nécessaire que","il est possible que","je doute que","je ne pense pas que","je ne crois pas que","je suis content que","j'ai peur que","je souhaite que","quoique","il semble que"],
  op:["à mon avis","selon moi","d'après moi","il me semble que","je pense que","je trouve que","je crois que","je suis convaincu","je suis convaincue","je suis d'accord","je ne suis pas d'accord","personnellement","pour ma part","de mon point de vue","j'estime que"],
  over:{"très":"extrêmement, particulièrement","beaucoup":"énormément, de nombreux","chose":"élément, aspect","choses":"éléments, aspects","il y a":"il existe","faire":"réaliser, effectuer","bon":"efficace, pertinent","important":"essentiel, crucial","problème":"difficulté, enjeu","problèmes":"difficultés, enjeux","dire":"affirmer, expliquer","mettre":"placer, poser","truc":"élément, objet"}
};
const BM_SAMPLE="À mon avis, le télétravail présente de nombreux avantages. Tout d'abord, il permet de gagner du temps, puisque l'on ne perd plus deux heures dans les transports. De plus, les salariés dont les enfants sont petits peuvent mieux organiser leur journée.\n\nCependant, il faut que les entreprises fassent attention à l'isolement. Certains employés se sentent seuls, ce qui peut les rendre moins motivés. C'est un problème très important.\n\nSi j'étais directeur, je proposerais deux jours au bureau par semaine. Par conséquent, chacun garderait le lien avec l'équipe tout en profitant d'une certaine liberté.";

/* Level-up rewriting tasks: rewrite the plain text, then compare with the model. */
const REWRITES = [
 {lv:"A2 → B1", task:"Join these short sentences into three. Use qui or que, parce que, a time word (ensuite, après) and the pronoun y.",
  from:"Samedi, je suis allé au marché. Le marché est près de chez moi. J'ai acheté des fruits au marché. Les fruits étaient très bons. Après, je suis rentré. J'étais fatigué.",
  model:"Samedi, je suis allé au marché qui se trouve près de chez moi. J'y ai acheté des fruits qui étaient délicieux. Ensuite, je suis rentré parce que j'étais fatigué.",
  notes:["qui joins two sentences about the same thing","y replaces « au marché »","ensuite orders the events","parce que gives the reason","imparfait (étaient, étais) for descriptions and states"]},
 {lv:"B1 → B2", task:"Make this opinion more convincing. Use a concession with certes, B2 connectors (car, donc, ainsi), il est indispensable que + subjonctif, and a conditionnel.",
  from:"Je pense que le vélo en ville est une bonne idée. C'est bon pour la santé. Mais c'est dangereux. Il faut plus de pistes cyclables. Comme ça, les gens vont prendre le vélo.",
  model:"À mon avis, développer le vélo en ville est une excellente idée, car il est bénéfique pour la santé. Certes, circuler à vélo reste dangereux ; il est donc indispensable que la ville crée davantage de pistes cyclables. Ainsi, les habitants seraient plus nombreux à laisser leur voiture au garage.",
  notes:["certes … ; donc: you admit the problem, then answer it","il est indispensable que + subjonctif (crée)","car and ainsi instead of « c'est » and « comme ça »","davantage, bénéfique: more precise words","seraient: the conditionnel presents a likely result"]},
 {lv:"B2 → C1", task:"Rewrite at C1. Turn a verb into a noun, use an emphasis structure (ce qui …, c'est …) and a C-level connector.",
  from:"Les loyers augmentent beaucoup dans les grandes villes. Les jeunes ne peuvent plus se loger. C'est très inquiétant. Pourtant, le gouvernement ne fait pas grand-chose.",
  model:"La forte hausse des loyers dans les grandes villes rend le logement inaccessible à de nombreux jeunes. Ce qui inquiète, c'est moins la hausse elle-même que l'inaction des pouvoirs publics : force est de constater que les mesures prises restent timides.",
  notes:["la forte hausse des loyers: the verb augmenter becomes a noun","ce qui inquiète, c'est moins … que …: emphasis plus a contrast","force est de constater que: a C-level connector","l'inaction des pouvoirs publics: abstract, precise wording","two long, well-linked sentences instead of four short ones"]},
 {lv:"B2 · narration", task:"Turn this dialogue into two sentences of narrative in the past, using reported speech.",
  from:"Marc : « Je ne peux pas venir ce soir. » Léa : « Pourquoi ? » Marc : « Je dois finir un rapport. Je te rappellerai demain. »",
  model:"Marc a dit à Léa qu'il ne pouvait pas venir ce soir-là. Quand elle lui a demandé pourquoi, il a expliqué qu'il devait finir un rapport et qu'il la rappellerait le lendemain.",
  notes:["présent → imparfait: pouvait, devait","futur → conditionnel: rappellerait","ce soir → ce soir-là, demain → le lendemain","varied reporting verbs: dire, demander, expliquer"]},
];

/* Annotated model texts. */
const MODELS = [
 {lv:"DELF B1", task:"Forum: « Faut-il interdire les voitures en centre-ville ? » Give your opinion with examples.",
  text:["Bonjour à tous,",
   "À mon avis, il ne faut pas interdire complètement les voitures en centre-ville, mais il faut les limiter. D'abord, dans ma ville, il y a souvent des embouteillages et l'air est pollué, surtout en été. Quand j'étais enfant, on pouvait jouer dans les rues, ce qui est impossible aujourd'hui. Ensuite, les transports en commun se sont beaucoup améliorés : le tramway, que je prends tous les jours, est rapide et pas cher.",
   "Par contre, certaines personnes ont besoin de leur voiture, par exemple les personnes âgées ou les artisans. Si on interdisait toutes les voitures, ce serait très difficile pour eux.",
   "Donc je propose une solution intermédiaire : des rues piétonnes le week-end et des parkings à l'entrée de la ville. Et vous, qu'est-ce que vous en pensez ?"],
  why:["A clear opinion in the first sentence (à mon avis)","A plan readers can follow: d'abord, ensuite, par contre, donc","Personal examples, as the task asks","The imparfait for a past habit (on pouvait jouer)","Relative clauses: ce qui, que","A si + imparfait → conditionnel sentence","Ends with a question: right for a forum post","About 150 words: in the B1 range"]},
 {lv:"DELF B2", task:"Essay: « Les réseaux sociaux rendent-ils les jeunes moins heureux ? »",
  text:["Les réseaux sociaux occupent aujourd'hui une place considérable dans la vie des adolescents. Faut-il pour autant les tenir pour responsables de leur mal-être ?",
   "Certes, de nombreuses études montrent qu'une utilisation intensive favorise l'anxiété et les troubles du sommeil. En effet, la comparaison permanente avec des vies apparemment parfaites peut fragiliser l'estime de soi, d'autant que les algorithmes mettent en avant les contenus les plus spectaculaires.",
   "Cependant, il serait réducteur de ne voir que les aspects négatifs. Les réseaux permettent aussi aux jeunes isolés de trouver une communauté et de s'exprimer. Le problème ne vient donc pas tant de l'outil que de l'usage qu'on en fait.",
   "Par conséquent, plutôt que d'interdire, il faudrait que les parents et l'école apprennent aux jeunes à utiliser ces plateformes de façon critique. C'est à cette condition que les réseaux sociaux pourront devenir un espace d'échange plutôt qu'une source de souffrance."],
  why:["The introduction turns the topic into a real question (faut-il pour autant …)","Certes … cependant: both sides, then a position","Precise vocabulary: favoriser, fragiliser, l'estime de soi, réducteur","d'autant que: a stronger reason","ne … pas tant … que …: a nuanced conclusion to the argument","il faudrait que + subjonctif (apprennent)","C'est à cette condition que …: emphasis in the conclusion","About 190 words here; the exam asks for about 250, so a full answer adds one more example"]},
];
