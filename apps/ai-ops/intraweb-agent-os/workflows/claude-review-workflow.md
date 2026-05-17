# Claude Review Workflow

## Purpose
Use Claude for deep critique, copy refinement, long-form reasoning, and second-pass judgment.

## Best Uses
- Messaging refinement
- Copy critique
- Strategy pressure testing
- UX critique
- Documentation rewrite
- Compliance review
- Long-form synthesis

## Claude Prompt Template

```txt
You are operating as [ROLE] for IntraWeb Technologies.

Read the context below and perform a deep review.

Company positioning:
IntraWeb Technologies is an operational infrastructure firm, not a web agency, freelance dev shop, generic AI consultancy, or automation vendor.

Task:
[task]

Material to review:
[paste only the relevant artifact, not the entire conversation]

Return:
1. Diagnosis
2. Strongest points
3. Weakest points
4. Specific fixes
5. Revised version if applicable
6. Implementation notes for Cursor if applicable

Avoid generic AI hype, consultant language, and agency-style language.
```

## After Claude
Send Claude's output to ChatGPT/Alex for synthesis and implementation briefing.
