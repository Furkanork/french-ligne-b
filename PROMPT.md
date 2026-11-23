# Prompt: build a language-learning site (any language)

Fill in the [BRACKETS], then paste everything below the line into a new session.

---

Build me a single-page, mobile-first website for learning **[LANGUAGE]**. I'm at **[CURRENT LEVEL, e.g. A2]** and I want to reach **[TARGET LEVEL, e.g. B1/B2]**. My native language is **[NATIVE LANGUAGE]**, so all explanations, translations and feedback should be in it.

## Core idea: 80/20
Use the Pareto principle. Find the small set of grammar structures, words and phrases that does most of the work in the jump from my level to the target level, and teach them in the order that pays off fastest. Skip anything rare, academic or low-impact. Every section should say briefly why it matters at the target level.

## Structure: a "line" of stations
- Build the page as a journey of **10–14 stations**, shown as a transit-style line. Each station has its own colour, number and level tag (e.g. B1, B1+, B2).
- Give the visual style a subtle nod to the culture where the language is spoken (signage, transit or typography), without copying any real brand.
- Choose the stations from the 80/20 analysis. For most languages that means roughly:
  1. The past tenses: how to tell a story.
  2. Pronouns and word order.
  3. Relative clauses / joining sentences.
  4. The future and conditionals ("if" sentences, plans, regrets).
  5. The mood or form learners find hardest at this level (for example a subjunctive, aspect, cases or particles, whichever this language actually has).
  6. Connectors for arguing and linking ideas.
  7. Advanced narrative and reported speech.
  8. A "boss" station: the hardest B2-level topics, each with a short "cheat code".
  9. High-frequency words: about 300 of the most useful words at this level, grouped by topic. Each word gets a "known" checkbox, a hide-known filter, and false-friend warnings.
  10. Vocabulary chunks: about 50 ready-made phrases.
  11. Idioms: about 20 common ones, with literal and real meanings.
  12. Exam workshop: tasks in the style of **[EXAM, e.g. DELF / DELE / Goethe / JLPT / none]** for telling, explaining and arguing.
  13. Terminus: a final mock exam mixing all stations.
- Every station has: a short "payoff" line explaining why it matters, explanation cards with example sentences, tables where useful, and a drill at the end.

## Interactive tools
- **Drills:** 6–15 multiple-choice questions per station, shuffled, with instant feedback that explains *why* the answer is right or wrong.
- **My mistakes:** every missed question is saved and comes back until I answer it correctly.
- **Daily mix:** 10 questions a day, weighted towards my weakest stations and stations I haven't tried.
- **Conjugator / inflection tool** (if the language has verb conjugation or noun inflection): type a word, see its key forms. Include quick-pick chips for the most common irregular words.
- **Typing sprint:** typed answers for conjugation or forms, with on-screen buttons for special characters or accents.
- **Writing analyser:** I paste or type a paragraph, and it highlights the target-level structures I used (connectors, subordinate clauses, advanced tenses or moods), shows a checklist of what's missing, and gives a rough level estimate.
- **Progress:** a route map showing stations cleared and drill accuracy per station, plus a "mark station cleared" button.

## Language support
- Every example sentence in [LANGUAGE] has a translation in my native language.
- Add an **"English: on/off" toggle** (or my native language) to hide translations when I want to test myself.
- Tap any word or sentence to hear it, using the browser's built-in speech synthesis with the right language voice.
- Station titles, tables, word lists and feedback all have translations.

## Mobile-first and easy to use
- Design for phones first; desktop should also look good.
- Nothing may overflow sideways on a 360–430px wide screen. Tables must fit; split wide ones on phones.
- On phones, use a **bottom menu bar**: Practice / Mistakes (with count badge) / Stations / Top.
- The top bar shows the current station. Tapping it opens a full list of all stations with progress.
- Tap targets are at least 44px. Quiz answers are full-width buttons. Nothing is smaller than about 12.5px.
- Hide the bottom bar while the keyboard is open.
- Support light and dark mode, and respect reduced-motion settings.

## Installable app and offline use
- Make it a PWA: a web app manifest, icons (192px, 512px and a maskable one, plus an apple-touch-icon), a theme colour and a service worker.
- It must install from Chrome on Android and Safari on iPhone ("Add to Home Screen") and work offline.
- Save all progress in localStorage (no accounts, no server).

## Technical
- One self-contained `index.html` (plus manifest, service worker and icons). No build step, no frameworks, no paid APIs.
- Deploy to **GitHub Pages** in my repo **[GITHUB USERNAME]/[REPO NAME]**, then give me the link and the steps to install it on my phone.

## Quality checks before you say it's done
- Load it in a headless browser at phone sizes (iPhone and Android) and at desktop size. Check for no script errors, no sideways overflow and no tap targets under 44px.
- Run every drill and tool once, and check the menus and the translation toggle.
- Check Chrome reports zero installability errors and that the page loads offline.
- Check the [LANGUAGE] content for accuracy: correct grammar, natural phrasing, and translations that match.
- Tell me honestly what you tested and what you couldn't test (for example audio, or my real phone).
