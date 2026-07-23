JB Guitar, en applikation för att öva gitarr
============================================

Funktion
--------
Denna applikation hjälper en gitarrist att öva sin gitarr genom att
ge stöd för att skapa övningar och övningsplaner/scheman.

Användaren kan definiera övningar genom att ange en länk till en övning
som finns publikt tillgänglig på:

- JTC Guitar
- Soundslice
- YouTube
- m.m

Användaren kan sedan sätta ihop en övningsplan/schema genom att välja
in olika övningar som skapats tidigare. Övningsplanen/schemat bestämmer
ordningen för hur de olika övningarna ska utföras.

Sedan kan användaren starta ett övningssession genom att välja en
övningsplan/schema. Då öppnas en instans av planen och vartefter man stegar
sig igenom planen, så öppnas den specifika övningen som ska utföras.
Applikationen kommer ihåg på vilken övning man befinner sig i och om man
avbryter och pausar sparas sessionen så att man kan återuppta den senare.

Applikationen har två huvudlägen:

- Genomför övningssession
- Skapa (övningar, övningsplaner)

Allting persisteras i local storage. Man kan spara till en lokal fil och samt
läsa upp allt från en lokal fil.

UX
--
Applikationen har en landningssida med toppmeny och en huvudpanel.

Huvudpanelen visar den senast genomförda övningssessionen i det tillstånd den
befann sig i när den avbröts.
Om ingen session har genomförts visas en knapp för att starta en övningssession.

Toppmenyn har två val:

- Öva
- Skapa

Om man väljer "Öva" visas en sida med

1. Senast pågående övning (kort)
2. Grid med kort för pågående övningssessioner

Klickar man på ett kort för en pågående övningssession öppnas en vy för den
sessionen.
I den vyn visas en vänsterpanel med övningsplanen och en huvudpanel visas vald
övning. För den valda övningen visas länkens innehåll i en iframe. Det finns
även knappar för att gå till nästa och föregående övning i planen.

Om man väljer "Skapa" visas en sida med

1. Grid med kort för övningar
2. Grid med kort för övningsplaner

Klickar man på ett kort för en övning öppnas en vy för att redigera den
övningen.
I denna vy kan man lägga till, alt. redigera en länk och spara övningen.

Klickar man på ett kort för en övningsplan öppnas en vy för att redigera den
övningsplanen.
I denna vy kan man lägga till och ta bort, samt ordna om övningar i planen (
ordnad lista) och spara övningsplanen.


