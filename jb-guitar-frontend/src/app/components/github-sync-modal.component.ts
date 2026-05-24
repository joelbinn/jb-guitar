import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GitHubSyncSettings } from '../models';
import { GitHubSyncService } from '../services/github-sync.service';
import { StorageService } from '../services/storage.service';

@Component({
    selector: 'jbg-github-sync-modal',
    imports: [FormsModule],
    template: `
        <div class="modal-backdrop" (click)="handleBackdropClick($event)">
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">

                <div class="modal-header">
                    <div class="modal-title-row">
                        <span class="modal-icon">☁</span>
                        <h2 id="modal-title">GitHub-synkronisering</h2>
                    </div>
                    <button class="close-btn" (click)="close()" aria-label="Stäng">✕</button>
                </div>

                <div class="modal-body">
                    <p class="modal-desc">
                        Synkronisera din övningsdata med ett privat GitHub-repository.
                        Dina inloggningsuppgifter sparas <strong>bara lokalt</strong> i din webbläsare.
                    </p>

                    <!-- Enable toggle -->
                    <label class="toggle-row">
                        <span class="toggle-label">Aktivera synkronisering</span>
                        <div class="toggle-wrap">
                            <input
                                id="sync-enabled"
                                type="checkbox"
                                class="toggle-input"
                                [(ngModel)]="formEnabled"
                            />
                            <span class="toggle-track">
                                <span class="toggle-thumb"></span>
                            </span>
                        </div>
                    </label>

                    <div class="form-fields" [class.disabled]="!formEnabled">
                        <!-- Repository -->
                        <div class="field">
                            <label class="field-label" for="sync-repo">Repository (ägare/repo)</label>
                            <input
                                id="sync-repo"
                                type="text"
                                class="field-input"
                                [(ngModel)]="formRepo"
                                placeholder="t.ex. johndoe/jb-guitar-data"
                                [disabled]="!formEnabled"
                                autocomplete="off"
                            />
                        </div>

                        <!-- PAT Token -->
                        <div class="field">
                            <div class="field-label-row">
                                <label class="field-label" for="sync-token">Personal Access Token (PAT)</label>
                                <a
                                    class="help-link"
                                    href="https://github.com/settings/personal-access-tokens/new"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Skapa ny token på GitHub"
                                >? Skapa token</a>
                            </div>
                            <input
                                id="sync-token"
                                [type]="showToken() ? 'text' : 'password'"
                                class="field-input token-input"
                                [(ngModel)]="formToken"
                                placeholder="github_pat_..."
                                [disabled]="!formEnabled"
                                autocomplete="off"
                            />
                            <button class="token-toggle" type="button" (click)="showToken.set(!showToken())">
                                {{ showToken() ? 'Dölj' : 'Visa' }}
                            </button>
                        </div>

                        <!-- Branch -->
                        <div class="field-row">
                            <div class="field">
                                <label class="field-label" for="sync-branch">Branch</label>
                                <input
                                    id="sync-branch"
                                    type="text"
                                    class="field-input"
                                    [(ngModel)]="formBranch"
                                    placeholder="main"
                                    [disabled]="!formEnabled"
                                />
                            </div>
                            <div class="field">
                                <label class="field-label" for="sync-path">Filväg</label>
                                <input
                                    id="sync-path"
                                    type="text"
                                    class="field-input"
                                    [(ngModel)]="formFilePath"
                                    placeholder="jb-guitar-data.json"
                                    [disabled]="!formEnabled"
                                />
                            </div>
                        </div>

                        <!-- Help info box -->
                        <div class="info-box">
                            <span class="info-icon">ℹ</span>
                            <div class="info-text">
                                <strong>Så här skapar du en PAT:</strong>
                                GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token.
                                Välj ditt repository och ge det <em>Contents: Read and write</em>-behörighet.
                                <a
                                    href="https://github.com/settings/personal-access-tokens/new"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >Öppna GitHub →</a>
                            </div>
                        </div>

                        <!-- Status -->
                        @if (statusMsg()) {
                            <div class="status-msg" [class]="statusClass()">
                                {{ statusMsg() }}
                            </div>
                        }

                        <!-- Test connection button -->
                        <button
                            class="btn btn-ghost btn-full"
                            type="button"
                            [disabled]="testing() || !formRepo || !formToken"
                            (click)="testConnection()"
                        >
                            @if (testing()) { ⏳ Testar... } @else { 🔌 Testa anslutning }
                        </button>
                    </div>

                    <!-- Manual sync actions (only when saved and enabled) -->
                    @if (storage.syncStatus() !== 'unconfigured') {
                        <div class="sync-actions">
                            <p class="sect-label">Manuell synkronisering</p>
                            <div class="btn-row">
                                <button
                                    class="btn btn-ghost"
                                    type="button"
                                    [disabled]="storage.syncStatus() === 'syncing'"
                                    (click)="pull()"
                                    title="Hämta data från GitHub och skriv över lokalt"
                                >⬇ Hämta från GitHub</button>
                                <button
                                    class="btn btn-ghost"
                                    type="button"
                                    [disabled]="storage.syncStatus() === 'syncing'"
                                    (click)="push()"
                                    title="Skicka lokal data till GitHub och skriv över remote"
                                >⬆ Skicka till GitHub</button>
                            </div>
                        </div>
                    }
                </div>

                <div class="modal-footer">
                    <button class="btn btn-ghost" type="button" (click)="close()">Stäng</button>
                    <button class="btn btn-primary" type="button" (click)="save()">Spara</button>
                </div>
            </div>
        </div>
    `,
    styles: `
        .modal-backdrop {
            position: fixed; inset: 0; z-index: 200;
            background: rgba(0,0,0,0.65);
            backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center;
            padding: 16px;
            animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        .modal {
            background: var(--surf);
            border: 1px solid var(--border2);
            border-radius: 10px;
            width: 100%; max-width: 480px;
            box-shadow: 0 24px 64px rgba(0,0,0,0.6);
            animation: slideUp 0.18s ease;
            overflow: hidden;
        }
        @keyframes slideUp {
            from { transform: translateY(16px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
        }
        .modal-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
        }
        .modal-title-row {
            display: flex; align-items: center; gap: 8px;
        }
        .modal-icon { font-size: 18px; }
        h2 {
            font-size: 14px; font-weight: 600;
            color: var(--txt); letter-spacing: 0.3px; margin: 0;
        }
        .close-btn {
            background: none; border: none; color: var(--txt3);
            font-size: 14px; cursor: pointer; padding: 4px 8px;
            border-radius: 4px; transition: color 0.15s, background 0.15s;
        }
        .close-btn:hover { color: var(--txt); background: var(--surf2); }
        .modal-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .modal-desc { font-size: 12px; color: var(--txt2); line-height: 1.6; }
        .modal-desc strong { color: var(--txt); }

        /* Toggle */
        .toggle-row {
            display: flex; align-items: center; justify-content: space-between;
            cursor: pointer; padding: 10px 12px;
            background: var(--surf2); border-radius: 6px;
            border: 1px solid var(--border);
        }
        .toggle-label { font-size: 12px; color: var(--txt); font-weight: 500; }
        .toggle-wrap { position: relative; }
        .toggle-input {
            position: absolute; opacity: 0; width: 0; height: 0;
        }
        .toggle-track {
            display: block; width: 36px; height: 20px;
            background: var(--border2); border-radius: 10px;
            transition: background 0.2s; cursor: pointer;
            position: relative;
        }
        .toggle-thumb {
            position: absolute; top: 3px; left: 3px;
            width: 14px; height: 14px;
            background: var(--txt3); border-radius: 50%;
            transition: transform 0.2s, background 0.2s;
        }
        .toggle-input:checked + .toggle-track { background: var(--accent-dim); border: 1px solid var(--accent); }
        .toggle-input:checked + .toggle-track .toggle-thumb {
            transform: translateX(16px); background: var(--accent);
        }

        /* Form fields */
        .form-fields { display: flex; flex-direction: column; gap: 12px; }
        .form-fields.disabled { opacity: 0.45; pointer-events: none; }
        .field-label-row {
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 6px;
        }
        .help-link {
            font-size: 10px; color: var(--accent); text-decoration: none;
            border: 1px solid var(--accent); border-radius: 10px;
            padding: 2px 8px; transition: background 0.15s;
        }
        .help-link:hover { background: var(--accent-dim); }
        .token-input { padding-right: 60px; }
        .token-toggle {
            float: right; margin-top: -28px; margin-right: 8px;
            background: none; border: none; color: var(--txt3);
            font-size: 10px; cursor: pointer; position: relative;
            z-index: 1; padding: 4px;
        }
        .token-toggle:hover { color: var(--txt2); }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .field { margin-bottom: 0; }

        /* Info box */
        .info-box {
            display: flex; gap: 10px; padding: 12px;
            background: var(--surf2); border-radius: 6px;
            border: 1px solid var(--border);
        }
        .info-icon { font-size: 16px; flex-shrink: 0; color: var(--accent); }
        .info-text { font-size: 11px; color: var(--txt2); line-height: 1.7; }
        .info-text a { color: var(--accent); text-decoration: none; }
        .info-text a:hover { text-decoration: underline; }

        /* Status message */
        .status-msg {
            font-size: 11px; padding: 8px 12px;
            border-radius: 5px; border: 1px solid var(--border);
        }
        .status-ok { border-color: var(--success); color: var(--success); background: rgba(90,138,90,0.1); }
        .status-err { border-color: var(--danger-border); color: var(--danger); background: rgba(160,80,80,0.1); }
        .status-info { border-color: var(--border2); color: var(--txt2); }

        /* Sync actions */
        .sync-actions {
            border-top: 1px solid var(--border); padding-top: 16px;
        }
        .sync-actions .btn-row { margin-top: 8px; }

        /* Footer */
        .modal-footer {
            display: flex; gap: 8px; justify-content: flex-end;
            padding: 14px 20px;
            border-top: 1px solid var(--border);
            background: var(--surf2);
        }
    `,
})
export class GitHubSyncModalComponent {
    readonly closed = output<void>();

    protected readonly gitSync = inject(GitHubSyncService);
    protected readonly storage = inject(StorageService);

    // Form state (local copy of settings)
    formEnabled = this.gitSync.settings().enabled;
    formRepo = this.gitSync.settings().repo;
    formToken = this.gitSync.settings().token;
    formBranch = this.gitSync.settings().branch || 'main';
    formFilePath = this.gitSync.settings().filePath || 'jb-guitar-data.json';

    showToken = signal(false);
    testing = signal(false);
    statusMsg = signal('');
    statusClass = signal('status-info');

    handleBackdropClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
            this.close();
        }
    }

    close(): void {
        this.closed.emit();
    }

    save(): void {
        const settings = {
            enabled: this.formEnabled,
            repo: this.formRepo.trim(),
            token: this.formToken.trim(),
            branch: this.formBranch.trim() || 'main',
            filePath: this.formFilePath.trim() || 'jb-guitar-data.json',
        };
        this.gitSync.saveSettings(settings);
        this.statusMsg.set('✓ Inställningar sparade');
        this.statusClass.set('status-ok');

        // Re-init sync with new settings
        if (settings.enabled && settings.repo && settings.token) {
            this.storage.pullFromGitHub();
        }

        setTimeout(() => this.close(), 800);
    }

    async testConnection(): Promise<void> {
        this.testing.set(true);
        this.statusMsg.set('');
        const settings = {
            enabled: this.formEnabled,
            repo: this.formRepo.trim(),
            token: this.formToken.trim(),
            branch: this.formBranch.trim() || 'main',
            filePath: this.formFilePath.trim() || 'jb-guitar-data.json',
        };
        const ok = await this.gitSync.testConnection(settings);
        this.testing.set(false);
        if (ok) {
            this.statusMsg.set('✓ Anslutningen fungerar! Repository och token är giltiga.');
            this.statusClass.set('status-ok');
        } else {
            this.statusMsg.set('✗ Anslutningen misslyckades. Kontrollera repository-namn, token och branch.');
            this.statusClass.set('status-err');
        }
    }

    async pull(): Promise<void> {
        this.statusMsg.set('⏳ Hämtar data från GitHub...');
        this.statusClass.set('status-info');
        await this.storage.pullFromGitHub();
        if (this.storage.syncStatus() === 'synced') {
            this.statusMsg.set('✓ Data hämtad! Sidan laddas om...');
            this.statusClass.set('status-ok');
            setTimeout(() => window.location.reload(), 800);
        } else {
            this.statusMsg.set('✗ Kunde inte hämta data. Kontrollera anslutningen.');
            this.statusClass.set('status-err');
        }
    }

    async push(): Promise<void> {
        this.statusMsg.set('⏳ Skickar data till GitHub...');
        this.statusClass.set('status-info');
        await this.storage.pushToGitHub();
        if (this.storage.syncStatus() === 'synced') {
            this.statusMsg.set('✓ Data skickad till GitHub!');
            this.statusClass.set('status-ok');
        } else {
            this.statusMsg.set('✗ Kunde inte skicka data. Kontrollera anslutningen.');
            this.statusClass.set('status-err');
        }
    }
}
