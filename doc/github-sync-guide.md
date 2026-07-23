# Användarguide: GitHub-synkronisering & Driftsättning

Denna guide beskriver hur du konfigurerar GitHub-synkronisering för din
övningsdata i JB Guitar samt hur du driftsätter (deployar) själva applikationen
gratis på GitHub Pages.

---

## 1. GitHub som databas (Backend)

JB Guitar är en "offline-first" webbapplikation. Som standard sparas all data i
din lokala webbläsare (`localStorage`). Genom att koppla appen till ett
GitHub-repository kan du:

- Synka din data mellan olika enheter (t.ex. mobil och dator).
- Få automatisk versionshantering (historik) över dina övningspass.
- Ha en säker molnkopia helt gratis och under egen kontroll.

### Hur fungerar det?

När du aktiverar synkningen kommer applikationen att fortsätta spara lokalt i
webbläsaren för maximal snabbhet. I bakgrunden (eller manuellt) görs anrop till
GitHubs API för att läsa och skriva en JSON-fil (t.ex. `jb-guitar-data.json`) i
ditt angivna repository.

Dina inmatade inloggningsuppgifter (Personal Access Token) sparas **endast
lokalt i din egen webbläsare** och skickas aldrig till någon annan server än
GitHubs officiella API.

---

## 2. Skapa ett GitHub-repository och Personal Access Token (PAT)

För att konfigurera synkningen behöver du ett GitHub-konto samt ett dedikerat
repository och en åtkomstnyckel.

### Steg 1: Skapa ett repository på GitHub

1. Logga in på [github.com](https://github.com).
2. Klicka på **New** (eller gå till `https://github.com/new`) för att skapa ett
   nytt repository.
3. Namnge det till exempel `jb-guitar-data`.
4. Välj **Private** (Privat) så att ingen annan kan se din övningsdata (
   rekommenderas, men Public fungerar också).
5. Markera **Add a README file** (detta skapar en standardgren/branch som heter
   `main`, vilket behövs).
6. Klicka på **Create repository**.

### Steg 2: Skapa en Personal Access Token (PAT)

En PAT fungerar som ett lösenord som tillåter appen att skriva till just detta
repository.

Vi rekommenderar att använda **Fine-grained tokens** eftersom de ger bäst
säkerhet och kan begränsas till endast ett specifikt repository.

1. Gå till dina kontoinställningar på GitHub (klicka på din profilbild uppe till
   höger -> **Settings**).
2. Skrolla ner i vänstermenyn och klicka på **Developer settings**.
3. Expandera **Personal access tokens** och välj **Fine-grained tokens**.
4. Klicka på **Generate new token**.
5. Fyll i inställningarna:
   - **Token name:** T.ex. `JB Guitar Sync`
   - **Expiration:** Välj giltighetstid (t.ex. 90 dagar eller Custom).
   - **Repository access:** Välj **Only select repositories** och välj ditt
     nyskapade repo (`jb-guitar-data`).
   - **Permissions:** Expandera **Repository permissions** och hitta **Contents
     **. Sätt denna till **Read and write**.
6. Klicka på **Generate token** längst ner.
7. **VIKTIGT:** Kopiera token-nyckeln (börjar med `github_pat_...`) direkt. Den
   visas bara en gång!

---

## 3. Konfigurera synkningen i appen

1. Öppna JB Guitar i din webbläsare.
2. Klicka på kugghjulet **⚙** uppe till höger i toppmenyn och välj *
   *GitHub-synkronisering**.
3. Fyll i dina uppgifter:
   - **Aktivera synkronisering:** Klicka i rutan.
   - **Repository (owner/repo):** T.ex. `ditt-användarnamn/jb-guitar-data`
   - **Token:** Klistra in din genererade `github_pat_...`
   - **Branch:** `main` (eller den branch du skapade repot med)
   - **Filväg:** `jb-guitar-data.json` (filen skapas automatiskt om den inte
     finns)
4. Klicka på **Testa anslutning** för att verifiera att allt fungerar.
5. Klicka på **Spara**.

Nu är synkningen aktiv! Du kan göra manuella överföringar i samma ruta via
knapparna:

- **Hämta från GitHub (Pull):** Skriver över din lokala data i webbläsaren med
  den data som finns sparad på GitHub.
- **Skicka till GitHub (Push):** Skriver över datan på GitHub med din nuvarande
  lokala data.

---

## 4. Driftsätt applikationen på GitHub Pages

Du kan enkelt köra själva applikationen gratis via GitHub Pages. Eftersom appen
är skriven i Angular (Single Page Application) måste vi göra några inställningar
för att routingen ska fungera ordentligt.

### Alternativ A: Automatisk driftsättning via GitHub Actions (Rekommenderas)

Varje gång du sparar/pushar din kod till ditt GitHub-repo för applikationen
kommer GitHub automatiskt bygga och driftsätta den åt dig.

1. Skapa en fil i ditt projekt under katalogen `.github/workflows/` med namnet
   `deploy.yml`.
2. Klistra in följande innehåll:

```yaml
name: Build and Deploy to GitHub Pages

on:
  push:
    branches:
      - main # Eller namnet på din huvudbranch

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: jb-guitar-frontend/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: jb-guitar-frontend

      - name: Build Angular App
        run: npx ng build --configuration production --base-href /jb-guitar/
        working-directory: jb-guitar-frontend

      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: jb-guitar-frontend/dist/jb-guitar-frontend/browser
          branch: gh-pages
```

*Obs: Justera `--base-href /jb-guitar/` till namnet på ditt GitHub-repository
där koden ligger.*

3. Gå till ditt repo på GitHub -> **Settings** -> **Pages**.
4. Under **Build and deployment** -> **Source**, se till att **Deploy from a
   branch** är valt.
5. Välj branch **gh-pages** och mappen **/ (root)**, klicka på **Save**.
6. Efter någon minut är din applikation tillgänglig på
   `https://ditt-användarnamn.github.io/jb-guitar/`.

### Alternativ B: Manuell driftsättning från din dator

Om du vill bygga och publicera direkt från din terminal:

1. Gå till mappen `jb-guitar-frontend` i din terminal:
   ```bash
   cd jb-guitar-frontend
   ```
2. Bygg appen och ange repots namn som bas:
   ```bash
   npx ng build --configuration production --base-href /jb-guitar/
   ```
3. Ladda upp till GitHub Pages:
   ```bash
   npx angular-cli-ghpages --dir=dist/jb-guitar-frontend/browser
   ```

*(Se till att aktivera GitHub Pages i inställningarna för repot enligt punkt 3-5
i Alternativ A ovan.)*
