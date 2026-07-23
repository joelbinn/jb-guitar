import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'jbg-root',
  imports: [RouterOutlet],
  template: `
    <div class="jbg-container">
      <header class="jbg-header">
        <span class="jbg-nav-brand" (click)="navigateTo('')">JB GUITAR</span>
        <button type="button" class="btn btn-ghost btn-icon mob-btn" aria-label="Instrument">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </button>
      </header>

      <main class="jbg-main">
        <router-outlet />
      </main>

      <nav class="jbg-nav">
        <button type="button" [class.active]="isActive('')" (click)="navigateTo('')" class="jbg-nav-item" aria-label="Home">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
          <span>HEM</span>
        </button>
        <button type="button" [class.active]="isActive('practice')" (click)="navigateTo('practice')" class="jbg-nav-item" aria-label="Practice">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
          <span>ÖVA</span>
        </button>
        <button type="button" [class.active]="isActive('create')" (click)="navigateTo('create')" class="jbg-nav-item" aria-label="Create">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span>SKAPA</span>
        </button>
        <button type="button" [class.active]="isActive('help')" (click)="navigateTo('help')" class="jbg-nav-item" aria-label="Help">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>HJÄLP</span>
        </button>
      </nav>
    </div>
  `,
  styles: `
    .jbg-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      max-width: 430px;
      margin: 0 auto;
      box-shadow: 0 0 0 1px var(--color-divider);
    }

    .jbg-header {
      position: sticky;
      top: 0;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--color-divider);
      background: var(--color-bg);
    }

    .jbg-nav-brand {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 0.02em;
      color: var(--color-text);
      cursor: pointer;
    }

    .jbg-main {
      flex: 1;
      width: 100%;
      padding: var(--space-5) var(--space-4) calc(64px + var(--space-6));
      box-sizing: border-box;
    }

    .jbg-nav {
      position: sticky;
      bottom: 0;
      z-index: 5;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      border-top: 1px solid var(--color-divider);
      background: var(--color-bg);
    }

    .jbg-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 8px 4px 10px;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--color-neutral-600);
      min-height: 52px;
      font-family: var(--font-body);
      font-size: 10px;
      letter-spacing: 0.04em;
      transition: color 0.15s;
    }

    .jbg-nav-item.active {
      color: var(--color-accent);
    }

    .jbg-nav-item:hover {
      color: var(--color-accent-700);
    }

    .jbg-nav-item svg {
      width: 19px;
      height: 19px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url === '/' + (path ? path : '');
  }
}
