## Context

The `jb-guitar` application is an Angular-based web application. Currently, all
data is stored in the browser's `localStorage`. This project aims to convert it
into a native macOS application using Tauri (v2) and Rust for local file system
access.

## Goals / Non-Goals

**Goals:**

- **Native macOS Experience:** Run as a standalone `.app` with a native window.
- **Local File Storage:** Store data in `~/.jb-guitar/*.json`.
- **Minimal Footprint:** Utilize Tauri's lightweight architecture (WebKit +
  Rust).
- **Existing Design:** Preserve the current Angular/Tailwind UI.

**Non-Goals:**

- **Mobile Support:** While Tauri v2 supports it, this change focuses
  exclusively on macOS.
- **Cloud Sync:** iCloud or other sync mechanisms are out of scope for this
  initial phase.
- **UI Redesign:** No changes to the current look and feel.

## Decisions

### 1. Platform: Tauri v2 over Electron

- **Rationale:** Tauri produces significantly smaller binaries (~15MB vs 200MB+)
  and uses less memory by leveraging the system's native WebKit. It also
  provides a more secure bridge between frontend and backend.
- **Alternative:** Electron was considered but rejected due to high resource
  usage.

### 2. Storage: Split JSON Files in `~/.jb-guitar/`

- **Rationale:** Storing `exercises`, `plans`, and `sessions` in separate
  files (`exercises.json`, `plans.json`, `sessions.json`) makes the data easier
  to manage manually (if needed) and more robust against corruption.
- **Alternative:** A single large `data.json` was considered but deemed less
  flexible for future growth.

### 3. Frontend-Backend Communication: Tauri Commands

- **Rationale:** Using Tauri's `invoke` API to call Rust functions (Commands)
  ensures type-safe and secure file operations.
- **Alternative:** Direct `fs` access from TypeScript (via Tauri plugins) was
  considered but using explicit Commands allows for better validation in Rust.

### 4. Dependency Management: `src-tauri` inside `jb-guitar-frontend`

- **Rationale:** This is the standard Tauri layout, making it easy for the Tauri
  CLI to manage the build process of both the Angular frontend and the Rust
  backend.

## Risks / Trade-offs

- **[Risk] Data Loss on Migration** → **Mitigation:** Retain the existing
  backup/import functionality in the UI so users can manually migrate their
  `localStorage` data to the new file-based system.
- **[Risk] Rust Learning Curve** → **Mitigation:** Keep the Rust backend
  minimal, focusing only on file I/O and directory management.
- **[Risk] Environment Setup** → **Mitigation:** Document that Rust and Xcode
  Command Line Tools are required for development.
