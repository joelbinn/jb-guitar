import {Component, inject, output, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {GitHubSyncService} from '../services/github-sync.service';
import {StorageService} from '../services/storage.service';

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

                        <div class="sync-actions" style="margin-top: 14px; border-top: 1px solid var(--border); padding-top: 14px;">
                            <p class="sect-label">Historikhantering</p>
                            <div style="margin-top: 8px;">
                                <button
                                    class="btn btn-danger btn-full"
                                    type="button"
                                    [disabled]="storage.syncStatus() === 'syncing' || compacting()"
                                    (click)="compact()"
                                    title="Radera all tidigare versionshistorik för din data på denna branch och spara endast den senaste versionen."
                                >
                                    @if (compacting()) { ⏳ Kompakterar... } @else { 🗑 Kompaktera historik }
                                </button>
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
            position: fixed; inset: 0;
            background: rgba(36, 31, 24, 0.45);
            display: flex; align-items: center; justify-content: center;
            padding: 20px; z-index: 100;
            animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        .modal {
            background: #fffdf7;
            border: 1px solid var(--color-divider);
            border-radius: var(--radius);
            width: 100%; max-width: 480px;
            box-shadow: var(--shadow-lg);
            animation: slideUp 0.18s ease;
            overflow: hidden;
            font-family: var(--font-body);
        }
        @keyframes slideUp {
            from { transform: translateY(16px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
        }
        .modal-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: var(--space-4) var(--space-5);
            border-bottom: 1px solid var(--color-divider);
        }
        .modal-title-row {
            display: flex; align-items: center; gap: 8px;
        }
        .modal-icon { font-size: 18px; }
        h2 {
            font-family: var(--font-heading);
            font-size: 17px; font-weight: 700;
            color: var(--color-text); margin: 0;
        }
        .close-btn {
            background: none; border: none; color: var(--color-neutral-600);
            font-size: 14px; cursor: pointer; padding: 4px 8px;
            border-radius: var(--radius-sm); transition: color 0.15s, background 0.15s;
        }
        .close-btn:hover { color: var(--color-text); background: var(--color-neutral-100); }
        .modal-body { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-4); }
        .modal-desc { font-size: 13px; color: var(--color-neutral-700); line-height: 1.6; }
        .modal-desc strong { color: var(--color-text); }

        /* Toggle */
        .toggle-row {
            display: flex; align-items: center; justify-content: space-between;
            cursor: pointer; padding: 10px 12px;
            background: var(--color-neutral-100); border-radius: var(--radius-sm);
            border: 1px solid var(--color-divider);
        }
        .toggle-label { font-size: 13px; color: var(--color-text); font-weight: 500; }
        .toggle-wrap { position: relative; }
        .toggle-input {
            position: absolute; opacity: 0; width: 0; height: 0;
        }
        .toggle-track {
            display: block; width: 36px; height: 20px;
            background: var(--color-neutral-300); border-radius: 10px;
            transition: background 0.2s; cursor: pointer;
            position: relative;
        }
        .toggle-thumb {
            position: absolute; top: 3px; left: 3px;
            width: 14px; height: 14px;
            background: #fffdf7; border-radius: 50%;
            transition: transform 0.2s, background 0.2s;
        }
        .toggle-input:checked + .toggle-track { background: var(--color-accent-100); border: 1px solid var(--color-accent); }
        .toggle-input:checked + .toggle-track .toggle-thumb {
            transform: translateX(16px); background: var(--color-accent);
        }

        /* Form fields */
        .form-fields { display: flex; flex-direction: column; gap: 12px; }
        .form-fields.disabled { opacity: 0.45; pointer-events: none; }
        .field-label-row {
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 6px;
        }
        .help-link {
            font-size: 11px; color: var(--color-accent-700); text-decoration: none;
            border: 1px solid var(--color-divider); border-radius: 10px;
            padding: 2px 8px; transition: background 0.15s;
        }
        .help-link:hover { background: var(--color-accent-100); }
        .token-input { padding-right: 60px; }
        .token-toggle {
            float: right; margin-top: -30px; margin-right: 8px;
            background: none; border: none; color: var(--color-neutral-600);
            font-size: 11px; cursor: pointer; position: relative;
            z-index: 1; padding: 4px;
        }
        .token-toggle:hover { color: var(--color-text); }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .field { margin-bottom: 0; }

        /* Info box */
        .info-box {
            display: flex; gap: 10px; padding: 12px;
            background: var(--color-neutral-100); border-radius: var(--radius-sm);
            border: 1px solid var(--color-divider);
        }
        .info-icon { font-size: 16px; flex-shrink: 0; color: var(--color-accent); }
        .info-text { font-size: 12px; color: var(--color-neutral-700); line-height: 1.7; }
        .info-text a { color: var(--color-accent-700); text-decoration: none; }
        .info-text a:hover { text-decoration: underline; }

        /* Status message */
        .status-msg {
            font-size: 12px; padding: 8px 12px;
            border-radius: var(--radius-sm); border: 1px solid var(--color-divider);
        }
        .status-ok { border-color: var(--success); color: var(--success); background: rgba(60,122,68,0.1); }
        .status-err { border-color: var(--color-accent-700); color: var(--color-accent-700); background: var(--color-accent-100); }
        .status-info { border-color: var(--color-divider); color: var(--color-neutral-700); }

        /* Sync actions */
        .sync-actions {
            border-top: 1px solid var(--color-divider); padding-top: 16px;
        }
        .sync-actions .btn-row { margin-top: 8px; }

        /* Footer */
        .modal-footer {
            display: flex; gap: 8px; justify-content: flex-end;
            padding: 14px 20px;
            border-top: 1px solid var(--color-divider);
            background: var(--color-neutral-100);
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
    compacting = signal(false);
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

    async compact(): Promise<void> {
        const confirmed = window.confirm(
            'VARNING: Detta kommer permanent att radera all tidigare versionshistorik för din övningsdata på GitHub och endast behålla den nuvarande versionen (1 commit). Vill du fortsätta?'
        );
        if (!confirmed) return;

        this.compacting.set(true);
        this.statusMsg.set('⏳ Kompakterar historik på GitHub...');
        this.statusClass.set('status-info');

        const settings = {
            enabled: this.formEnabled,
            repo: this.formRepo.trim(),
            token: this.formToken.trim(),
            branch: this.formBranch.trim() || 'main',
            filePath: this.formFilePath.trim() || 'jb-guitar-data.json',
        };

        try {
            await this.gitSync.compactHistory(settings);
            this.statusMsg.set('✓ Historik kompakterad! Endast senaste versionen är sparad.');
            this.statusClass.set('status-ok');
        } catch (error) {
            console.error('History compaction failed:', error);
            this.statusMsg.set('✗ Kompakteringen misslyckades. Kontrollera anslutningen och rättigheter.');
            this.statusClass.set('status-err');
        } finally {
            this.compacting.set(false);
        }
    }
}
