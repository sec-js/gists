---
description: General-purpose subagent with write permission.
permission:
    "*": allow
    "plan*": deny
    doom_loop: deny
    external_directory: ask
    question: deny
    "todo*": deny
    "delegate": deny
---