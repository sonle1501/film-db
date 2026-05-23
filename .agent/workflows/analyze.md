---
description: Analyze the user's original idea and determine what to implement next and how to implement it.
---
# WORKFLOW: ANALYZE
**Trigger:** `/analyze`

## Core Objective
Analyze things base on user idea. Explain how it currently works, rate its quality based on engineering metrics, and generate a comprehensive audit report.

## Core Principles
1. **Objective Evaluation:** Rate things based on tangible metrics 
2. Feedback:** Pointing and showing places

## Execution Steps
1. **Scan Target:** Use file-reading tools to ingest the code or read the user's proposed idea.
2. **Deep Analysis:** Break down the logic. Identify anti-patterns
3. **Rate & Report:** Generate an audit report containing explanations, ratings, and actionable fixes.
4. **Save Asset:** Write the report to `.agent/output/reports/<target-name>-report.md`
5. **Respond:** Provide a 2-sentence summary in the chat and link to the generated report.

## Output Schema for the Analysis File
The generated `.agent/output/reports/<target-name>-report.md` MUST follow this exact structure:
- User's intent
- Results