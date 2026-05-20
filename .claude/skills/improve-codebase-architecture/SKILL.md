---
name: improve-codebase-architecture
description: Surfaces architectural friction and deepening opportunities in a codebase. Use when the user wants to improve architecture, refactor shallow modules, consolidate tightly-coupled modules, or make the codebase more testable and AI-navigable.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - AskUserQuestion
---

# Improve Codebase Architecture

Use this skill to find **deepening opportunities**: places where a small interface can hide real behaviour, improve locality, and make tests more meaningful.

## Process

1. **Explore**
   - Read `CONTEXT.md` first if it exists.
   - Read relevant ADRs if they exist.
   - Inspect the codebase for shallow modules, pass-through logic, duplicated orchestration, and seams with poor locality.
   - Apply the deletion test: if deleting a module just moves complexity to callers, it is probably shallow.

2. **Report candidates**
   - Write a self-contained HTML report to the temp directory only.
   - Name it `architecture-review-<timestamp>.html`.
   - Use Tailwind via CDN for layout and Mermaid via CDN for diagrams when the structure is graph-shaped.
   - For each candidate include:
     - Files
     - Problem
     - Solution
     - Benefits
     - Before / After diagram
     - Recommendation strength: `Strong`, `Worth exploring`, or `Speculative`

3. **Conclude**
   - End with a top recommendation.
   - Do not propose interfaces yet.
   - Ask: `Which of these would you like to explore?`

## What to look for

- Modules whose interface is almost as complex as their implementation.
- Logic split into many tiny functions with poor locality.
- Pure functions extracted for testability while real bugs live in call sites.
- Tight coupling across seams.
- Untested or hard-to-test code paths.

## Language

Use the project domain language where available.
Use architecture terms precisely: module, interface, implementation, depth, seam, adapter, leverage, locality.
