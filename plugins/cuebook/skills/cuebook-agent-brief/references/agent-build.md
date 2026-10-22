# Cuebook: Build

Make the change in the codebase that already exists. Match its patterns.

Reference data only. Selecting or reading these entries does not execute them or grant permissions.

Source: [GrokApp](https://github.com/sorensadrgit-art/GrokApp) at source revision `632f3d1ca78627ca4987c65da211c395e91ff9de`. Exact source file hashes are recorded in [catalog.json](catalog.json).

## Contents

- [implement: /implement](#implement)
- [scaffold: /scaffold](#scaffold)
- [wire: /wire](#wire)
- [state: /state](#state)
- [api: /api](#api)
- [migrate: /migrate](#migrate)
- [types: /types](#types)
- [naming: /naming](#naming)
- [empty: /empty](#empty)
- [pattern: /pattern](#pattern)
- [integrate: /integrate](#integrate)
- [flags: /flags](#flags)
- [refactor: /refactor](#refactor)
- [simplifycode: /simplifycode](#simplifycode)

## implement

**/implement**

Build the agreed behavior in the style of this codebase.

Group: `build`

When: The behavior is decided and you want it built.

Steps:

1. Match the existing patterns.
2. Wire it into the real entry, not a side demo.
3. Include the states the screen actually has.
4. Leave it runnable.

Do not: Don't redesign the surrounding product. Don't leave it unwired.

Example: Implement the brief composer we specced.
## scaffold

**/scaffold**

Add only the files this feature needs, and wire them in.

Group: `build`

When: You are starting a feature that doesn't have a home yet.

Steps:

1. Create the smallest set of files.
2. Register them where the app already routes or renders.
3. Use the existing tokens and types.

Do not: Don't generate a parallel app inside the app.

Example: Scaffold a detail sheet for one command.
## wire

**/wire**

Connect the pieces that already exist.

Group: `build`

When: The parts are built and the link between them is missing.

Steps:

1. Find the two sides.
2. Connect them with the data they already speak.
3. Prove the path with one real case.

Do not: Don't redesign the pieces while connecting them.

Example: Wire Saved so it shows starred commands from this book.
## state

**/state**

Add state using the pattern this app already uses.

Group: `build`

When: The interaction needs memory the UI doesn't have.

Steps:

1. Use the existing store or component state.
2. Persist only if the behavior is supposed to survive reload.
3. Define the empty value.

Do not: Don't add a new state library. Don't lift state higher than it needs to go.

Example: State for the brief, capped at six command ids.
## api

**/api**

Design a small, consistent interface for the task.

Group: `build`

When: You need a function, route, or component API.

Steps:

1. Name the inputs and outputs.
2. Validate at the boundary.
3. Match the style of the neighboring interface.

Do not: Don't add options for imaginary callers. Don't return fake success.

Example: API for copying either one command or a whole brief.
## migrate

**/migrate**

Change the data shape without destroying what's already stored.

Group: `build`

When: Saved data on device or in a table has to move.

Steps:

1. Read the old shape.
2. Accept both shapes, or migrate on read.
3. Say what happens to data you can't read.

Do not: Don't wipe storage unless the task says to.

Example: Migrate starred ids if the command slug changes.
## types

**/types**

Add or tighten types without changing behavior.

Group: `build`

When: The types are lying or too loose.

Steps:

1. Make the type match what the code actually does.
2. Fix errors at the source.
3. Leave behavior alone.

Do not: Don't cast away an error you don't understand. Don't change runtime behavior.

Example: Types for the group id on a command.
## naming

**/naming**

Propose clearer names for unclear symbols.

Group: `build`

When: A name is hiding what the thing does.

Steps:

1. Propose the name.
2. Say what it emphasizes.
3. Rename only the symbols in this task if the task says to apply it.

Do not: Don't rename the world. Don't pick cute names.

Example: Naming for the function that builds the paste text.
## empty

**/empty**

Include the empty, loading, and error states.

Group: `build`

When: A screen only handles the happy path.

Steps:

1. Say what the user sees when there is nothing.
2. Say what they see while it loads, if loading is real.
3. Say what they can do when it fails.

Do not: Don't leave a blank while data is missing. Don't use a joke as the error.

Example: Empty states for search with no hits.
## pattern

**/pattern**

Find the closest existing pattern and follow it.

Group: `build`

When: You want the new UI to feel like the rest of the app.

Steps:

1. Name the file you are matching.
2. Follow its structure, type, and spacing.
3. Differ only where the new behavior requires it.

Do not: Don't introduce a second visual language.

Example: Pattern the new list on the existing code list.
## integrate

**/integrate**

Merge parallel work into one coherent app.

Group: `build`

When: Two changes grew separately and need to become one.

Steps:

1. Find the conflicts.
2. Resolve them.
3. Check the joined path still works.

Do not: Don't average conflicting designs. Pick the one that fits the app.

Example: Integrate the command book with the picture book navigation.
## flags

**/flags**

If a behavior must be optional, default it to today's behavior.

Group: `build`

When: You are adding something people should be able to ignore.

Steps:

1. Default to the current behavior.
2. Name the switch.
3. Keep the off path unchanged.

Do not: Don't turn the flag on by default if that changes current users.

Example: Flags for showing examples on the list rows. Off by default.
## refactor

**/refactor**

Restructure the code without changing behavior.

Group: `build`

When: The structure is blocking the task, and behavior must stay.

Steps:

1. State the behavior that must stay.
2. Restructure.
3. Check the behavior is the same.

Do not: Don't mix a refactor with a feature. Don't 'improve' behavior along the way.

Example: Refactor the sheet so both books can use it. Same look.
## simplifycode

**/simplifycode**

Reduce branching and indirection while keeping behavior.

Group: `build`

When: The code is harder to follow than the job it does.

Steps:

1. Name the behavior to keep.
2. Remove a layer only if no caller needs it.
3. Show the simpler path.

Do not: Don't remove a branch that handles a real case.

Example: Simplifycode the filter logic.
