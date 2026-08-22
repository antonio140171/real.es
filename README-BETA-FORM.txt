REAL v4 — Modulo candidatura beta

1) Il sito non usa più mailto:. Il modulo invia direttamente la candidatura alla Cloud Function sendBetaApplication.
2) I secret SUPPORT_TO, SMTP_USER e SMTP_PASS sono gli stessi già configurati per l'assistenza REAL.
3) Prima pubblica la nuova Function:

   cd functions
   npm install
   cd ..
   set FUNCTIONS_DISCOVERY_TIMEOUT=60
   firebase deploy --only functions:sendBetaApplication

4) Poi carica su GitHub Pages SOLO i file/cartelle del sito necessari alla pagina:
   - index.html
   - styles.css
   - assets/
   NON è necessario caricare functions/, firebase.json o .firebaserc su GitHub Pages.

5) Test: apri la landing GitHub Pages, compila il modulo e premi "Invia candidatura".
   La mail deve arrivare a SUPPORT_TO (antonioiannucci71@gmail.com).
