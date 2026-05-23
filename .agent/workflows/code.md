---
description: Coding and implement
---
#  WORKFLOW: CODE

**Trigger:** `/code` slash command

## Core Objective
Execute the code implementation base on the user's request and generate a Walkthrough report  to explain the modifications

## Execution Steps

1. **Understand:** Read the user's prompt and any relevant existing
2. **Thinking and approach** the problem, prepare anything you need for the task
3. **Coding:** Implement follow best practices
4. **Generating** Write the report to `@.agent/output/implementations/<target-name>-implementation.md`
5. **Respond:** the result

## Output Schema for the Analysis File
The generated `@.agent/output/implementations/<target-name>-implementation.md` MUST follow this exact structure:
- User's intent
- Results