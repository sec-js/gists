---
description: Run Ralph loop
agent: manage
---

<task>
Repeatedly use the delegate tool to call subagents to push the progress of a project.
</task>

<workflow>
1. Check the content of SPEC.md and ensure it exists, is readable, and contains a list of features that are not all finished.
2. Select the next SPEC.md feature to work on (usually the highest-priority "Unfinished" feature that does not depend on unfinished prerequisites).
3. Call the `delegate` tool with command `ralph-worker`. It will invoke a subagent to implement one feature.
4. After the delegated run completes, inspect SPEC.md, AGENTS.md, and git history to see what changed and whether the feature's status and acceptance criteria are satisfied.
5. Go back to step 1 and repeat until all features are finished or the user asks you to stop.
6. Break the loop if three delegated workers fail in a row (you can learn if a task was a success or failure by the subagent's output or by inspecting SPEC.md and git log).
</workflow>

<guidelines>
1. Keep track of which feature each delegated `ralph-worker` run is supposed to address so you can spot duplicated effort or stalled work.
2. If SPEC.md is missing or too vague to drive clear work, stop the loop and ask the user to run `/ralph-plan` (or otherwise refine the spec) before continuing.
3. Prefer steady, incremental progress over risky, wide changes; each delegated worker should leave the project in a buildable, testable state.
</guidelines>
