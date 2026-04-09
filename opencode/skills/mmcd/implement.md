1. Check the process and git history to understand the situation of this project.
2. Identify the gap between current state and the goal.
    - if the goal is already reached, respond with GOAL REACHED.
3. Pick one specific, self-contained, and testable feature to implement.
    - if there are significant flaws in the design such that the goal is unreachable, respond with CONCERNED.
    - do NOT attempt to reach the goal in one go. Do a focused work and complete it with high standard.
4. Write down a subsection in MMCD.md progress, ending with `status: unfinished`.
5. Start implementation and verification.
    - rigorously verify the implementation, including documents and tests.
6. If the implementation is succesful: Modify MMCD.md to mark it `status: finished`, make a commit, and respond with DONE
7. If you encountered significant issue and given up: revert changes with git and respond CONCERNED.
8. If the scope is larger than expected and you cannot finish it in one shot, but the current unfinished state is self-contained and testable, you should still mark it as `status: unfinished`, but make it clear what you have done and what is the current state, and report PARTIAL.

Give a short summary about the current state, gap to the goal, what you have done, and issues encountered in your response, after the DONE / PARTIAL / CONCERNED / GOAL REACHED keyword.