# JB Guitar — Agent Rules

## Critical Rule

Always update [kravspecifikationen](./doc/kravspecifikation.md) when adding or
changing features in the application.

---

## Project Structure

```
jb-guitar/
├── doc/                        # Requirements spec and product docs (Swedish)
├── openspec/                   # OpenSpec change artifacts
└── jb-guitar-frontend/         # Angular 21 SPA — the only application
    └── src/app/
        ├── components/         # Shared UI components (e.g. top-bar)
        ├── models/             # TypeScript interfaces + barrel (index.ts)
        ├── pages/              # One folder per route (*.page.ts)
        └── services/           # Singleton services + barrel (index.ts)
```

All source work happens inside `jb-guitar-frontend/`.

---

## Commands

Run all commands from `jb-guitar-frontend/`:

```bash
npm start          # Dev server at localhost:4200
npm run build      # Production build
npm run watch      # Dev build with watch
npm test           # Run all tests (Vitest via Angular CLI)
```

### Running a single test file

```bash
npx ng test --include="src/app/some.spec.ts"
```

### Passing Vitest flags directly

```bash
npx ng test -- --reporter=verbose
```

---

## Tech Stack

| Concern     | Choice                                           |
|-------------|--------------------------------------------------|
| Framework   | Angular 21 (standalone, zoneless, signals)       |
| Language    | TypeScript 5.9 (`strict: true`)                  |
| Styling     | CSS custom properties + Tailwind CSS 4 (PostCSS) |
| Drag & Drop | `@angular/cdk` drag-drop                         |
| Test runner | Vitest 4 (via `@angular/build:unit-test`)        |
| Persistence | `localStorage` (key: `jb-guitar-data`)           |
| Audio       | Web Audio API                                    |

---

## TypeScript

- `strict: true` — no implicit `any`, no implicit returns, no fallthrough
- Prefer type inference when the type is obvious
- Never use `any`; use `unknown` when type is truly uncertain
- `noImplicitOverride`, `noPropertyAccessFromIndexSignature` are enabled
- `isolatedModules: true` — no const enums, no namespace merging

---

## Angular Patterns

### Standalone components (default in v20+)

- **Do NOT set `standalone: true`** in decorators — it is the default
- **Do NOT use `NgModule`**

### Change Detection

- Always set `changeDetection: ChangeDetectionStrategy.OnPush` on every
  `@Component`
- App uses `provideZonelessChangeDetection()` — Zone.js is not present

### Dependency Injection

- Use `inject()` function, **not constructor injection**
- Use `providedIn: 'root'` for all singleton services

### Signals

- Use `signal()` for all local component state
- Use `computed()` for derived state — never derive in templates
- Use `signal.set()` / `signal.update()` — **never `mutate()`**
- Use `effect()` for side effects that react to signal changes

### Inputs / Outputs

- Use `input()` and `output()` functions, **not `@Input()`/`@Output()`
  decorators**

### Templates

- Use native control flow: `@if`, `@for`, `@switch` — *
  *not `*ngIf`, `*ngFor`, `*ngSwitch`**
- **No `ngClass`** — use `[class.foo]="expr"` or `[class]="expr"` bindings
- **No `ngStyle`** — use `[style.prop]="expr"` bindings
- Keep templates simple; no complex expressions or arrow functions in templates
- Do not assume globals like `new Date()` are available in templates
- Use `NgOptimizedImage` for all static images (not for inline base64)

### Host Bindings

- **No `@HostBinding` / `@HostListener`** — use the `host: {}` object in the
  decorator instead

### Forms

- Prefer Reactive forms over Template-driven forms

### Routing

- Prefer lazy loading for feature routes

### Observables

- Use the async pipe to handle observables in templates

---

## Naming Conventions

| Item               | Convention                | Example                          |
|--------------------|---------------------------|----------------------------------|
| Component files    | `kebab-case.component.ts` | `top-bar.component.ts`           |
| Page files         | `kebab-case.page.ts`      | `session.page.ts`                |
| Service files      | `kebab-case.service.ts`   | `session.service.ts`             |
| Model files        | `kebab-case.model.ts`     | `exercise.model.ts`              |
| Classes            | `PascalCase`              | `SessionPage`, `ExerciseService` |
| Interfaces         | `PascalCase`              | `Exercise`, `Session`            |
| Union types        | `PascalCase`              | `SessionStatus`, `BeatStrength`  |
| Component selector | `jbg-` prefix + kebab     | `jbg-session`, `jbg-top-bar`     |
| Methods            | `camelCase`, verb-first   | `getAll()`, `pauseSession()`     |
| Signals            | `camelCase`, noun         | `session`, `timerRunning`        |
| Constants          | `UPPER_SNAKE_CASE`        | `STORAGE_KEY`                    |
| Barrel files       | `index.ts`                | `models/index.ts`                |

---

## Formatting

- **Line width:** 100 characters (Prettier)
- **Quotes:** Single quotes for TypeScript
- **Indentation:** 2 spaces (EditorConfig)
- **HTML parser:** Angular (Prettier override for `*.html`)
- Final newline required; no trailing whitespace

---

## Error Handling

Four established patterns — use the appropriate one for context:

1. **Silent fallback (storage/parsing):** `try/catch` resetting to a safe
   default
2. **User alert (destructive/import ops):** `try/catch` with `alert()` in
   Swedish
3. **Graceful degradation (Web APIs):** `try/catch` with `console.log`
4. **Guard clauses / early returns (dominant):** `if (!x) return;` before
   proceeding

Use `confirm()` for destructive actions; messages should be in Swedish.

---

## Architecture — Lightweight DDD

- **Models** (`models/`) are plain TypeScript interfaces acting as
  Entities/Value Objects
- **StorageService** is the **Repository** — hides all `localStorage`
  persistence
- **Application Services** (`services/`) are thin orchestrators; no business
  logic
- **Pages** (`pages/`) are the Presentation Layer — coordinate service calls and
  hold UI state
- Data migration (upgrading old persisted data) lives in the relevant service

---

## Accessibility

- All UI must pass AXE checks
- Must meet WCAG AA minimums: focus management, color contrast, ARIA attributes

---

## CSS Architecture

- Global design tokens defined as CSS custom properties in `src/styles.css` (
  `--bg`, `--accent`, `--surf`, etc.)
- Global utility classes (`.card`, `.btn`, `.grid-2`, etc.) live in
  `src/styles.css`
- Component-specific styles go in inline `styles: \`...\`` inside the
  decorator (scoped)
- Tailwind CSS 4 available via PostCSS for utility classes in templates
