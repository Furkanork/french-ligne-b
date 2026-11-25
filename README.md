# Ligne B · Ligne C — French A2 → C2

A free, offline-capable French course laid out like a métro line: 16 B stations, then 8 C stations, plus daily practice (mixed drills, flashcards, listening, speaking).
Live site: https://furkanork.github.io/french-ligne-b/

## Where things live

| File | What's in it |
|---|---|
| `index.html` | The page: every station's explanations, tables and example sentences |
| `css/style.css` | All styling, including the phone layout (`@media (max-width:700px)`) |
| `js/data/stations.js` | The station list: order, names, levels, colours |
| `js/data/drills.js` | Drill questions per station. `o[0]` is always the right answer |
| `js/data/drills-more.js` | Extra questions, including typed rewrite tasks (`type:"typed"`, accepted answers in `a`) |
| `js/data/english.js` | Translations: station titles, example sentences, drill sentences |
| `js/data/words.js` | Frequent words, topic vocabulary, idioms |
| `js/data/writing.js` | Writing tasks, connector lists, level-up rewrites, annotated model texts |
| `js/data/reading.js` | Lecture texts and questions, DALF synthesis practice, speaking prompts |
| `js/app.js` | All the logic: drills and typed answers, flashcards (spaced repetition), listening, speaking, navigation, conjugator, backup, writing tools |
| `sw.js`, `manifest.json`, `icons/` | Install-as-app and offline support |
| `tests/run.js` | Automated checks |

## Common edits

- **Add a drill question:** add `{q:"… ___ …", o:["right","wrong","wrong"], e:"why"}` to the station's list in `js/data/drills.js`, and its English to the same position in `DRILL_EN` in `js/data/english.js`.
- **Add an example sentence:** write `<button class="fr" data-say>Phrase.</button>` in `index.html` and add `"Phrase.": "Translation."` to `EN` in `js/data/english.js`.
- **Add a station:** add it to `js/data/stations.js` in line order and add a matching `<section class="station" id="…">` in `index.html`. Numbers and "Next" links update themselves.
- After changing any file, bump `CACHE` in `sw.js` (e.g. `ligne-b-v8`) so installed apps pick up the change.

## Tests

```
npm i -D playwright && npx playwright install chromium   # once
node tests/run.js
```

The suite checks content consistency (every sentence translated, every drill complete), phone layouts, every drill, navigation, backup/restore, installability and offline mode.
