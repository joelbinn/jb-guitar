import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBarComponent } from './components/top-bar.component';

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
    }
    .app-content {
      flex: 1;
      padding: 20px 16px;
    }
  `,
})
export class App { }
