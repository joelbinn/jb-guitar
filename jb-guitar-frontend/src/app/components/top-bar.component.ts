import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'jbg-top-bar',
    imports: [RouterLink, RouterLinkActive],
    template: `
    <header class="topbar">
      <a class="logo" routerLink="/">JB GUITAR</a>
      <nav class="topnav">
        <a class="tnav" routerLink="/practice" routerLinkActive="active">ÖVA</a>
        <a class="tnav" routerLink="/create" routerLinkActive="active">SKAPA</a>
      </nav>
    </header>
  `,
    styles: `
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      height: 48px;
      border-bottom: 1px solid var(--border);
      background: var(--surf);
    }
    .logo {
      font-weight: 700;
      letter-spacing: 3px;
      font-size: 13px;
      color: var(--accent);
      text-decoration: none;
    }
    .topnav {
      display: flex;
      gap: 0;
    }
    .tnav {
      background: none;
      border: none;
      color: var(--txt3);
      font-size: 11px;
      letter-spacing: 1px;
      padding: 6px 12px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      text-decoration: none;
      text-transform: uppercase;
      transition: color 0.15s, border-color 0.15s;
    }
    .tnav:hover {
      color: var(--txt2);
    }
    .tnav.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }
  `,
})
export class TopBarComponent { }
