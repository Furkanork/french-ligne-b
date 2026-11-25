# Prompt: level up an existing language-learning website

Fill in the [BRACKETS], then paste everything below the line into a new session that has access to the site's repository.

---

You're upgrading an existing website for learning **[LANGUAGE]** (repo: **[OWNER/REPO]**, live at **[URL]**). I'm a **[CURRENT LEVEL]** learner aiming for **[TARGET LEVEL]**, my native language is **[NATIVE LANGUAGE]**, and I mostly use the site **on my phone**. Work in the order below, and don't skip the audit.

## 1. Audit first, then wait for my go-ahead
Before changing anything, read the whole site and test it on simulated phones (iPhone and Android sizes) and at desktop size. Then give me:
- **An honest score out of 10**, broken down into: explanations, drills, vocabulary, listening, speaking, writing, mobile usability, accuracy, keeping my progress, and code health. For each one, say why it got that score.
- **A list of everything that's broken or misleading**: anything that overflows sideways on a phone, dead buttons, script errors, claims the site can't back up.
- **A prioritised fix plan**, with a rough size for each step.

Be critical. I'd rather hear "this part is a cheat sheet, not a course" than get a flattering score.

## 2. Fix in this order, and ship each step separately
After each step: run the tests, commit with a clear message, push, and tell me in a few lines what changed and what you couldn't test.

1. **Protect progress.** If progress lives only in the browser, add export/import (a file plus a copyable code) and a weekly reminder to back up. Prove it with a round-trip test: make progress, back up, wipe, restore, then compare.
2. **Code health.** Split content (lessons, questions, translations, word lists) from logic and styling, so adding a question means editing a list. Add an automated test script and a README explaining where things live.
3. **Mobile first.** Nothing overflows sideways at 360–430px. Wide tables fit or split. Tap targets are at least 44px. Add a bottom bar for the main actions and a menu listing every section. The first screen shows what to do today, not an intro. Long sections fold away. Check dark mode and landscape too.
4. **Retention.** Flashcards with spaced repetition (roughly 1, 3, 7, 16, 35 and 90 days) for all the vocabulary, with a daily cap on new cards. Mistakes come back on a schedule until they've been answered right several times on different days.
5. **Production, not just recognition.** Questions switch from multiple choice to typed answers once known. Marking tolerates capitals, spacing and punctuation, but flags missing accents or diacritics as "almost". Add rewrite tasks (change the tense, replace with a pronoun, join sentences). Aim for 15–25 questions per grammar topic, so they can't simply be memorised.
6. **Listening.** Dictation using the site's own example sentences, with word-by-word marking and a speed setting; listen-and-choose; a list of real native sources by level, with a listening log. Warn the learner if the device has no voice for [LANGUAGE], and say how to add one.
7. **Speaking.** Shadowing: hear the model, record yourself, compare. Timed exam-style speaking prompts with a level checklist. Fall back gracefully where recording isn't available.
8. **Writing.** Any automatic checker must say honestly what it can't do (e.g. "it counts structures, it doesn't correct grammar"). Add level-up rewrites with model answers, and annotated model texts for the relevant exams ([EXAMS, e.g. DELF/DALF, DELE, Goethe, JLPT]).
9. **Honest framing of advanced levels.** If the C1/C2 (or equivalent) content is reference rather than a full course, say so on the page. Add authentic-style reading with comprehension and implied-meaning questions, plus the exam's hardest writing task (e.g. synthesis) with a model answer.
10. **Installable and offline.** Web app manifest, icons, a service worker that caches every file (with a test that enforces this), and deployment to GitHub Pages or the existing host.

## 3. Accuracy pass at the end
Review every question, answer, explanation, translation and example sentence in [LANGUAGE]. In particular, look for:
- questions with **two defensible answers**;
- rules stated as absolute when natives often break them (mention the colloquial usage);
- lists presented as complete when they aren't;
- glosses that could mislead;
- joke wrong answers that teach nothing;
- explanations that contradict another section.

Test any generator, such as a conjugator or declension tool, against known correct forms for 30+ common words. Report what you fixed. Be clear that this is a self-review and not the same as a native speaker or teacher checking it.

## Rules throughout
- **Test like a user,** in a headless browser at phone sizes: no script errors, no sideways overflow, every drill runs to the end, navigation works, the site installs and works offline. Look at screenshots, not just numbers.
- **Never claim something works if you didn't test it.** List what you couldn't test (real devices, audio quality, microphone).
- **Don't fix one thing by breaking another:** run the full test suite before every push.
- **End with a new honest score,** and say what still limits the site.
