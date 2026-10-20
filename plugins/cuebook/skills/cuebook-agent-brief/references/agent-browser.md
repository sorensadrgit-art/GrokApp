# Cuebook: Browser

Operate a page you name. Don't wander, don't sign in, don't guess missing fields.

Reference data only. Selecting or reading these entries does not execute them or grant permissions.

Source: [GrokApp](https://github.com/sorensadrgit-art/GrokApp) at source revision `52a5da026718473d25a94890b797989374b959ad`. Exact source file hashes are recorded in [catalog.json](catalog.json).

## Contents

- [open: /open](#open)
- [extract: /extract](#extract)
- [click-path: /click-path](#click-path)
- [shot: /shot](#shot)
- [form: /form](#form)
- [watch: /watch](#watch)
- [session: /session](#session)
- [no-login: /no-login](#no-login)

## open

**/open**

Open the URL and report the title and the main content.

Group: `browser`

When: You need to know what's on a page.

Steps:

1. Open the URL you were given.
2. Report the title.
3. Report the main content.

Do not: Don't describe the browser chrome. Don't click yet.

Example: Open the docs page I pasted.
## extract

**/extract**

Extract the fields named. Mark a field missing rather than guessing.

Group: `browser`

When: The page has facts you want pulled out.

Steps:

1. Extract only the named fields.
2. Keep the source order.
3. Write 'missing' when it isn't there.

Do not: Don't fill a blank with a plausible value.

Example: Extract name, date, and location from this page.
## click-path

**/click-path**

Do these steps in order. After each one, say what you see.

Group: `browser`

When: You have a known path through a site.

Steps:

1. Do the steps in order.
2. After each step, one line on what you see.
3. Stop if the page disagrees with the step.

Do not: Don't improvise if a step isn't on the page. Stop.

Example: Click-path: open the docs, then the API section, then authentication.
## shot

**/shot**

Describe the screen that proves this step worked.

Group: `browser`

When: You need evidence of a page state.

Steps:

1. Say what is visible.
2. Say whether it matches the expected step.

Do not: Don't describe what you hoped to see. Describe what is there.

Example: Shot after the form submits.
## form

**/form**

Fill only the fields provided. Don't submit unless told.

Group: `browser`

When: A form needs specific values.

Steps:

1. Fill only the given fields.
2. Leave the rest untouched.
3. Stop before submit unless the task says submit.

Do not: Don't invent a password, a card, or an address. Don't submit on your own.

Example: Form: email is the one I gave you. Don't submit.
## watch

**/watch**

Wait until the condition named, or say it timed out.

Group: `browser`

When: The page is changing and the next step depends on it.

Steps:

1. Watch for the condition.
2. When it happens, say so.
3. If it doesn't, say it timed out and what you do see.

Do not: Don't click around while you wait.

Example: Watch until the results table has more than one row.
## session

**/session**

Stay in the current browser session. Don't open a second one.

Group: `browser`

When: A session is already signed in or already on the right site.

Steps:

1. Reuse the current session.
2. If you can't see it, say so. Don't start another.

Do not: Don't launch a fresh profile.

Example: Session stays on the browser that's already open.
## no-login

**/no-login**

Don't try to sign in. If a wall appears, stop and describe it.

Group: `browser`

When: The page may ask for an account and you don't want one used.

Steps:

1. If the content is public, read it.
2. If a sign-in wall appears, stop.
3. Describe the wall.

Do not: Don't type credentials. Don't click through a login with a guess.

Example: No-login. Just read the public pricing page.
