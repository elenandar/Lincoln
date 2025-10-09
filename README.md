# Lincoln scripts

Internal notes for maintaining the Lincoln v16.0.8-compat6d script suite.

## Turn accounting invariants

- Normal player input and the UI **Continue** button each increment the turn counter (`+1`).
- Slash commands (e.g. `/recap`, `/epoch`, `/continue`), retries, and the service `/continue` command leave the turn counter unchanged (`+0`).
- The `/continue` slash command is the draft acceptance hook and must not be confused with the UI **Continue** button.

## Context overlay fallback

- If the composed context overlay is empty or invalid, the upstream context text is used as a fallback.
