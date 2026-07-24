import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {TopBarComponent} from './components/top-bar.component';

@Component({
  selector: 'jbg-root',
  imports: [RouterOutlet, TopBarComponent],
  template: `
    <jbg-top-bar />
    <main class="app-content">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--color-bg);
      color: var(--color-text);
      font-family: var(--font-body);
    }
    .app-content {
      flex: 1;
      width: 100%;
      max-width: 1080px;
      margin: 0 auto;
      padding: var(--space-8) var(--space-4);
      box-sizing: border-box;
    }
    @media (max-width: 640px) {
      .app-content {
        padding: var(--space-5) var(--space-4) calc(64px + var(--space-6));
      }
    }
  `,
})
export class App { }
