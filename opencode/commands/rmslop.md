---
description: Remove AI code slop from recent changes
---

<instructions>
Analyze the changes introduced in this branch compared to `master`:

`!git diff master...HEAD`

The agent MUST identify and remove all AI-generated slop. This includes:

- Extra comments that a human would not add or that are inconsistent with the rest of the file
- Extra defensive checks or try/catch blocks that are abnormal for that area of the codebase (especially if called by trusted/validated codepaths)
- Lazy workarounds (casts to `any`, spamming `Rc` and `RefCell`, etc.)
- Any other style that is inconsistent with the file
- Unnecessary emoji usage
</instructions>

<workflow>
1. Review the diff.
2. If unsure about whether something is slop, the agent SHOULD use the `question` tool (following the `<constraints>` above) to ask for clarification.
3. Apply fixes to the files.
4. The agent MUST report with a 1-3 sentence summary of what was changed.
</workflow>