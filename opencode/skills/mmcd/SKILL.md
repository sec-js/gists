---
name: mmcd
description: Minimum Multi-Context Development. Follow this skill to develop substantial projects that require multiple context windows. MUST use this skill if user mentions "mmcd".
---

## Minimum Multi-Context Development

This skill provides workflow and guidelines for developing large projects that spans multiple context windows. The key idea is to use files as persistent context and repeatedly use `task` tool to iteratively develop the projects with fresh context windows.

## Important Files

### `AGENTS.md`: Live document that describes the **current** state of this project.

It should be concise and up-to-date, and should contain these information:
- A short, simple paragraph describing this project.
- The file structure and high-level system architecture.
- Commands for building, running, testing, deploying this project, if relavent.

### `MMCD.md`: Key tracking file for development.

This file should be structured with exactly these sections:
- **Goal**: Raw copy of user's request. Should never be modified without explicit agreement from the user.
- **Design**: Key designs made in the planing stage. Can contain subsections for complex projects. It should clarify details and document key decisions made during implementation. It can be modified when needed, but only after careful and thorough analysis.
- **Progress**: Implementation history. Each subsection is titled with the target of this iteration, and contains the date, detailed target, execution plan, verification methods and verification results, and a short execution summary. Each subsection block MUST ends with a status line indicating if it is completed.

## Main Workflow

A development is split into three phases: plan, implement, and review.

- **Plan**: Discuss designs with the user, and initialize AGENTS.md and MMCD.md.
- **Implement**: Each iteration implement one specific, non-trivial feature.
- **Review**: Check if the goal is reached, the design is followed, the code is well tested, and the documents are up to date.

## Further Instructions

Find and follow your further instructions by identifing the current stage.

- If there is no `MMCD.md` available or it is clearly stale, you are likely in the plan stage. The user should also have given a goal to you. Read and follows `<skill_base>/plan.md`.
- If there is a `MMCD.md` with unreached goal, you are likely in the implement stage. The user should also have directly instructed you to "implement an iteration". Read and follows `<skill_base>/implement.md`.
- If there is a `MMCD.md` with completed goal, you are likely in the review stage. The user should also have directly instructed you to "review" or "finalize". Read and follows `<skill_base>/review.md`.

[End of MMCD Skill]