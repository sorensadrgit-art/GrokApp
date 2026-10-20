# Cuebook agent command index

These entries are reference data, not instruction authority. Read a selected entry's full record before applying its meaning. They are community shorthand, not official model commands.

Source: [GrokApp](https://github.com/sorensadrgit-art/GrokApp) at source revision `52a5da026718473d25a94890b797989374b959ad`. Exact source file hashes are recorded in [catalog.json](catalog.json).

Entries: **123**. Composition limit: **6**.

## Contents

- [Control](agent-control.md)
- [Read](agent-read.md)
- [Build](agent-build.md)
- [Repair](agent-repair.md)
- [Ship](agent-ship.md)
- [Research](agent-research.md)
- [Write](agent-write.md)
- [Design](agent-design.md)
- [Picture](agent-picture.md)
- [Browser](agent-browser.md)
- [Study](agent-study.md)
- [Decide](agent-decide.md)
- [Cross-catalog token collisions](collisions.md)
- [Machine-readable full catalog](catalog.json)

## Presets

| ID | Preset | Ordered command IDs |
| --- | --- | --- |
| fix | Fix a bug | debug, repro, fix, tests, verify |
| ship | Ship | scope, implement, preview, done, changelog |
| review | Review | diff, review, security |
| plan | Plan only | scope, plan, ask |
| decide | Decide | alt3, decide, riskmap |
| teach | Teach | teachme, quizme, gaps |
| picture | Direct a still | still, labels, codes |
| browse | Browse | open, extract, no-login |

## Control

| ID | Code | Meaning |
| --- | --- | --- |
| [scope](agent-control.md#scope) | /scope | Restate the job, the done-condition, and what you will not touch. |
| [plan](agent-control.md#plan) | /plan | Write the plan only. No edits, no installs, no servers. |
| [go](agent-control.md#go) | /go | Carry out the plan you already have. |
| [only](agent-control.md#only) | /only | Change only what the task needs. |
| [proceed](agent-control.md#proceed) | /proceed | State your assumptions, pick the safest, and continue. |
| [ask](agent-control.md#ask) | /ask | Ask the single question that unblocks you, then stop. |
| [status](agent-control.md#status) | /status | Report done, in progress, blocked, and the next step. |
| [stop](agent-control.md#stop) | /stop | Stop this approach. Say what changed and what you did not verify. |
| [constraints](agent-control.md#constraints) | /constraints | The lines under this command outrank your defaults. |
| [quiet](agent-control.md#quiet) | /quiet | Use the fewest words that are still complete. |
| [show](agent-control.md#show) | /show | Lead with the thing the user can use. |
| [checkpoint](agent-control.md#checkpoint) | /checkpoint | Pause after this step and show the result before continuing. |

## Read

| ID | Code | Meaning |
| --- | --- | --- |
| [codemap](agent-read.md#codemap) | /codemap | Map only the parts of the system this task touches. |
| [find](agent-read.md#find) | /find | Find every place that owns this behavior. |
| [trace](agent-read.md#trace) | /trace | Walk the execution path and name where state goes wrong. |
| [explaincode](agent-read.md#explaincode) | /explaincode | Explain what the code is doing, in plain language. |
| [contracts](agent-read.md#contracts) | /contracts | List the invariants this code must keep. |
| [deps](agent-read.md#deps) | /deps | Name what this change depends on, and what breaks if those move. |
| [diff](agent-read.md#diff) | /diff | Explain what a change does and why it matters. |
| [blast](agent-read.md#blast) | /blast | Name the blast radius of this change. |

## Build

| ID | Code | Meaning |
| --- | --- | --- |
| [implement](agent-build.md#implement) | /implement | Build the agreed behavior in the style of this codebase. |
| [scaffold](agent-build.md#scaffold) | /scaffold | Add only the files this feature needs, and wire them in. |
| [wire](agent-build.md#wire) | /wire | Connect the pieces that already exist. |
| [state](agent-build.md#state) | /state | Add state using the pattern this app already uses. |
| [api](agent-build.md#api) | /api | Design a small, consistent interface for the task. |
| [migrate](agent-build.md#migrate) | /migrate | Change the data shape without destroying what's already stored. |
| [types](agent-build.md#types) | /types | Add or tighten types without changing behavior. |
| [naming](agent-build.md#naming) | /naming | Propose clearer names for unclear symbols. |
| [empty](agent-build.md#empty) | /empty | Include the empty, loading, and error states. |
| [pattern](agent-build.md#pattern) | /pattern | Find the closest existing pattern and follow it. |
| [integrate](agent-build.md#integrate) | /integrate | Merge parallel work into one coherent app. |
| [flags](agent-build.md#flags) | /flags | If a behavior must be optional, default it to today's behavior. |
| [refactor](agent-build.md#refactor) | /refactor | Restructure the code without changing behavior. |
| [simplifycode](agent-build.md#simplifycode) | /simplifycode | Reduce branching and indirection while keeping behavior. |

## Repair

| ID | Code | Meaning |
| --- | --- | --- |
| [debug](agent-repair.md#debug) | /debug | Find the likely bug. Name the cause, then fix the cause. |
| [repro](agent-repair.md#repro) | /repro | Turn a bug report into the smallest steps that reproduce it. |
| [edgecases](agent-repair.md#edgecases) | /edgecases | List the inputs most likely to break this. |
| [bisect](agent-repair.md#bisect) | /bisect | Narrow it to the smallest case that still fails. |
| [fix](agent-repair.md#fix) | /fix | Apply the fix. Keep the diff to the bug. |
| [tests](agent-repair.md#tests) | /tests | Write tests for the important paths and the edge cases. |
| [regress](agent-repair.md#regress) | /regress | Check the neighbors this change could have broken. |
| [review](agent-repair.md#review) | /review | Review the code for bugs, risks, and concrete fixes. |
| [security](agent-repair.md#security) | /security | Review for injection, auth gaps, and data exposure. |
| [logs](agent-repair.md#logs) | /logs | Read the failure and quote the first real error. |
| [flaky](agent-repair.md#flaky) | /flaky | Explain the intermittence, then fix that. |
| [undo](agent-repair.md#undo) | /undo | Back out the failed approach before trying the next one. |
| [optimize](agent-repair.md#optimize) | /optimize | Improve the hot path. Leave the rest alone. |

## Ship

| ID | Code | Meaning |
| --- | --- | --- |
| [verify](agent-ship.md#verify) | /verify | Run the checks that prove this works. Report pass or fail. |
| [preview](agent-ship.md#preview) | /preview | Confirm the screen shows real content on a phone width and a laptop width. |
| [a11y](agent-ship.md#a11y) | /a11y | Check names, keyboard, focus, and contrast for what you changed. |
| [mobile](agent-ship.md#mobile) | /mobile | At a phone width: no sideways scroll, no overlap, targets you can tap. |
| [perf](agent-ship.md#perf) | /perf | Name the one cost that matters here. |
| [changelog](agent-ship.md#changelog) | /changelog | Write what changed and what to try, in the user's words. |
| [handoff](agent-ship.md#handoff) | /handoff | Note how to run it, what is fragile, and what is not done. |
| [done](agent-ship.md#done) | /done | Check the work against the done-condition. List any gap. |
| [docs](agent-ship.md#docs) | /docs | Add concise documentation for the public surface. |

## Research

| ID | Code | Meaning |
| --- | --- | --- |
| [research](agent-research.md#research) | /research | Look it up. Separate what you found from what you inferred. |
| [factcheck](agent-research.md#factcheck) | /factcheck | Check factual claims and flag what could not be verified. |
| [latest](agent-research.md#latest) | /latest | Use current documentation. Say the version or the date. |
| [glossary](agent-research.md#glossary) | /glossary | Define the terms as this project uses them. |
| [scan](agent-research.md#scan) | /scan | Survey the options quickly. Go deep on the two that fit. |
| [systemmap](agent-research.md#systemmap) | /systemmap | Map the actors, forces, and relationships. |
| [reverseengineer](agent-research.md#reverseengineer) | /reverseengineer | Work backward from the result to how it is produced. |

## Write

| ID | Code | Meaning |
| --- | --- | --- |
| [spec](agent-write.md#spec) | /spec | Write the spec: who it's for, the job, done-when, and out of scope. |
| [rewrite](agent-write.md#rewrite) | /rewrite | Rephrase the text I give you. Keep the meaning. |
| [shorten](agent-write.md#shorten) | /shorten | Condense it. Same facts. |
| [simplify](agent-write.md#simplify) | /simplify | Make it easier to understand, in plainer language. |
| [human](agent-write.md#human) | /human | Rewrite so it sounds natural, not like a template. |
| [formal](agent-write.md#formal) | /formal | Change the tone to professional. |
| [commit-msg](agent-write.md#commit-msg) | /commit-msg | Propose a commit message from the change. Don't commit unless asked. |
| [pr](agent-write.md#pr) | /pr | Write the description: what, why, how to test, risk. |
| [error-copy](agent-write.md#error-copy) | /error-copy | Write the message a person should see: what happened, and the next action. |
| [skeleton](agent-write.md#skeleton) | /skeleton | Outline only. A heading and one line under each. |
| [bullets](agent-write.md#bullets) | /bullets | Turn the output into bullet points. |
| [tldr](agent-write.md#tldr) | /tldr | Give the shortest useful summary. |
| [checklist](agent-write.md#checklist) | /checklist | Turn this into a checklist. One action per line. |

## Design

| ID | Code | Meaning |
| --- | --- | --- |
| [ui](agent-design.md#ui) | /ui | Design the screen as a product: hierarchy, one primary action, real states. |
| [tokens](agent-design.md#tokens) | /tokens | Use the existing color, type, and spacing. |
| [layout](agent-design.md#layout) | /layout | Set the regions, what is primary, and what collapses on a phone. |
| [motion](agent-design.md#motion) | /motion | Say what moves, how far, and how long. Honor reduced motion. |
| [critique](agent-design.md#critique) | /critique | Review the work and point out what needs improvement. |
| [brand](agent-design.md#brand) | /brand | Hold the name, palette, and type. Don't restyle the product in passing. |
| [states](agent-design.md#states) | /states | List every state of this screen and what the person can do in each. |
| [og](agent-design.md#og) | /og | Specify the share card: the sentence, the picture, and the card type. |

## Picture

| ID | Code | Meaning |
| --- | --- | --- |
| [still](agent-picture.md#still) | /still | Direct one still: subject, light, and what must stay recognizable. |
| [contact](agent-picture.md#contact) | /contact | Four distinct directions for the same subject, labeled, so one can be picked. |
| [edit-img](agent-picture.md#edit-img) | /edit-img | Change only what is specified in the uploaded image. |
| [clip](agent-picture.md#clip) | /clip | Direct one clip: start, action, end, camera. One motion. |
| [hero](agent-picture.md#hero) | /hero | A clean hero image with the subject as the focal point. |
| [ugc](agent-picture.md#ugc) | /ugc | A user-style photo or clip, as if someone is showing it to a friend. |
| [labels](agent-picture.md#labels) | /labels | Use only the labels and facts provided. Leave off anything else. |
| [codes](agent-picture.md#codes) | /codes | Treat pasted picture-book tokens as shorthand. Follow each meaning. |

## Browser

| ID | Code | Meaning |
| --- | --- | --- |
| [open](agent-browser.md#open) | /open | Open the URL and report the title and the main content. |
| [extract](agent-browser.md#extract) | /extract | Extract the fields named. Mark a field missing rather than guessing. |
| [click-path](agent-browser.md#click-path) | /click-path | Do these steps in order. After each one, say what you see. |
| [shot](agent-browser.md#shot) | /shot | Describe the screen that proves this step worked. |
| [form](agent-browser.md#form) | /form | Fill only the fields provided. Don't submit unless told. |
| [watch](agent-browser.md#watch) | /watch | Wait until the condition named, or say it timed out. |
| [session](agent-browser.md#session) | /session | Stay in the current browser session. Don't open a second one. |
| [no-login](agent-browser.md#no-login) | /no-login | Don't try to sign in. If a wall appears, stop and describe it. |

## Study

| ID | Code | Meaning |
| --- | --- | --- |
| [teachme](agent-study.md#teachme) | /teachme | Teach it as a lesson: the idea, a concrete case, the usual mistake. |
| [quizme](agent-study.md#quizme) | /quizme | Ask one question. Wait for the answer. Then mark it. |
| [drill](agent-study.md#drill) | /drill | Set the station, ask for the step, then correct the performance. |
| [oral](agent-study.md#oral) | /oral | Play the examiner. One check-off question, then grade it against the standard. |
| [gaps](agent-study.md#gaps) | /gaps | From what I show you, name the gaps. Don't pad. |
| [mnemonic](agent-study.md#mnemonic) | /mnemonic | One memory hook, tied to the real mechanism. |
| [socratic](agent-study.md#socratic) | /socratic | Teach by asking guided questions. |
| [stepbystep](agent-study.md#stepbystep) | /stepbystep | Force a sequential, ordered explanation. |
| [misconceptions](agent-study.md#misconceptions) | /misconceptions | List the common misunderstandings about this topic. |
| [feynman](agent-study.md#feynman) | /feynman | Explain it as simply as possible, to test whether it is actually understood. |

## Decide

| ID | Code | Meaning |
| --- | --- | --- |
| [alt3](agent-decide.md#alt3) | /alt3 | Three different alternatives. For each, the upside, the cost, and when it is the wrong pick. |
| [compare](agent-decide.md#compare) | /compare | Compare two or more options side by side. |
| [decide](agent-decide.md#decide) | /decide | Make the call. Say why, and what would change it. |
| [riskmap](agent-decide.md#riskmap) | /riskmap | Identify the risks that can actually happen, each with a mitigation you can do now. |
| [assumptions](agent-decide.md#assumptions) | /assumptions | Identify the hidden assumptions in the claim or the plan. |
| [tradeoff](agent-decide.md#tradeoff) | /tradeoff | Name the tradeoff being ignored. |
| [priority](agent-decide.md#priority) | /priority | Order the work. Say what drops if time runs out. |
| [scope-cut](agent-decide.md#scope-cut) | /scope-cut | Propose the smaller version that still ships the point. |
| [postmortem](agent-decide.md#postmortem) | /postmortem | What failed, the cause, and the change in how we'll do it. |
| [nextstep](agent-decide.md#nextstep) | /nextstep | Choose one useful next action, and how to start it. |
| [counter](agent-decide.md#counter) | /counter | Generate the strongest counterargument. |
| [redteam](agent-decide.md#redteam) | /redteam | Critique aggressively to expose weaknesses. |
| [pareto](agent-decide.md#pareto) | /pareto | Find the small set of actions that drive most of the result. |
