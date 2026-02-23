* [x] Nästa-knapp i session funkar inte rätt, man hoppar ur sessionen.
* [x] Breadcrumb funkar inte korrekt, man skall kunna hoppa ur alla vyer med
  tillbakaknapp, samt klicka på items.
* [x] /-path skall leda till Öva
* [x] Börja om knapp på session
* [x] Beskrivning på övning
* [x] Timer
* [x] Komma ihåg senaste timerinställning (per session)
* [x] Avsluta/ta bort session
* [x] Lägg till helppage med beskrivning av alla funktioner
* [x] Spara timer per övning i session
  * [x] Återställ inte vid reset
* [x] Metronom i övingssession
  * Man ska kunna starta och stoppa
  * Man ska kunna ange BPM
  * Man skall kunna ange tidsignatur med två heltals-inputs (spinners):
    * den ena går från 1-16
    * den andra har vallistan 1,2,4,8
    * med dessa skall man kunna ange t.ex 4/4, 3/4, etc.
  * Man skall kunna ange tre olika ljud för varje puls
    * stark, mellan, svag
    * På detta sätt skall man kunna ange för t.ex 7/8
      * 1: stark
      * 2: svag
      * 3: svag
      * 4: mellan
      * 5: svag
      * 6: mellan
      * 7: svag
  * Puls skall visas med prickar med olika storlek beroende på
    * ljud (stor=stark, mellan=mellan,liten=svag)
  * När metronomen spelar skall pulsen indikeras visellt genom att prickarna
    tänds synkroniserat med ljudet
  * Metronomens inställningar skall sparas per övning i en session i
    `ExerciseSessionState`
    * BPM
    * Tidssignatur
    * Audio-profil för pulser
* [ ] Visa tid för senast öppnad
* [ ] Visa förväntad tidsåtgång
  * Basera på timervärden
* [ ] Flagga "öppna i iframe" på övning.
* [ ] Backend med persistering
