---
description: Run one iteration of Ralph loop
agent: general
---

<task>
Implement a feature for this project.
</task>

<workflow>
1. Check git history and SPEC.md to see what has been done.
2. Run the project to ensure it is in a working state.
3. Pick a feature to implement. Do not attempt to do more than one thing.
4. Verify that your implementation actually completes that feature.
5. Update SPEC.md to change the status of the feature to "finished". Important: you can only do this when you actually, clearly, univocally meet the feature's acceptance standard.
6. Update AGENTS.md to document the latest file structure, running and testing procedure, and key decisions if any.
7. Make a git commit, including a list of changes made by you.
</workflow>

<guidelines>
1. AGENTS.md is a live document of the current state of this project. It should be short, containing useful informations.
    - DO include: up-to-date file structure, key decisions after trial-and-error, commands for running and testing.
    - MUST NOT include: trivial facts, random decisions that alternatives has not been attempted, progress update, changelog.
2. You can only change the status line in SPEC.md, and can only do it when you undoubtedly verified that feature. MUST NOT change a feature to "finished" if your verification failed for any reason, even if you implemented the feature.
</guidelines>