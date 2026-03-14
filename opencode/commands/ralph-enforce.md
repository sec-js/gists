---
description: Run Ralph loop
agent: manage
---

<task>
Repeatedly use the `delegate` tool to call `ralph-worker` to push the progress of a project.
</task>

<workflow>
1. Check the content of SPEC.md and ensure it exists, is readable, and contains a list of features that are not all finished.
2. Call the `delegate` tool with command `ralph-worker`. It will invoke a subagent to pick and implement one feature.
3. After the delegated run completes, inspect SPEC.md, AGENTS.md, and git history to see what changed and whether the feature's status and acceptance criteria are satisfied.
4. Go back to step 1 and repeat until all features are finished. Break the loop if three delegated workers fail in a row (you can learn if a task was a success or failure by the subagent's output or by inspecting SPEC.md and git log).
</workflow>

<guidelines>
1. Keep track of what feature each subagent done.
2. If SPEC.md is missing or too vague to drive clear work, stop the loop and ask the user to run `/ralph-plan` (or otherwise refine the spec) before continuing.
3. Run `ralph-worker` sequentially, i.e., start a new subagent when previous call finished and verified.
</guidelines>
