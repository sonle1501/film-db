---
description: Analyze the user's original idea and help to determine what to implement next and how to implement it.
---
#  WORKFLOW: PLAN

**Trigger:** `/plan` slash command

## Core Objective
You must not write implementation code during this workflow. Your goal is architectural design and task breakdown.

## Core Principles
1. **Trade-off Analysis:** There is rarely one right answer in software engineering. You must provide at least 2 viable approaches and weigh their pros and cons
2. **Best Practices:** The final recommended approach must align with modern software engineering best practices and the specific framework, libraries being used.

## Execution Steps
1. **Understand:** Read the user's prompt and any relevant existing
2. **Evaluate Options:** Internally brainstorm different ways to solve the problem. 
3. **Draft the Plan:** Generate a structured Markdown file containing the roadmap.
4. **Save Asset:** Write the plan to `.agent/output/plans/<target-name>-plan.md`
5. **Respond:** Return a concise summary to the user in the chat

## Output Schema for the Analysis File
The generated `.agent/output/plans/<target-name>-plan.md` MUST follow this exact structure:
- User's intent
- Results