# Accordo di consegna — sito Halo Store

Tra **Andrea** (chi ha realizzato il sito) e **Buonsante Miriana**, titolare di **Halo Store**, Via Castellana 18A, Conversano.

Data: 20 agosto 2026.

Questo foglio serve a metterci d’accordo su una cosa semplice: **il sito è questo**. Quello che c’è sotto è il lavoro fatto. Quello che non c’è, se lo vuoi, è un lavoro nuovo, con tempi e costi da rivedere. Così evitiamo di allungare il progetto a ogni idea che passa.

---

## In due parole

Hai un sito vetrina con catalogo vero, carrello, account, ritiro in negozio e spedizione in Italia. Tu gestisci i capi e gli ordini da un pannello tuo. Io ho messo in piedi il sistema. Da qui in poi il catalogo e il giorno per giorno sono in mano tua, salvo sistemazioni di bug o un nuovo accordo.

---

## Cosa è stato implementato

### Il sito pubblico
- Home editoriale: presentazione, catalogo, come funziona, recensioni, dove siete.
- Catalogo filtrabile per tipologia, scheda del capo con foto, taglie, colori, prezzo, scorte.
- Carrello: si sceglie **ritiro in negozio** (nome, telefono, fascia oraria nelle 48 ore, pagamento in cassa) oppure **spedizione in Italia** (indirizzo e pagamento online con Stripe, quando le chiavi sono accese).
- Account cliente: registrazione e accesso, storico ordini, preferenze email.
- Pagine privacy, cookie, termini, banner cookie.
- Newsletter e avvisi “es.è tornato il prodotto” **solo** a chi ha consentito i cookie per ricevere email dalla tua mail.

### Il pannello admin (solo per te)
- Panoramica: ultimi ordini e scorte basse per taglia e colore.
- Catalogo: nuovi capi, modifica, foto con ritaglio, colori, scorte, pubblica / nascondi, elimina, tipologie anche nuove.
- Ordini: stati (in preparazione, pronto al ritiro, spedito, completato, ecc.), tracking, note.
- Impostazioni: costo spedizione Italia, soglia scorte basse, minuti di prenotazione scorte per chi paga online (significa che chi è in fase di pagamento ha 20 minuti per completare l'ordine).
- Invio newsletter a chi ha dato il consenso.

### Dietro le quinte
- Login con Clerk, dati su Supabase, email con Resend, avviso WhatsApp a te quando arriva un ordine.
- Per il ritiro le scorte si tengono da parte. Per la spedizione si prenotano al pagamento.
- Email al cliente quando l’ordine è confermato e quando cambia stato (es. pronto al ritiro o spedito).

Stripe per i pagamenti online della **spedizione** è previsto nel sito. Andare live con i pagamenti significa avere chiavi e webhook a posto: non è una funzione extra di catalogo, è accendere quello che già c’è.

---

## Cosa puoi fare tu, senza chiedere nuove funzioni

- Caricare, modificare, nascondere ed eliminare i capi e le foto.
- Aggiornare prezzi, taglie, colori e pezzi in magazzino.
- Creare una nuova tipologia (es. “Gonne”) e usarla.
- Seguire gli ordini e segnare ritiro / spedizione / tracking.
- Cambiare il prezzo della spedizione Italia e la soglia delle scorte basse.
- Mandare una mail a chi si è iscritto alle novità.
- Usare il sito come vetrina e come cassa “prenota e ritira” / “paga e spedisci”.

In pratica: **gestire il negozio sul sito**. 

---

## Cosa non è compreso (e quindi non si aggiunge “al volo”)

Per chiarezza, **non** fa parte di questo lavoro, a meno di un nuovo accordo:

- Nuove sezioni, nuovi layout, cambio identità grafica, app, blog, marketplace.
- Spedizioni fuori Italia, più corrieri, calcolo automatico delle tariffe, dogane.
- Codici sconto, coupon benvenuto, punti fedeltà, omaggi, “sconto sopra i X euro” (oggi il costo spedizione è un importo fisso per l’Italia).
- Pagare online anche il ritiro in negozio (il ritiro si paga in cassa, di proposito).
- Integrazioni extra (Instagram shop, Meta ads, gestionali, fatturazione elettronica, POS).
- Traduzione in altre lingue, account per più dipendenti con ruoli diversi.
- Foto, testi, recensioni, dominio, hosting e pubblicità: i contenuti e i servizi a pagamento restano tuoi.
- Formazione lunga, assistenza quotidiana, “mentre ci sei metti anche…”, se si vuole aggiungere altro basta dirlo prima di firmare il contratto.

Se dopo la consegna vuoi una di queste cose, si parla, si valuta, si fa un preventivo. Non si attacca al lavoro già chiuso.

---

## Stripe e dominio: da fare prima di andare online

Il sito è pronto. Per far pagare le spedizioni e per aprire il negozio all’indirizzo vero (tipo `www.halostore.it`) servono due cose tue: **un account Stripe** e **un dominio**. I costi (le commissioni Stripe su ogni pagamento, il rinnovo del dominio, eventuale hosting) sono **sempre a carico del negozio**. Io collego il tutto al sito.

Puoi farle tu, oppure le faccio io **a tue spese** (tu mi rimborsi quello che pago e resti titolare di account e dominio). In tutti i casi, **una volta creati, mi servono le credenziali** (o un accesso da tecnico) per attaccare pagamenti e indirizzo al sito.

### Come aprire Stripe (pagamenti online)

Serve per chi sceglie la **spedizione** e paga sul sito. Il ritiro in negozio resta in cassa, Stripe non c’entra.

1. Vai su [stripe.com](https://stripe.com/it) e crea un account con **la mail del negozio** (o quella che usi per i documenti).
2. Paese: **Italia**. L’attività è Halo Store / tu, persona fisica o ditta, con i dati veri (codice fiscale / partita IVA, indirizzo di Via Castellana).
3. Completa la verifica: documento, conto **IBAN** dove vuoi ricevere i soldi. Stripe non ti accredita nulla finché questo passaggio non è ok.
4. Quando l’account è “live”, apri **Sviluppatori → Chiavi API**.
5. Tieni da parte (e poi mandami in privato):
   - la **chiave pubblicabile** (`pk_live_…`)
   - la **chiave segreta** (meglio una **chiave ristretta** `rk_live_…`, non va mai sul telefono dei clienti)
6. L’account deve restare **intestato a te**. Io lo uso solo per collegare il sito. Se preferisci non mandare le chiavi, aggiungimi come collaboratore dalla Dashboard Stripe (ruolo sviluppatore) e me lo dici.

Webhook e accensione pagamenti sul sito li sistemo io, dopo che ho le chiavi (o l’accesso) e il dominio è puntato.

In alternativa: **lo apro io con i tuoi documenti**, tu paghi / rimborsi, e mi lasci comunque accesso e chiavi. 

### Dove comprare il dominio

Il dominio è l’indirizzo del sito (es. `halostore-conversano.it` — il nome esatto lo scegli tu, se è libero). Lo compri da un **registrar**. In Italia vanno bene, tra gli altri:

- [Aruba](https://www.aruba.it)
- [Register.it](https://www.register.it)
- [Netsons](https://www.netsons.com)
- [Cloudflare](https://www.cloudflare.com) (registrar, spesso comodo per i DNS)

Un `.it` si rinnova ogni anno; il prezzo è basso, ma **è un costo tuo** ogni anno. Intestalo a **Buonsante Miriana / Halo Store**, non a me, così il nome resta tuo se un giorno cambiamo tecnico.

**Due strade:**

1. **Lo compri tu.** Scegli il nome, paghi, poi mi dai **accesso al pannello** (utente e password del registrar, o un invito come tecnico) così imposto i DNS verso l’hosting.
2. **Lo compro io e mi rimborsi.** Stesso risultato, ma il dominio va comunque intestato a te. Poi mi servi comunque l’accesso (o me lo tengo io solo se restiamo d’accordo sul rinnovo).

Senza dominio il sito esiste in locale / su un indirizzo tecnico: **non è ancora “il sito del negozio”**.

### Cosa mi devi mandare, quando hai finito

In privato, quando Stripe e dominio ci sono:

**Stripe**
- email con cui hai aperto l’account
- chiave pubblicabile `pk_live_…`
- chiave segreta / ristretta `rk_live_…` (o invito da collaboratore in Dashboard)
- conferma che la verifica identità e l’IBAN sono ok

**Dominio**
- nome esatto comprato (es. `halostore-conversano.it`)
- registrar usato (Aruba, Register, ecc.)
- login del pannello **oppure** accesso DNS / invito tecnico
- se hai già una casella email sul dominio (es. `ordini@…`), anche quella: serve per le mail del sito

Con queste cose io collego pagamenti, webhook e indirizzo pubblico. Senza, il catalogo e il ritiro in negozio possono già funzionare; **il paga-e-spedisci no**, e il sito non sta sul tuo nome.

---

## Bug e piccole correzioni

Se qualcosa di quanto sopra **non funziona** (si rompe, non salva, non manda la mail), si sistema senza costi.  
Se è **una cosa nuova** (“e se aggiungessimo…”), è un altro discorso,bisogna parlare e capire insieme.

---

## Chiusura

Con le firme sotto, il titolare conferma di aver visto il sito, di sapere cosa può fare da sola e di accettare che il perimetro è questo.

Spazio firme (carta o scan):

| | Sviluppatore | Titolare |
| --- | --- | --- |
| Nome | Andrea Ermes Locaputo | Buonsante Miriana |
| Data | | |
| Firma | | |

---

## Domande a cui rispondere prima di chiudere il contratto

Rispondi qui sotto, anche in due parole. Servono per non lasciare buchi e per non riaprire il lavoro dopo.

**1. Dove voler spedire?**  
(es. solo in Italia)

> Risposta:

**2. Vuole inserire un codice sconto ai nuovi iscritti che arriva direttamente tramite email?**

> Risposta:

**3. La prima inizializzazione del catalogo verrà svolta da voi o lo faccio io?**

> Risposta:

**4. Sconto sulla spedizione per ordini superiori ad un importo?**

> Risposta:

**5. Account Stripe: lo apri tu o lo apro io (a tue spese), e poi mi mandi le chiavi / l’accesso in privato?**

> Risposta:

**6. Dominio: lo compri tu o lo compro io (a tue spese)? Che nome vuoi, se l’hai già in mente?**

> Risposta:
