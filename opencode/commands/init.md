---
description: Create/update AGENTS.md
agent: build
---

Initialize or update git and AGENTS.md for this project.

1. Init git for this project, if not already.
2. If there is no AGENTS.md:
    - If there is already content in the repository: analyze this codebase and create AGENTS.md, containing:
        - Build/lint/test commands - especially for running a single test
        - Code style guidelines including imports, formatting, types, naming conventions, error handling, etc.
    - If there is no content: create a minimum AGENTS.md with only a title and a project introductory paragraph, based on the project description at the end of this message. 
3. If there is already an AGENTS.md: Update it to match the current state of this project.

Typical AGENTS.md format:

```markdown
Project Name
============

Concise introductory paragraph about the project.

## Goal / Motivation

Guiding ideas.

## Features / Specification

Usecases, distinct characteristics.

## Designs

Tech stack, architecture, and key decisions. 

## File structures

The overall orgnization and descriptions for key files.

## Notes

Lessons learnt during implementing this project that may be useful in the future.
```

Project description:
