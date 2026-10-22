# Cuebook: Decide

Options, a call, and the risks. Say what would change the answer.

Reference data only. Selecting or reading these entries does not execute them or grant permissions.

Source: [GrokApp](https://github.com/sorensadrgit-art/GrokApp) at source revision `632f3d1ca78627ca4987c65da211c395e91ff9de`. Exact source file hashes are recorded in [catalog.json](catalog.json).

## Contents

- [alt3: /alt3](#alt3)
- [compare: /compare](#compare)
- [decide: /decide](#decide)
- [riskmap: /riskmap](#riskmap)
- [assumptions: /assumptions](#assumptions)
- [tradeoff: /tradeoff](#tradeoff)
- [priority: /priority](#priority)
- [scope-cut: /scope-cut](#scope-cut)
- [postmortem: /postmortem](#postmortem)
- [nextstep: /nextstep](#nextstep)
- [counter: /counter](#counter)
- [redteam: /redteam](#redteam)
- [pareto: /pareto](#pareto)

## alt3

**/alt3**

Three different alternatives. For each, the upside, the cost, and when it is the wrong pick.

Group: `decide`

When: You have not chosen and want real options.

Steps:

1. Three options.
2. Upside, cost, and the case where it is wrong.
3. Don't pick yet unless another command says to decide.

Do not: Don't offer three wordings of the same option.

Example: Alt3 for saving a brief: this device, an account, or no save.
## compare

**/compare**

Compare two or more options side by side.

Group: `decide`

When: The options exist and you want them lined up.

Steps:

1. Same criteria for each.
2. Use a table if there are more than two criteria.
3. Leave the call for /decide if it wasn't requested.

Do not: Don't add a recommendation unless asked. Comparison first.

Example: Compare starring on device versus a written list.
## decide

**/decide**

Make the call. Say why, and what would change it.

Group: `decide`

When: You want a decision, not a survey.

Steps:

1. State the call.
2. Two sentences on why.
3. What would change it.

Do not: Don't hand the choice back. Don't hide the condition that would flip it.

Example: Decide whether the agent book should open by default.
## riskmap

**/riskmap**

Identify the risks that can actually happen, each with a mitigation you can do now.

Group: `decide`

When: You are about to commit to a plan.

Steps:

1. Risks that can happen on this task.
2. A mitigation available now.
3. Drop risks you cannot act on.

Do not: Don't list generic risks. Don't mitigate with 'be careful.'

Example: Riskmap for storing the brief in local storage.
## assumptions

**/assumptions**

Identify the hidden assumptions in the claim or the plan.

Group: `decide`

When: Something sounds decided but rests on unstated premises.

Steps:

1. List the assumptions.
2. Mark which ones are load-bearing.
3. Say which one to check first.

Do not: Don't treat an assumption as a fact once you've named it.

Example: Assumptions in 'students will paste the whole book into the agent.'
## tradeoff

**/tradeoff**

Name the tradeoff being ignored.

Group: `decide`

When: A plan pretends you can have both.

Steps:

1. Name the two things in tension.
2. Say what you give up on each side.

Do not: Don't resolve it unless asked. Name it.

Example: Tradeoff between a full list on one screen and a readable phone layout.
## priority

**/priority**

Order the work. Say what drops if time runs out.

Group: `decide`

When: There is more to do than will fit.

Steps:

1. Order the items.
2. Say the cut line.
3. Say what 'done enough' means.

Do not: Don't rank everything as high.

Example: Priority: command list, briefs, picture-book link, presets.
## scope-cut

**/scope-cut**

Propose the smaller version that still ships the point.

Group: `decide`

When: The full idea is too big for this pass.

Steps:

1. State the point.
2. State the smaller version.
3. State what you are leaving out.

Do not: Don't cut the part that makes it the thing. Cut the ornaments.

Example: Scope-cut the command book so it still counts as a full list.
## postmortem

**/postmortem**

What failed, the cause, and the change in how we'll do it.

Group: `decide`

When: A piece of work missed and you want the lesson.

Steps:

1. What failed.
2. The cause.
3. The change in the next attempt.

Do not: Don't write a blame story. Don't propose a process nobody will follow.

Example: Postmortem on the last UI that looked fine in dev and broke when built.
## nextstep

**/nextstep**

Choose one useful next action, and how to start it.

Group: `decide`

When: You are stalled and need the next move, not a plan.

Steps:

1. One action.
2. The first physical step.
3. What done looks like for that step.

Do not: Don't list five next steps.

Example: Nextstep after the command list is in.
## counter

**/counter**

Generate the strongest counterargument.

Group: `decide`

When: You want the best case against the current plan.

Steps:

1. State the plan in one line.
2. Give the strongest case against it.
3. Say whether that case changes the call.

Do not: Don't argue a weak version so the plan still wins.

Example: Counter: opening the agent book by default hides the picture codes.
## redteam

**/redteam**

Critique aggressively to expose weaknesses.

Group: `decide`

When: You want the plan stressed, not encouraged.

Steps:

1. Name the failure modes.
2. Say which one is fatal.
3. Stop before proposing a replacement unless asked.

Do not: Don't insult. Attack the plan.

Example: Redteam the idea of pasting twelve commands at once.
## pareto

**/pareto**

Find the small set of actions that drive most of the result.

Group: `decide`

When: The list of work is long and you want the few that matter.

Steps:

1. Name the few actions.
2. Say the result they get you.
3. Say what you are explicitly not doing first.

Do not: Don't pretend the rest is worthless. Say it is the rest.

Example: Pareto for learning a joint exam this week.
