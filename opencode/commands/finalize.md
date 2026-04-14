---
description: Document session findings
agent: build
---

Finalize this session.

1. If AGENTS.md exists, carefully review this session and update it accordingly:
    - Each time when the user asks you to do something, it may implies a specification. For example, if the user asked you to implement an authentication system, then "having an authentication system" is a requirement of this project and should not regress in the future. You should document all these requirements at appropriate places in AGENTS.md, or creates a "Requirements" section if needed.
    - Each time when the user makes a choice, it may implies a technical decision, and should not be silently changed in the future. For example, if you asked the user whether to implement email verification using regex or thrid party library, and the users chooses regex, then this is a design choice. You should document all these decisions at appropriate places in AGENTS.md, or creates a "Designs" section if needed.
        - However, do not be overly detailed. Focus on important choices that matter.
    - When you encountered difficulties during this session, and finally found a workarounds (either by yourself or guided by the user), and you think that you might need to do similar things in the future, document the situation and solutions to AGENTS.md, create a "Notes" section if needed.
    - Guidelines: prefer merge into existing document, avoid generic preambles or repeated info, focus on actual observations, and be concise.
    - Note: AGENTS.md describes the current state of this project. Don't write it like a changelog.
2. If the project is a git repo, make a commit.
    - If it is also in a git worktree, merge the worktree.
    - Do not push to remote unless asked.
3. If the project has a deploy instruction, use your best judgement whether you should redeploy it.
4. Respond the user with a very breif summary of what was done in this session, your modifications to AGENTS.md (if any), and the deployment (e.g., URL if any).