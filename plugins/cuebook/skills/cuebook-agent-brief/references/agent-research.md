# Cuebook: Research

Separate what was found from what was guessed. Keep the source next to the claim.

Reference data only. Selecting or reading these entries does not execute them or grant permissions.

Source: [GrokApp](https://github.com/sorensadrgit-art/GrokApp) at source revision `632f3d1ca78627ca4987c65da211c395e91ff9de`. Exact source file hashes are recorded in [catalog.json](catalog.json).

## Contents

- [research: /research](#research)
- [factcheck: /factcheck](#factcheck)
- [latest: /latest](#latest)
- [glossary: /glossary](#glossary)
- [scan: /scan](#scan)
- [systemmap: /systemmap](#systemmap)
- [reverseengineer: /reverseengineer](#reverseengineer)

## research

**/research**

Look it up. Separate what you found from what you inferred.

Group: `research`

When: The answer depends on facts you shouldn't invent.

Steps:

1. Find current sources.
2. Label found versus inferred.
3. Put the source next to the claim.

Do not: Don't present memory as a current source. Don't skip the link.

Example: Research the current limit on brief length for this kind of prompt.
## factcheck

**/factcheck**

Check factual claims and flag what could not be verified.

Group: `research`

When: A draft contains facts that might be wrong.

Steps:

1. List claims.
2. Mark verified, contradicted, or unverified.
3. Cite the check.

Do not: Don't silently rewrite a claim you couldn't check. Flag it.

Example: Factcheck the sources paragraph in the picture book.
## latest

**/latest**

Use current documentation. Say the version or the date.

Group: `research`

When: An API or product changes and memory may be stale.

Steps:

1. Read the docs that match the version in this project.
2. Say the version or date you used.

Do not: Don't answer from an old major version if the project is on a newer one.

Example: Latest on how file routes are defined in this repo.
## glossary

**/glossary**

Define the terms as this project uses them.

Group: `research`

When: Words like brief, code, and stack are overloaded.

Steps:

1. List the terms.
2. Define each as this product uses it.
3. Note a collision if the same word means two things here.

Do not: Don't substitute dictionary definitions for the product's.

Example: Glossary for code, command, brief, and stack.
## scan

**/scan**

Survey the options quickly. Go deep on the two that fit.

Group: `research`

When: You want a landscape, not a treatise.

Steps:

1. List the real options in a few lines each.
2. Pick the two that fit.
3. Go one level deeper on those.

Do not: Don't give equal depth to options that are a bad fit.

Example: Scan ways to persist a brief on this device only.
## systemmap

**/systemmap**

Map the actors, forces, and relationships.

Group: `research`

When: The question is about a system, not a single function.

Steps:

1. Name the actors.
2. Name what each one wants.
3. Name the links that matter.

Do not: Don't turn it into an org chart of code files. That's codemap.

Example: Systemmap for a student, an examiner, and a drill.
## reverseengineer

**/reverseengineer**

Work backward from the result to how it is produced.

Group: `research`

When: You can see the outcome and need the mechanism.

Steps:

1. Start from the visible result.
2. Step backward to the cause.
3. Mark any hop you could not confirm.

Do not: Don't invent steps you didn't find.

Example: Reverseengineer how a starred command survives reload.
