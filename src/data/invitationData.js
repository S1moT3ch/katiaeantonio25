export const invitationData = {
  couple: {
    groom: "Antonio Cantore",
    bride: "Katia Loliva",
    shortNames: "Katia & Antonio",
    monogram: "A & K",
    anniversaryYears: "25°",
    anniversaryType: "Nozze d'Argento",
    weddingDateOriginal: "Mercoledì 26 Settembre 2001 - ore 10.30",
    yearsSpan: "2001 — 2026",
    addresses: "Via Rita Levi Montalcini, 4 - Gioia del Colle",
  },

  quote: {
    text: "\"Nessuna gioia\nè grande\nse non è condivisa\"",
    author: "Seneca",
  },

  event: {
    // Data dei 25 anni di matrimonio
    dateIso: "2026-09-26T11:00:00",
    formattedDate: "Sabato 26 Settembre 2026",
    anniversaryHeading: "... dopo <b>25 anni</b>\nCon Simone e Andrea, insieme a voi,\n ringrazieremo il Signore\nper tutti i benefici che ci ha concesso \nin questo tempo",
    ceremonyTime: "Ore 11:00",
    receptionTime: "A seguire",

    ceremony: {
      title: "La Cerimonia",
      placeName: "Chiesa Immacolata di Lourdes",
      city: "Gioia del Colle (BA)",
      address: "Gioia del Colle",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Chiesa+Immacolata+di+Lourdes+Gioia+del+Colle",
      time: "ore 11.00"
    },

    reception: {
      title: "Il Ricevimento",
      introText: "La nostra festa continuerà, nella semplicità,\npranzando insieme presso l'Agriturismo",
      placeName: "Masseria Foggiagrande",
      address: "Strada Comunale Foggia Grande, 1",
      city: "Putignano (BA)",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Masseria+Foggiagrande+Putignano",
    },

    receptionEvening: {
      title: "La Festa Serale",
      introText: "Desideriamo trascorrere del tempo speciale\ncon gli amici che c'erano allora, ci sono stati sempre e, confidiamo,\ncontinueranno ad esserci.\nPensiamo ad un momento informale, da vivere tra noi,\nin semplicità con amicizia",
      placeName: "Sabato 26 Settembre",
      address: "ore 20.00",
      city: "Monopoli",
      mapsUrl: "https://maps.app.goo.gl/yJ9RwYSPzy4HkAak6",
      details: "Lido Colonia - Contrada Porto Camicia, 29/C",
    },

    rsvp: {
      noticeText: "È gradito un cenno di partecipazione",
      phone1: "3932665321",
      phone2: "3346670222",
      phoneFormatted1: "393 2665321",
      phoneFormatted2: "334 6670222",
      whatsappNumber: "393346670222",
      deadline: "10 Settembre 2026",
      // Incolla qui l'URL dell'App Web di Google Apps Script (creato seguendo la guida)
      googleSheetsScriptUrl: "https://script.google.com/macros/s/AKfycbzz53AX8IDLV1G8TIREHiZbFgevAND-H7AjnlG76mE3oC7XeM47x8rND0U5viCRGqtbxQ/exec",
    }
  }
};

export const getInvitationData = () => {
  // Check URL parameters
  const params = new URLSearchParams(window.location.search);
  const isEvening = params.get('f') === '2';
  const isCeremonyOnly = params.get('f') === '3';

  // Create a deep copy of the base invitation data
  const data = JSON.parse(JSON.stringify(invitationData));

  if (isCeremonyOnly) {
    data.event.reception = null;
    data.event.partyType = "Solo Cerimonia";
  } else if (isEvening) {
    // Replace standard reception with evening reception
    data.event.reception = data.event.receptionEvening;
    // Optional: override time if ceremonyTime/receptionTime needs to change for evening guests
    data.event.receptionTime = "Ore 20:00";
    data.event.partyType = "Sera";
  } else {
    data.event.partyType = "Pranzo";
  }

  return data;
};
