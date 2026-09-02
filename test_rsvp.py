import requests
import json
import datetime
import time
import random
import re
from collections import defaultdict

# ==============================================================================
# SCRIPT AVANZATO PER TESTARE IL DATABASE (GOOGLE SHEET) TRAMITE WEBHOOK
# ==============================================================================
WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzz53AX8IDLV1G8TIREHiZbFgevAND-H7AjnlG76mE3oC7XeM47x8rND0U5viCRGqtbxQ/exec"

# Pool limitato di famiglie per forzare la creazione di duplicati (test aggiornamento)
FAMIGLIE_POOL = [
    "Famiglia Rossi", "Famiglia Bianchi", "Antonio Esposito", "Marco Russo", 
    "Giulia Romano", "Famiglia Colombo", "Luca Ricci", "Famiglia Marino", 
    "Greco & Partner", "Famiglia Bruno", "Ilaria Costa", "Famiglia Giordano"
]

PARTECIPAZIONI = [
    "Saremo presenti a tutto", 
    "Saremo presenti (solo cerimonia)", 
    "Saremo presenti (solo ricevimento)",
    "Non potremo esserci",
    "Ci saremo al ricevimento"
]

INTOLLERANZE_POOL = [
    "Nessuna", "-", "Nessuna",
    "1 Celiachia", 
    "2 Intolleranza al Lattosio, 1 Vegetariano",
    "1 Allergia alle Arachidi",
    "1 Celiaco • 1 Intollerante al Latte",
    "1 Uova, 2 Pesce",
    "1 Vegano",
    "1 Seggiolone bimbo",
    "2 Allergia al Nichel, 1 Celiachia"
]

NOTE_POOL = [
    "", "", "Non vediamo l'ora!", "Ci scusiamo per il ritardo.", 
    "Arriveremo un po' dopo la messa.", "Il bambino ha bisogno del seggiolone."
]

def generate_random_record():
    """Genera un record casuale pescando dai pool."""
    famiglia = random.choice(FAMIGLIE_POOL)
    partecipazione = random.choice(PARTECIPAZIONI)
    
    # Se non ci sono, zero ospiti
    if "non" in partecipazione.lower():
        ospiti = 0
        intolleranze = "-"
    else:
        ospiti = random.randint(1, 5)
        intolleranze = random.choice(INTOLLERANZE_POOL)
    
    return {
        "dataOra": datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        "nomeFamiglia": famiglia,
        "numeroOspiti": ospiti,
        "partecipazione": partecipazione,
        "intolleranzeNote": intolleranze,
        "noteAggiuntive": random.choice(NOTE_POOL),
        "targetSheet": random.choice(["Pranzo", "Sera Monopoli"]),
    }

def normalizza_categoria(voce):
    """Stessa logica di normalizzazione del Google Apps Script"""
    v = voce.lower().strip()
    if not v or v in ["nessuna", "nessuno", "no", "-", "persone"]:
        return None
    
    if "celiac" in v or "glutin" in v: return "🌾 Celiachia / Senza Glutine"
    if "lattos" in v or "latte" in v: return "🥛 Intolleranza al Lattosio"
    if "vegetar" in v or "vegan" in v: return "🥗 Vegetariano / Vegano"
    if "frutta secca" in v or "arachid" in v or "noci" in v: return "🥜 Frutta Secca / Arachidi"
    if "crostace" in v or "mollusch" in v or "pesce" in v: return "🦐 Crostacei / Pesce"
    if "uov" in v: return "🥚 Uova"
    if "nichel" in v: return "🧪 Allergia al Nichel"
    if "seggiolon" in v or "seggiol" in v: return "👶 Seggiolone Bimbo"

    # Fallback
    etichetta = re.sub(r'^(note:|\d+\s*|allergia a|intolleranza a|no|senza)\s*', '', v, flags=re.IGNORECASE).strip()
    if not etichetta: return None
    return "🔹 " + etichetta.capitalize()

def calcola_totali(database_locale):
    """Calcola i totali in locale per confrontarli con quelli di Google Sheet"""
    tot_famiglie = 0
    tot_presenti = 0
    tot_solo_cerimonia = 0
    tot_assenti = 0
    mappa_intolleranze = defaultdict(int)

    for record in database_locale.values():
        tot_famiglie += 1
        
        # Simuliamo il comportamento esatto (e il bug) del GAS:
        # Nel tuo GAS c'è: var numeroOspiti = Number(data.numeroOspiti) || 1;
        # Se ospiti è 0, diventerà 1.
        ospiti_raw = int(record["numeroOspiti"])
        ospiti = ospiti_raw if ospiti_raw != 0 else 1

        partec = record["partecipazione"].lower()
        intolleranze = record["intolleranzeNote"].strip()

        # Calcolo presenze
        if "presenti" in partec or "ricevimento" in partec or "entrambi" in partec:
            tot_presenti += ospiti
        elif "cerimonia" in partec or "messa" in partec or "celebrazione" in partec:
            tot_solo_cerimonia += ospiti
        elif "non" in partec or "assent" in partec:
            tot_assenti += ospiti
        else:
            tot_presenti += ospiti

        # Parsing Intolleranze
        if intolleranze and intolleranze.lower() != "nessuna" and intolleranze != "-":
            spezzoni = re.split(r'[•,;]', intolleranze)
            for frammento in spezzoni:
                frammento = frammento.strip()
                if not frammento: continue
                
                match = re.match(r'^(\d+)\s+(.+)$', frammento)
                if match:
                    qta = int(match.group(1))
                    nome_voce = match.group(2).strip()
                else:
                    qta = 1
                    nome_voce = frammento
                
                cat = normalizza_categoria(nome_voce)
                if cat:
                    mappa_intolleranze[cat] += qta

    return tot_famiglie, tot_presenti, tot_solo_cerimonia, tot_assenti, mappa_intolleranze


def test_webhook(num_requests=100):
    print(f"[*] Inizio test batch: {num_requests} invii verso Google Sheet...\n")
    
    # Questo dizionario simula il comportamento di update (sovrascrittura) del GAS per i duplicati
    database_locale = {
        "Pranzo": {},
        "Sera Monopoli": {}
    }
    success_count = 0

    for i in range(num_requests):
        payload = generate_random_record()
        
        # Chiave univoca per i duplicati usata nel GAS: lowercase e spazi singoli
        chiave_confronto = re.sub(r'\s+', ' ', payload["nomeFamiglia"].lower()).strip()
        target_sheet = payload["targetSheet"]
        
        # Aggiorniamo il nostro DB locale (simulando l'update del foglio Excel)
        is_update = chiave_confronto in database_locale[target_sheet]
        database_locale[target_sheet][chiave_confronto] = payload

        print(f"[{i+1:02d}/{num_requests}] {'[UPD]' if is_update else '[NEW]'} [{target_sheet}] Invio: {payload['nomeFamiglia']} ({payload['numeroOspiti']} p) | {payload['partecipazione']} | {payload['intolleranzeNote']}")
        
        try:
            response = requests.post(WEBHOOK_URL, json=payload)
            if response.status_code == 200:
                success_count += 1
            else:
                print(f"    [X] Errore HTTP {response.status_code}")
        except Exception as e:
            print(f"    [X] Errore di connessione: {e}")
            
        time.sleep(1) # Rispetta i rate-limits di Google App Script

    print("\n" + "="*60)
    print("📊 RIEPILOGO TOTALI CALCOLATO DA PYTHON")
    print("Confrontalo con i fogli 'Riepilogo Pranzo' e 'Riepilogo Sera Monopoli' su Excel!")
    print("="*60)
    
    for evento in ["Pranzo", "Sera Monopoli"]:
        tot_famiglie, tot_presenti, tot_solo_cerimonia, tot_assenti, mappa_intolleranze = calcola_totali(database_locale[evento])
        
        print(f"\n📌 EVENTO: {evento.upper()}")
        print(f"👨👩👧👦 Numero Totale Famiglie Rispondenti : {tot_famiglie}")
        print(f"👥 Totale Ospiti a Cerimonia & Ricevimento: {tot_presenti}")
        print(f"⛪ Totale Ospiti solo Cerimonia          : {tot_solo_cerimonia}")
        print(f"❌ Totale Persone Assenti               : {tot_assenti}")
        print("🍽️ DETTAGLIO INTOLLERANZE & ALLERGIE")
        
        if mappa_intolleranze:
            for cat, qta in sorted(mappa_intolleranze.items()):
                print(f"   - {cat}: {qta}")
        else:
            print("   - Nessuna intolleranza segnalata al momento")
        
    print("="*60)
    print(f"🎉 Test completato: {success_count}/{num_requests} richieste inviate con successo.")

if __name__ == "__main__":
    # Avvia 100 richieste (modifica il numero se vuoi fare un test più rapido)
    test_webhook(100)
