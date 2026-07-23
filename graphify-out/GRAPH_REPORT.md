# Graph Report - jb-guitar  (2026-07-15)

## Corpus Check

- 117 files · ~81,938 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 760 nodes · 928 edges · 104 communities (89 shown, 15 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (
  avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `83838bb2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]

## God Nodes (most connected - your core abstractions)

1. `StorageService` - 39 edges
2. `SessionPage` - 34 edges
3. `Session` - 25 edges
4. `SessionService` - 20 edges
5. `Exercise` - 19 edges
6. `ExerciseService` - 18 edges
7. `PlanService` - 18 edges
8. `PracticePlan` - 17 edges
9. `GitHubSyncModalComponent` - 14 edges
10. `CreatePage` - 14 edges

## Surprising Connections (you probably didn't know these)

- `Angular Best Practices` --rationale_for--> `App`  [INFERRED]
  jb-guitar-frontend/.claude/CLAUDE.md → jb-guitar-frontend/src/app/app.ts
- `OPSX Fast Forward Command` --references-->
  `openspec-ff-change Skill`  [INFERRED]
  .claude/commands/opsx/ff.md → .agent/skills/openspec-ff-change/SKILL.md
- `dependencies` --references--> `OpenCode Apply Command`  [INFERRED]
  .opencode/package.json → .opencode/commands/opsx-apply.md
- `Index HTML` --references--> `App`  [EXTRACTED]
  jb-guitar-frontend/src/index.html → jb-guitar-frontend/src/app/app.ts
- `Accessibility Requirements` --rationale_for-->
  `GitHubSyncModalComponent`  [INFERRED]
  jb-guitar-frontend/.claude/CLAUDE.md →
  jb-guitar-frontend/src/app/components/github-sync-modal.component.ts

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **OpenSpec Core Workflows** — workflows_opsx_new_workflow,
  workflows_opsx_continue_workflow, workflows_opsx_apply_workflow,
  workflows_opsx_archive_workflow [INFERRED 0.85]
- **OpenSpec Core Skills** — openspec_new_change_skill_definition,
  openspec_continue_change_skill_definition,
  openspec_apply_change_skill_definition,
  openspec_archive_change_skill_definition [INFERRED 0.85]
- **OpenSpec Agent Workflow Skills** —
  openspec_apply_change_skill_openspec_apply_change,
  openspec_archive_change_skill_openspec_archive_change,
  openspec_bulk_archive_change_skill_openspec_bulk_archive_change,
  openspec_continue_change_skill_openspec_continue_change,
  openspec_explore_skill_openspec_explore,
  openspec_ff_change_skill_openspec_ff_change,
  openspec_new_change_skill_openspec_new_change,
  openspec_onboard_skill_openspec_onboard,
  openspec_sync_specs_skill_openspec_sync_specs,
  openspec_verify_change_skill_openspec_verify_change [EXTRACTED 1.00]
- **OpenCode User Commands** — commands_opsx_apply_opsx_apply,
  commands_opsx_archive_opsx_archive,
  commands_opsx_bulk_archive_opsx_bulk_archive,
  commands_opsx_continue_opsx_continue, commands_opsx_explore_opsx_explore,
  commands_opsx_ff_opsx_ff, commands_opsx_new_opsx_new,
  commands_opsx_onboard_opsx_onboard, commands_opsx_sync_opsx_sync,
  commands_opsx_verify_opsx_verify [EXTRACTED 1.00]
- **OpenSpec Lifecycle Workflow** — openspec_new_change_skill_change_directory,
  openspec_continue_change_skill_artifact_sequence,
  openspec_apply_change_skill_implementation_flow,
  openspec_archive_change_skill_archiving_flow [EXTRACTED 1.00]
- **TypeScript App & Spec Configurations** — jb_guitar_frontend_tsconfig,
  jb_guitar_frontend_tsconfig_app,
  jb_guitar_frontend_tsconfig_spec [EXTRACTED 1.00]
- **Frontend Page Components** — create_create_page_createpage,
  exercise_edit_exercise_edit_page_exerciseeditpage, help_help_page_helppage,
  landing_landing_page_landingpage [INFERRED 0.85]
- **Application State Models** — models_exercise_model_exercise,
  models_practice_plan_model_practiceplan, models_session_model_session,
  models_github_sync_model_githubsyncsettings [INFERRED 0.85]
- **App Routing Mapping** — app_app_routes_routes,
  create_create_page_createpage,
  exercise_edit_exercise_edit_page_exerciseeditpage, help_help_page_helppage,
  landing_landing_page_landingpage [INFERRED 0.95]
- **Angular Page Components** — plan_edit_plan_edit_page_planeditpage,
  practice_list_practice_list_page_practicelistpage,
  session_session_page_sessionpage [INFERRED 0.95]
- **Domain State Services** — services_exercise_service_exerciseservice,
  services_plan_service_planservice,
  services_session_service_sessionservice [INFERRED 0.95]

## Communities (104 total, 15 thin omitted)

### Community 0 - "Community 0"

Cohesion: 0.07
Nodes (54): Actions on a Change Model (Skill), openspec-apply-change Skill,
openspec-archive-change/SKILL.md, OpenSpec Archive Change Flow,
openspec-archive-change Skill, openspec-bulk-archive-change/SKILL.md, Agentic
Spec Conflict Resolution (Skill), openspec-bulk-archive-change Skill (+46 more)

### Community 1 - "Community 1"

Cohesion: 0.20
Nodes (3): LandingPage, Session, SessionService

### Community 2 - "Community 2"

Cohesion: 0.05
Nodes (35): dependencies, @angular/cdk, @angular/common, @angular/compiler,
@angular/core, @angular/forms, @angular/platform-browser, @angular/router (+27
more)

### Community 3 - "Community 3"

Cohesion: 0.12
Nodes (12): App, appConfig, routes, App Specs, Angular Best Practices, Services,
State Management, Templates (+4 more)

### Community 4 - "Community 4"

Cohesion: 0.16
Nodes (7): Exercise, ExerciseSource, SyncStatus, PlanExerciseRow,
ExerciseService, DEFAULT_SETTINGS, AppData

### Community 6 - "Community 6"

Cohesion: 0.06
Nodes (37): build, serve, test, builder, configurations, defaultConfiguration,
options, cli (+29 more)

### Community 7 - "Community 7"

Cohesion: 0.15
Nodes (23): OpenCode Apply Command, OpenCode Archive Command, OpenCode Bulk
Archive Command, OpenCode Continue Command, OpenCode Explore Command, OpenCode
Fast-Forward Command, OpenCode New Command, OpenCode Onboard Command (+15 more)

### Community 8 - "Community 8"

Cohesion: 0.06
Nodes (29): 1. GitHub som databas (Backend), 2. Skapa ett GitHub-repository och
Personal Access Token (PAT), 3. Konfigurera synkningen i appen, 4. Driftsätt
applikationen på GitHub Pages, Alternativ A: Automatisk driftsättning via GitHub
Actions (Rekommenderas), Alternativ B: Manuell driftsättning från din dator,
Användarguide: GitHub-synkronisering & Driftsättning, GitHub Actions Deploy
Workflow (+21 more)

### Community 10 - "Community 10"

Cohesion: 0.17
Nodes (5): Accessibility Requirements, Components, GitHubSyncModalComponent,
GitHubSyncSettings, GitHubSyncService

### Community 11 - "Community 11"

Cohesion: 0.17
Nodes (12): openspec-apply-change/SKILL.md, OpenSpec Apply Change Flow,
openspec-continue-change/SKILL.md, OpenSpec Artifact Sequence,
openspec-explore/SKILL.md, OpenSpec Explore Stance, openspec-ff-change/SKILL.md,
OpenSpec Fast-Forward Action (+4 more)

### Community 13 - "Community 13"

Cohesion: 0.67
Nodes (3): JB Brand Identity, Guitar Visual Motif, App Logo (Dark)

### Community 19 - "Community 19"

Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server,
JbGuitarFrontend, Running end-to-end tests, Running unit tests

### Community 25 - "Community 25"

Cohesion: 0.04
Nodes (45): 2.1.1 Skapa övning, 2.1.2 Se övningar, 2.1.3 Redigera övning, 2.1.4
Ta bort övning, 2.1 Övningshantering, 2.2.1 Skapa övningsplan, 2.2.2 Se
övningsplaner, 2.2.3 Redigera övningsplan (+37 more)

### Community 26 - "Community 26"

Cohesion: 0.08
Nodes (24): 3.1.1 Layout, 3.1.2 Visuell hierarki, 3.1.3 Färgschema, 3.1.4
Komponenter, 3.1 Överordnad design, 3.2.1 Senaste session-kort, 3.2.2 Övriga
sessioner-grid, 3.2.3 Tom session-lista (+16 more)

### Community 27 - "Community 27"

Cohesion: 0.10
Nodes (19): Codebase Analysis, Graceful Exit Handling, Guardrails, Phase 10:
Archive, Phase 11: Recap & Next Steps, Phase 1: Welcome, Phase 2: Task
Selection, Phase 3: Explore Demo (+11 more)

### Community 28 - "Community 28"

Cohesion: 0.10
Nodes (19): Codebase Analysis, Graceful Exit Handling, Guardrails, Phase 10:
Archive, Phase 11: Recap & Next Steps, Phase 1: Welcome, Phase 2: Task
Selection, Phase 3: Explore Demo (+11 more)

### Community 29 - "Community 29"

Cohesion: 0.10
Nodes (19): Codebase Analysis, Graceful Exit Handling, Guardrails, Phase 10:
Archive, Phase 11: Recap & Next Steps, Phase 1: Welcome, Phase 2: Task
Selection, Phase 3: Explore Demo (+11 more)

### Community 30 - "Community 30"

Cohesion: 0.10
Nodes (19): Codebase Analysis, Graceful Exit Handling, Guardrails, Phase 10:
Archive, Phase 11: Recap & Next Steps, Phase 1: Welcome, Phase 2: Task
Selection, Phase 3: Explore Demo (+11 more)

### Community 31 - "Community 31"

Cohesion: 0.10
Nodes (19): Codebase Analysis, Graceful Exit Handling, Guardrails, Phase 10:
Archive, Phase 11: Recap & Next Steps, Phase 1: Welcome, Phase 2: Task
Selection, Phase 3: Explore Demo (+11 more)

### Community 32 - "Community 32"

Cohesion: 0.10
Nodes (19): Codebase Analysis, Graceful Exit Handling, Guardrails, Phase 10:
Archive, Phase 11: Recap & Next Steps, Phase 1: Welcome, Phase 2: Task
Selection, Phase 3: Explore Demo (+11 more)

### Community 33 - "Community 33"

Cohesion: 0.10
Nodes (19): Codebase Analysis, Graceful Exit Handling, Guardrails, Phase 10:
Archive, Phase 11: Recap & Next Steps, Phase 1: Welcome, Phase 2: Task
Selection, Phase 3: Explore Demo (+11 more)

### Community 34 - "Community 34"

Cohesion: 0.15
Nodes (4): PracticePlan, PracticeListPage, SessionView, PlanService

### Community 35 - "Community 35"

Cohesion: 0.13
Nodes (3): CreatePage, ExerciseEditPage, HelpPage

### Community 36 - "Community 36"

Cohesion: 0.18
Nodes (10): Check for context, Ending Discovery, Guardrails, Handling Different
Entry Points, OpenSpec Awareness, The Stance, What You Don't Have To Do, What
You Might Do (+2 more)

### Community 37 - "Community 37"

Cohesion: 0.18
Nodes (10): Check for context, Ending Discovery, Guardrails, Handling Different
Entry Points, OpenSpec Awareness, The Stance, What You Don't Have To Do, What
You Might Do (+2 more)

### Community 38 - "Community 38"

Cohesion: 0.18
Nodes (10): Check for context, Ending Discovery, Guardrails, Handling Different
Entry Points, OpenSpec Awareness, The Stance, What You Don't Have To Do, What
You Might Do (+2 more)

### Community 39 - "Community 39"

Cohesion: 0.18
Nodes (10): Check for context, Ending Discovery, Guardrails, Handling Different
Entry Points, OpenSpec Awareness, The Stance, What You Don't Have To Do, What
You Might Do (+2 more)

### Community 40 - "Community 40"

Cohesion: 0.20
Nodes (9): Check for context, Ending Discovery, Guardrails, OpenSpec Awareness,
The Stance, What You Don't Have To Do, What You Might Do, When a change exists (
+1 more)

### Community 41 - "Community 41"

Cohesion: 0.20
Nodes (9): Check for context, Ending Discovery, Guardrails, OpenSpec Awareness,
The Stance, What You Don't Have To Do, What You Might Do, When a change exists (
+1 more)

### Community 42 - "Community 42"

Cohesion: 0.20
Nodes (9): Check for context, Ending Discovery, Guardrails, OpenSpec Awareness,
The Stance, What You Don't Have To Do, What You Might Do, When a change exists (
+1 more)

### Community 43 - "Community 43"

Cohesion: 0.40
Nodes (3): BeatStrength, ExerciseSessionState, SessionStatus

### Community 44 - "Community 44"

Cohesion: 0.50
Nodes (3): Answer, Q: beskriv vad denna applikation tillhandahåller, Source
Nodes

## Knowledge Gaps

- **360 isolated node(s):** `@opencode-ai/plugin`, `$schema`, `version`,
  `packageManager`, `newProjectRoot` (+355 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query`
  to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `Kravspecifikation: JB Guitar` connect `Community 8`
  to `Community 25`, `Community 26`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **What connects `@opencode-ai/plugin`, `$schema`, `version` to the rest of the
  system?**
  _361 weakly-connected nodes found - possible documentation gaps or missing
  edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06708595387840671 - nodes in this community are weakly
  interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly
  interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly
  interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.09195402298850575 - nodes in this community are weakly
  interconnected._
- **Should `Community 6` be split into smaller, more focused modules?**
  _Cohesion score 0.05547652916073969 - nodes in this community are weakly
  interconnected._
