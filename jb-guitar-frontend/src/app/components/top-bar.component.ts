import {Component, inject, signal} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {StorageService} from '../services';

@Component({
  selector: 'jbg-top-bar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <a class="logo" routerLink="/"><img src="app-logo.png"
                                          alt="applogo"
                                          height="32"
                                          width="32"/><span>JB GUITAR</span></a>
      <div class="topbar-right">
        <nav class="topnav">
          <a class="tnav" routerLink="/practice" routerLinkActive="active">ÖVA</a>
          <a class="tnav" routerLink="/create" routerLinkActive="active">SKAPA</a>
          <a class="tnav" routerLink="/help" routerLinkActive="active">HJÄLP</a>
        </nav>
        <div class="menu-wrap">
          <button class="gear-btn" (click)="menuOpen.set(!menuOpen())" title="Data">⚙</button>
          @if (menuOpen()) {
            <div class="menu-backdrop" (click)="menuOpen.set(false)"></div>
            <div class="menu">
              <button class="menu-item" (click)="exportData()">📥 Exportera till fil</button>
              <button class="menu-item" (click)="fileInput.click()">📤 Importera från fil</button>
            </div>
          }
          <input #fileInput type="file" accept=".json" hidden (change)="importData($event)" />
        </div>
      </div>
    </header>
  `,
  styles: `
    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 16px; height: 48px;
      border-bottom: 1px solid var(--border); background: var(--surf);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
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
      padding: 4px; min-width: 190px; z-index: 100;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .menu-item {
      display: block; width: 100%; background: none; border: none;
      color: var(--txt2); font-size: 11px; padding: 8px 12px;
      text-align: left; cursor: pointer; border-radius: 4px;
      font-family: inherit; transition: background 0.15s, color 0.15s;
    }
    .menu-item:hover { background: var(--accent-dim); color: var(--accent); }
  `,
})
export class TopBarComponent {
  private readonly storage = inject(StorageService);

  menuOpen = signal(false);

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
    } catch (e) {
      alert('Kunde inte läsa filen. Kontrollera att det är en giltig JSON-fil.');
    }
    input.value = '';
  }
}
