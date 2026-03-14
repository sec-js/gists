---
description: Run one iteration of Ralph loop
agent: general
---

<task>
Implement exactly one SPEC.md feature for this project from start to finish.
</task>

<workflow>
1. Read SPEC.md and git history to understand what has already been implemented.
2. Run the project (and any existing tests) to ensure it starts from a working state.
3. Choose a single feature whose status is "Unfinished" and that you can complete in this iteration. Do not attempt to do more than one thing.
4. Implement the feature, keeping the project buildable and tests passing at all times.
5. Verify that your implementation actually satisfies that feature's acceptance criteria (from SPEC.md). Run the appropriate commands, tests, or manual checks and describe what you did.
6. Update SPEC.md to change the status of the feature to "Finished" only when you clearly and unambiguously meet the acceptance standard.
7. Update AGENTS.md to document the latest file structure, running and testing procedure, and any non-obvious decisions or workarounds.
8. Make a git commit that includes only your changes for this feature, with a clear message summarizing the "why".
</workflow>

<guidelines>
1. AGENTS.md is a live document of the current state of this project. It should be short, containing useful informations.
    - DO include: up-to-date file structure, key decisions after trial-and-error, commands for running and testing.
    - MUST NOT include: trivial facts, random decisions that alternatives has not been attempted, progress update, changelog.
2. You can only change the status line in SPEC.md, and can only do it when you undoubtedly verified that feature. MUST NOT change a feature to "finished" if your verification failed for any reason, even if you implemented the feature.
3. If you discover gaps or contradictions in SPEC.md, pause implementation and propose concrete clarifications or amendments before proceeding.
4. Keep your edits tightly scoped to the chosen feature; avoid drive-by refactors unless they are strictly required to complete the acceptance criteria.
</guidelines>
