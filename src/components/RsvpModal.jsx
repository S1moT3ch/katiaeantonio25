import React, { useState } from 'react';
import { X, Send, Heart, Phone, Users, Utensils, UserCheck, Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const COMMON_DIETARY_OPTIONS = [
  { id: 'gluten', label: 'Celiachia / Senza Glutine', icon: '🌾' },
  { id: 'lactose', label: 'Intolleranza al Lattosio', icon: '🥛' },
  { id: 'vegetarian', label: 'Vegetariano / Vegano', icon: '🥗' },
  { id: 'nuts', label: 'Frutta Secca / Arachidi', icon: '🥜' },
  { id: 'seafood', label: 'Crostacei / Molluschi / Pesce', icon: '🦐' },
  { id: 'highchair', label: 'Seggiolone Bimbo', icon: '👶' },
];

export default function RsvpModal({ isOpen, onClose, rsvpData, coupleData }) {
  const [representativeName, setRepresentativeName] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [attendance, setAttendance] = useState('both'); // 'both', 'ceremony', 'cannot'

  // Mappa delle quantità per le intolleranze comuni: { gluten: 1, lactose: 2, ... }
  const [dietaryCounts, setDietaryCounts] = useState({});

  // Intolleranze / allergie personalizzate: [ { id: 1, name: 'Fragole', count: 1 }, ... ]
  const [customIntolerances, setCustomIntolerances] = useState([]);
  const [customNameInput, setCustomNameInput] = useState('');

  // Note generiche opzionali
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Gestione incremento/decremento opzioni comuni
  const handleToggleCommon = (id) => {
    setDietaryCounts((prev) => {
      const current = prev[id] || 0;
      if (current > 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      } else {
        return { ...prev, [id]: 1 };
      }
    });
  };

  const handleUpdateCommonCount = (id, delta) => {
    setDietaryCounts((prev) => {
      const current = prev[id] || 1;
      const next = Math.max(1, Math.min(guestsCount, current + delta));
      return { ...prev, [id]: next };
    });
  };

  // Gestione intolleranze personalizzate
  const handleAddCustom = () => {
    if (!customNameInput.trim()) return;
    const newItem = {
      id: Date.now(),
      name: customNameInput.trim(),
      count: 1,
    };
    setCustomIntolerances((prev) => [...prev, newItem]);
    setCustomNameInput('');
  };

  const handleUpdateCustomCount = (id, delta) => {
    setCustomIntolerances((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, count: Math.max(1, Math.min(guestsCount, item.count + delta)) } : item
      )
    );
  };

  const handleRemoveCustom = (id) => {
    setCustomIntolerances((prev) => prev.filter((item) => item.id !== id));
  };

  // Formatta l'elenco completo per Google Sheets e WhatsApp
  const formatDietarySummary = () => {
    const parts = [];

    COMMON_DIETARY_OPTIONS.forEach((opt) => {
      const count = dietaryCounts[opt.id];
      if (count && count > 0) {
        parts.push(`${count} ${opt.label}`);
      }
    });

    customIntolerances.forEach((item) => {
      if (item.count > 0 && item.name.trim()) {
        parts.push(`${item.count} ${item.name.trim()}`);
      }
    });

    return parts.length > 0 ? parts.join(' • ') : 'Nessuna';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!representativeName.trim()) return;

    setIsSubmitting(true);

    let attendanceText = 'Saremo presenti a Cerimonia e Ricevimento';
    if (attendance === 'ceremony') attendanceText = 'Solo Celebrazione';
    if (attendance === 'cannot') attendanceText = 'Purtroppo non potremo esserci';

    const timestamp = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' });
    const dietaryFormatted = formatDietarySummary();
    const cleanNotes = additionalNotes.trim();

    // 1. Invio a Google Sheets (se configurato)
    const sheetsEndpoint = rsvpData?.googleSheetsScriptUrl;
    if (sheetsEndpoint && sheetsEndpoint.trim().length > 0) {
      try {
        const payload = {
          dataOra: timestamp,
          nomeFamiglia: representativeName.trim(),
          numeroOspiti: guestsCount,
          partecipazione: attendanceText,
          intolleranzeNote: dietaryFormatted,
          noteAggiuntive: cleanNotes,
        };

        await fetch(sheetsEndpoint.trim(), {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn('Errore salvataggio Google Sheets (non bloccante):', err);
      }
    }

    // 2. Composizione messaggio WhatsApp
    const messageLines = [
      `✨ *Conferma Partecipazione Famiglia - 25° Anniversario di Katia & Antonio* ✨\n`,
      `👨‍👩‍👧‍👦 *Famiglia*: ${representativeName.trim()}`,
      `👥 *Numero Componenti Famiglia*: ${guestsCount}`,
      `📌 *Partecipazione*: ${attendanceText}`,
    ];

    if (dietaryFormatted !== 'Nessuna') {
      messageLines.push(`🍽️ *Intolleranze / Richieste*: ${dietaryFormatted}`);
    }

    if (cleanNotes) {
      messageLines.push(`📝 *Note*: ${cleanNotes}`);
    }

    let rawNumber = (rsvpData?.whatsappNumber || '393395343851').replace(/\D/g, '');
    if (!rawNumber.startsWith('39')) {
      rawNumber = '39' + rawNumber;
    }

    const encodedMessage = encodeURIComponent(messageLines.join('\n'));
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${rawNumber}&text=${encodedMessage}`;

    setIsSubmitting(false);
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const phone1 = rsvpData?.phone1 || '3932665321';
  const phone2 = rsvpData?.phone2 || '3346670222';
  const phoneFormatted1 = rsvpData?.phoneFormatted1 || '393 2665321';
  const phoneFormatted2 = rsvpData?.phoneFormatted2 || '334 6670222';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Chiudi">
          <X size={22} />
        </button>

        <div className="modal-header">
          <div className="modal-icon-badge">
            <Users size={24} />
          </div>
          <h3 className="modal-title">Conferma Partecipazione Famiglia</h3>
          <p className="modal-subtitle">
            È gradita gentile conferma entro il <strong>{rsvpData?.deadline || '10 Settembre 2026'}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rsvp-form">
          <div className="form-group">
            <label htmlFor="rsvp-rep-name">
              <UserCheck size={16} className="input-label-icon" /> Nome e Cognome *
            </label>
            <input
              id="rsvp-rep-name"
              type="text"
              required
              placeholder="Es. Mario Rossi (o Famiglia Rossi)"
              value={representativeName}
              onChange={(e) => setRepresentativeName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="rsvp-guests">
              <Users size={16} className="input-label-icon" /> Quanti sarete in totale?
            </label>
            <div className="guests-stepper">
              <button
                type="button"
                className="btn-stepper"
                onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
              >
                -
              </button>
              <span className="stepper-value">{guestsCount}</span>
              <button
                type="button"
                className="btn-stepper"
                onClick={() => setGuestsCount(guestsCount + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Partecipazione della Famiglia</label>
            <div className="radio-pills">
              <label className={`radio-pill ${attendance === 'both' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="attendance"
                  value="both"
                  checked={attendance === 'both'}
                  onChange={() => setAttendance('both')}
                />
                <span>Saremo presenti</span>
              </label>

              {/*<label className={`radio-pill ${attendance === 'ceremony' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="attendance"
                  value="ceremony"
                  checked={attendance === 'ceremony'}
                  onChange={() => setAttendance('ceremony')}
                />
                <span>Solo Celebrazione</span>
              </label>*/}

              <label className={`radio-pill ${attendance === 'cannot' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="attendance"
                  value="cannot"
                  checked={attendance === 'cannot'}
                  onChange={() => setAttendance('cannot')}
                />
                <span>Purtroppo non potremo esserci</span>
              </label>
            </div>
          </div>

          {/* SEZIONE INTOLLERANZE CON NUMERO DI PERSONE DEDICATO */}
          {attendance !== 'cannot' && (
            <div className="form-group dietary-section-box">
              <label className="dietary-main-label">
                <Utensils size={16} className="input-label-icon" /> Intolleranze, allergie o richieste alimentari
              </label>
              <p className="dietary-hint-text">
                Seleziona e indica quante persone nella tua famiglia hanno ciascuna intolleranza:
              </p>

              <div className="dietary-options-grid">
                {COMMON_DIETARY_OPTIONS.map((opt) => {
                  const isSelected = !!dietaryCounts[opt.id];
                  const count = dietaryCounts[opt.id] || 1;

                  return (
                    <div key={opt.id} className={`dietary-option-card ${isSelected ? 'selected' : ''}`}>
                      <div className="dietary-card-header" onClick={() => handleToggleCommon(opt.id)}>
                        <span className="dietary-emoji">{opt.icon}</span>
                        <span className="dietary-label-text">{opt.label}</span>
                        <div className={`dietary-checkbox ${isSelected ? 'checked' : ''}`}>
                          {isSelected && <CheckCircle2 size={16} />}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="dietary-stepper-row">
                          <span className="stepper-prompt">Persone:</span>
                          <div className="dietary-mini-stepper">
                            <button
                              type="button"
                              className="btn-mini-stepper"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateCommonCount(opt.id, -1);
                              }}
                            >
                              -
                            </button>
                            <span className="mini-stepper-val">{count}</span>
                            <button
                              type="button"
                              className="btn-mini-stepper"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateCommonCount(opt.id, +1);
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Aggiunta Intolleranze Personalizzate con Persone */}
              {customIntolerances.length > 0 && (
                <div className="custom-intolerances-list">
                  {customIntolerances.map((item) => (
                    <div key={item.id} className="custom-intolerance-chip-row">
                      <span className="custom-intolerance-name">🔹 {item.name}</span>
                      <div className="dietary-mini-stepper">
                        <span className="stepper-prompt-mini">Persone:</span>
                        <button
                          type="button"
                          className="btn-mini-stepper"
                          onClick={() => handleUpdateCustomCount(item.id, -1)}
                        >
                          -
                        </button>
                        <span className="mini-stepper-val">{item.count}</span>
                        <button
                          type="button"
                          className="btn-mini-stepper"
                          onClick={() => handleUpdateCustomCount(item.id, +1)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="btn-remove-custom"
                          onClick={() => handleRemoveCustom(item.id)}
                          title="Rimuovi"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="add-custom-intolerance-bar">
                <input
                  type="text"
                  placeholder="Altra intolleranza o allergia specifica (es. Fragole, Nichel...)"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustom();
                    }
                  }}
                  className="form-input form-input-mini"
                />
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="btn-add-custom"
                  disabled={!customNameInput.trim()}
                >
                  <Plus size={16} />
                  <span>Aggiungi</span>
                </button>
              </div>

              {/* Note aggiuntive libere */}
              <div className="additional-notes-wrap">
                <input
                  type="text"
                  placeholder="Altre note o dettagli per la cucina (facoltativo)..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="form-input form-input-notes"
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary-send" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Salvataggio in corso...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Invia Conferma su WhatsApp</span>
              </>
            )}
          </button>
        </form>

        <div className="modal-contacts-footer">
          <div className="contacts-divider">
            <span>Oppure contattaci telefonicamente</span>
          </div>
          <div className="contacts-buttons">
            <a href={`tel:${phone1}`} className="contact-chip">
              <Phone size={14} />
              <span>Tel. {phoneFormatted1}</span>
            </a>
            <a href={`tel:${phone2}`} className="contact-chip">
              <Phone size={14} />
              <span>Tel. {phoneFormatted2}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
