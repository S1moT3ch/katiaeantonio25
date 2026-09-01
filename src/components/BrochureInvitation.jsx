import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MapPin,
  Send,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Phone
} from 'lucide-react';
import EmbossedFloralHeart from './EmbossedFloralHeart';
import Countdown from './Countdown';
import RsvpModal from './RsvpModal';
import { invitationData } from '../data/invitationData';

export default function BrochureInvitation() {
  // step: 0 = Chiuso (Unico quadrato perfetto con Copertina e Cuore)
  //       1 = Passo 1 (Apertura verso l'alto: Mostra Seneca al centro)
  //       2 = Passo 2 (Apertura verso il basso: Trittico completo con Cerimonia e Ricevimento)
  const [step, setStep] = useState(0);
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);

  const { couple, event, quote } = invitationData;

  const handleNextStep = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleFullOpen = () => {
    setStep(2);
  };

  const handleCloseAll = () => {
    setStep(0);
  };

  // Transizione morbida e realistica
  const flapTransition = {
    duration: 0.85,
    ease: [0.22, 1, 0.36, 1]
  };

  return (
    <div className="brochure-page-container">
      <div className="ambient-background-glow"></div>

      {/* Barra superiore minimale con tasto richiudi se aperto */}
      {step > 0 && (
        <header className="top-action-bar top-action-bar-minimal">
          <button
            type="button"
            className="btn-pill-action"
            onClick={handleCloseAll}
            title="Richiudi brochure"
          >
            <RotateCcw size={15} />
            <span className="btn-pill-text">Richiudi Invito</span>
          </button>
        </header>
      )}

      {/* Palcoscenico Principale */}
      <main className="brochure-stage">
        <motion.div
          className={`navy-support-card view-step-${step}`}
          layout
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <div className="navy-embossed-inner-border"></div>

          <div className="clean-folding-card">

            {/* 1. QUADRATO SUPERIORE (VISIBILE IN STEP 1 & 2) */}
            <AnimatePresence>
              {step >= 1 && (
                <motion.div
                  key="top-square"
                  className="card-leaf top-leaf"
                  initial={{ height: 0, opacity: 0, rotateX: 90 }}
                  animate={{ height: "auto", opacity: 1, rotateX: 0 }}
                  exit={{ height: 0, opacity: 0, rotateX: 90 }}
                  transition={flapTransition}
                  style={{ transformOrigin: 'bottom center', transformStyle: 'preserve-3d' }}
                >
                  <div className="square-leaf-surface top-leaf-surface">
                    <div className="top-watermark-wrap">
                      <EmbossedFloralHeart className="subtle-relief-watermark" />
                    </div>
                    <div className="top-anniversary-badge-wrap">
                      <span className="top-silver-badge">{couple.anniversaryYears} ANNIVERSARIO</span>
                      <p className="top-years-span">{couple.yearsSpan}</p>
                    </div>
                    <div className="top-countdown-container">
                      <Countdown targetDate={event.dateIso} />
                    </div>
                    <div className="crease-divider bottom-divider"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>


            {/* 2. QUADRATO CENTRALE:                                        */}
            {/*    - STEP 0: Copertina con Cuore a Rilievo (Zero spazi vuoti) */}
            {/*    - STEP 1: Citazione di Seneca in basso a destra           */}
            {/*    - STEP 2: Cerimonia Antonio Cantore & Katia Loliva        */}
            <div className="card-leaf center-leaf">
              <div className="square-leaf-surface center-leaf-surface">

                {/* STEP 0: COPERTINA */}
                {step === 0 && (
                  <motion.div
                    key="step-0-cover"
                    className="leaf-view cover-leaf-view"
                    onClick={handleNextStep}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="cover-typography-container">
                      <div className="cover-monogram-badge">25°</div>
                      <div className="anniversary-subtle-tag">
                        <span>{couple.anniversaryYears} {couple.anniversaryType}</span>
                      </div>
                      <h2 className="cover-couple-names">Antonio & Katia</h2>
                    </div>
                    <div className="tap-to-open-pill">
                      <ChevronUp size={16} className="bounce-up" />
                      <span>Tocca per aprire</span>
                    </div>
                  </motion.div>
                )}

                {/* STEP 1: CITAZIONE SENECA */}
                {step === 1 && (
                  <motion.div
                    key="step-1-seneca"
                    className="leaf-view seneca-leaf-view"
                    onClick={handleNextStep}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="seneca-quote-box">
                      <p className="seneca-text">{quote.text}</p>
                      <p className="seneca-author">{quote.author}</p>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: CERIMONIA ANTONIO & KATIA */}
                {step === 2 && (
                  <motion.div
                    key="step-2-ceremony"
                    className="leaf-view ceremony-leaf-view"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="center-header-intro">
                      {event.anniversaryHeading}
                    </div>

                    <div className="center-date-highlight">
                      <span className="event-date-main">{event.formattedDate} - {event.ceremonyTime}</span>
                      <span className="event-church-title">{event.ceremony.placeName}</span>
                      <span className="event-church-city">{event.ceremony.city}</span>
                    </div>

                    <div className="center-couple-names-block">
                      <h2 className="couple-name-groom">{couple.groom}</h2>
                      <h2 className="couple-name-bride">{couple.bride}</h2>
                    </div>

                    <div className="center-addresses">
                      {couple.addresses}
                    </div>
                  </motion.div>
                )}

              </div>
            </div>


            {/* 3. QUADRATO INFERIORE (VISIBILE IN STEP 2) */}
            <AnimatePresence>
              {step === 2 && (
                <motion.div
                  key="bottom-square"
                  className="card-leaf bottom-leaf"
                  initial={{ height: 0, opacity: 0, rotateX: -90 }}
                  animate={{ height: "auto", opacity: 1, rotateX: 0 }}
                  exit={{ height: 0, opacity: 0, rotateX: -90 }}
                  transition={flapTransition}
                  style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
                >
                  <div className="square-leaf-surface bottom-leaf-surface">
                    <div className="crease-divider top-divider"></div>

                    <div className="reception-intro-text">
                      {event.reception.introText}
                    </div>

                    <h3 className="reception-venue-title">
                      {event.reception.placeName}
                    </h3>

                    <p className="reception-venue-address">
                      {event.reception.address}
                    </p>

                    <div className="reception-actions">
                      <a
                        href={event.reception.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-navy-link"
                      >
                        <MapPin size={14} />
                        <span>Indicazioni Mappa</span>
                      </a>
                    </div>

                    <div className="rsvp-divider-line"></div>

                    <div className="rsvp-section-box">
                      <div className="rsvp-phones-row">
                        <a href={`tel:${event.rsvp.phone1}`} className="phone-chip">
                          <Phone size={12} />
                          <span>{event.rsvp.phoneFormatted1}</span>
                        </a>
                        <a href={`tel:${event.rsvp.phone2}`} className="phone-chip">
                          <Phone size={12} />
                          <span>{event.rsvp.phoneFormatted2}</span>
                        </a>
                      </div>

                      <button
                        type="button"
                        className="btn-rsvp-primary"
                        onClick={() => setIsRsvpOpen(true)}
                      >
                        <Send size={15} />
                        <span>Conferma Presenza (RSVP)</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </main>

      {/* Pulsanti di Navigazione in Basso (visibili solo dal secondo passaggio in poi) */}
      {step >= 1 && (
        <footer className="bottom-nav-controls">
          {step === 1 && (
            <div className="step-buttons-group">
              <button type="button" className="btn-action-secondary" onClick={handlePrevStep}>
                <span> Vai Indietro</span>
              </button>
              <button type="button" className="btn-action-primary" onClick={handleNextStep}>
                <span>Continua ad aprire</span>
                <ChevronDown size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step-buttons-group">
              <button type="button" className="btn-action-secondary" onClick={handleCloseAll}>
                <RotateCcw size={16} />
                <span>Richiudi Invito</span>
              </button>
              <button type="button" className="btn-action-primary" onClick={() => setIsRsvpOpen(true)}>
                <span>Conferma Partecipazione</span>
              </button>
            </div>
          )}
        </footer>
      )}

      {/* Modale RSVP */}
      <RsvpModal
        isOpen={isRsvpOpen}
        onClose={() => setIsRsvpOpen(false)}
        rsvpData={event.rsvp}
        coupleData={couple}
      />
    </div>
  );
}
