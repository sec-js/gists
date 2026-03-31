1. Setup the project scaffold (package.json, Cargo.toml, etc.) and AGENTS.md, if they are not already present.
2. Use `task` tool with exactly the following prompt, without adding any more instructions or guidelines:
```
Load mmcd skill and run an implementation iteration.
```
3. Based on the subagent's response:
    - DONE: repeat step 1 for the next iteration.
    - CONCERNED: check the subagent's concern and re-discuss the design with user if needed.
    - GOAL REACHED: proceed to review step.
    - [empty response]: The agent likely be interrupted. Revert changes (if any) with git and retry (up to 3 times, abort afterwards).
> Note: you don't verify the claims of the subagents, just follow this workflow based on the subagent's responses.
4. Use `task` tool with exactly the following prompt, without adding any more instructions or guidelines:
```
Load mmcd skill and run review stage.
```
5. Summarize the execution and report the review results to the user.
