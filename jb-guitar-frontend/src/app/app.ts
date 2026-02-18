import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'jbg-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: ``,
})
export class App {}
