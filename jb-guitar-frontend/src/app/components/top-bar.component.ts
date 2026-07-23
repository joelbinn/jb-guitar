import {Component, inject, signal} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {StorageService} from '../services';
import {GitHubSyncModalComponent} from './github-sync-modal.component';

@Component({
  selector: 'jbg-top-bar',
  imports: [RouterLink, RouterLinkActive, GitHubSyncModalComponent],
  template: `
    <header class="topbar">
      <a class="logo" routerLink="/">
        <img src="app-logo.png" alt="applogo" height="32" width="32"/>
        <span>JB GUITAR</span>
      </a>

      <div class="topbar-right">
        <nav class="topnav">
          <a class="tnav" routerLink="/practice" routerLinkActive="active">ÖVAS</a>
          <a class="tnav" routerLink="/create" routerLinkActive="active">SKAPA</a>
          <a class="tnav" routerLink="/help" routerLinkActive="active">HJÄLP</a>
        </nav>

        <!-- GitHub sync status indicator -->
        <button
          class="sync-btn"
          [class]="'sync-btn sync-' + storage.syncStatus()"
          (click)="syncModalOpen.set(true)"
          [title]="syncTitle()"
          aria-label="GitHub-synkronisering"
        >
          <span class="sync-icon">☁</span>
          <span class="sync-dot"></span>
        </button>

        <div class="menu-wrap">
          <button class="gear-btn" (click)="menuOpen.set(!menuOpen())" title="Data">⚙</button>
          @if (menuOpen()) {
            <div class="menu-backdrop" (click)="menuOpen.set(false)"></div>
            <div class="menu">
              <button class="menu-item" (click)="openSyncModal()">☁ GitHub-synkronisering</button>
              <div class="menu-divider"></div>
              <div class="menu-volume">
                <span class="volume-label">🔊 Metronomvolym: {{ storage.metronomeVolume() }}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  [value]="storage.metronomeVolume()"
                  (input)="onVolumeChange($event)"
                  class="volume-slider"
                />
              </div>
              <div class="menu-divider"></div>
              <button class="menu-item" (click)="exportData()">📥 Exportera till fil</button>
              <button class="menu-item" (click)="fileInput.click()">📤 Importera från fil</button>
            </div>
          }
          <input #fileInput type="file" accept=".json" hidden (change)="importData($event)"/>
        </div>
      </div>
    </header>

    @if (syncModalOpen()) {
      <jbg-github-sync-modal (closed)="syncModalOpen.set(false)"/>
    }
  `,
  styles: `
    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 16px; height: 48px;
      border-bottom: 1px solid var(--border); background: var(--surf);
    }
    .logo {
      display: flex; align-items: center; gap: 0.5rem;
      font-weight: 700; letter-spacing: 3px; font-size: 13px;
      color: var(--accent); text-decoration: none;
    }
    .topbar-right { display: flex; align-items: center; gap: 8px; }
    .topnav { display: flex; gap: 0; }
    .tnav {
      background: none; border: none; color: var(--txt3);
      font-size: 11px; letter-spacing: 1px; padding: 6px 12px;
      cursor: pointer; border-bottom: 2px solid transparent;
      text-decoration: none; text-transform: uppercase;
      transition: color 0.15s, border-color 0.15s;
    }
    .tnav:hover { color: var(--txt2); }
    .tnav.active { color: var(--accent); border-bottom-color: var(--accent); }

    /* Sync button */
    .sync-btn {
      position: relative;
      background: none; border: 1px solid var(--border); border-radius: 4px;
      color: var(--txt3); font-size: 14px; padding: 4px 8px; cursor: pointer;
      transition: border-color 0.15s, color 0.15s;
      display: flex; align-items: center;
    }
    .sync-btn:hover { border-color: var(--txt3); color: var(--txt2); }
    .sync-dot {
      position: absolute; top: 4px; right: 4px;
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--txt4); /* unconfigured */
    }
    /* Status colours */
    .sync-unconfigured .sync-dot { background: var(--txt4); }
    .sync-synced .sync-dot { background: var(--success); }
    .sync-syncing .sync-dot {
      background: var(--accent);
      animation: pulse 1s ease-in-out infinite;
    }
    .sync-error .sync-dot { background: var(--danger); }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }

    .menu-wrap { position: relative; }
    .gear-btn {
      background: none; border: 1px solid var(--border); border-radius: 4px;
      color: var(--txt3); font-size: 14px; padding: 4px 8px; cursor: pointer;
      transition: border-color 0.15s, color 0.15s;
    }
    .gear-btn:hover { border-color: var(--accent); color: var(--accent); }
    .menu-backdrop { position: fixed; inset: 0; z-index: 99; }
    .menu {
      position: absolute; right: 0; top: calc(100% + 6px);
      background: var(--surf); border: 1px solid var(--border); border-radius: 6px;
      padding: 4px; min-width: 210px; z-index: 100;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .menu-item {
      display: block; width: 100%; background: none; border: none;
      color: var(--txt2); font-size: 11px; padding: 8px 12px;
      text-align: left; cursor: pointer; border-radius: 4px;
      font-family: inherit; transition: background 0.15s, color 0.15s;
    }
    .menu-item:hover { background: var(--accent-dim); color: var(--accent); }
    .menu-divider {
      height: 1px; background: var(--border);
      margin: 4px 8px;
    }
    .menu-volume {
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .volume-label {
      font-size: 10px;
      color: var(--txt2);
      font-weight: 500;
    }
    .volume-slider {
      width: 100%;
      height: 4px;
      background: var(--border);
      border-radius: 2px;
      outline: none;
      -webkit-appearance: none;
      cursor: pointer;
    }
    .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--accent);
      cursor: pointer;
      transition: transform 0.1s;
    }
    .volume-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }
  `,
})
export class TopBarComponent {
  menuOpen = signal(false);
  syncModalOpen = signal(false);
  protected readonly storage = inject(StorageService);

  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.storage.setMetronomeVolume(+input.value);
  }

  syncTitle(): string {
    const status = this.storage.syncStatus();
    switch (status) {
      case 'synced':
        return 'GitHub-synk: OK';
      case 'syncing':
        return 'GitHub-synk: Synkar...';
      case 'error':
        return 'GitHub-synk: Fel – klicka för att konfigurera';
      default:
        return 'GitHub-synkronisering (ej konfigurerad)';
    }
  }

  openSyncModal(): void {
    this.menuOpen.set(false);
    this.syncModalOpen.set(true);
  }

  exportData(): void {
    this.storage.exportToFile();
    this.menuOpen.set(false);
  }

  async importData(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      await this.storage.importFromFile(file);
      this.menuOpen.set(false);
      window.location.reload();
    } catch {
      alert('Kunde inte läsa filen. Kontrollera att det är en giltig JSON-fil.');
    }
    input.value = '';
  }
}
