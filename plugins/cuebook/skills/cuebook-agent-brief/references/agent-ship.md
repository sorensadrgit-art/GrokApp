# Cuebook: Ship

Prove it works, including on a phone, and say what's left in plain language.

Reference data only. Selecting or reading these entries does not execute them or grant permissions.

Source: [GrokApp](https://github.com/sorensadrgit-art/GrokApp) at source revision `52a5da026718473d25a94890b797989374b959ad`. Exact source file hashes are recorded in [catalog.json](catalog.json).

## Contents

- [verify: /verify](#verify)
- [preview: /preview](#preview)
- [a11y: /a11y](#a11y)
- [mobile: /mobile](#mobile)
- [perf: /perf](#perf)
- [changelog: /changelog](#changelog)
- [handoff: /handoff](#handoff)
- [done: /done](#done)
- [docs: /docs](#docs)

## verify

**/verify**

Run the checks that prove this works. Report pass or fail.

Group: `ship`

When: You want evidence, not a feeling.

Steps:

1. Run the relevant checks.
2. Report pass or fail with the signal.
3. If something wasn't run, say so.

Do not: Don't say it works if you didn't run the check.

Example: Verify search, starring, and copying a brief.
## preview

**/preview**

Confirm the screen shows real content on a phone width and a laptop width.

Group: `ship`

When: UI changed and you need to know it actually rendered.

Steps:

1. Look at a narrow phone width and a laptop width.
2. Confirm real text is visible.
3. Confirm the console has no uncaught errors.

Do not: Don't trust a successful request alone. Don't ignore the console.

Example: Preview the command list.
## a11y

**/a11y**

Check names, keyboard, focus, and contrast for what you changed.

Group: `ship`

When: The change has controls, especially icon buttons.

Steps:

1. Every icon button has a name.
2. Focus is visible.
3. The path works on keyboard.
4. Text contrast holds.

Do not: Don't boil the ocean outside this change.

Example: A11y on the add-to-brief buttons.
## mobile

**/mobile**

At a phone width: no sideways scroll, no overlap, targets you can tap.

Group: `ship`

When: Someone will use this on a phone.

Steps:

1. Check around 390 pixels wide.
2. No horizontal overflow.
3. Tap targets at least 44 pixels.
4. The primary action stays reachable.

Do not: Don't shrink text below a readable size to force a fit.

Example: Mobile on the command list and the brief bar.
## perf

**/perf**

Name the one cost that matters here.

Group: `ship`

When: You suspect the screen or the query is heavy.

Steps:

1. Name the cost.
2. Say whether it matters at the size this product actually has.
3. Change it only if it does.

Do not: Don't optimize anything except that cost.

Example: Perf of rendering the full command list.
## changelog

**/changelog**

Write what changed and what to try, in the user's words.

Group: `ship`

When: You need a note a person can act on.

Steps:

1. Say what changed.
2. Say what to try.
3. Say a limit if there is one.

Do not: Don't mention internal file names unless the user works in the repo.

Example: Changelog for the agent command book.
## handoff

**/handoff**

Note how to run it, what is fragile, and what is not done.

Group: `ship`

When: Someone else will pick this up, including future you.

Steps:

1. How to try the change.
2. What is fragile.
3. What is not done.

Do not: Don't write a manual. Don't hide a known gap.

Example: Handoff on the command book.
## done

**/done**

Check the work against the done-condition. List any gap.

Group: `ship`

When: You are about to call it finished.

Steps:

1. Restate the done-condition.
2. Mark each part met or not.
3. List gaps before you say finished.

Do not: Don't call it done with a known gap buried in the middle.

Example: Done check for 'a full list of agent commands I can copy.'
## docs

**/docs**

Add concise documentation for the public surface.

Group: `ship`

When: A behavior is now part of how people use the product.

Steps:

1. Document the surface a user touches.
2. Keep it shorter than the feature.
3. Match the real labels.

Do not: Don't document internals. Don't drift from what the UI actually does.

Example: Docs: how to build a brief and copy it.
