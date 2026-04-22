## 1. Tauri Project Setup

- [ ] 1.1 Install Tauri CLI and initialize Tauri in `jb-guitar-frontend`
- [ ] 1.2 Update `package.json` with Tauri scripts (`tauri:dev`, `tauri:build`)
- [ ] 1.3 Configure `tauri.conf.json` to point to Angular's
  `dist/jb-guitar-frontend/browser`
- [ ] 1.4 Verify that a basic Tauri window launches with the Angular app

## 2. Rust Backend Implementation

- [ ] 2.1 Define data models in Rust using `serde` (`Exercise`, `PracticePlan`,
  `Session`)
- [ ] 2.2 Implement a Rust utility to get the storage path (`~/.jb-guitar/`)
- [ ] 2.3 Implement Tauri Commands for file I/O: `read_file` and `write_file`
- [ ] 2.4 Add initialization logic to create `.jb-guitar` directory on startup

## 3. Frontend Integration

- [ ] 3.1 Install `@tauri-apps/api` in the Angular project
- [ ] 3.2 Refactor `StorageService` to use Tauri `invoke` instead of
  `localStorage`
- [ ] 3.3 Ensure existing data models in TypeScript are compatible with Rust
  Commands
- [ ] 3.4 Implement a basic "Data Migration" check to help users import backups

## 4. Verification & Packaging

- [ ] 4.1 Test full CRUD operations (create/read/update/delete) on exercises and
  plans
- [ ] 4.2 Verify that JSON files are correctly updated in `~/.jb-guitar/`
- [ ] 4.3 Run a production build (`npm run tauri:build`) and verify the `.app`
  bundle
