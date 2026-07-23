---
type: "query"
date: "2026-07-15T21:14:23.997650+00:00"
question: "beskriv vad denna applikation tillhandahåller"
contributor: "graphify"
source_nodes: ["doc_kravspecifikation", "doc_product_idea"]
---

# Q: beskriv vad denna applikation tillhandahåller

## Answer

**JB Guitar** är en webbapplikation avsedd för gitarrister som vill strukturera,
planera och genomföra sina övningspass. Baserat på de analyserade dokumenten
kravspecifikation.md och product-idea.md, tillhandahåller applikationen följande
kärnfunktioner:

1. **Övningshantering (Exercises):**
   - Skapa, redigera och ta bort övningar.
   - Referera till publika externa källor som YouTube, JTC Guitar och
     Soundslice via länkar.
   - Lägga till beskrivningar för instruktioner.

2. **Övningsplanering (Practice Plans):**
   - Kombinera olika sparade övningar till en sammanhängande, ordnad lista (
     övningsplan).
   - Sortera om och anpassa ordningen för genomförandet.

3. **Genomförande av övningspass (Sessions):**
   - Starta en session baserat på en plan.
   - Visar planen i en sidopanel och den aktiva övningen via iframe i
     huvudpanelen.
   - Stega fram/tillbaka och spara framsteg (pausa/återuppta).

4. **Inbyggda verktyg:**
   - **Timer:** Individuell timer per övning (default 5 min) med slutsignal.
   - **Metronom:** Tempo 20-300 BPM, valbara taktarter, och anpassningsbara
     slagstyrkor per slag med visuell animation.

5. **Persistering och synk:**
   - Lagring lokalt i LocalStorage med import/export till JSON.
   - Möjlighet till offline-first molnsynk mot privat GitHub-repo via PAT.

Byggd i Angular med Signals och Web Audio API.

## Source Nodes

- doc_kravspecifikation
- doc_product_idea
