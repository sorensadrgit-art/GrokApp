# Cuebook: Write

Spec, rewrite, and the messages around the work. Keep the meaning you already have.

Reference data only. Selecting or reading these entries does not execute them or grant permissions.

Source: [GrokApp](https://github.com/sorensadrgit-art/GrokApp) at source revision `632f3d1ca78627ca4987c65da211c395e91ff9de`. Exact source file hashes are recorded in [catalog.json](catalog.json).

## Contents

- [spec: /spec](#spec)
- [rewrite: /rewrite](#rewrite)
- [shorten: /shorten](#shorten)
- [simplify: /simplify](#simplify)
- [human: /human](#human)
- [formal: /formal](#formal)
- [commit-msg: /commit-msg](#commit-msg)
- [pr: /pr](#pr)
- [error-copy: /error-copy](#error-copy)
- [skeleton: /skeleton](#skeleton)
- [bullets: /bullets](#bullets)
- [tldr: /tldr](#tldr)
- [checklist: /checklist](#checklist)

## spec

**/spec**

Write the spec: who it's for, the job, done-when, and out of scope.

Group: `write`

When: The work needs a contract before building.

Steps:

1. Who it's for.
2. The job.
3. Done when.
4. Out of scope.
5. The edge cases that matter.

Do not: Don't include implementation trivia. Don't leave done-when as a vibe.

Example: Spec a full command list for my agent.
## rewrite

**/rewrite**

Rephrase the text I give you. Keep the meaning.

Group: `write`

When: The words are close but the wording is wrong.

Steps:

1. Keep every fact.
2. Change the wording.
3. Don't add a closer or a moral.

Do not: Don't add claims, features, or a new tone I didn't ask for.

Example: Rewrite: 'This is a list of commands you can paste.'
## shorten

**/shorten**

Condense it. Same facts.

Group: `write`

When: It's too long for the place it sits.

Steps:

1. Cut about a third, more if it's fluffy.
2. Keep the facts.
3. Keep the action.

Do not: Don't drop a number, a name, or a constraint to make it shorter.

Example: Shorten the group blurbs.
## simplify

**/simplify**

Make it easier to understand, in plainer language.

Group: `write`

When: A smart non-expert has to act on it.

Steps:

1. Prefer plain words.
2. Keep the term where precision matters, and define it once.

Do not: Don't talk down. Don't remove the precise term if the plain word is wrong.

Example: Simplify the paragraph about briefs.
## human

**/human**

Rewrite so it sounds natural, not like a template.

Group: `write`

When: The text sounds generated.

Steps:

1. Use sentences a person would say.
2. Cut stock transitions.
3. Keep the meaning.

Do not: Don't add slang, jokes, or fake warmth.

Example: Human the empty-state line.
## formal

**/formal**

Change the tone to professional.

Group: `write`

When: The text will be seen in a formal place.

Steps:

1. Professional, plain, specific.
2. No slang.
3. Same facts.

Do not: Don't make it stiff. Don't add legalese it doesn't need.

Example: Formal the handoff note.
## commit-msg

**/commit-msg**

Propose a commit message from the change. Don't commit unless asked.

Group: `write`

When: You want the message, not the commit.

Steps:

1. Subject line: what changed.
2. Body: why, if why isn't obvious.
3. Stop before running git commit.

Do not: Don't commit or push. Don't mention files that didn't change.

Example: Commit-msg for the agent command book.
## pr

**/pr**

Write the description: what, why, how to test, risk.

Group: `write`

When: The change needs a review note.

Steps:

1. What.
2. Why.
3. How to test.
4. Risk.

Do not: Don't market it. Don't hide a risk.

Example: PR text for adding the command book.
## error-copy

**/error-copy**

Write the message a person should see: what happened, and the next action.

Group: `write`

When: An error is currently a code or a blank.

Steps:

1. Say what happened.
2. Say the next action.
3. Don't blame the person.

Do not: Don't show a stack trace. Don't be cute.

Example: Error-copy when copying to the clipboard fails.
## skeleton

**/skeleton**

Outline only. A heading and one line under each.

Group: `write`

When: You want structure before prose.

Steps:

1. Headings in order.
2. One sentence under each.
3. Stop.

Do not: Don't draft the full piece.

Example: Skeleton for a practical-exam study sheet.
## bullets

**/bullets**

Turn the output into bullet points.

Group: `write`

When: A list will be scanned, not read as prose.

Steps:

1. One idea per bullet.
2. Parallel grammar.
3. No nested bullets unless the nesting is real.

Do not: Don't use a bullet for a single sentence that should stay prose.

Example: Bullets for how to use this book.
## tldr

**/tldr**

Give the shortest useful summary.

Group: `write`

When: Someone needs the point before the detail.

Steps:

1. One to three sentences.
2. The action, if there is one.
3. The caveat, if skipping it would mislead.

Do not: Don't omit the caveat that changes the action.

Example: Tldr what this command book is for.
## checklist

**/checklist**

Turn this into a checklist. One action per line.

Group: `write`

When: A person is about to do the steps, not read about them.

Steps:

1. One action per line.
2. Start with a verb.
3. Order them the way the work happens.

Do not: Don't combine two actions on one line.

Example: Checklist for shipping a small UI change.
