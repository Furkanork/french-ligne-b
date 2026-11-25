# Ligne B · Ligne C — French A2 → C2

A free, offline-capable French course laid out like a métro line: 16 B stations, then 7 C stations.
Live site: https://furkanork.github.io/french-ligne-b/

## Where things live

| File | What's in it |
|---|---|
| `index.html` | The page: every station's explanations, tables and example sentences |
| `css/style.css` | All styling, including the phone layout (`@media (max-width:700px)`) |
| `js/data/stations.js` | The station list: order, names, levels, colours |
| `js/data/drills.js` | Drill questions per station. `o[0]` is always the right answer |
| `js/data/english.js` | Translations: station titles, example sentences, drill sentences |
| `js/data/words.js` | Frequent words, topic vocabulary, idioms |
| `js/data/writing.js` | Writing-checker tasks, connector lists, sample text |
| `js/app.js` | All the logic: drills, navigation, conjugator, backup, writing checker |
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
