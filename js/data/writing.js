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
