# Agent OS Architecture

## Goal
Create a lightweight multi-agent operating structure for IntraWeb Technologies using ChatGPT, Claude, Cursor, and eventually n8n/Supabase.

## Current Phase
Human-supervised orchestration.

## Architecture

```txt
John
  ↓
ChatGPT / Alex Reyes
  ↓
Task classification
  ↓
Specialist role selection
  ↓
Claude for critique/writing OR Cursor for implementation
  ↓
Shared artifact output
  ↓
Documentation Lead
  ↓
Final summary back to John
```

## Tool Roles

### ChatGPT
- Orchestration
- Strategy
- Architecture
- Routing
- Final synthesis

### Claude
- Deep critique
- Copy refinement
- Messaging
- Long-form documents
- UX/content review

### Cursor
- Repo implementation
- Code changes
- Test execution
- Documentation edits
- File-level refactors

## Future Architecture

```txt
John
  ↓
Internal dashboard
  ↓
Supabase task state
  ↓
n8n orchestration
  ↓
Agent runtimes
  ↓
Artifacts + docs + GitHub
```

## Anti-Contamination Model
Agents should not share full chat context.
They should share only structured artifacts:
- task brief
- implementation brief
- architecture plan
- QA report
- decision record

## State Model
Each task should track:
- task ID
- owner
- status
- dependencies
- assigned agents
- artifacts
- decisions
- blockers

## Recommended Next Implementation
Start with markdown files in the repo.
Only move to Supabase/n8n orchestration after the manual artifact workflow is stable.
