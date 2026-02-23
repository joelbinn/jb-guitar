# Kravspecifikation: JB Guitar

## 1. Produktöversikt

### 1.1 Syfte

JB Guitar är en webapplikation designad för gitarrister att organisera, planera
och genomföra strukturerade övningspass. Applikationen möjliggör användare att
skapa individuella övningar, sätta ihop dem i övningsplaner, och sedan genomföra
dessa planer med inbyggda verktyg för tidhantering och taktuppehållning.

### 1.2 Målgrupp

- Gitarrister på alla nivåer som vill strukturera sin övning
- Användare som övar enligt externa övningskällor (YouTube, JTC Guitar,
  Soundslice)
- Musikelever och självstudierande gitarrister

### 1.3 Huvudmål

Skapa ett enkelt verktyg som hjälper gitarrister att:

1. Organisera och referera till övningar från olika källplatser
2. Planera träningspass genom att kombinera övningar
3. Genomföra träningspass med stödjande verktyg (timer, metronom)
4. Spara framsteg och kunna återuppta sessioner senare
5. Exportera/importera data för säkerhetskopior

---

## 2. Funktionella Krav

### 2.1 Övningshantering

#### 2.1.1 Skapa övning

- **Krav:** Användaren ska kunna skapa nya övningar
- **Input:**
    - Namn (obligatoriskt, text)
    - Källplats (obligatoriskt, val mellan: YouTube, JTC Guitar, Soundslice,
      Annat)
    - URL (obligatorisk, länk)
    - Beskrivning (valfri, långtext med stöd för radbrytningar)
- **Output:** Sparad övning med unikt ID och tidsstämpel (createdAt)
- **Lagring:** I local storage

#### 2.1.2 Se övningar

- **Krav:** Användaren ska kunna se en lista/grid av alla skapade övningar
- **Visning:** Övningskort med namn och källplats
- **Handling:** Klick på kort öppnar redigeringsvyn

#### 2.1.3 Redigera övning

- **Krav:** Användaren ska kunna uppdatera en befintlig övning
- **Ändringsbar:** Namn, källplats, URL, beskrivning
- **Lagring:** Ändringar sparas omedelbar i local storage

#### 2.1.4 Ta bort övning

- **Krav:** Användaren ska kunna radera en övning
- **Begränsning:** Ska inte kunna raderas om den är använd i en aktiv/pausad
  session
- **Lagring:** Omedelbar borttagning från local storage

---

### 2.2 Övningsplanhantering

#### 2.2.1 Skapa övningsplan

- **Krav:** Användaren ska kunna skapa en ny övningsplan
- **Input:**
    - Namn (obligatoriskt, text)
    - Övningar (valfri initialt, kan läggas till senare)
- **Output:** Sparad plan med unikt ID, innehållande ordnad lista av
  övningsreferenser
- **Lagring:** I local storage

#### 2.2.2 Se övningsplaner

- **Krav:** Användaren ska kunna se alla skapade övningsplaner
- **Visning:** Grid med kort för varje plan
- **Information:** Plannamn och antal övningar
- **Handling:** Klick på kort öppnar redigeringsvyn

#### 2.2.3 Redigera övningsplan

- **Krav:** Användaren ska kunna ändra en övningsplan
- **Funktionalitet:**
    - Lägg till övningar från befintliga övningar
    - Ta bort övningar från planen
    - Ändra ordning på övningar (drag & drop)
    - Ändra plannamn
- **Validering:** Plan ska innehålla minst en övning
- **Lagring:** Ändringar sparas omedelbar

#### 2.2.4 Ta bort övningsplan

- **Krav:** Användaren ska kunna radera en övningsplan
- **Begränsning:** Ska inte kunna raderas om den är använd i en aktiv/pausad
  session
- **Lagring:** Omedelbar borttagning

---

### 2.3 Sessionshantering

#### 2.3.1 Starta session

- **Krav:** Användaren ska kunna starta en ny övningssession från en vald
  övningsplan
- **Initiering:**
    - Skapar session med unikt ID
    - Status sätts till "active"
    - Spara startidspunkt (startedAt)
    - Spara tidpunkt för senaste uppdatering (updatedAt)
    - Initiera all övningar i planen som "not completed"
    - Sätt första övningen som aktuell

#### 2.3.2 Se sessioner (Öva-sida)

- **Krav:** Användaren ska se en översikt av sina övningssessioner
- **Visning:**
    - Senaste aktiv/pausad session i destacat kort med information:
        - Plannamn
        - Antal genomförda/totala övningar
        - Förloppsbar
        - Aktuell övning (namn, URL)
        - Status (Pågående/Pausad)
        - Tidpunkt för senast öppnad (datum och tid)
        - Förväntad tidsåtgång baserat på timer per övning
        - Knapp "Fortsätt →"
    - Övriga sessioner i 2x grid med kort innehållande:
        - Plannamn
        - Antal genomförda/totala övningar
        - Förloppsbar
        - Tidpunkt för senast öppnad
        - Förväntad tidsåtgång
        - Status ikon (om slutförd)
        - Knapp "Fortsätt →" eller "Se igen →"

#### 2.3.3 Se landningssida

- **Krav:** Landningssidan ska visa snabb åtkomst till senaste session
- **Visning:**
    - Destacat kort med senaste aktiv/pausad session (samma info som Öva-sidan)
    - Om ingen session: "Ingen övningssession påbörjad" med knapp "Starta
      övningssession"

#### 2.3.4 Genomför övning i session

- **Krav:** Användaren ska kunna genomföra övningar i en session
- **Layout:**
    - Vänsterpanel: Övningsplan med alla övningar listade
        - Aktuell övning markerad
        - Klickbar för att välja annan övning direkt
    - Huvudpanel: Aktuell övning visad i iframe
- **Information om övningen:**
    - Namn
    - URL (för extern länk)
    - Beskrivning (om finns)
- **Navigation:**
    - Knapp "← Föregående" (inaktiv om första övningen)
    - Knapp "Nästa →" (inaktiv om sista övningen)
    - Breadcrumb för navigation tillbaka
- **Lagring:** Aktuell övning sparas omedelbar i session

#### 2.3.5 Pausa session

- **Krav:** Användaren ska kunna pausa en session
- **Effekt:**
    - Status ändras till "paused"
    - updatedAt uppdateras
    - Session sparas med aktuell övning och framsteg
- **Lagring:** Omedelbar persistering

#### 2.3.6 Återuppta session

- **Krav:** Användaren ska kunna fortsätta en pausad session
- **Effekt:**
    - Status ändras från "paused" tillbaka till "active"
    - updatedAt uppdateras
    - Samma övning visas som när sessionnen pausades
- **Lagring:** Omedelbar persistering

#### 2.3.7 Markera övning som slutförd

- **Krav:** När användaren går till nästa övning ska den aktuella markeras som
  slutförd
- **Effekt:**
    - Övningen markeras som "completed"
    - updatedAt uppdateras
- **Lagring:** Omedelbar persistering

#### 2.3.8 Slutför session

- **Krav:** När sista övningen är slutförd ska sessionen automatiskt markeras
  som slutförd
- **Effekt:**
    - Status ändras till "completed"
    - updatedAt uppdateras
    - Sessionen visas fortfarande men kan inte ändras
- **Lagring:** Omedelbar persistering

#### 2.3.9 Starta om session

- **Krav:** Användaren ska kunna starta om en session från början
- **Effekt:**
    - Nollställer alla övningar till "not completed"
    - Status sätts tillbaka till "active"
    - Första övningen blir aktuell
    - updatedAt uppdateras
- **Lagring:** Omedelbar persistering

#### 2.3.10 Ta bort session

- **Krav:** Användaren ska kunna radera en session
- **Lagring:** Omedelbar borttagning från local storage

---

### 2.4 Timer-funktionalitet

#### 2.4.1 Timer per övning

- **Krav:** Varje övning i en session kan ha en inställd tid
- **Beteende:**
    - Default: 5 minuter per övning
    - Varje övning sparar sin egen timinställning per session
    - Timinställning ändras inte vid "Börja om"
- **Lagring:** Sparas per övning i ExerciseSessionState

#### 2.4.2 Starta/Pausa timer

- **Krav:** Användaren ska kunna starta och pausa en timer
- **Visning:** Timer visar återstående tid (MM:SS)
- **Ljud:** Ett ljud spelas när tiden är slut

#### 2.4.3 Ändra timinställning

- **Krav:** Användaren ska kunna ändra antalet minuter innan timer startas
- **Input:** Spinner eller textinput (heltal)
- **Effekt:** Uppdaterar countdown

#### 2.4.4 Återställ timer

- **Krav:** Användaren ska kunna nollställa timern till ursprungligt värde
- **Lagring:** Sparar automatiskt ändringar

#### 2.4.5 Förväntad tidsåtgång

- **Krav:** Applikationen ska visa förväntat totalt övningstid för en session
- **Beräkning:** Summan av alla övningars timinställningar
- **Visning:**
    - På sessionskort: "⏱ XX min"
    - Uppdateras dynamiskt om timer ändras
    - Visas både på landningssida och öva-sida

---

### 2.5 Metronomfunktionalitet

#### 2.5.1 Metronom i session

- **Krav:** Inbyggd metronom för att hålla takten under övning
- **Lagring:** Inställningar sparas per övning i ExerciseSessionState

#### 2.5.2 BPM-inställning

- **Krav:** Användaren ska kunna ställa in tempo (beats per minute)
- **Intervall:** 20-300 BPM
- **Input:** Spinner eller textinput
- **Default:** 100 BPM

#### 2.5.3 Taktartsval

- **Krav:** Användaren ska kunna ställa in taktart
- **Input:** Två spinners
    - Täljare: 1-16 (antal slag per takt)
    - Nämnare: 2, 4, eller 8 (noter per slag)
- **Exempel:** 4/4, 3/4, 7/8
- **Default:** 4/4

#### 2.5.4 Slag-styrka-profil

- **Krav:** Användaren ska kunna definiera ljud för varje slag i takten
- **Slag-nivåer:**
    - Stark (1050 Hz)
    - Mellan (880 Hz)
    - Svag (660 Hz)
- **Funktionalitet:**
    - En styrka för varje slag baserat på taktarts-täljare
    - Antal slag = täljare (t.ex. 7/8 = 7 slag)
    - Kan anpassas individuellt per slag
    - Ändra genom att klicka på visuella prickar

#### 2.5.5 Visuell feedback

- **Krav:** Prickar ska visualisera metronomen och taktarten
- **Storlek:**
    - Stor = Stark ljud
    - Mellan = Mellan ljud
    - Liten = Svag ljud
- **Animation:** Prickar animeras/tänds synkroniserat med metronomljud
- **Uppdatering:** Visuell feedback uppdateras när slag-styrka ännas

#### 2.5.6 Start/Stopp

- **Krav:** Knapp för att starta och stoppa metronomen
- **Beteende:**
    - Klick startar metronomljud
    - Klick igen stoppar
    - Metronomen stannar när sessionen byter övning

#### 2.5.7 Snabb slag-styrka-anpassning

- **Krav:** Användaren ska kunna snabbt ändra slag-styrka
- **Interaktion:** Klicka på en prick för att cykla mellan: stark → mellan →
  svag → stark
- **Effekt:** Uppdateras omedelbar både visuellt och vid nästa metronom-ljud

---

### 2.6 Navigation och Breadcrumb

#### 2.6.1 Breadcrumb-navigering

- **Krav:** Användaren ska kunna navigera med breadcrumbs från alla vyer
- **Funktionalitet:**
    - Länk för att gå tillbaka (← Hem/Tillbaka)
    - Visas i alla vyer utom landningssidan
    - Klick sparar sessionsstatus före navigering

#### 2.6.2 Toppmeny

- **Krav:** Huvudmeny med två val
    - "Öva" - för att genomföra sessioner
    - "Skapa" - för att skapa övningar och planer
    - "Hjälp" - för att se dokumentation
- **Funktionalitet:** Navigering mellan sektioner
- **Visual:** Visar aktuell sektion

#### 2.6.3 Default-routing

- **Krav:** Roten (/) ska dirigera till "Öva"-sidan
- **Effekt:** Användare kommer direkt till huvudaktiviteten

---

### 2.7 Datapersistering och Export/Import

#### 2.7.1 Local Storage

- **Krav:** All data ska lagras i local storage
- **Data:** Övningar, planer, sessioner
- **Uppdatering:** Automatisk persistering vid varje ändring

#### 2.7.2 Export av data

- **Krav:** Användaren ska kunna exportera all data till en JSON-fil
- **Format:** JSON
- **Innehål:** All övningar, planer och sessioner
- **Använding:** Säkerhetskopia och överföring mellan enheter/browsers

#### 2.7.3 Import av data

- **Krav:** Användaren ska kunna importera data från en tidigare exporterad fil
- **Format:** JSON
- **Validering:** Kontrollera att fil är giltig
- **Behov:** Låta användare välja om man vill skriva över eller slå ihop

#### 2.7.4 Datamigration

- **Krav:** System ska hantera uppdateringar av datamodeller
- **Strategi:** Automatisk migration när gamla sessioner läses
- **Exempel:**
    - Lägg till default-värden för timerMinutes = 5 för gamla sessioner
    - Lägg till default metronominställningar för gamla sessioner

---

## 3. UX/Design-Krav

### 3.1 Överordnad design

#### 3.1.1 Layout

- **Toppmeny:** Permanent, visar navigering och app-namn
- **Huvudinnehål:** Flex layout som anpassar sig till innehål
- **Responsiv:** Anpassar sig till olika skärmstorlekar (mobil, tablet, desktop)

#### 3.1.2 Visuell hierarki

- **Primär handling:** Tydlig knapp för att starta session/nästa övning
- **Sekundär handling:** Mindre/diskreta knappar
- **Information:** Text-storlek reflekterar prioritet

#### 3.1.3 Färgschema

- **Accent-färg:** För viktig information och primär handling
- **Text-nivåer:** Minst 3 nivåer (primär, sekundär, tertiary)
- **Kontrast:** Måste uppfylla WCAG AA-krav

#### 3.1.4 Komponenter

- **Kort:** För att visa sessioner, övningar, planer
    - Visar relevanta metadata
    - Klickbar för huvudinstruktion
    - Visar status-information
- **Knapp-variabler:**
    - Primary (viktig handling)
    - Secondary/Ghost (mindre viktig)
    - Small (compact)
- **Input-komponenter:** Spinner för numeriska värden, select för val

### 3.2 Öva-sida (Sessionskord)

#### 3.2.1 Senaste session-kort

- **Prominence:** Destacat kort överst
- **Information:**
    - Plannamn (stort, tydligt)
    - Status (Pågående/Pausad)
    - Framstegsmätare (visuell bar)
    - Antal övningar slutförda/totalt
    - Aktuell övning (namn, URL)
    - Tidpunkt för senast öppnad
    - Förväntad tidsåtgång
- **Knappar:**
    - "Fortsätt →" (primär)
    - "Starta ny session" (sekundär)

#### 3.2.2 Övriga sessioner-grid

- **Layout:** 2-kolumns grid
- **Kort-info:**
    - Plannamn
    - Framstegsmätare
    - Antal övningar
    - Tidpunkt för senast öppnad
    - Förväntad tidsåtgång
    - Status-ikon (✓ om slutförd)
    - Knapp "Fortsätt →" eller "Se igen →"
- **Lägg till session:** "Ny session" kort med + ikon

#### 3.2.3 Tom session-lista

- **Fallback:** "Ingen övningssession påbörjad" med knapp "Starta
  övningssession"

### 3.3 Övningssession-vy

#### 3.3.1 Layout

- **Vänsterpanel:** Övningsplan
    - Lista av alla övningar
    - Markering av aktuell övning
    - Visuell indikator för slutförda övningar
    - Klickbar för att välja annan övning
- **Huvudpanel:** Aktuell övning
    - Övningens namn
    - Iframe för att visa övningens innehål
    - Övningens beskrivning
    - Timer och metronom nedan

#### 3.3.2 Navigering

- **Föregående/Nästa:** Knappar för navigering mellan övningar
- **Breadcrumb:** Länk till Öva-sidan

#### 3.3.3 Timer och Metronom

- **Timer:**
    - Visar återstående tid (MM:SS)
    - Start/Pausa-knapp
    - Återställ-knapp
    - Input för att ändra minuter
- **Metronom:**
    - BPM-spinner
    - Taktart-spinners (täljare och nämnare)
    - Visuella prickar för slag
    - Start/Stopp-knapp
    - Klickbar på prickar för att ändra styrka

### 3.4 Skapa-sida

#### 3.4.1 Övningssektion

- **Övningskort-grid:**
    - Visar alla skapade övningar
    - Namn och källplats
    - Klickbar för att redigera
- **"Ny övning"-kort:** Med + ikon
- **Redigeringsvyn:**
    - Namn-input
    - Källplats-select (YouTube, JTC, Soundslice, Annat)
    - URL-input
    - Beskrivning-textarea
    - Knapp "Spara"
    - Knapp "Radera" (om övningen redan finns)

#### 3.4.2 Överartssektion

- **Plankort-grid:**
    - Visar alla planer
    - Namn och antal övningar
    - Klickbar för att redigera
- **"Ny plan"-kort:** Med + ikon
- **Redigeringsvyn:**
    - Namn-input
    - Lista av övningar i planen
        - Drag & drop-sorterable
        - Visa för varje övning: namn, källplats
        - Knapp × för att ta bort
    - Knapp "+ Lägg till övning"
        - Visar modal/picker med alla tillgängliga övningar
        - Klick lägger till i planen
    - Knapp "Spara"
    - Knapp "Radera" (om planen redan finns)

### 3.5 Hjälp-sida

#### 3.5.1 Innehål

- **Sektion för varje huvudfeature:**
    - Öva
    - Timer
    - Metronom
    - Skapa (Övningar och Planer)
    - Data (Export/Import)
    - Tips & Tricks
- **Format:** Rubriker, beskrivningar och punktlistor
- **Länk:** Från toppmeny

### 3.6 Accessibility (WCAG AA)

#### 3.6.1 Färgkontrast

- **Krav:** Minst 4.5:1 för text
- **Testning:** AXE-test

#### 3.6.2 Fokushantering

- **Krav:** All interaktiva element måste vara fokuserbara
- **Ordning:** Logisk tabordning

#### 3.6.3 ARIA

- **Krav:** Relevanta ARIA-attribut på komponenter
- **Buttons:** aria-label om inte synlig text finns
- **Forms:** Label-associations

#### 3.6.4 Tangentbordnavigation

- **Krav:** All funktionalitet måste vara tillgänglig via tangentbord
- **Escape:** Stänger dialogs och moaler

---

## 4. Tekniska Krav

### 4.1 Arkitektur

- **Frontend Framework:** Angular (standalone components, signals-based)
- **State Management:** Signals för lokal komponent-state
- **Routing:** Angular Router med lazy loading
- **Styling:** CSS med CSS-variabler för tema

### 4.2 Data-modeller

```typescript
interface Exercise {
  id: string;
  name: string;
  source: 'youtube' | 'jtc' | 'soundslice' | 'other';
  url: string;
  description?: string;
  createdAt: string; // ISO
}

interface PracticePlan {
  id: string;
  name: string;
  exerciseIds: string[]; // Sorterad lista
  createdAt: string; // ISO
}

interface ExerciseSessionState {
  exerciseId: string;
  completed: boolean;
  timerMinutes: number;
  metronomeConfig?: {
    bpm: number;
    numerator: number; // 1-16
    denominator: 2 | 4 | 8;
    beatProfile: ('stark' | 'mellan' | 'svag')[];
  };
}

interface Session {
  id: string;
  planId: string;
  status: 'active' | 'paused' | 'completed';
  currentExerciseId: string;
  exerciseState: ExerciseSessionState[];
  startedAt: string; // ISO
  updatedAt: string; // ISO
}
```

### 4.3 Persistering

- **Storage:** LocalStorage (JSON-baserat)
- **Key-namning:** `jbguitar:exercises`, `jbguitar:plans`, `jbguitar:sessions`
- **Sidoeffekt:** Automatisk uppdatering vid varje ändring

### 4.4 Performance

- **Bundle-size:** Hålla liten för snabb nedladdning
- **Change Detection:** OnPush strategy
- **Memory:** Garbige collection av completed sessions

### 4.5 Browser-support

- **Minsta version:** Modern browsers (Chrome, Firefox, Safari, Edge)
- **APIs:** LocalStorage, Web Audio API (för metronom)
- **Fallback:** Ingen fallback för Web Audio API

---

## 5. Framtida Features (inte inkluderade i MVP)

- Backend med persistering
- Serveröversättning av data
- Flagga för "öppna i iframe" kontra ny tab
- Statistik och framstegsspårning
- Möjlighet att dela planer
- Cloud-synkronisering mellan enheter
- Möjlighet att importera planer från andra användare

---

## 6. Acceptanskriterier för Slutförande

- [ ] All funktionalitet från sektion 2 är implementerad
- [ ] All UX/Design krav från sektion 3 är implementerad
- [ ] WCAG AA-kompatibilitet är verifierad
- [ ] Datamigration fungerar för gamla sessioner
- [ ] Export/Import fungerar korrekt
- [ ] Local Storage-persistering är tillförlitlig
- [ ] Dokumentation (Help-sida) är komplett
- [ ] Applikationen är testbar på mobil och desktop
