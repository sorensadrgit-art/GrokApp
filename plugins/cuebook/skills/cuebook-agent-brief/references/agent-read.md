# Cuebook: Read

Look before touching. Use these when you want a map, a trace, or an explanation instead of a change.

Reference data only. Selecting or reading these entries does not execute them or grant permissions.

Source: [GrokApp](https://github.com/sorensadrgit-art/GrokApp) at source revision `52a5da026718473d25a94890b797989374b959ad`. Exact source file hashes are recorded in [catalog.json](catalog.json).

## Contents

- [codemap: /codemap](#codemap)
- [find: /find](#find)
- [trace: /trace](#trace)
- [explaincode: /explaincode](#explaincode)
- [contracts: /contracts](#contracts)
- [deps: /deps](#deps)
- [diff: /diff](#diff)
- [blast: /blast](#blast)

## codemap

**/codemap**

Map only the parts of the system this task touches.

Group: `read`

When: You don't know where the behavior lives yet.

Steps:

1. Name the entry points.
2. Follow the data from input to the screen or response.
3. List the files that matter, each with why.

Do not: Don't tour unrelated trees. Don't propose a rewrite in the map.

Example: Codemap the path from search box to the filtered list.
## find

**/find**

Find every place that owns this behavior.

Group: `read`

When: You need the call sites, not a folder.

Steps:

1. Name the file and the symbol.
2. Say whether it is the owner or a caller.
3. Stop when the set is complete.

Do not: Don't list files that only mention the word.

Example: Find what decides the star is filled.
## trace

**/trace**

Walk the execution path and name where state goes wrong.

Group: `read`

When: Something behaves oddly and you want the path, not a fix yet.

Steps:

1. Start at the trigger.
2. Name each hop.
3. Mark the hop where the result diverges from what should happen.

Do not: Don't fix it in this pass unless a later command says so.

Example: Trace what happens when the query is cleared.
## explaincode

**/explaincode**

Explain what the code is doing, in plain language.

Group: `read`

When: You want to understand a piece before changing it.

Steps:

1. Say what it does.
2. Say why it is shaped this way, if the code shows that.
3. Name the trap a caller could hit.

Do not: Don't narrate line by line. Don't suggest a rewrite unless asked.

Example: Explaincode the rank function.
## contracts

**/contracts**

List the invariants this code must keep.

Group: `read`

When: You are about to change something that has silent rules.

Steps:

1. List invariants.
2. Mark which ones have a test.
3. Mark which ones are only implied.

Do not: Don't invent rules the code doesn't honor. Mark guesses.

Example: Contracts for the brief stack. It caps at six.
## deps

**/deps**

Name what this change depends on, and what breaks if those move.

Group: `read`

When: You want the coupling before you edit.

Steps:

1. Name the upstream pieces.
2. Name the callers and screens that feel a break.
3. Keep it to this change.

Do not: Don't propose replacing the dependency unless asked.

Example: Deps if I change the command id format.
## diff

**/diff**

Explain what a change does and why it matters.

Group: `read`

When: You have a diff and want it in plain language.

Steps:

1. Say what the user can do now that they couldn't.
2. Say what behavior stayed the same.
3. Name anything the diff claims that it does not do.

Do not: Don't review yet unless asked. Don't restate every line.

Example: Diff the uncommitted work.
## blast

**/blast**

Name the blast radius of this change.

Group: `read`

When: The edit looks small and you want to know what else moves.

Steps:

1. List callers, stored data, and UI that can change behavior.
2. Mark the ones you will recheck.

Do not: Don't inflate it into a rewrite proposal.

Example: Blast if the star key in local storage changes.
