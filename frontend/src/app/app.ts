import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  host: { class: 'app-root-host' },
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 100dvh;
    }
  `,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
