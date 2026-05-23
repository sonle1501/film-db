---
trigger: always_on
---

# START HERE

This file defines how the AI behaves in this workspace.

**MANDATORY:** You MUST read this file entirely and apply. This is the highest priority rule.

# Project context
Read the project context at `@.agent/reference/project-context.md`  after doing anything

# User's intent
Analyze the user's prompt. If it starts with a `/` (Slash Command), bypass intent recognition and immediately trigger the corresponding workflow in **Table 2**. If it is a natural language prompt, classify it using **Table 1** to determine where assets should be placed and what the output format must be.

## TABLE 1: Normal Prompt Classification (Semantic Intent Recognition)
*Use this table to classify natural language inputs

| Request Type                                   | Trigger Keywords (Include but not limited to)                                                                          | Action                              |
| :--------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- | :---------------------------------- |
| **Question / Explain** / **Plan / Breakdown**  | `how`, `why`, `explain`, `what is`, `help me understand` , `plan`, `break down`, `steps to`, `how to approach` ...     | answer (no code or modify)          |
| **Code / Implementation** / **Refactor / Fix** | `create`, `write`, `build`, `implement`, `add feature` , `fix`, `bug`, `error`, `refactor`, `clean up`, `optimize` ... | implementation / coding             |
## TABLE 2: Slash Commands (Explicit Workflow Triggers)
*If the user prompt begins with a Slash Command, bypass Table 1. Assume strict intent and execute the exact workflow defined below.*

| Slash Command | Workflow Triggered             | Goal                                    |
| :------------ | :----------------------------- | :-------------------------------------- |
| `/plan`       | `@.agent/workflows/plan.md`    | Planning, brainstorming and disscusion. |
| `/code`       | `@.agent/workflows/code.md`    | Executation and implementation          |
| `/analyze`    | `@.agent/workflows/analyze.md` | Analyzation and revision.               |

### Execution Rules for Table 2:
1. **Strict Adherence:** When a slash command is used, do not deviate from the workflow. 

## Fallback Directive
If a prompt is highly ambiguous and cannot be confidently mapped to Table 1 or Table 2, **fail gracefully**. Ask the user to clarify by providing an explicit slash command from Table 2.

# Reference folder
There is a reference folder at `@reference`, contains all things and knowledge that you need to reference
+ `@.agent/reference/project-context.md` : the project's context
+ `@.agent/reference/backend-summary` : summary the backend
+ `@.agent/reference/codebase-structure` : overview of the project structure
+ `@.agent/reference/backend-apis` : APIs provided by backend

# Skills
There are skills about frontend, tailwind and web design in the `@.agent/skills/` folder. You can use these if need

# Language
When user's prompt is NOT in English:

1. **Internally translate** for better comprehension
2. **Respond in user's language** - match their communication
3. **Code comments/variables** remain in English

# File Dependency Awareness
If you need to see the overview of project structure, see the `@.agent/reference/codebase-structure`

## System Map Read

Read `ARCHITECTURE.md` to understand the structure of `@.agent/` root folder

**Path Awareness:**

- `@.agent` : root agent folder
- `@.agent/rules` : main rule
- `@.agent/skills : skill you need
- `@.agent/workflows : workflow trigger
- `@.agent/reference : reference knowledge
- `@.agent/output : generated output