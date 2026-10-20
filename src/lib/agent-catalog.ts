export type GroupId =
  | "control"
  | "read"
  | "build"
  | "repair"
  | "ship"
  | "research"
  | "write"
  | "design"
  | "picture"
  | "browser"
  | "study"
  | "decide"

export type AgentCommand = {
  id: string
  code: string
  group: GroupId
  meaning: string
  when: string
  avoid: string
  steps: string[]
  example: string
}

export type GroupMeta = {
  id: GroupId
  label: string
  blurb: string
}

export const GROUPS: GroupMeta[] = [
  {
    id: "control",
    label: "Control",
    blurb: "How the agent should behave on this task. Put these first when you care about the shape of the work.",
  },
  {
    id: "read",
    label: "Read",
    blurb: "Look before touching. Use these when you want a map, a trace, or an explanation instead of a change.",
  },
  {
    id: "build",
    label: "Build",
    blurb: "Make the change in the codebase that already exists. Match its patterns.",
  },
  {
    id: "repair",
    label: "Repair",
    blurb: "Find the cause, fix that, and leave a check behind. No drive-by cleanup.",
  },
  {
    id: "ship",
    label: "Ship",
    blurb: "Prove it works, including on a phone, and say what's left in plain language.",
  },
  {
    id: "research",
    label: "Research",
    blurb: "Separate what was found from what was guessed. Keep the source next to the claim.",
  },
  {
    id: "write",
    label: "Write",
    blurb: "Spec, rewrite, and the messages around the work. Keep the meaning you already have.",
  },
  {
    id: "design",
    label: "Design",
    blurb: "Screens, layout, and critique. One primary action. Use the tokens that are already there.",
  },
  {
    id: "picture",
    label: "Picture",
    blurb: "Direction for a still or a clip. The picture book has the rest of the visual codes.",
  },
  {
    id: "browser",
    label: "Browser",
    blurb: "Operate a page you name. Don't wander, don't sign in, don't guess missing fields.",
  },
  {
    id: "study",
    label: "Study",
    blurb: "Teach, quiz, and drill. One question at a time when the command says to wait.",
  },
  {
    id: "decide",
    label: "Decide",
    blurb: "Options, a call, and the risks. Say what would change the answer.",
  },
]

function cmd(
  group: GroupId,
  slug: string,
  meaning: string,
  when: string,
  avoid: string,
  steps: string[],
  example: string,
): AgentCommand {
  return { id: slug, code: `/${slug}`, group, meaning, when, avoid, steps, example }
}

export const COMMANDS: AgentCommand[] = [
  cmd(
    "control",
    "scope",
    "Restate the job, the done-condition, and what you will not touch.",
    "The task is fuzzy, or you want the agent to show it understood before editing.",
    "Don't start editing in the same breath. Don't widen the job.",
    [
      "Restate the job in one short paragraph.",
      "State the done-condition as something you can check.",
      "List what is out of scope.",
      "Continue only if nothing material is ambiguous. Otherwise ask one question.",
    ],
    "Add a saved-filters view to the list. Don't redesign the navigation.",
  ),
  cmd(
    "control",
    "plan",
    "Write the plan only. No edits, no installs, no servers.",
    "You want the approach before any file changes.",
    "Don't implement 'while you're in there.' Don't pad the plan with optional ideas.",
    [
      "Give ordered steps.",
      "Name the files you expect to touch.",
      "Name the risks and how you'll check the result.",
      "Stop after the plan.",
    ],
    "Plan how you'll add offline starring without an account.",
  ),
  cmd(
    "control",
    "go",
    "Carry out the plan you already have.",
    "A plan exists and you want it executed, not reopened.",
    "Don't relitigate the plan unless a step is blocked.",
    [
      "Follow the plan in order.",
      "If a step is blocked, stop and say why.",
      "Don't add steps that were not in the plan.",
    ],
    "Go. The plan we agreed is the one in your last message.",
  ),
  cmd(
    "control",
    "only",
    "Change only what the task needs.",
    "You want a fix or feature without a cleanup tour.",
    "Don't refactor neighbors, rename for taste, or add settings nobody asked for.",
    [
      "Touch the smallest set of files that solves the task.",
      "Leave unrelated code as you found it.",
      "If you notice a separate issue, mention it. Don't fix it.",
    ],
    "The empty state says 'No items' even when the request failed. Fix the copy only.",
  ),
  cmd(
    "control",
    "proceed",
    "State your assumptions, pick the safest, and continue.",
    "A few details are open but you don't want a questionnaire.",
    "Don't stop for a preference you can default safely. Don't hide a risky assumption.",
    [
      "List assumptions, one line each.",
      "Mark the one you are using.",
      "Continue.",
    ],
    "Add export. Proceed if I didn't name the format.",
  ),
  cmd(
    "control",
    "ask",
    "Ask the single question that unblocks you, then stop.",
    "You are actually blocked, not merely missing a preference.",
    "Don't ask a stack of questions. Don't keep working past the block.",
    [
      "Ask one question.",
      "Offer two to four concrete options.",
      "Stop.",
    ],
    "Ask before you pick a database. I haven't decided.",
  ),
  cmd(
    "control",
    "status",
    "Report done, in progress, blocked, and the next step.",
    "You want a snapshot, not more work.",
    "Don't teach. Don't start the next step.",
    [
      "Use four labels: done, in progress, blocked, next.",
      "One to three lines under each, or 'none.'",
    ],
    "Status on the filter work.",
  ),
  cmd(
    "control",
    "stop",
    "Stop this approach. Say what changed and what you did not verify.",
    "The current attempt is wrong and you don't want it stacked on.",
    "Don't keep patching the failed approach.",
    [
      "Stop.",
      "Say what already changed.",
      "Say what is unverified.",
      "Wait for direction.",
    ],
    "Stop. The animation approach is wrong.",
  ),
  cmd(
    "control",
    "constraints",
    "The lines under this command outrank your defaults.",
    "You have rules that should beat helpful extras.",
    "Don't 'improve' past a constraint.",
    [
      "Read the constraints under this command as binding.",
      "If one conflicts with a habit of yours, follow the constraint.",
      "If two constraints conflict, say so and stop.",
    ],
    "Constraints:\nKeep the lime accent.\nNo new dependencies.\nNo accounts.",
  ),
  cmd(
    "control",
    "quiet",
    "Use the fewest words that are still complete.",
    "You want the answer, not a tour of the reasoning.",
    "Don't drop the result, the decision, or a real blocker just to be short.",
    [
      "Lead with the answer.",
      "Cut preamble and recap.",
      "Keep the one detail that would be dangerous to omit.",
    ],
    "Quiet. What file owns the search ranking?",
  ),
  cmd(
    "control",
    "show",
    "Lead with the thing the user can use.",
    "The user wants the result, not how the tools were used.",
    "Don't narrate plumbing, ports, or internal steps unless asked.",
    [
      "Put the usable result first.",
      "Then the one next action, if there is one.",
    ],
    "Show me the empty state you wrote.",
  ),
  cmd(
    "control",
    "checkpoint",
    "Pause after this step and show the result before continuing.",
    "You want to approve a step before the rest happens.",
    "Don't run ahead after the checkpoint.",
    [
      "Do only the step in front of you.",
      "Show the result.",
      "Wait.",
    ],
    "Checkpoint after the data shape, before any UI.",
  ),

  cmd(
    "read",
    "codemap",
    "Map only the parts of the system this task touches.",
    "You don't know where the behavior lives yet.",
    "Don't tour unrelated trees. Don't propose a rewrite in the map.",
    [
      "Name the entry points.",
      "Follow the data from input to the screen or response.",
      "List the files that matter, each with why.",
    ],
    "Codemap the path from search box to the filtered list.",
  ),
  cmd(
    "read",
    "find",
    "Find every place that owns this behavior.",
    "You need the call sites, not a folder.",
    "Don't list files that only mention the word.",
    [
      "Name the file and the symbol.",
      "Say whether it is the owner or a caller.",
      "Stop when the set is complete.",
    ],
    "Find what decides the star is filled.",
  ),
  cmd(
    "read",
    "trace",
    "Walk the execution path and name where state goes wrong.",
    "Something behaves oddly and you want the path, not a fix yet.",
    "Don't fix it in this pass unless a later command says so.",
    [
      "Start at the trigger.",
      "Name each hop.",
      "Mark the hop where the result diverges from what should happen.",
    ],
    "Trace what happens when the query is cleared.",
  ),
  cmd(
    "read",
    "explaincode",
    "Explain what the code is doing, in plain language.",
    "You want to understand a piece before changing it.",
    "Don't narrate line by line. Don't suggest a rewrite unless asked.",
    [
      "Say what it does.",
      "Say why it is shaped this way, if the code shows that.",
      "Name the trap a caller could hit.",
    ],
    "Explaincode the rank function.",
  ),
  cmd(
    "read",
    "contracts",
    "List the invariants this code must keep.",
    "You are about to change something that has silent rules.",
    "Don't invent rules the code doesn't honor. Mark guesses.",
    [
      "List invariants.",
      "Mark which ones have a test.",
      "Mark which ones are only implied.",
    ],
    "Contracts for the brief stack. It caps at six.",
  ),
  cmd(
    "read",
    "deps",
    "Name what this change depends on, and what breaks if those move.",
    "You want the coupling before you edit.",
    "Don't propose replacing the dependency unless asked.",
    [
      "Name the upstream pieces.",
      "Name the callers and screens that feel a break.",
      "Keep it to this change.",
    ],
    "Deps if I change the command id format.",
  ),
  cmd(
    "read",
    "diff",
    "Explain what a change does and why it matters.",
    "You have a diff and want it in plain language.",
    "Don't review yet unless asked. Don't restate every line.",
    [
      "Say what the user can do now that they couldn't.",
      "Say what behavior stayed the same.",
      "Name anything the diff claims that it does not do.",
    ],
    "Diff the uncommitted work.",
  ),
  cmd(
    "read",
    "blast",
    "Name the blast radius of this change.",
    "The edit looks small and you want to know what else moves.",
    "Don't inflate it into a rewrite proposal.",
    [
      "List callers, stored data, and UI that can change behavior.",
      "Mark the ones you will recheck.",
    ],
    "Blast if the star key in local storage changes.",
  ),

  cmd(
    "build",
    "implement",
    "Build the agreed behavior in the style of this codebase.",
    "The behavior is decided and you want it built.",
    "Don't redesign the surrounding product. Don't leave it unwired.",
    [
      "Match the existing patterns.",
      "Wire it into the real entry, not a side demo.",
      "Include the states the screen actually has.",
      "Leave it runnable.",
    ],
    "Implement the brief composer we specced.",
  ),
  cmd(
    "build",
    "scaffold",
    "Add only the files this feature needs, and wire them in.",
    "You are starting a feature that doesn't have a home yet.",
    "Don't generate a parallel app inside the app.",
    [
      "Create the smallest set of files.",
      "Register them where the app already routes or renders.",
      "Use the existing tokens and types.",
    ],
    "Scaffold a detail sheet for one command.",
  ),
  cmd(
    "build",
    "wire",
    "Connect the pieces that already exist.",
    "The parts are built and the link between them is missing.",
    "Don't redesign the pieces while connecting them.",
    [
      "Find the two sides.",
      "Connect them with the data they already speak.",
      "Prove the path with one real case.",
    ],
    "Wire Saved so it shows starred commands from this book.",
  ),
  cmd(
    "build",
    "state",
    "Add state using the pattern this app already uses.",
    "The interaction needs memory the UI doesn't have.",
    "Don't add a new state library. Don't lift state higher than it needs to go.",
    [
      "Use the existing store or component state.",
      "Persist only if the behavior is supposed to survive reload.",
      "Define the empty value.",
    ],
    "State for the brief, capped at six command ids.",
  ),
  cmd(
    "build",
    "api",
    "Design a small, consistent interface for the task.",
    "You need a function, route, or component API.",
    "Don't add options for imaginary callers. Don't return fake success.",
    [
      "Name the inputs and outputs.",
      "Validate at the boundary.",
      "Match the style of the neighboring interface.",
    ],
    "API for copying either one command or a whole brief.",
  ),
  cmd(
    "build",
    "migrate",
    "Change the data shape without destroying what's already stored.",
    "Saved data on device or in a table has to move.",
    "Don't wipe storage unless the task says to.",
    [
      "Read the old shape.",
      "Accept both shapes, or migrate on read.",
      "Say what happens to data you can't read.",
    ],
    "Migrate starred ids if the command slug changes.",
  ),
  cmd(
    "build",
    "types",
    "Add or tighten types without changing behavior.",
    "The types are lying or too loose.",
    "Don't cast away an error you don't understand. Don't change runtime behavior.",
    [
      "Make the type match what the code actually does.",
      "Fix errors at the source.",
      "Leave behavior alone.",
    ],
    "Types for the group id on a command.",
  ),
  cmd(
    "build",
    "naming",
    "Propose clearer names for unclear symbols.",
    "A name is hiding what the thing does.",
    "Don't rename the world. Don't pick cute names.",
    [
      "Propose the name.",
      "Say what it emphasizes.",
      "Rename only the symbols in this task if the task says to apply it.",
    ],
    "Naming for the function that builds the paste text.",
  ),
  cmd(
    "build",
    "empty",
    "Include the empty, loading, and error states.",
    "A screen only handles the happy path.",
    "Don't leave a blank while data is missing. Don't use a joke as the error.",
    [
      "Say what the user sees when there is nothing.",
      "Say what they see while it loads, if loading is real.",
      "Say what they can do when it fails.",
    ],
    "Empty states for search with no hits.",
  ),
  cmd(
    "build",
    "pattern",
    "Find the closest existing pattern and follow it.",
    "You want the new UI to feel like the rest of the app.",
    "Don't introduce a second visual language.",
    [
      "Name the file you are matching.",
      "Follow its structure, type, and spacing.",
      "Differ only where the new behavior requires it.",
    ],
    "Pattern the new list on the existing code list.",
  ),
  cmd(
    "build",
    "integrate",
    "Merge parallel work into one coherent app.",
    "Two changes grew separately and need to become one.",
    "Don't average conflicting designs. Pick the one that fits the app.",
    [
      "Find the conflicts.",
      "Resolve them.",
      "Check the joined path still works.",
    ],
    "Integrate the command book with the picture book navigation.",
  ),
  cmd(
    "build",
    "flags",
    "If a behavior must be optional, default it to today's behavior.",
    "You are adding something people should be able to ignore.",
    "Don't turn the flag on by default if that changes current users.",
    [
      "Default to the current behavior.",
      "Name the switch.",
      "Keep the off path unchanged.",
    ],
    "Flags for showing examples on the list rows. Off by default.",
  ),
  cmd(
    "build",
    "refactor",
    "Restructure the code without changing behavior.",
    "The structure is blocking the task, and behavior must stay.",
    "Don't mix a refactor with a feature. Don't 'improve' behavior along the way.",
    [
      "State the behavior that must stay.",
      "Restructure.",
      "Check the behavior is the same.",
    ],
    "Refactor the sheet so both books can use it. Same look.",
  ),
  cmd(
    "build",
    "simplifycode",
    "Reduce branching and indirection while keeping behavior.",
    "The code is harder to follow than the job it does.",
    "Don't remove a branch that handles a real case.",
    [
      "Name the behavior to keep.",
      "Remove a layer only if no caller needs it.",
      "Show the simpler path.",
    ],
    "Simplifycode the filter logic.",
  ),

  cmd(
    "repair",
    "debug",
    "Find the likely bug. Name the cause, then fix the cause.",
    "Something fails and you want it actually fixed.",
    "Don't patch the symptom. Don't clean unrelated code.",
    [
      "Reproduce it with the smallest case.",
      "Name the cause in one sentence.",
      "Fix that cause.",
      "Show the check that now passes.",
    ],
    "The save button stays disabled after the form is valid.",
  ),
  cmd(
    "repair",
    "repro",
    "Turn a bug report into the smallest steps that reproduce it.",
    "You have a vague report and need a recipe.",
    "Don't fix it yet if this command is alone.",
    [
      "Write the shortest steps.",
      "State what you expect and what happens.",
      "Cut any step that isn't needed to show the bug.",
    ],
    "People say search sometimes shows picture codes inside the agent book.",
  ),
  cmd(
    "repair",
    "edgecases",
    "List the inputs most likely to break this.",
    "You want the cases before or after a fix.",
    "Don't list theoretical cases that this code cannot receive.",
    [
      "List the cases that can actually happen here.",
      "Say the expected result for each.",
      "Mark the ones that fail today, if you know.",
    ],
    "Edgecases for the brief when it is full.",
  ),
  cmd(
    "repair",
    "bisect",
    "Narrow it to the smallest case that still fails.",
    "The failure is real but the area is large.",
    "Don't speculate a cause before the case is small.",
    [
      "Find the last known good behavior, if you can.",
      "Shrink the input until removing anything makes the bug vanish.",
      "Then name the suspect.",
    ],
    "Bisect why copying fails only on the phone preview.",
  ),
  cmd(
    "repair",
    "fix",
    "Apply the fix. Keep the diff to the bug.",
    "The cause is known.",
    "Don't bundle a refactor. Don't claim it's fixed without a check.",
    [
      "Change only what the cause requires.",
      "Keep a check that fails before and passes after, when a check is possible.",
    ],
    "Fix the off-by-one when the sixth command is added.",
  ),
  cmd(
    "repair",
    "tests",
    "Write tests for the important paths and the edge cases.",
    "Behavior needs a lock so it doesn't regress.",
    "Don't test the framework. Don't assert copy you expect to keep changing, unless the copy is the contract.",
    [
      "Cover the main path.",
      "Cover the edge case that broke or is likely to.",
      "Run the tests.",
    ],
    "Tests for ranking an exact code match above a substring.",
  ),
  cmd(
    "repair",
    "regress",
    "Check the neighbors this change could have broken.",
    "A fix landed and nearby behavior might have moved.",
    "Don't expand into a full rewrite of the neighbors.",
    [
      "List the neighboring behaviors.",
      "Check each one.",
      "Report pass or fail.",
    ],
    "Regress starring and the picture book after the nav change.",
  ),
  cmd(
    "repair",
    "review",
    "Review the code for bugs, risks, and concrete fixes.",
    "You want a picky pass, not more features.",
    "Don't nitpick taste. Don't rewrite the feature in the review.",
    [
      "Look for correctness, security, and missing states.",
      "Cite the place.",
      "Say the fix in one sentence.",
      "Block only on those. Mention nits separately.",
    ],
    "Review the brief assembler.",
  ),
  cmd(
    "repair",
    "security",
    "Review for injection, auth gaps, and data exposure.",
    "The change takes input, stores data, or crosses a trust boundary.",
    "Don't wave it through because it 'looks internal.'",
    [
      "Check input handling, auth, and secrets.",
      "Cite the line if something is wrong.",
      "Say 'nothing in this change' if that's the truth.",
    ],
    "Security on the task text that gets pasted into the brief.",
  ),
  cmd(
    "repair",
    "logs",
    "Read the failure and quote the first real error.",
    "There is a stack trace or a long log.",
    "Don't anchor on the last line if it's fallout.",
    [
      "Quote the first error that is a cause.",
      "Say what it means.",
      "Ignore trailing noise unless it changes the cause.",
    ],
    "Logs from the failed build. Quote the real error.",
  ),
  cmd(
    "repair",
    "flaky",
    "Explain the intermittence, then fix that.",
    "It fails sometimes.",
    "Don't add a sleep and call it fixed.",
    [
      "Say whether it is order, time, shared state, or a real race.",
      "Fix that cause.",
      "Say how you'll know it stayed fixed.",
    ],
    "Flaky: the sheet sometimes opens the previous command.",
  ),
  cmd(
    "repair",
    "undo",
    "Back out the failed approach before trying the next one.",
    "An attempt made things worse.",
    "Don't stack the next idea on the failed one.",
    [
      "Remove the failed change.",
      "Confirm the previous behavior is back.",
      "Then try the next approach, if one was asked for.",
    ],
    "Undo the virtualized list. It broke tap targets.",
  ),
  cmd(
    "repair",
    "optimize",
    "Improve the hot path. Leave the rest alone.",
    "Something is actually slow.",
    "Don't micro-optimize cold code. Don't change behavior.",
    [
      "Name the hot path.",
      "Change that.",
      "Say how you know it is cheaper.",
    ],
    "Optimize filtering when the query changes. The list is long.",
  ),

  cmd(
    "ship",
    "verify",
    "Run the checks that prove this works. Report pass or fail.",
    "You want evidence, not a feeling.",
    "Don't say it works if you didn't run the check.",
    [
      "Run the relevant checks.",
      "Report pass or fail with the signal.",
      "If something wasn't run, say so.",
    ],
    "Verify search, starring, and copying a brief.",
  ),
  cmd(
    "ship",
    "preview",
    "Confirm the screen shows real content on a phone width and a laptop width.",
    "UI changed and you need to know it actually rendered.",
    "Don't trust a successful request alone. Don't ignore the console.",
    [
      "Look at a narrow phone width and a laptop width.",
      "Confirm real text is visible.",
      "Confirm the console has no uncaught errors.",
    ],
    "Preview the command list.",
  ),
  cmd(
    "ship",
    "a11y",
    "Check names, keyboard, focus, and contrast for what you changed.",
    "The change has controls, especially icon buttons.",
    "Don't boil the ocean outside this change.",
    [
      "Every icon button has a name.",
      "Focus is visible.",
      "The path works on keyboard.",
      "Text contrast holds.",
    ],
    "A11y on the add-to-brief buttons.",
  ),
  cmd(
    "ship",
    "mobile",
    "At a phone width: no sideways scroll, no overlap, targets you can tap.",
    "Someone will use this on a phone.",
    "Don't shrink text below a readable size to force a fit.",
    [
      "Check around 390 pixels wide.",
      "No horizontal overflow.",
      "Tap targets at least 44 pixels.",
      "The primary action stays reachable.",
    ],
    "Mobile on the command list and the brief bar.",
  ),
  cmd(
    "ship",
    "perf",
    "Name the one cost that matters here.",
    "You suspect the screen or the query is heavy.",
    "Don't optimize anything except that cost.",
    [
      "Name the cost.",
      "Say whether it matters at the size this product actually has.",
      "Change it only if it does.",
    ],
    "Perf of rendering the full command list.",
  ),
  cmd(
    "ship",
    "changelog",
    "Write what changed and what to try, in the user's words.",
    "You need a note a person can act on.",
    "Don't mention internal file names unless the user works in the repo.",
    [
      "Say what changed.",
      "Say what to try.",
      "Say a limit if there is one.",
    ],
    "Changelog for the agent command book.",
  ),
  cmd(
    "ship",
    "handoff",
    "Note how to run it, what is fragile, and what is not done.",
    "Someone else will pick this up, including future you.",
    "Don't write a manual. Don't hide a known gap.",
    [
      "How to try the change.",
      "What is fragile.",
      "What is not done.",
    ],
    "Handoff on the command book.",
  ),
  cmd(
    "ship",
    "done",
    "Check the work against the done-condition. List any gap.",
    "You are about to call it finished.",
    "Don't call it done with a known gap buried in the middle.",
    [
      "Restate the done-condition.",
      "Mark each part met or not.",
      "List gaps before you say finished.",
    ],
    "Done check for 'a full list of agent commands I can copy.'",
  ),
  cmd(
    "ship",
    "docs",
    "Add concise documentation for the public surface.",
    "A behavior is now part of how people use the product.",
    "Don't document internals. Don't drift from what the UI actually does.",
    [
      "Document the surface a user touches.",
      "Keep it shorter than the feature.",
      "Match the real labels.",
    ],
    "Docs: how to build a brief and copy it.",
  ),

  cmd(
    "research",
    "research",
    "Look it up. Separate what you found from what you inferred.",
    "The answer depends on facts you shouldn't invent.",
    "Don't present memory as a current source. Don't skip the link.",
    [
      "Find current sources.",
      "Label found versus inferred.",
      "Put the source next to the claim.",
    ],
    "Research the current limit on brief length for this kind of prompt.",
  ),
  cmd(
    "research",
    "factcheck",
    "Check factual claims and flag what could not be verified.",
    "A draft contains facts that might be wrong.",
    "Don't silently rewrite a claim you couldn't check. Flag it.",
    [
      "List claims.",
      "Mark verified, contradicted, or unverified.",
      "Cite the check.",
    ],
    "Factcheck the sources paragraph in the picture book.",
  ),
  cmd(
    "research",
    "latest",
    "Use current documentation. Say the version or the date.",
    "An API or product changes and memory may be stale.",
    "Don't answer from an old major version if the project is on a newer one.",
    [
      "Read the docs that match the version in this project.",
      "Say the version or date you used.",
    ],
    "Latest on how file routes are defined in this repo.",
  ),
  cmd(
    "research",
    "glossary",
    "Define the terms as this project uses them.",
    "Words like brief, code, and stack are overloaded.",
    "Don't substitute dictionary definitions for the product's.",
    [
      "List the terms.",
      "Define each as this product uses it.",
      "Note a collision if the same word means two things here.",
    ],
    "Glossary for code, command, brief, and stack.",
  ),
  cmd(
    "research",
    "scan",
    "Survey the options quickly. Go deep on the two that fit.",
    "You want a landscape, not a treatise.",
    "Don't give equal depth to options that are a bad fit.",
    [
      "List the real options in a few lines each.",
      "Pick the two that fit.",
      "Go one level deeper on those.",
    ],
    "Scan ways to persist a brief on this device only.",
  ),
  cmd(
    "research",
    "systemmap",
    "Map the actors, forces, and relationships.",
    "The question is about a system, not a single function.",
    "Don't turn it into an org chart of code files. That's codemap.",
    [
      "Name the actors.",
      "Name what each one wants.",
      "Name the links that matter.",
    ],
    "Systemmap for a student, an examiner, and a drill.",
  ),
  cmd(
    "research",
    "reverseengineer",
    "Work backward from the result to how it is produced.",
    "You can see the outcome and need the mechanism.",
    "Don't invent steps you didn't find.",
    [
      "Start from the visible result.",
      "Step backward to the cause.",
      "Mark any hop you could not confirm.",
    ],
    "Reverseengineer how a starred command survives reload.",
  ),

  cmd(
    "write",
    "spec",
    "Write the spec: who it's for, the job, done-when, and out of scope.",
    "The work needs a contract before building.",
    "Don't include implementation trivia. Don't leave done-when as a vibe.",
    [
      "Who it's for.",
      "The job.",
      "Done when.",
      "Out of scope.",
      "The edge cases that matter.",
    ],
    "Spec a full command list for my agent.",
  ),
  cmd(
    "write",
    "rewrite",
    "Rephrase the text I give you. Keep the meaning.",
    "The words are close but the wording is wrong.",
    "Don't add claims, features, or a new tone I didn't ask for.",
    [
      "Keep every fact.",
      "Change the wording.",
      "Don't add a closer or a moral.",
    ],
    "Rewrite: 'This is a list of commands you can paste.'",
  ),
  cmd(
    "write",
    "shorten",
    "Condense it. Same facts.",
    "It's too long for the place it sits.",
    "Don't drop a number, a name, or a constraint to make it shorter.",
    [
      "Cut about a third, more if it's fluffy.",
      "Keep the facts.",
      "Keep the action.",
    ],
    "Shorten the group blurbs.",
  ),
  cmd(
    "write",
    "simplify",
    "Make it easier to understand, in plainer language.",
    "A smart non-expert has to act on it.",
    "Don't talk down. Don't remove the precise term if the plain word is wrong.",
    [
      "Prefer plain words.",
      "Keep the term where precision matters, and define it once.",
    ],
    "Simplify the paragraph about briefs.",
  ),
  cmd(
    "write",
    "human",
    "Rewrite so it sounds natural, not like a template.",
    "The text sounds generated.",
    "Don't add slang, jokes, or fake warmth.",
    [
      "Use sentences a person would say.",
      "Cut stock transitions.",
      "Keep the meaning.",
    ],
    "Human the empty-state line.",
  ),
  cmd(
    "write",
    "formal",
    "Change the tone to professional.",
    "The text will be seen in a formal place.",
    "Don't make it stiff. Don't add legalese it doesn't need.",
    [
      "Professional, plain, specific.",
      "No slang.",
      "Same facts.",
    ],
    "Formal the handoff note.",
  ),
  cmd(
    "write",
    "commit-msg",
    "Propose a commit message from the change. Don't commit unless asked.",
    "You want the message, not the commit.",
    "Don't commit or push. Don't mention files that didn't change.",
    [
      "Subject line: what changed.",
      "Body: why, if why isn't obvious.",
      "Stop before running git commit.",
    ],
    "Commit-msg for the agent command book.",
  ),
  cmd(
    "write",
    "pr",
    "Write the description: what, why, how to test, risk.",
    "The change needs a review note.",
    "Don't market it. Don't hide a risk.",
    [
      "What.",
      "Why.",
      "How to test.",
      "Risk.",
    ],
    "PR text for adding the command book.",
  ),
  cmd(
    "write",
    "error-copy",
    "Write the message a person should see: what happened, and the next action.",
    "An error is currently a code or a blank.",
    "Don't show a stack trace. Don't be cute.",
    [
      "Say what happened.",
      "Say the next action.",
      "Don't blame the person.",
    ],
    "Error-copy when copying to the clipboard fails.",
  ),
  cmd(
    "write",
    "skeleton",
    "Outline only. A heading and one line under each.",
    "You want structure before prose.",
    "Don't draft the full piece.",
    [
      "Headings in order.",
      "One sentence under each.",
      "Stop.",
    ],
    "Skeleton for a practical-exam study sheet.",
  ),
  cmd(
    "write",
    "bullets",
    "Turn the output into bullet points.",
    "A list will be scanned, not read as prose.",
    "Don't use a bullet for a single sentence that should stay prose.",
    [
      "One idea per bullet.",
      "Parallel grammar.",
      "No nested bullets unless the nesting is real.",
    ],
    "Bullets for how to use this book.",
  ),
  cmd(
    "write",
    "tldr",
    "Give the shortest useful summary.",
    "Someone needs the point before the detail.",
    "Don't omit the caveat that changes the action.",
    [
      "One to three sentences.",
      "The action, if there is one.",
      "The caveat, if skipping it would mislead.",
    ],
    "Tldr what this command book is for.",
  ),
  cmd(
    "write",
    "checklist",
    "Turn this into a checklist. One action per line.",
    "A person is about to do the steps, not read about them.",
    "Don't combine two actions on one line.",
    [
      "One action per line.",
      "Start with a verb.",
      "Order them the way the work happens.",
    ],
    "Checklist for shipping a small UI change.",
  ),

  cmd(
    "design",
    "ui",
    "Design the screen as a product: hierarchy, one primary action, real states.",
    "A screen is new or feels like a wireframe.",
    "Don't add a second accent. Don't decorate.",
    [
      "One primary action.",
      "Hierarchy through size, weight, and color.",
      "Empty, busy, and error states if those exist.",
    ],
    "UI for the command list on a phone.",
  ),
  cmd(
    "design",
    "tokens",
    "Use the existing color, type, and spacing.",
    "A new surface is drifting from the product.",
    "Don't invent a palette. Don't add a new font.",
    [
      "Use the tokens already defined.",
      "If a value is missing, add a token. Don't sprinkle a one-off.",
    ],
    "Tokens only. No new colors for the agent book.",
  ),
  cmd(
    "design",
    "layout",
    "Set the regions, what is primary, and what collapses on a phone.",
    "The desktop layout doesn't have a phone plan.",
    "Don't hide the primary action below a long rail on a phone.",
    [
      "Name the regions.",
      "Say what stacks on a narrow screen.",
      "Keep the primary action reachable.",
    ],
    "Layout: groups as a rail on a laptop, chips on a phone.",
  ),
  cmd(
    "design",
    "motion",
    "Say what moves, how far, and how long. Honor reduced motion.",
    "Something animates, or you're about to add motion.",
    "Don't animate layout. Don't bounce.",
    [
      "What moves.",
      "Opacity and transform only, unless there's a reason.",
      "Reduced motion gets an instant or opacity-only change.",
    ],
    "Motion for the detail sheet.",
  ),
  cmd(
    "design",
    "critique",
    "Review the work and point out what needs improvement.",
    "You want a critique of a screen or a flow.",
    "Don't restyle it in the critique. Name the smallest fix.",
    [
      "Hierarchy, contrast, overflow, dead ends.",
      "The smallest fix for each real problem.",
      "Leave taste comments out unless they block use.",
    ],
    "Critique the command list.",
  ),
  cmd(
    "design",
    "brand",
    "Hold the name, palette, and type. Don't restyle the product in passing.",
    "A change is threatening to rebrand the app.",
    "Don't introduce a new logo, accent, or voice.",
    [
      "Keep the existing name and tokens.",
      "Match the voice of the existing copy.",
    ],
    "Brand stays Cuebook. This is a second book, not a new product.",
  ),
  cmd(
    "design",
    "states",
    "List every state of this screen and what the person can do in each.",
    "A screen has more modes than the mock shows.",
    "Don't design only the full list.",
    [
      "Name each state.",
      "Say what is on screen.",
      "Say the actions available.",
    ],
    "States: all commands, one group, search, saved, empty, detail open, brief full.",
  ),
  cmd(
    "design",
    "og",
    "Specify the share card: the sentence, the picture, and the card type.",
    "The link will be shared and needs a card.",
    "Don't promise a picture you don't have.",
    [
      "One sentence.",
      "What the picture shows.",
      "The card type.",
    ],
    "Og for Cuebook.",
  ),

  cmd(
    "picture",
    "still",
    "Direct one still: subject, light, and what must stay recognizable.",
    "You want a single image direction, not a menu of moods.",
    "Don't add people, logos, or text you weren't given.",
    [
      "Name the subject.",
      "Name the light and the lens feel.",
      "Say what must not change.",
    ],
    "Still of the product on a wood table, north window, no extra props.",
  ),
  cmd(
    "picture",
    "contact",
    "Four distinct directions for the same subject, labeled, so one can be picked.",
    "You haven't chosen a direction yet.",
    "Don't produce four near-duplicates.",
    [
      "Four directions.",
      "Label each.",
      "Same subject in all four.",
      "Say how they differ in one line.",
    ],
    "Contact sheet for a clinic hero. Same room, four lights.",
  ),
  cmd(
    "picture",
    "edit-img",
    "Change only what is specified in the uploaded image.",
    "An image exists and should be edited, not restaged.",
    "Don't change identity, pose, or background unless the instruction says so.",
    [
      "List the edits.",
      "Leave everything else.",
      "If an edit would require inventing a fact, skip it and say so.",
    ],
    "Edit-img: remove the outlet on the back wall. Leave the person alone.",
  ),
  cmd(
    "picture",
    "clip",
    "Direct one clip: start, action, end, camera. One motion.",
    "You want a short moving shot.",
    "Don't stack three ideas in one clip.",
    [
      "Start frame.",
      "The action.",
      "End frame.",
      "Camera move, if any.",
    ],
    "Clip: the goniometer settles on the joint. One slow push-in. No text.",
  ),
  cmd(
    "picture",
    "hero",
    "A clean hero image with the subject as the focal point.",
    "You need a primary picture for a page or a card.",
    "Don't add a headline you weren't given. Don't crowd the subject.",
    [
      "Subject dominates.",
      "Background stays quiet.",
      "Leave clean space only if a line of type was provided.",
    ],
    "Hero of the instrument on a dark field. No slogan.",
  ),
  cmd(
    "picture",
    "ugc",
    "A user-style photo or clip, as if someone is showing it to a friend.",
    "You want it to feel handheld, not like an ad.",
    "Don't polish it into a studio shot.",
    [
      "Handheld.",
      "A real place.",
      "Imperfect framing.",
      "The product still readable.",
    ],
    "Ugc of the product on a kitchen counter, phone photo.",
  ),
  cmd(
    "picture",
    "labels",
    "Use only the labels and facts provided. Leave off anything else.",
    "The image needs words and the words must be true.",
    "Don't invent measurements, prices, or anatomy.",
    [
      "Use the supplied labels verbatim.",
      "If a label wasn't supplied, don't add one.",
      "Keep them short.",
    ],
    "Labels: only 'Knee flexion' and '120°'. Nothing else.",
  ),
  cmd(
    "picture",
    "codes",
    "Treat pasted picture-book tokens as shorthand. Follow each meaning.",
    "You are combining visual codes from the other book.",
    "They are not secret switches. Don't obey the token if you ignore the meaning.",
    [
      "Read each code's meaning.",
      "Apply them together.",
      "Keep the subject recognizable.",
      "If a code wants a fact you don't have, omit it.",
    ],
    "Codes: /packshot and /northlight. Subject is the bottle I uploaded.",
  ),

  cmd(
    "browser",
    "open",
    "Open the URL and report the title and the main content.",
    "You need to know what's on a page.",
    "Don't describe the browser chrome. Don't click yet.",
    [
      "Open the URL you were given.",
      "Report the title.",
      "Report the main content.",
    ],
    "Open the docs page I pasted.",
  ),
  cmd(
    "browser",
    "extract",
    "Extract the fields named. Mark a field missing rather than guessing.",
    "The page has facts you want pulled out.",
    "Don't fill a blank with a plausible value.",
    [
      "Extract only the named fields.",
      "Keep the source order.",
      "Write 'missing' when it isn't there.",
    ],
    "Extract name, date, and location from this page.",
  ),
  cmd(
    "browser",
    "click-path",
    "Do these steps in order. After each one, say what you see.",
    "You have a known path through a site.",
    "Don't improvise if a step isn't on the page. Stop.",
    [
      "Do the steps in order.",
      "After each step, one line on what you see.",
      "Stop if the page disagrees with the step.",
    ],
    "Click-path: open the docs, then the API section, then authentication.",
  ),
  cmd(
    "browser",
    "shot",
    "Describe the screen that proves this step worked.",
    "You need evidence of a page state.",
    "Don't describe what you hoped to see. Describe what is there.",
    [
      "Say what is visible.",
      "Say whether it matches the expected step.",
    ],
    "Shot after the form submits.",
  ),
  cmd(
    "browser",
    "form",
    "Fill only the fields provided. Don't submit unless told.",
    "A form needs specific values.",
    "Don't invent a password, a card, or an address. Don't submit on your own.",
    [
      "Fill only the given fields.",
      "Leave the rest untouched.",
      "Stop before submit unless the task says submit.",
    ],
    "Form: email is the one I gave you. Don't submit.",
  ),
  cmd(
    "browser",
    "watch",
    "Wait until the condition named, or say it timed out.",
    "The page is changing and the next step depends on it.",
    "Don't click around while you wait.",
    [
      "Watch for the condition.",
      "When it happens, say so.",
      "If it doesn't, say it timed out and what you do see.",
    ],
    "Watch until the results table has more than one row.",
  ),
  cmd(
    "browser",
    "session",
    "Stay in the current browser session. Don't open a second one.",
    "A session is already signed in or already on the right site.",
    "Don't launch a fresh profile.",
    [
      "Reuse the current session.",
      "If you can't see it, say so. Don't start another.",
    ],
    "Session stays on the browser that's already open.",
  ),
  cmd(
    "browser",
    "no-login",
    "Don't try to sign in. If a wall appears, stop and describe it.",
    "The page may ask for an account and you don't want one used.",
    "Don't type credentials. Don't click through a login with a guess.",
    [
      "If the content is public, read it.",
      "If a sign-in wall appears, stop.",
      "Describe the wall.",
    ],
    "No-login. Just read the public pricing page.",
  ),

  cmd(
    "study",
    "teachme",
    "Teach it as a lesson: the idea, a concrete case, the usual mistake.",
    "You want to learn the thing, not just get an answer.",
    "Don't dump the whole chapter. Don't quiz yet unless another command says so.",
    [
      "The idea.",
      "One concrete case.",
      "The mistake people make.",
    ],
    "Teachme end feel versus a hard stop.",
  ),
  cmd(
    "study",
    "quizme",
    "Ask one question. Wait for the answer. Then mark it.",
    "You want to be tested, not handed the list.",
    "Don't ask the next question in the same message. Don't give the answer before the attempt.",
    [
      "Ask one question.",
      "Wait.",
      "Mark it and say why.",
      "Then stop.",
    ],
    "Quizme on goniometer alignment for knee flexion.",
  ),
  cmd(
    "study",
    "drill",
    "Set the station, ask for the step, then correct the performance.",
    "You want a practical rep, not a lecture.",
    "Don't demonstrate the whole skill and call it a drill.",
    [
      "Set the scene: position, landmarks, what you can see.",
      "Ask for the next step.",
      "Correct that step.",
    ],
    "Drill manual muscle test for hip abduction. I'm the student.",
  ),
  cmd(
    "study",
    "oral",
    "Play the examiner. One check-off question, then grade it against the standard.",
    "You want the pressure of a practical, including the grading.",
    "Don't soften a wrong answer into a pass. Don't ask three questions at once.",
    [
      "Ask one check-off question.",
      "Wait for the answer.",
      "Grade it: pass, borderline, or miss, with the standard you used.",
    ],
    "Oral me on ankle dorsiflexion. Examiner voice.",
  ),
  cmd(
    "study",
    "gaps",
    "From what I show you, name the gaps. Don't pad.",
    "You want to know what is missing before a test.",
    "Don't reteach topics I already have cold.",
    [
      "Read what I already covered.",
      "Name only the gaps.",
      "Say which gap to close first.",
    ],
    "Gaps: I can landmark the knee but I rush the end feel.",
  ),
  cmd(
    "study",
    "mnemonic",
    "One memory hook, tied to the real mechanism.",
    "A list won't stick and you want one hook.",
    "Don't use a cute story that isn't how the thing works.",
    [
      "One hook.",
      "Tie it to the mechanism.",
      "Say where the hook would mislead you if you trusted it too far.",
    ],
    "Mnemonic for the order of a MMT grade.",
  ),
  cmd(
    "study",
    "socratic",
    "Teach by asking guided questions.",
    "You want to arrive at the idea, not be handed it.",
    "Don't ask a question you immediately answer.",
    [
      "Ask the question that unlocks the next step.",
      "Wait.",
      "Use the answer to choose the next question.",
    ],
    "Socratic through why the axis goes over the joint.",
  ),
  cmd(
    "study",
    "stepbystep",
    "Force a sequential, ordered explanation.",
    "Order matters and a summary would hide it.",
    "Don't skip a step because it seems obvious.",
    [
      "Number the steps.",
      "One action per step.",
      "Name the check at the end of the sequence.",
    ],
    "Stepbystep for measuring ankle dorsiflexion.",
  ),
  cmd(
    "study",
    "misconceptions",
    "List the common misunderstandings about this topic.",
    "You want the traps before you practice.",
    "Don't include straw men. These should be mistakes people actually make.",
    [
      "The misunderstanding.",
      "What is true instead.",
      "How you'd notice it in a practical.",
    ],
    "Misconceptions about end feel.",
  ),
  cmd(
    "study",
    "feynman",
    "Explain it as simply as possible, to test whether it is actually understood.",
    "You want the simple version as a test of understanding.",
    "Don't hide behind jargon. Don't lose the mechanism.",
    [
      "Plain explanation.",
      "The one place the plain version is incomplete.",
    ],
    "Feynman gait during stance.",
  ),

  cmd(
    "decide",
    "alt3",
    "Three different alternatives. For each, the upside, the cost, and when it is the wrong pick.",
    "You have not chosen and want real options.",
    "Don't offer three wordings of the same option.",
    [
      "Three options.",
      "Upside, cost, and the case where it is wrong.",
      "Don't pick yet unless another command says to decide.",
    ],
    "Alt3 for saving a brief: this device, an account, or no save.",
  ),
  cmd(
    "decide",
    "compare",
    "Compare two or more options side by side.",
    "The options exist and you want them lined up.",
    "Don't add a recommendation unless asked. Comparison first.",
    [
      "Same criteria for each.",
      "Use a table if there are more than two criteria.",
      "Leave the call for /decide if it wasn't requested.",
    ],
    "Compare starring on device versus a written list.",
  ),
  cmd(
    "decide",
    "decide",
    "Make the call. Say why, and what would change it.",
    "You want a decision, not a survey.",
    "Don't hand the choice back. Don't hide the condition that would flip it.",
    [
      "State the call.",
      "Two sentences on why.",
      "What would change it.",
    ],
    "Decide whether the agent book should open by default.",
  ),
  cmd(
    "decide",
    "riskmap",
    "Identify the risks that can actually happen, each with a mitigation you can do now.",
    "You are about to commit to a plan.",
    "Don't list generic risks. Don't mitigate with 'be careful.'",
    [
      "Risks that can happen on this task.",
      "A mitigation available now.",
      "Drop risks you cannot act on.",
    ],
    "Riskmap for storing the brief in local storage.",
  ),
  cmd(
    "decide",
    "assumptions",
    "Identify the hidden assumptions in the claim or the plan.",
    "Something sounds decided but rests on unstated premises.",
    "Don't treat an assumption as a fact once you've named it.",
    [
      "List the assumptions.",
      "Mark which ones are load-bearing.",
      "Say which one to check first.",
    ],
    "Assumptions in 'students will paste the whole book into the agent.'",
  ),
  cmd(
    "decide",
    "tradeoff",
    "Name the tradeoff being ignored.",
    "A plan pretends you can have both.",
    "Don't resolve it unless asked. Name it.",
    [
      "Name the two things in tension.",
      "Say what you give up on each side.",
    ],
    "Tradeoff between a full list on one screen and a readable phone layout.",
  ),
  cmd(
    "decide",
    "priority",
    "Order the work. Say what drops if time runs out.",
    "There is more to do than will fit.",
    "Don't rank everything as high.",
    [
      "Order the items.",
      "Say the cut line.",
      "Say what 'done enough' means.",
    ],
    "Priority: command list, briefs, picture-book link, presets.",
  ),
  cmd(
    "decide",
    "scope-cut",
    "Propose the smaller version that still ships the point.",
    "The full idea is too big for this pass.",
    "Don't cut the part that makes it the thing. Cut the ornaments.",
    [
      "State the point.",
      "State the smaller version.",
      "State what you are leaving out.",
    ],
    "Scope-cut the command book so it still counts as a full list.",
  ),
  cmd(
    "decide",
    "postmortem",
    "What failed, the cause, and the change in how we'll do it.",
    "A piece of work missed and you want the lesson.",
    "Don't write a blame story. Don't propose a process nobody will follow.",
    [
      "What failed.",
      "The cause.",
      "The change in the next attempt.",
    ],
    "Postmortem on the last UI that looked fine in dev and broke when built.",
  ),
  cmd(
    "decide",
    "nextstep",
    "Choose one useful next action, and how to start it.",
    "You are stalled and need the next move, not a plan.",
    "Don't list five next steps.",
    [
      "One action.",
      "The first physical step.",
      "What done looks like for that step.",
    ],
    "Nextstep after the command list is in.",
  ),
  cmd(
    "decide",
    "counter",
    "Generate the strongest counterargument.",
    "You want the best case against the current plan.",
    "Don't argue a weak version so the plan still wins.",
    [
      "State the plan in one line.",
      "Give the strongest case against it.",
      "Say whether that case changes the call.",
    ],
    "Counter: opening the agent book by default hides the picture codes.",
  ),
  cmd(
    "decide",
    "redteam",
    "Critique aggressively to expose weaknesses.",
    "You want the plan stressed, not encouraged.",
    "Don't insult. Attack the plan.",
    [
      "Name the failure modes.",
      "Say which one is fatal.",
      "Stop before proposing a replacement unless asked.",
    ],
    "Redteam the idea of pasting twelve commands at once.",
  ),
  cmd(
    "decide",
    "pareto",
    "Find the small set of actions that drive most of the result.",
    "The list of work is long and you want the few that matter.",
    "Don't pretend the rest is worthless. Say it is the rest.",
    [
      "Name the few actions.",
      "Say the result they get you.",
      "Say what you are explicitly not doing first.",
    ],
    "Pareto for learning a joint exam this week.",
  ),
]

const groupLabel = new Map(GROUPS.map((group) => [group.id, group.label]))

export function groupName(group: GroupId) {
  return groupLabel.get(group) ?? group
}

export function singlePrompt(command: AgentCommand) {
  const steps = command.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")
  return [
    command.code,
    "",
    command.meaning,
    "",
    `When: ${command.when}`,
    "",
    "Do this:",
    steps,
    "",
    `Do not: ${command.avoid}`,
  ].join("\n")
}

export function briefPrompt(commands: AgentCommand[], task: string) {
  const lines = commands
    .map((command, index) => `${index + 1}. ${command.code} — ${command.meaning}\n   Do not: ${command.avoid}`)
    .join("\n")
  const body = task.trim() || "(write the task here)"
  return [
    "You are my agent for this task. Follow each command in order. If two conflict, the earlier command wins.",
    "",
    lines,
    "",
    "Task:",
    body,
  ].join("\n")
}

export function bookMarkdown(commands: AgentCommand[] = COMMANDS) {
  const sections = GROUPS.map((group) => {
    const items = commands
      .filter((command) => command.group === group.id)
      .map((command) => `- ${command.code} — ${command.meaning}`)
      .join("\n")
    if (!items) return ""
    return `## ${group.label}\n\n${items}`
  }).filter(Boolean)
  return ["# Agent commands", "", ...sections].join("\n\n")
}

export function matchesCommand(command: AgentCommand, query: string) {
  const q = query.trim().toLowerCase().replace(/^\//, "")
  if (!q) return true
  const hay = [command.code, command.meaning, command.when, command.avoid, command.example, command.group, groupName(command.group)]
    .join(" ")
    .toLowerCase()
  return hay.includes(q)
}

export function rankCommand(command: AgentCommand, query: string) {
  const q = query.trim().toLowerCase().replace(/^\//, "")
  if (!q) return command.code
  const code = command.code.toLowerCase().replace(/^\//, "")
  if (code === q) return `0${code}`
  if (code.startsWith(q)) return `1${code}`
  if (code.includes(q)) return `2${code}`
  return `3${code}`
}

export const PRESETS: { id: string; label: string; ids: string[] }[] = [
  { id: "fix", label: "Fix a bug", ids: ["debug", "repro", "fix", "tests", "verify"] },
  { id: "ship", label: "Ship", ids: ["scope", "implement", "preview", "done", "changelog"] },
  { id: "review", label: "Review", ids: ["diff", "review", "security"] },
  { id: "plan", label: "Plan only", ids: ["scope", "plan", "ask"] },
  { id: "decide", label: "Decide", ids: ["alt3", "decide", "riskmap"] },
  { id: "teach", label: "Teach", ids: ["teachme", "quizme", "gaps"] },
  { id: "picture", label: "Direct a still", ids: ["still", "labels", "codes"] },
  { id: "browse", label: "Browse", ids: ["open", "extract", "no-login"] },
]

export const BRIEF_LIMIT = 6
