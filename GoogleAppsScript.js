function doPost(e) {
  try {
    // 1. Apri il foglio di calcolo corrente
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 2. Parsa i dati JSON in arrivo dalla richiesta POST
    var data = JSON.parse(e.postData.contents);
    
    // 3. Estrai i campi (assicurati che i nomi corrispondano a quelli del JSON inviato da Python o dal sito)
    var timestamp = data.timestamp || new Date().toLocaleString("it-IT");
    var famiglia = data.famiglia || "";
    var ospiti = data.ospiti || 0;
    var partecipazione = data.partecipazione || "";
    var intolleranze = data.intolleranze || "";
    var note = data.note || "";
    
    // 4. Inserisci una nuova riga nel foglio
    sheet.appendRow([timestamp, famiglia, ospiti, partecipazione, intolleranze, note]);
    
    // 5. Restituisci una risposta di successo
    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "Dati salvati con successo" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Gestione degli errori
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Funzione di test per verificare che lo script risponda
function doGet(e) {
  return ContentService.createTextOutput("Il Webhook RSVP è attivo e funzionante!");
}
