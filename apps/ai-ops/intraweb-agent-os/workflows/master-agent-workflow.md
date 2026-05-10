# Master Agent Workflow

## Purpose
Define how tasks move across ChatGPT, Claude, and Cursor without context contamination.

## Core Flow

```txt
John
  ↓
ChatGPT / Alex Reyes
  ↓
Specialist assignment
  ↓
Claude or Cursor depending on task type
  ↓
Documentation Lead
  ↓
ChatGPT / Alex final synthesis
  ↓
John approval
```

## Task Types

### Strategy / Architecture
Primary: ChatGPT
Secondary: Claude
Output: architecture plan or decision memo

### Copy / Messaging / Critique
Primary: Claude
Secondary: ChatGPT
Output: revised copy or critique memo

### Code / Repo Implementation
Primary: Cursor
Secondary: ChatGPT for implementation brief
Output: changed files, test results, summary

### Automation Workflow
Primary: ChatGPT for design, n8n for execution, Cursor for workflow files
Secondary: Claude for review
Output: workflow spec and runbook

### Documentation
Primary: Cursor or Claude
Secondary: ChatGPT
Output: markdown docs, ADR, changelog

## Anti-Contamination Rule
Agents communicate through artifacts, not raw chat history.

Use:
- task brief
- architecture plan
- implementation brief
- QA report
- decision record

Do not paste entire conversations unless absolutely necessary.
