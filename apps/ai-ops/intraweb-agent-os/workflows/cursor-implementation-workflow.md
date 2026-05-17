# Cursor Implementation Workflow

## Purpose
Use Cursor only when the task is ready for repo execution.

## Required Before Cursor
- Approved task brief
- Clear files or areas to inspect
- Acceptance criteria
- Constraints
- Testing requirements

## Cursor Prompt Template

```txt
You are operating as [AGENT ROLE].

Use the project context in /ai-ops/context and the relevant agent definition in /ai-ops/agents.

Task:
[brief task]

Constraints:
- Inspect existing files before editing.
- Preserve current architecture.
- Do not introduce new dependencies unless justified.
- Keep changes minimal and targeted.
- Maintain accessibility and performance standards.
- Update documentation if behavior changes.

Acceptance criteria:
- [criteria]

Return:
1. Files inspected
2. Files changed
3. Summary of changes
4. Tests run
5. Risks or follow-ups
```

## After Cursor
Send the Cursor summary back to ChatGPT/Alex for review.

Then route to Documentation Lead if docs need updating.
