---
name: generate-plan
description: Generate an implementation plan document (.md) for features, bug fixes, improvements, or system changes. Saves to docs/ directory. Usage — /generate-plan <brief description of what to implement>
disable-model-invocation: true
user-invocable: true
argument-hint: <brief description of the task — e.g. "เพิ่มระบบ notification", "แก้บัค login timeout", "ปรับปรุง search performance">
---

# Generate Implementation Plan

Create an implementation plan for: **$ARGUMENTS**

Output directory: `docs/` (gitignored)

## Pre-flight

1. Read `!cat .claude/skills/_foundation/detection.md` — detect the project's tech stack
2. Read `!cat .claude/skills/_foundation/philosophy.md` — review shared conventions
3. Read `CLAUDE.md` for project-specific architecture and patterns
4. **Research phase** — before writing the plan, explore the codebase to understand:
   - Which files are relevant to the task
   - Current implementation of related features
   - Existing patterns and components that can be reused
   - Potential impact areas and dependencies

---

## Plan Document Structure

**Filename:** `docs/IMPLEMENT_<TOPIC>.md` — use UPPER_SNAKE_CASE for the topic (e.g., `IMPLEMENT_NOTIFICATION.md`, `IMPLEMENT_SEARCH_OPTIMIZATION.md`)

Generate the plan using this structure:

```markdown
# <Type>: <Title in Thai>

---

## Task

### Goal

<Describe what needs to be done in 2-3 sentences. Use Thai language.
Be specific about the end result. Use **bold** for key terms.
If there are multiple sub-goals, use a numbered list.>

### Scope

**ต้องทำ (In Scope)**

- [ ] **<Item 1 title>**: <Detailed description of what to implement — mention specific files, components, or modules involved>
- [ ] **<Item 2 title>**: <Detailed description>
- [ ] ...

**ไม่ต้องทำ (Out of Scope)**

- <Item that might seem related but should NOT be changed>
- <Item that is explicitly excluded to prevent scope creep>
- ...

---

## Context

### Tech Stack

- <List only the technologies relevant to this task>
- อ้างอิง Core Architecture เพิ่มเติมได้จากไฟล์ `CLAUDE.md`

### Related Code

- **`<file-path>`** — <Current state / what it does / why it's relevant>
- **`<file-path>`** — <Current state / what it does / why it's relevant>
- ...

### Constraints

- เขียนโค้ดให้อยู่ในรูปแบบเดียวกับโค้ดที่มีอยู่ (ตาม CLAUDE.md)
- Comment เป็นภาษาอังกฤษ เท่าที่จำเป็นเท่านั้น
- <Additional task-specific constraints — e.g., library restrictions, performance requirements>
- เมื่อ Implement เสร็จแล้ว **ไม่ต้องอธิบาย** และ **ไม่ต้องสรุป** อะไรทั้งนั้น

---

## Format

### Expected Behavior

#### 1. <Feature/Change name>

- <Describe the expected behavior from user's perspective>
- <Describe UI behavior, state changes, or system behavior>
- <Be specific about interactions, edge cases>

#### 2. <Feature/Change name> (if multiple)

- ...

### Implementation Order (แนะนำ)

1. **<Step 1>** → <Brief description of what to do>
2. **<Step 2>** → <Brief description of what to do>
3. ...

### Code Style & Conventions

- ใช้ Architecture Pattern เดียวกับระบบเดิม (ดู `CLAUDE.md`)
- Reuse คอมโพเนนต์และ Logic ที่มีอยู่ให้มากที่สุด
- <Additional style notes specific to this task — e.g., where to place new components/services>
- <Backend/Frontend scope note — e.g., "ไม่มีการแก้ไขฝั่ง Backend">
```

---

## Plan Type Headers

Use the appropriate header based on the type of task:

| Type | Header Format | Example |
|------|--------------|---------|
| New feature | `# Feature: <title>` | `# Feature: เพิ่มระบบ Notification` |
| Bug fix | `# Bug Fix: <title>` | `# Bug Fix: แก้ไข Login Timeout` |
| Improvement | `# Improvement: <title>` | `# Improvement: ปรับปรุง Search Performance` |
| Refactor | `# Refactor: <title>` | `# Refactor: ปรับโครงสร้าง Auth Module` |
| Security | `# Security: <title>` | `# Security: เพิ่ม Rate Limiting` |

---

## Generation Rules

1. **Always research first** — read related source files before writing the plan. Never guess file paths or current implementation details.
2. **Be specific in Related Code** — list actual file paths found in the codebase, describe their current state accurately.
3. **Scope is critical** — clearly separate In Scope vs Out of Scope to prevent scope creep. The Out of Scope section should list things that someone might reasonably think should be included but shouldn't be.
4. **In Scope items use checkboxes** — `- [ ]` format so they can be checked off during implementation.
5. **Implementation Order matters** — suggest a logical sequence that minimizes rework (e.g., create shared components before feature-specific ones, backend before frontend if both are needed).
6. **Expected Behavior is user-facing** — describe what the user sees and experiences, not implementation details.
7. **Constraints are guardrails** — include both project-wide conventions (from CLAUDE.md) and task-specific restrictions.
8. **Thai language for content** — plan titles, goals, scope items, and descriptions are in Thai. Technical terms (file names, component names, library names) stay in English.
9. **Output to `docs/`** — ensure the directory exists, create if not. Overwrite if the file already exists.
10. **One plan per file** — each task gets its own plan document.

## Running

```bash
# Generate a plan
/generate-plan เพิ่มระบบ notification real-time
/generate-plan แก้บัค session หมดอายุแล้วไม่ redirect
/generate-plan ปรับปรุง loading UX ของ data table
/generate-plan refactor auth middleware ให้รองรับ OAuth
```
