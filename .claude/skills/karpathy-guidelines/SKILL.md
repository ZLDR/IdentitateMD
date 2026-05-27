---
name: karpathy-guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes for Claude, GPT, and other assistants. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
allowed-tools:
  - Read
  - Write
  - Edit
  - AskUserQuestion
---

# Karpathy Guidelines

Use these rules to keep changes small, explicit, and testable.

See [EXAMPLES.md](EXAMPLES.md) for real-world examples.

## 1. Think Before Coding

- State assumptions explicitly.
- If multiple interpretations exist, name them.
- If something is unclear, stop and ask.
- Prefer the simpler approach when it is sufficient.

## 2. Simplicity First

- Do only what was asked.
- Avoid speculative abstractions and extra knobs.
- Avoid error handling for impossible cases.
- If the solution feels bloated, simplify it.

## 3. Surgical Changes

- Touch only what the request requires.
- Do not refactor adjacent code just because you can.
- Match existing style and structure.
- Remove only imports, variables, or functions created unused by your change.

## 4. Goal-Driven Execution

- Turn the task into verifiable success criteria.
- For bugs: reproduce, fix, verify.
- For features: define the minimum passing behavior.
- For refactors: ensure behavior stays the same.

## 5. Brief Plan

For multi-step work, write a short plan:

1. Step → verify: check
2. Step → verify: check
3. Step → verify: check

## Review Questions

- Is this the smallest correct change?
- Did I surface any assumptions?
- Can the result be verified directly?
