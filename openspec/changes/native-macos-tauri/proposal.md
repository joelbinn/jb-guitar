# Proposal: Native macOS App via Tauri

## Context & Problem

`jb-guitar` currently runs as a web application using `localStorage` for data
persistence. This limits the app's robustness, makes backups difficult, and
prevents deeper system integration (like global shortcuts or high-precision
metronomes). The goal is to make it a first-class macOS citizen with local file
storage.

## Proposed Change

We will introduce **Tauri (v2)** to the project. This allows us to keep the
existing Angular frontend while using Rust for a lightweight backend.

### Key Changes

1. **Frontend Integration**: Add `src-tauri` to `jb-guitar-frontend`.
2. **Rust Backend**:
    - Implement "Commands" in Rust for file I/O.
    - Define data structures in Rust (Serde) matching Angular models.
3. **Storage Migration**:
    - Switch from `localStorage` to local JSON files in `~/.jb-guitar/`.
    - Maintain current data models (`Exercise`, `PracticePlan`, `Session`).
4. **Developer Experience**:
    - Add `npm run tauri:dev` and `npm run tauri:build` scripts.

## Success Criteria

- [ ] Application launches as a `.app` on macOS.
- [ ] All exercises, plans, and sessions are saved to `~/.jb-guitar/`.
- [ ] No data is lost from the existing UI/UX during migration.
- [ ] Build artifact is small (< 50MB).

## Risks & Constraints

- **Data Migration**: First-time users need a way to import existing backups.
- **Environment**: Requires Rust and Xcode command line tools on the build
  machine.
- **No UI Changes**: The current Tailwind-based design must be preserved.
