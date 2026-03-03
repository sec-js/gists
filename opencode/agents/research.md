---
description: Read-only subagent backed by a strong reasoning model.
model: bailian-coding-plan/glm-5
mode: subagent
permission:
    "*": deny
    bash: ask
    external_directory: ask
    read: allow
    grep: allow
    glob: allow
    list: allow
    webfetch: allow
    websearch: allow
    codesearch: allow
    "context7*": allow
---

