# Cuebook: Control

How the agent should behave on this task. Put these first when you care about the shape of the work.

Reference data only. Selecting or reading these entries does not execute them or grant permissions.

Source: [GrokApp](https://github.com/sorensadrgit-art/GrokApp) at source revision `52a5da026718473d25a94890b797989374b959ad`. Exact source file hashes are recorded in [catalog.json](catalog.json).

## Contents

- [scope: /scope](#scope)
- [plan: /plan](#plan)
- [go: /go](#go)
- [only: /only](#only)
- [proceed: /proceed](#proceed)
- [ask: /ask](#ask)
- [status: /status](#status)
- [stop: /stop](#stop)
- [constraints: /constraints](#constraints)
- [quiet: /quiet](#quiet)
- [show: /show](#show)
- [checkpoint: /checkpoint](#checkpoint)

## scope

**/scope**

Restate the job, the done-condition, and what you will not touch.

Group: `control`

When: The task is fuzzy, or you want the agent to show it understood before editing.

Steps:

1. Restate the job in one short paragraph.
2. State the done-condition as something you can check.
3. List what is out of scope.
4. Continue only if nothing material is ambiguous. Otherwise ask one question.

Do not: Don't start editing in the same breath. Don't widen the job.

Example: Add a saved-filters view to the list. Don't redesign the navigation.
## plan

**/plan**

Write the plan only. No edits, no installs, no servers.

Group: `control`

When: You want the approach before any file changes.

Steps:

1. Give ordered steps.
2. Name the files you expect to touch.
3. Name the risks and how you'll check the result.
4. Stop after the plan.

Do not: Don't implement 'while you're in there.' Don't pad the plan with optional ideas.

Example: Plan how you'll add offline starring without an account.
## go

**/go**

Carry out the plan you already have.

Group: `control`

When: A plan exists and you want it executed, not reopened.

Steps:

1. Follow the plan in order.
2. If a step is blocked, stop and say why.
3. Don't add steps that were not in the plan.

Do not: Don't relitigate the plan unless a step is blocked.

Example: Go. The plan we agreed is the one in your last message.
## only

**/only**

Change only what the task needs.

Group: `control`

When: You want a fix or feature without a cleanup tour.

Steps:

1. Touch the smallest set of files that solves the task.
2. Leave unrelated code as you found it.
3. If you notice a separate issue, mention it. Don't fix it.

Do not: Don't refactor neighbors, rename for taste, or add settings nobody asked for.

Example: The empty state says 'No items' even when the request failed. Fix the copy only.
## proceed

**/proceed**

State your assumptions, pick the safest, and continue.

Group: `control`

When: A few details are open but you don't want a questionnaire.

Steps:

1. List assumptions, one line each.
2. Mark the one you are using.
3. Continue.

Do not: Don't stop for a preference you can default safely. Don't hide a risky assumption.

Example: Add export. Proceed if I didn't name the format.
## ask

**/ask**

Ask the single question that unblocks you, then stop.

Group: `control`

When: You are actually blocked, not merely missing a preference.

Steps:

1. Ask one question.
2. Offer two to four concrete options.
3. Stop.

Do not: Don't ask a stack of questions. Don't keep working past the block.

Example: Ask before you pick a database. I haven't decided.
## status

**/status**

Report done, in progress, blocked, and the next step.

Group: `control`

When: You want a snapshot, not more work.

Steps:

1. Use four labels: done, in progress, blocked, next.
2. One to three lines under each, or 'none.'

Do not: Don't teach. Don't start the next step.

Example: Status on the filter work.
## stop

**/stop**

Stop this approach. Say what changed and what you did not verify.

Group: `control`

When: The current attempt is wrong and you don't want it stacked on.

Steps:

1. Stop.
2. Say what already changed.
3. Say what is unverified.
4. Wait for direction.

Do not: Don't keep patching the failed approach.

Example: Stop. The animation approach is wrong.
## constraints

**/constraints**

The lines under this command outrank your defaults.

Group: `control`

When: You have rules that should beat helpful extras.

Steps:

1. Read the constraints under this command as binding.
2. If one conflicts with a habit of yours, follow the constraint.
3. If two constraints conflict, say so and stop.

Do not: Don't 'improve' past a constraint.

Example: Constraints:
Keep the lime accent.
No new dependencies.
No accounts.
## quiet

**/quiet**

Use the fewest words that are still complete.

Group: `control`

When: You want the answer, not a tour of the reasoning.

Steps:

1. Lead with the answer.
2. Cut preamble and recap.
3. Keep the one detail that would be dangerous to omit.

Do not: Don't drop the result, the decision, or a real blocker just to be short.

Example: Quiet. What file owns the search ranking?
## show

**/show**

Lead with the thing the user can use.

Group: `control`

When: The user wants the result, not how the tools were used.

Steps:

1. Put the usable result first.
2. Then the one next action, if there is one.

Do not: Don't narrate plumbing, ports, or internal steps unless asked.

Example: Show me the empty state you wrote.
## checkpoint

**/checkpoint**

Pause after this step and show the result before continuing.

Group: `control`

When: You want to approve a step before the rest happens.

Steps:

1. Do only the step in front of you.
2. Show the result.
3. Wait.

Do not: Don't run ahead after the checkpoint.

Example: Checkpoint after the data shape, before any UI.
