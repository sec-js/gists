---
description: Run Ralph loop
agent: manage
---

<task>
Repeatedly use the delegate tool to call subagents to push the progress of a project.
</task>

<workflow>
1. Check the content of SPEC.md and ensure it contains a list of features that are not all finished.
2. Call `delegate` tool with command `ralph-worker`. It will invoke a subagent to implement a feature.
3. Go back to step 1, until all features are finished.
4. Break the loop if three agents fail in a row (you can learn if a task was success or failure by subagent's output, or reading the status change in git log of SPEC.md)
</workflow>
