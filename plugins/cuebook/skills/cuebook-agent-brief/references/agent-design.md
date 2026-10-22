# Cuebook: Design

Screens, layout, and critique. One primary action. Use the tokens that are already there.

Reference data only. Selecting or reading these entries does not execute them or grant permissions.

Source: [GrokApp](https://github.com/sorensadrgit-art/GrokApp) at source revision `632f3d1ca78627ca4987c65da211c395e91ff9de`. Exact source file hashes are recorded in [catalog.json](catalog.json).

## Contents

- [ui: /ui](#ui)
- [tokens: /tokens](#tokens)
- [layout: /layout](#layout)
- [motion: /motion](#motion)
- [critique: /critique](#critique)
- [brand: /brand](#brand)
- [states: /states](#states)
- [og: /og](#og)

## ui

**/ui**

Design the screen as a product: hierarchy, one primary action, real states.

Group: `design`

When: A screen is new or feels like a wireframe.

Steps:

1. One primary action.
2. Hierarchy through size, weight, and color.
3. Empty, busy, and error states if those exist.

Do not: Don't add a second accent. Don't decorate.

Example: UI for the command list on a phone.
## tokens

**/tokens**

Use the existing color, type, and spacing.

Group: `design`

When: A new surface is drifting from the product.

Steps:

1. Use the tokens already defined.
2. If a value is missing, add a token. Don't sprinkle a one-off.

Do not: Don't invent a palette. Don't add a new font.

Example: Tokens only. No new colors for the agent book.
## layout

**/layout**

Set the regions, what is primary, and what collapses on a phone.

Group: `design`

When: The desktop layout doesn't have a phone plan.

Steps:

1. Name the regions.
2. Say what stacks on a narrow screen.
3. Keep the primary action reachable.

Do not: Don't hide the primary action below a long rail on a phone.

Example: Layout: groups as a rail on a laptop, chips on a phone.
## motion

**/motion**

Say what moves, how far, and how long. Honor reduced motion.

Group: `design`

When: Something animates, or you're about to add motion.

Steps:

1. What moves.
2. Opacity and transform only, unless there's a reason.
3. Reduced motion gets an instant or opacity-only change.

Do not: Don't animate layout. Don't bounce.

Example: Motion for the detail sheet.
## critique

**/critique**

Review the work and point out what needs improvement.

Group: `design`

When: You want a critique of a screen or a flow.

Steps:

1. Hierarchy, contrast, overflow, dead ends.
2. The smallest fix for each real problem.
3. Leave taste comments out unless they block use.

Do not: Don't restyle it in the critique. Name the smallest fix.

Example: Critique the command list.
## brand

**/brand**

Hold the name, palette, and type. Don't restyle the product in passing.

Group: `design`

When: A change is threatening to rebrand the app.

Steps:

1. Keep the existing name and tokens.
2. Match the voice of the existing copy.

Do not: Don't introduce a new logo, accent, or voice.

Example: Brand stays Cuebook. This is a second book, not a new product.
## states

**/states**

List every state of this screen and what the person can do in each.

Group: `design`

When: A screen has more modes than the mock shows.

Steps:

1. Name each state.
2. Say what is on screen.
3. Say the actions available.

Do not: Don't design only the full list.

Example: States: all commands, one group, search, saved, empty, detail open, brief full.
## og

**/og**

Specify the share card: the sentence, the picture, and the card type.

Group: `design`

When: The link will be shared and needs a card.

Steps:

1. One sentence.
2. What the picture shows.
3. The card type.

Do not: Don't promise a picture you don't have.

Example: Og for Cuebook.
