import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'jbg-help',
  template: `
    <div class="breadcrumb" (click)="goBack()">← Hem</div>
    <div class="page-title">Hjälp & Guide</div>

    <div class="help-section">
      <h2>Välkommen till JB Guitar!</h2>
      <p>En app för att organisera och öva gitarrövningar strukturerat.</p>
    </div>

    <div class="help-section">
      <h3>🎯 Öva</h3>
      <p>Här kan du se dina övningsplaner och starta träningspass.</p>
      <ul>
        <li><strong>Starta övning:</strong> Klicka på en plan för att börja ett träningspass</li>
        <li><strong>Föregående/Nästa:</strong> Navigera mellan övningar i planen</li>
        <li><strong>Pausa session:</strong> Pausa och spara ditt framsteg</li>
        <li><strong>Börja om:</strong> Starta om sessionen från början (nollställer framsteg)</li>
        <li><strong>Ta bort:</strong> Radera sessionen helt</li>
      </ul>
    </div>

    <div class="help-section">
      <h3>⏱️ Timer</h3>
      <p>Varje övning har en inbyggd timer för att hålla tiden.</p>
      <ul>
        <li><strong>Ställ tid:</strong> Ändr antal minuter innan timern startar</li>
        <li><strong>Start/Pausa:</strong> Starta eller pausa timern</li>
        <li><strong>Återställ:</strong> Nollställ timern till inställd tid</li>
        <li><strong>Ljud:</strong> Ett ljud spelas när tiden är slut</li>
        <li><strong>Sparad inställning:</strong> Din timinställning sparas per session</li>
      </ul>
    </div>

    <div class="help-section">
      <h3>🎵 Metronom</h3>
      <p>En inbyggd metronom för att hålla takten under övning.</p>
      <ul>
        <li><strong>BPM:</strong> Ställ in tempo från 20 till 300 slag per minut</li>
        <li><strong>Taktarts-inställning:</strong> Välj taktart med två spinners
          <ul>
            <li>Täljare: 1-16 (hur många slag per takt)</li>
            <li>Nämnare: 2, 4 eller 8 (noter per slag)</li>
            <li>Exempel: 4/4, 3/4, 7/8</li>
          </ul>
        </li>
        <li><strong>Slag-nivåer:</strong> Anpassa varje slag individuellt:
          <ul>
            <li><strong>Stark</strong> (1050 Hz, stor prick) - vanligtvis första slaget</li>
            <li><strong>Mellan</strong> (880 Hz, mellan prick) - betoning på vissa slag</li>
            <li><strong>Svag</strong> (660 Hz, liten prick) - vanliga slag</li>
          </ul>
        </li>
        <li><strong>Visuell feedback:</strong> Prickar animeras synkroniserat med ljud</li>
        <li><strong>Start/Stopp:</strong> Knapp för att starta och stoppa metronomen</li>
        <li><strong>Snabb anpassning:</strong> Klicka på en prick för att snabbt ändra dess styrka
        </li>
        <li><strong>Sparad inställning:</strong> Metronominställningar sparas per övning</li>
      </ul>
    </div>

    <div class="help-section">
      <h3>✏️ Skapa</h3>
      <p>Här kan du skapa och hantera övningar och övningsplaner.</p>

      <h4>Övningar</h4>
      <ul>
        <li><strong>Ny övning:</strong> Klicka "+ Ny övning" för att skapa en</li>
        <li><strong>Namn:</strong> Namn på övningen</li>
        <li><strong>Källa:</strong> Välj från YouTube, JTC Guitar, Soundslice eller Annan</li>
        <li><strong>URL:</strong> Länk till övningen (obligatoriskt)</li>
        <li><strong>Beskrivning:</strong> Valfri anteckning om övningen (stöder radbrytningar)</li>
        <li><strong>Redigera:</strong> Klicka på en övning för att ändra</li>
        <li><strong>Ta bort:</strong> Radera övningen</li>
      </ul>

      <h4>Övningsplaner</h4>
      <ul>
        <li><strong>Ny plan:</strong> Klicka "+ Ny plan" för att skapa en</li>
        <li><strong>Lägg till övningar:</strong> Klicka "+ Lägg till övning" för att välja vilka övningar planen ska innehålla</li>
        <li><strong>Sortera:</strong> Dra & drop (⠿) för att ändra ordning på övningar</li>
        <li><strong>Ta bort övning:</strong> Klicka × för att ta bort en övning från planen</li>
        <li><strong>Redigera:</strong> Klicka på en plan för att ändra</li>
        <li><strong>Ta bort:</strong> Radera hela planen</li>
      </ul>
    </div>

    <div class="help-section">
      <h3>💾 Data</h3>
      <p>Hantera dina data och säkerhetskopior.</p>
      <ul>
        <li><strong>Exportera:</strong> Spara all data till en JSON-fil på din dator</li>
        <li><strong>Importera:</strong> Ladda in data från en tidigare sparad fil</li>
      </ul>
    </div>

    <div class="help-section">
      <h3>💡 Tips & Tricks</h3>
      <ul>
        <li>Använd beskrivningen för att anteckna svåra delar eller special-fokus</li>
        <li>Skapa flera planer för olika nivåer eller fokusområden</li>
        <li>Pausera en session för att spara ditt framsteg och fortsätta senare</li>
        <li>Exportera dina data regelbundet för säkerhetskopia</li>
      </ul>
    </div>
  `,
  styles: `
    .breadcrumb { font-size: 10px; color: var(--txt3); margin-bottom: 16px; cursor: pointer; }
    .page-title { font-size: 18px; font-weight: 700; color: var(--txt); margin-bottom: 20px; }
    .help-section { margin-bottom: 24px; }
    .help-section h2 {
      font-size: 16px; font-weight: 700; color: var(--accent); margin-bottom: 12px;
    }
    .help-section h3 {
      font-size: 14px; font-weight: 600; color: var(--txt); margin-bottom: 8px;
    }
    .help-section h4 {
      font-size: 12px; font-weight: 600; color: var(--txt2); margin-top: 12px; margin-bottom: 8px;
    }
    .help-section p {
      font-size: 12px; color: var(--txt2); line-height: 1.5; margin-bottom: 10px;
    }
    .help-section ul {
      font-size: 12px; color: var(--txt2); margin-left: 20px; line-height: 1.6;
    }
    .help-section li {
      margin-bottom: 6px;
    }
    .help-section strong { color: var(--txt); }
  `,
})
export class HelpPage {
  private readonly router = inject(Router);

  goBack(): void {
    this.router.navigate(['/']);
  }
}
