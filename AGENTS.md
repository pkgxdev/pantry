# AGENTS: pantry

Public repository for package recipes and metadata.

## Core Commands

- `dev`
- `bk build <pkg>`
- `bk test <pkg>`
- `bk audit <pkg>`

## Always Do

- Keep package recipes reproducible and auditable.
- Validate changed package recipes with build, test, and audit.
- Keep recipe metadata and tests aligned.

## Ask First

- Bulk recipe rewrites.
- Workflow changes that affect packaging/release pipelines.

## Never Do

- Never merge changed package recipes without at least one successful test path.
- Never include internal-only environment details in public recipe docs.
