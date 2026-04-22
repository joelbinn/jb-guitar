## ADDED Requirements

### Requirement: Local File Storage

The system SHALL store all application data (exercises, plans, sessions) as JSON
files in a dedicated directory in the user's home folder (`~/.jb-guitar/`).

#### Scenario: Data persistence on disk

- **WHEN** a user saves an exercise in the application
- **THEN** the data SHALL be written to `~/.jb-guitar/exercises.json`

### Requirement: Automatic Directory Creation

The system SHALL automatically create the storage directory (`~/.jb-guitar/`)
and necessary JSON files if they do not exist upon application startup.

#### Scenario: First launch initialization

- **WHEN** the application is launched for the first time
- **THEN** the system SHALL create the `~/.jb-guitar/` directory

### Requirement: Data Integrity via Rust Backend

The system SHALL utilize a Rust-based backend (Tauri) to validate and perform
all file I/O operations, ensuring data integrity before writing to disk.

#### Scenario: Secure save operation

- **WHEN** the frontend invokes a save command
- **THEN** the Rust backend SHALL validate the data structure before writing to
  the JSON file
