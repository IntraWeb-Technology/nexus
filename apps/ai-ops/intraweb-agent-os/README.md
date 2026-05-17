# IntraWeb Agent OS

This folder defines the AI operating structure for IntraWeb Technologies.

## Tool Responsibilities

- ChatGPT: Executive orchestration, strategy, task routing, operating model, final review.
- Claude: deep critique, copy, messaging, long-form reasoning, policy/compliance review.
- Cursor: implementation, code changes, repo edits, tests, documentation updates.

## Core Rule

Do not use every AI for the same task.

ChatGPT decides and coordinates.
Claude refines and critiques.
Cursor implements and validates.

## Recommended Workflow

1. John gives a task to ChatGPT/Alex Reyes.
2. Alex classifies and routes the task.
3. Claude is used when long-form reasoning, critique, copy, or documentation needs deeper treatment.
4. Cursor is used only when files need to be changed.
5. Documentation Lead records the decision, implementation notes, and follow-up tasks.

## Folder Map

```txt
/ai-ops
  /agents       Role definitions
  /context      Shared company and project context
  /workflows    Repeatable operating workflows
  /tasks        Task templates and active task structure
  /decisions    Architecture decision records
  /architecture System architecture notes
  /standards    Engineering, writing, and compliance standards
  /handoffs     Cross-agent handoff templates
```
