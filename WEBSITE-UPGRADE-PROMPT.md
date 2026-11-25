# Prompt: level up any website

A general prompt for improving an existing website of any kind: a shop, portfolio, tool, blog, dashboard, community or app. Fill in the [BRACKETS] and paste everything below the line into a new session that has access to the site's code.

---

You're improving an existing website: **[WHAT THE SITE IS AND WHO IT'S FOR]**. Code: **[REPO OR FOLDER]**. Live at **[URL]**. Its main goal is **[WHAT A SUCCESSFUL VISIT LOOKS LIKE: e.g. a purchase, a sign-up, finding information, finishing a task]**. Most visitors use **[PHONE / DESKTOP / BOTH]**.

## Phase 1: Understand and audit (change nothing yet)

1. **Read all of it:** every page, the code, the content and the configuration. Run it locally.
2. **Use it like a real visitor,** in a browser at phone width (about 390px), tablet and desktop, in light and dark mode. Do the main task from start to finish. Take screenshots and look at them.
3. **Give me an honest report:**
   - **A score out of 10, area by area:** purpose and clarity, the main task flow, content quality and accuracy, design and readability, mobile usability, speed, accessibility, reliability (errors, broken links, edge cases), data and privacy, security basics, SEO and sharing, and code health. Give each score a one-line reason.
   - **What's broken:** errors, dead links, layouts that overflow or overlap, forms that fail, anything that doesn't do what it says.
   - **What's misleading:** claims the site can't back up, outdated information, features that look finished but aren't.
   - **What's missing** that users of this kind of site would expect.
   - **A prioritised plan:** most impact for least effort first, with a rough size for each step.

Be critical. "This page doesn't help anyone do anything" is more useful than a polite score. Then **wait for my go-ahead.**

## Phase 2: Fix in priority order, one step at a time

After each step:
- run the tests;
- check it in the browser at phone and desktop size;
- commit with a clear message and deploy;
- tell me in a few lines what changed and what you couldn't verify.

This is the usual order. Adapt it to what the audit found.

1. **Stop the damage.** Fix anything broken, anything that loses users' data or work, anything insecure (exposed secrets, unsafe forms, missing HTTPS), and any claim that's false.
2. **Protect what users create.** If people save anything (accounts, carts, drafts, progress, settings), make sure it survives refreshes, device changes and mistakes. Offer an export or backup where it makes sense, and never delete without asking.
3. **Make the core task effortless.** The first screen tells visitors what this is and what to do next. Remove steps, clicks and reading that don't serve the main goal. Put the most-used actions where thumbs reach on a phone.
4. **Mobile first:**
   - nothing overflows sideways;
   - tap targets are at least 44px and text is readable without zooming;
   - navigation works with one hand;
   - forms use the right keyboard and don't get hidden behind it;
   - landscape and dark mode work.
5. **Content you can trust.** Check every fact, number, price, date, link and claim. Remove or label anything outdated. Write plainly for the actual audience. Wherever the site gives advice or scores, say what it can't do.
6. **Code health.** Separate content from logic and styling so routine edits are safe. Remove dead code. Add an automated test script for the core flows, and a README explaining where things live and how to run and deploy.
7. **Speed and resilience:**
   - compress images and load only what each page needs;
   - handle slow or no network gracefully;
   - show useful error messages instead of blank screens.
8. **Accessibility:**
   - keyboard navigation and visible focus;
   - enough colour contrast;
   - alt text, labelled form fields, and a sensible heading order;
   - respect for reduced-motion settings.
9. **Findability:** page titles, descriptions, share previews, and a favicon or app icon. Make it installable or usable offline if repeat visits matter.
10. **Then, and only then, new features.** Pick the ones that serve the main goal, based on what's missing from the audit. Build each to the same standard.

## Phase 3: Final check

- **Accuracy:** re-read every piece of content and check each claim, calculation and instruction. Report what you fixed, and say this is a self-review, not an expert or user test.
- **Full regression:** the whole test suite, plus a manual run of the main task on phone and desktop.
- **New honest score,** in the same areas as the audit, plus what still limits the site and what only I can do (real user testing, expert review, real devices, decisions about content or money).

## Rules throughout

- **Never say something works unless you tested it.** List what you couldn't test.
- **Don't break one thing to fix another:** run every test before every deploy.
- **Small, reversible steps,** each one committed and deployed on its own.
- **Ask before anything irreversible or outward-facing:** deleting data, changing what users see as their account, publishing, sending emails, spending money, making something public.
- **Keep my data and my users' data private;** no secrets in the code.
- **Prefer plain language** in the site and in your reports to me.
