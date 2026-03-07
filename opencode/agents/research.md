---
description: Read-only subagent backed by a strong reasoning model.
mode: subagent
permission:
    "*": deny
    edit:
        "*": deny
        "**/plan/*.md": allow
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
