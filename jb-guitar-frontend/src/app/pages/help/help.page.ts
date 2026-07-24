import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'jbg-help',
  template: `
    <div class="breadcrumb" (click)="goBack()">← Hem</div>
    <h2 class="page-title">Hjälp & guide</h2>

    <div class="help-content">
      <h3 style="color: var(--color-accent-700);">Välkommen till JB Guitar</h3>
      <p>En app för att organisera och öva gitarrövningar strukturerat.</p>

      <h4>Öva</h4>
      <p>Se dina övningsplaner och starta träningspass.</p>
      <ul>
        <li><strong>Starta övning:</strong> klicka på en plan för att börja ett träningspass.</li>
        <li><strong>Föregående/Nästa:</strong> navigera mellan övningar i planen.</li>
        <li><strong>Pausa session:</strong> pausa och spara ditt framsteg.</li>
        <li><strong>Börja om:</strong> starta om sessionen från början.</li>
        <li><strong>Ta bort:</strong> radera sessionen helt.</li>
      </ul>

      <h4>Timer</h4>
      <p>Varje övning har en inbyggd timer.</p>
      <ul>
        <li><strong>Ställ tid:</strong> ändra antal minuter innan timern startar.</li>
        <li><strong>Start/Pausa/Återställ:</strong> styr nedräkningen.</li>
        <li><strong>Ljud:</strong> spelas när tiden är slut.</li>
      </ul>

      <h4>Metronom</h4>
      <p>Håller takten under övning.</p>
      <ul>
        <li><strong>BPM:</strong> 20–300 slag per minut.</li>
        <li><strong>Taktart:</strong> täljare 1–16.</li>
        <li><strong>Slag-nivåer:</strong> klicka en prick för att cykla stark / mellan / svag.</li>
      </ul>

      <h4>Skapa</h4>
      <p>Skapa och hantera övningar och övningsplaner.</p>
      <ul>
        <li><strong>Övningar:</strong> namn, källa (YouTube/JTC/Soundslice/Annan), URL, valfri beskrivning.</li>
        <li><strong>Övningsplaner:</strong> lägg till, ta bort och ordna om övningar i en ordnad lista.</li>
      </ul>

      <h4>Tips</h4>
      <ul>
        <li>Använd beskrivningen för att anteckna svåra partier.</li>
        <li>Skapa flera planer för olika nivåer eller fokusområden.</li>
        <li>Pausera en session för att fortsätta senare.</li>
      </ul>
    </div>
  `,
  styles: `
    .breadcrumb {
      font-size: 11px;
      color: var(--color-neutral-500);
      cursor: pointer;
      margin-bottom: var(--space-2);
    }
    .page-title {
      margin-bottom: var(--space-6);
      font-size: 24px;
    }
    .help-content {
      max-width: 640px;
    }
    .help-content h3 {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 18px;
      margin-bottom: var(--space-2);
    }
    .help-content h4 {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 16px;
      color: var(--color-text);
      margin-top: var(--space-6);
      margin-bottom: var(--space-2);
    }
    .help-content p {
      color: var(--color-neutral-700);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: var(--space-2);
    }
    .help-content ul {
      color: var(--color-neutral-700);
      font-size: 14px;
      line-height: 1.7;
      padding-left: 1.2em;
      margin-bottom: var(--space-4);
    }
    .help-content li {
      margin-bottom: var(--space-1);
    }
    .help-content strong {
      color: var(--color-text);
    }
  `,
})
export class HelpPage {
  private readonly router = inject(Router);

  goBack(): void {
    this.router.navigate(['/']);
  }
}
