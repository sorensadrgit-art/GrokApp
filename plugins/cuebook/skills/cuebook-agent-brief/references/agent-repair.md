# Cuebook: Repair

Find the cause, fix that, and leave a check behind. No drive-by cleanup.

Reference data only. Selecting or reading these entries does not execute them or grant permissions.

Source: [GrokApp](https://github.com/sorensadrgit-art/GrokApp) at source revision `632f3d1ca78627ca4987c65da211c395e91ff9de`. Exact source file hashes are recorded in [catalog.json](catalog.json).

## Contents

- [debug: /debug](#debug)
- [repro: /repro](#repro)
- [edgecases: /edgecases](#edgecases)
- [bisect: /bisect](#bisect)
- [fix: /fix](#fix)
- [tests: /tests](#tests)
- [regress: /regress](#regress)
- [review: /review](#review)
- [security: /security](#security)
- [logs: /logs](#logs)
- [flaky: /flaky](#flaky)
- [undo: /undo](#undo)
- [optimize: /optimize](#optimize)

## debug

**/debug**

Find the likely bug. Name the cause, then fix the cause.

Group: `repair`

When: Something fails and you want it actually fixed.

Steps:

1. Reproduce it with the smallest case.
2. Name the cause in one sentence.
3. Fix that cause.
4. Show the check that now passes.

Do not: Don't patch the symptom. Don't clean unrelated code.

Example: The save button stays disabled after the form is valid.
## repro

**/repro**

Turn a bug report into the smallest steps that reproduce it.

Group: `repair`

When: You have a vague report and need a recipe.

Steps:

1. Write the shortest steps.
2. State what you expect and what happens.
3. Cut any step that isn't needed to show the bug.

Do not: Don't fix it yet if this command is alone.

Example: People say search sometimes shows picture codes inside the agent book.
## edgecases

**/edgecases**

List the inputs most likely to break this.

Group: `repair`

When: You want the cases before or after a fix.

Steps:

1. List the cases that can actually happen here.
2. Say the expected result for each.
3. Mark the ones that fail today, if you know.

Do not: Don't list theoretical cases that this code cannot receive.

Example: Edgecases for the brief when it is full.
## bisect

**/bisect**

Narrow it to the smallest case that still fails.

Group: `repair`

When: The failure is real but the area is large.

Steps:

1. Find the last known good behavior, if you can.
2. Shrink the input until removing anything makes the bug vanish.
3. Then name the suspect.

Do not: Don't speculate a cause before the case is small.

Example: Bisect why copying fails only on the phone preview.
## fix

**/fix**

Apply the fix. Keep the diff to the bug.

Group: `repair`

When: The cause is known.

Steps:

1. Change only what the cause requires.
2. Keep a check that fails before and passes after, when a check is possible.

Do not: Don't bundle a refactor. Don't claim it's fixed without a check.

Example: Fix the off-by-one when the sixth command is added.
## tests

**/tests**

Write tests for the important paths and the edge cases.

Group: `repair`

When: Behavior needs a lock so it doesn't regress.

Steps:

1. Cover the main path.
2. Cover the edge case that broke or is likely to.
3. Run the tests.

Do not: Don't test the framework. Don't assert copy you expect to keep changing, unless the copy is the contract.

Example: Tests for ranking an exact code match above a substring.
## regress

**/regress**

Check the neighbors this change could have broken.

Group: `repair`

When: A fix landed and nearby behavior might have moved.

Steps:

1. List the neighboring behaviors.
2. Check each one.
3. Report pass or fail.

Do not: Don't expand into a full rewrite of the neighbors.

Example: Regress starring and the picture book after the nav change.
## review

**/review**

Review the code for bugs, risks, and concrete fixes.

Group: `repair`

When: You want a picky pass, not more features.

Steps:

1. Look for correctness, security, and missing states.
2. Cite the place.
3. Say the fix in one sentence.
4. Block only on those. Mention nits separately.

Do not: Don't nitpick taste. Don't rewrite the feature in the review.

Example: Review the brief assembler.
## security

**/security**

Review for injection, auth gaps, and data exposure.

Group: `repair`

When: The change takes input, stores data, or crosses a trust boundary.

Steps:

1. Check input handling, auth, and secrets.
2. Cite the line if something is wrong.
3. Say 'nothing in this change' if that's the truth.

Do not: Don't wave it through because it 'looks internal.'

Example: Security on the task text that gets pasted into the brief.
## logs

**/logs**

Read the failure and quote the first real error.

Group: `repair`

When: There is a stack trace or a long log.

Steps:

1. Quote the first error that is a cause.
2. Say what it means.
3. Ignore trailing noise unless it changes the cause.

Do not: Don't anchor on the last line if it's fallout.

Example: Logs from the failed build. Quote the real error.
## flaky

**/flaky**

Explain the intermittence, then fix that.

Group: `repair`

When: It fails sometimes.

Steps:

1. Say whether it is order, time, shared state, or a real race.
2. Fix that cause.
3. Say how you'll know it stayed fixed.

Do not: Don't add a sleep and call it fixed.

Example: Flaky: the sheet sometimes opens the previous command.
## undo

**/undo**

Back out the failed approach before trying the next one.

Group: `repair`

When: An attempt made things worse.

Steps:

1. Remove the failed change.
2. Confirm the previous behavior is back.
3. Then try the next approach, if one was asked for.

Do not: Don't stack the next idea on the failed one.

Example: Undo the virtualized list. It broke tap targets.
## optimize

**/optimize**

Improve the hot path. Leave the rest alone.

Group: `repair`

When: Something is actually slow.

Steps:

1. Name the hot path.
2. Change that.
3. Say how you know it is cheaper.

Do not: Don't micro-optimize cold code. Don't change behavior.

Example: Optimize filtering when the query changes. The list is long.
