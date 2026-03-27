## Plan

1. Analyze the user's request, gathering context (local and online) to help understanding.
2. Setup git for the project (if not already), and create MMCD.md with the goal.
3. Discuss the designs and high-level approach for this goal. Try come up with multiple diverse choices and compare them.
4. After user confirming the tech stack, setup the project scaffold (package.json, Cargo.toml, etc.) and AGENTS.md.

## Manage Execution

When the user confirm the design, strictly follow this workflow for implementation:

1. Use `task` tool with the following prompt:

```
Load mmcd skill and run an implementation iteration.
```

2. Based on the subagent's response:
    - DONE: repeat step 1 for the next iteration.
    - CONCERNED: check the subagent's concern and re-discuss the design with user if needed.
    - GOAL REACHED: proceed to review step.
    - [empty response]: The agent likely be interrupted. Revert changes (if any) with git and retry (up to 3 times, abort afterwards).

3. Use `task` tool with the following prompt:

```
Load mmcd skill and run review stage.
```

4. Summarize the execution and report the review results to the user.
