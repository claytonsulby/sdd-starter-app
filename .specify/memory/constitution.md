<!--
Sync Impact Report
- Version change: N/A → 1.0.0
- Modified principles: None — new adoption
- Added sections: Core Principles (fully populated), Execution Guardrails
- Removed sections: None
- Templates requiring updates:
- Templates requiring updates:
  ✅ .specify/templates/plan-template.md
  ✅ .specify/templates/spec-template.md
  ✅ .specify/templates/tasks-template.md
- Follow-up TODOs: None
-->
# SDD Starter App Constitution

## Core Principles

### Principle 1 — Write Clean Code
All contributions MUST leave the codebase readable, covered by appropriate tests, and free of debt that the team cannot immediately address. When cleanliness and delivery are in tension, refactor first so the change stays maintainable.

### Principle 2 — The Simpler The Better
Deliver the smallest, clearest solution that satisfies the specification. Avoid speculative abstractions, unnecessary layers, or cleverness that hides intent.

### Principle 3 — Do Exactly As Instructed
Follow approved specs, prompts, and review feedback precisely. Raise questions before deviating; unapproved shortcuts or embellishments are not allowed.

### Principle 4 — Prevent Scope Creep
Freeze scope once the spec and plan are approved. Any new requirement MUST be documented, prioritized, and ratified before implementation work begins.

## Execution Guardrails

- Specs capture every user story before coding starts, and new ideas return to spec review before work proceeds.
- Plans and tasks reference the approved scope so each deliverable maps cleanly to a single user story.
- Code reviews and CI checks verify cleanliness and simplicity before merge.

## Governance

- **Amendments**: Product owner and technical lead MUST approve changes. Record each amendment with rationale in the repo history.
- **Versioning**: Apply semantic versioning to this constitution (MAJOR for breaking principle changes, MINOR for new or expanded rules, PATCH for clarifications).
- **Compliance Reviews**: Before starting any feature and before release, confirm teams still meet all principles and guardrails; document outcomes in the relevant plan.

**Version**: 1.0.0 | **Ratified**: 2025-10-16 | **Last Amended**: 2025-10-16