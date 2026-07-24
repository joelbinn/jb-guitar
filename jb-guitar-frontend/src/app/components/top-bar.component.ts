import {Component, inject, signal} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {StorageService} from '../services';
import {GitHubSyncModalComponent} from './github-sync-modal.component';

@Component({
  selector: 'jbg-top-bar',
  imports: [RouterLink, RouterLinkActive, GitHubSyncModalComponent],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <a class="nav-brand" routerLink="/">JB GUITAR</a>
        <nav class="topnav">
          <a class="tnav" routerLink="/practice" routerLinkActive="active">ÖVA</a>
          <a class="tnav" routerLink="/create" routerLinkActive="active">SKAPA</a>
          <a class="tnav" routerLink="/help" routerLinkActive="active">HJÄLP</a>
        </nav>
      </div>

      <div class="topbar-right">
        <!-- GitHub sync status indicator -->
        <button
          class="btn btn-ghost btn-icon sync-btn"
          [class]="'sync-' + storage.syncStatus()"
          (click)="syncModalOpen.set(true)"
          [title]="syncTitle()"
          aria-label="GitHub-synkronisering"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
          </svg>
          <span class="sync-dot"></span>
        </button>

        <div class="menu-wrap">
          <button class="btn btn-ghost btn-icon gear-btn" (click)="menuOpen.set(!menuOpen())" title="Inställningar" aria-label="Inställningar">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
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
          <input #fileInput type="file" accept=".json" hidden (change)="importData($event)" />
        </div>
      </div>
    </header>

    <!-- Mobile Bottom Tab Bar -->
    <nav class="mobile-nav">
      <a routerLink="/" [routerLinkActiveOptions]="{exact: true}" routerLinkActive="active" class="mnav-item">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <path d="M9 22V12h6v10"/>
        </svg>
        <span>HEM</span>
      </a>
      <a routerLink="/practice" routerLinkActive="active" class="mnav-item">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="10 8 16 12 10 16 10 8"/>
        </svg>
        <span>ÖVA</span>
      </a>
      <a routerLink="/create" routerLinkActive="active" class="mnav-item">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/>
          <path d="M12 5v14"/>
        </svg>
        <span>SKAPA</span>
      </a>
      <a routerLink="/help" routerLinkActive="active" class="mnav-item">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>HJÄLP</span>
      </a>
    </nav>

    @if (syncModalOpen()) {
      <jbg-github-sync-modal (closed)="syncModalOpen.set(false)" />
    }
  `,
  styles: `
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 24px;
      border-bottom: 1px solid var(--color-divider);
      background: var(--color-bg);
      font-family: var(--font-body);
    }
    .topbar-left {
      display: flex;
      align-items: center;
      gap: var(--space-6);
    }
    .nav-brand {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 19px;
      letter-spacing: 0.02em;
      color: var(--color-text);
      text-decoration: none;
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .topnav {
      display: flex;
      gap: var(--space-4);
    }
    .tnav {
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 500;
      color: var(--color-neutral-600);
      text-decoration: none;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      transition: color 0.15s, background-color 0.15s;
    }
    .tnav:hover {
      color: var(--color-accent-700);
    }
    .tnav.active {
      color: var(--color-accent-700);
      background: var(--color-accent-100);
      font-weight: 600;
    }

    /* Sync button */
    .sync-btn {
      position: relative;
    }
    .sync-dot {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-neutral-400);
    }
    .sync-unconfigured .sync-dot { background: var(--color-neutral-400); }
    .sync-synced .sync-dot { background: var(--success); }
    .sync-syncing .sync-dot {
      background: var(--color-accent);
      animation: pulse 1s ease-in-out infinite;
    }
    .sync-error .sync-dot { background: var(--color-accent-700); }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }

    .menu-wrap { position: relative; }
    .menu-backdrop { position: fixed; inset: 0; z-index: 99; }
    .menu {
      position: absolute; right: 0; top: calc(100% + 6px);
      background: #fffdf7; border: 1px solid var(--color-divider); border-radius: var(--radius);
      padding: var(--space-2); min-width: 220px; z-index: 100;
      box-shadow: var(--shadow-md);
    }
    .menu-item {
      display: block; width: 100%; background: none; border: none;
      color: var(--color-neutral-700); font-size: 13px; font-family: var(--font-body);
      padding: 8px 12px; text-align: left; cursor: pointer; border-radius: var(--radius-sm);
      transition: background 0.15s, color 0.15s;
    }
    .menu-item:hover { background: var(--color-accent-100); color: var(--color-accent-700); }
    .menu-divider {
      height: 1px; background: var(--color-divider);
      margin: 4px 8px;
    }
    .menu-volume {
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .volume-label {
      font-size: 11px;
      color: var(--color-neutral-600);
      font-weight: 500;
    }
    .volume-slider {
      width: 100%;
      height: 4px;
      background: var(--color-neutral-200);
      border-radius: 2px;
      outline: none;
      -webkit-appearance: none;
      cursor: pointer;
    }
    .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--color-accent);
      cursor: pointer;
      transition: transform 0.1s;
    }
    .volume-slider::-webkit-slider-thumb:hover {
      transform: scale(1.15);
    }

    /* Mobile navigation bottom tab bar */
    .mobile-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 50;
      grid-template-columns: repeat(4, 1fr);
      border-top: 1px solid var(--color-divider);
      background: var(--color-bg);
    }
    .mnav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      padding: 10px 4px;
      background: transparent;
      border: none;
      color: var(--color-neutral-600);
      text-decoration: none;
      font-family: var(--font-body);
      font-size: 10px;
      letter-spacing: 0.04em;
    }
    .mnav-item.active {
      color: var(--color-accent-700);
      background: var(--color-accent-100);
      font-weight: 600;
    }

    @media (max-width: 640px) {
      .topbar {
        padding: var(--space-3) var(--space-4);
      }
      .nav-brand {
        font-size: 16px;
      }
      .topnav {
        display: none;
      }
      .mobile-nav {
        display: grid;
      }
    }
  `,
})
export class TopBarComponent {
  protected readonly storage = inject(StorageService);

  menuOpen = signal(false);
  syncModalOpen = signal(false);

  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.storage.setMetronomeVolume(+input.value);
  }

  syncTitle(): string {
    const status = this.storage.syncStatus();
    switch (status) {
      case 'synced':       return 'GitHub-synk: OK';
      case 'syncing':      return 'GitHub-synk: Synkar...';
      case 'error':        return 'GitHub-synk: Fel – klicka för att konfigurera';
      default:             return 'GitHub-synkronisering (ej konfigurerad)';
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
