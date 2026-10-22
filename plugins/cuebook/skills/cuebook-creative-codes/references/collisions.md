# Cross-catalog token collisions

The two Cuebook books have separate meanings. Always use the intended namespace; a shared token does not merge definitions. This file supplies cross-references only.

Source: [GrokApp](https://github.com/sorensadrgit-art/GrokApp) at source revision `632f3d1ca78627ca4987c65da211c395e91ff9de`. Exact source file hashes are recorded in [catalog.json](catalog.json).

| Token | This book ID | This meaning | Other book / ID | Other meaning |
| --- | --- | --- | --- | --- |
| /trace | x093 | Walks the execution path and names where state goes wrong. | agent / trace | Walk the execution path and name where state goes wrong. |
| /explaincode | x100 | Explains what the code is doing in plain language. | agent / explaincode | Explain what the code is doing, in plain language. |
| /diff | x106 | Explains what a change does and why it matters. | agent / diff | Explain what a change does and why it matters. |
| /api | x099 | Designs a small, consistent interface for the task. | agent / api | Design a small, consistent interface for the task. |
| /types | x097 | Adds or tightens types without changing behavior. | agent / types | Add or tighten types without changing behavior. |
| /naming | x098 | Proposes clearer names for unclear symbols. | agent / naming | Propose clearer names for unclear symbols. |
| /refactor | x095 | Restructures the code without changing behavior. | agent / refactor | Restructure the code without changing behavior. |
| /simplifycode | x096 | Reduces branching and indirection while keeping behavior. | agent / simplifycode | Reduce branching and indirection while keeping behavior. |
| /debug | x090 | Finds likely bugs or errors in the code. | agent / debug | Find the likely bug. Name the cause, then fix the cause. |
| /repro | x091 | Turns a bug report into the smallest steps that reproduce it. | agent / repro | Turn a bug report into the smallest steps that reproduce it. |
| /edgecases | x092 | Lists the inputs most likely to break this code. | agent / edgecases | List the inputs most likely to break this. |
| /tests | x103 | Writes tests for the important paths and edge cases. | agent / tests | Write tests for the important paths and the edge cases. |
| /review | x101 | Reviews the code for bugs, risks, and concrete fixes. | agent / review | Review the code for bugs, risks, and concrete fixes. |
| /security | x102 | Reviews for injection, auth gaps, and data exposure. | agent / security | Review for injection, auth gaps, and data exposure. |
| /optimize | x094 | Improves the code for speed, efficiency, or cleanliness. | agent / optimize | Improve the hot path. Leave the rest alone. |
| /docs | x104 | Adds concise documentation for the public surface. | agent / docs | Add concise documentation for the public surface. |
| /factcheck | x050 | Checks factual claims and flags what could not be verified. | agent / factcheck | Check factual claims and flag what could not be verified. |
| /systemmap | x071 | Maps actors, forces, and relationships in a system. | agent / systemmap | Map the actors, forces, and relationships. |
| /reverseengineer | x068 | Works backward to infer how something functions. | agent / reverseengineer | Work backward from the result to how it is produced. |
| /rewrite | x002 | Rephrases while keeping the core meaning. | agent / rewrite | Rephrase the text I give you. Keep the meaning. |
| /shorten | x008 | Condenses into a tighter version. | agent / shorten | Condense it. Same facts. |
| /simplify | x010 | Makes text easier to understand with plainer language. | agent / simplify | Make it easier to understand, in plainer language. |
| /human | x001 | Rewrites text so it sounds natural, not robotic. | agent / human | Rewrite so it sounds natural, not like a template. |
| /formal | x004 | Changes the tone to professional. | agent / formal | Change the tone to professional. |
| /bullets | x016 | Turns the output into bullet points. | agent / bullets | Turn the output into bullet points. |
| /tldr | x015 | Gives the shortest useful summary. | agent / tldr | Give the shortest useful summary. |
| /checklist | s440 | Create a checklist of actions or parts. | agent / checklist | Turn this into a checklist. One action per line. |
| /critique | x075 | Reviews the work and points out what needs improvement. | agent / critique | Review the work and point out what needs improvement. |
| /hero | s352 | Create a clean hero image with the subject as the focal point. | agent / hero | A clean hero image with the subject as the focal point. |
| /ugc | x107 | A short user-style video of the product, as if someone is showing it to a friend. | agent / ugc | A user-style photo or clip, as if someone is showing it to a friend. |
| /teachme | x039 | Frames the response as a lesson. | agent / teachme | Teach it as a lesson: the idea, a concrete case, the usual mistake. |
| /quizme | x033 | Quizzes one question at a time and waits for an answer. | agent / quizme | Ask one question. Wait for the answer. Then mark it. |
| /socratic | x036 | Teaches by asking guided questions. | agent / socratic | Teach by asking guided questions. |
| /stepbystep | x042 | Forces a sequential, ordered explanation. | agent / stepbystep | Force a sequential, ordered explanation. |
| /misconceptions | x038 | Lists common misunderstandings about a topic. | agent / misconceptions | List the common misunderstandings about this topic. |
| /feynman | x037 | Explains as simply as possible to test true understanding. | agent / feynman | Explain it as simply as possible, to test whether it is actually understood. |
| /alt3 | x078 | Provides three different alternatives. | agent / alt3 | Three different alternatives. For each, the upside, the cost, and when it is the wrong pick. |
| /compare | x044 | Compares two or more options side by side. | agent / compare | Compare two or more options side by side. |
| /decide | x048 | Builds a structured decision framework. | agent / decide | Make the call. Say why, and what would change it. |
| /riskmap | x046 | Identifies the key risks in a plan. | agent / riskmap | Identify the risks that can actually happen, each with a mitigation you can do now. |
| /assumptions | x045 | Identifies hidden assumptions in a claim. | agent / assumptions | Identify the hidden assumptions in the claim or the plan. |
| /nextstep | x052 | Chooses one useful next action and how to start it. | agent / nextstep | Choose one useful next action, and how to start it. |
| /counter | x056 | Generates the strongest counterargument. | agent / counter | Generate the strongest counterargument. |
| /redteam | x060 | Critiques aggressively to expose weaknesses. | agent / redteam | Critique aggressively to expose weaknesses. |
| /pareto | x049 | Finds the small actions that drive most of the result. | agent / pareto | Find the small set of actions that drive most of the result. |
