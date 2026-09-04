import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  Heart,
  MapPin,
  Send,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Phone,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import EmbossedFloralHeart from './EmbossedFloralHeart';
import Countdown from './Countdown';
import RsvpModal from './RsvpModal';
import { getInvitationData } from '../data/invitationData';

export default function BrochureInvitation() {
  // step: 0 = Chiuso (Unico quadrato perfetto con Copertina e Cuore)
  //       1 = Passo 1 (Apertura verso l'alto: Mostra Seneca al centro)
  //       2 = Passo 2 (Apertura verso il basso: Trittico completo con Cerimonia e Ricevimento)
  const [step, setStep] = useState(0);
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);

  const { couple, event, quote } = getInvitationData();

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

  const [touchStartY, setTouchStartY] = useState(null);

  const handleTouchStart = (e) => {
    // Registra lo start solo se c'è un solo dito (no pinch-zoom)
    if (e.touches.length === 1) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartY === null) return;

    // Ignoriamo lo swipe se siamo zoomati
    if (zoomLevel > 0 || (window.visualViewport && window.visualViewport.scale > 1.05)) {
      setTouchStartY(null);
      return;
    }

    const touchEndY = e.changedTouches[0].clientY;
    const distance = touchStartY - touchEndY;

    if (distance > 50) {
      handleNextStep(); // Swipe up (apre)
    } else if (distance < -50) {
      handlePrevStep(); // Swipe down (chiude)
    }

    setTouchStartY(null);
  };

  const cardRef = useRef(null);
  const containerRef = useRef(null);
  const controls = useAnimation();
  const [autoScaleFactor, setAutoScaleFactor] = useState(1);
  const [zoomScaleFactor, setZoomScaleFactor] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(0); // 0: Normal, 1: Fit Width, 2: Max Zoom
  const [hasZoomed, setHasZoomed] = useState(false);
  const [dragLimits, setDragLimits] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  const handleZoomToggle = () => {
    let newLevel;
    if (step === 1) {
      newLevel = zoomLevel === 0 ? 1 : 0;
    } else {
      newLevel = (zoomLevel + 1) % 3;
    }
    setZoomLevel(newLevel);
    if (!hasZoomed) setHasZoomed(true);
  };

  useEffect(() => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const cardHeight = card.offsetHeight;
    const cardWidth = card.offsetWidth;
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;

    if (zoomLevel === 1) {
      const scale = zoomScaleFactor;
      const polaroidTopLocal = (cardHeight / 2 + cardWidth) * scale;
      const cardNativeCenterY = screenHeight / 2 - 32;
      const targetY = polaroidTopLocal - cardNativeCenterY + 40; 

      controls.start({ 
        scale: scale, 
        x: 0, 
        y: targetY, 
        transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } 
      });

      const maxY = targetY;
      const distanceToBottomLocal = cardHeight / 2 + cardWidth;
      const minY = screenHeight - 40 - cardNativeCenterY - distanceToBottomLocal * scale;
      const scaledWidth = cardWidth * scale;
      const maxX = Math.max(0, (scaledWidth - screenWidth) / 2 + 40);
      const minX = -maxX;
      
      setDragLimits({ top: Math.min(minY, maxY), bottom: Math.max(minY, maxY), left: minX, right: maxX });
      
    } else if (zoomLevel === 0) {
      controls.start({ 
        scale: autoScaleFactor, 
        x: 0, 
        y: 0, 
        transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } 
      });
    } else if (zoomLevel === 2) {
      const scale = zoomScaleFactor * 1.5;
      controls.start({ 
        scale: scale, 
        transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } 
      });

      const distanceToTopLocal = cardHeight / 2 + cardWidth;
      const distanceToBottomLocal = cardHeight / 2 + cardWidth;
      const cardNativeCenterY = screenHeight / 2 - 32;
      const maxY = distanceToTopLocal * scale - cardNativeCenterY + 40;
      const minY = screenHeight - 40 - cardNativeCenterY - distanceToBottomLocal * scale;
      const scaledWidth = cardWidth * scale;
      const maxX = Math.max(0, (scaledWidth - screenWidth) / 2 + 40);
      const minX = -maxX;
      
      setDragLimits({ top: Math.min(minY, maxY), bottom: Math.max(minY, maxY), left: minX, right: maxX });
    }
  }, [zoomLevel, autoScaleFactor, zoomScaleFactor, controls]);

  const getCurrentScale = () => {
    if (zoomLevel === 0) return autoScaleFactor;
    if (zoomLevel === 1) return zoomScaleFactor;
    if (zoomLevel === 2) return zoomScaleFactor * 1.5;
    return autoScaleFactor;
  };

  // Effetto cinematografico: Zoom-out dinamico per far entrare tutto nello schermo
  useEffect(() => {
    const updateScale = () => {
      if (!cardRef.current) return;

      const baseHeight = cardRef.current.offsetHeight;
      const baseWidth = cardRef.current.offsetWidth;
      if (baseHeight === 0 || baseWidth === 0) return;

      // Calcoliamo l'altezza e la larghezza totale stimata in base allo step
      let requiredHeight = baseHeight * 1.1;
      if (step >= 1) {
        requiredHeight = baseHeight * 3.3;
      }
      const requiredWidth = baseWidth * 1.454545;

      const availableHeight = window.innerHeight;
      const availableWidth = window.innerWidth;

      let scaleH = 1;
      let scaleW = 1;

      if (requiredWidth > availableWidth) {
        scaleW = availableWidth / (requiredWidth * 1.05);
      }

      if (requiredHeight > availableHeight) {
        scaleH = availableHeight / requiredHeight;
      }

      // autoScaleFactor adatta l'invito per farlo entrare TUTTO (sia larghezza che altezza del piatto blu)
      setAutoScaleFactor(Math.min(scaleH, scaleW, 1));
      
      // zoomScaleFactor fa in modo che i FOGLI (baseWidth) riempiano la larghezza dello schermo
      const sheetFitScale = availableWidth / (baseWidth * 1.02); 
      setZoomScaleFactor(Math.min(sheetFitScale, 2));
    };

    updateScale();
    const timeout = setTimeout(updateScale, 50);

    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timeout);
    };
  }, [step]);

  // Transizione morbida e realistica
  const flapTransition = {
    duration: 0.85,
    ease: [0.22, 1, 0.36, 1]
  };

  let dragProps = {};
  if (zoomLevel === 1) {
    dragProps = {
      drag: "y",
      dragConstraints: dragLimits,
      dragMomentum: true
    };
  } else if (zoomLevel === 2) {
    dragProps = {
      drag: true,
      dragConstraints: dragLimits,
      dragMomentum: false,
      dragElastic: 0.1
    };
  }

  return (
    <div
      ref={containerRef}
      className="brochure-page-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="ambient-background-glow"></div>

      {/* Palcoscenico Principale */}
      <main className="brochure-stage">
        <motion.div
          className="navy-support-card"
          transition={{ duration: 1.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.div
            ref={cardRef}
            className="clean-folding-card"
            style={{ 
              transformOrigin: 'center center',
              touchAction: zoomLevel > 0 ? 'none' : 'auto'
            }}
            animate={controls}
            {...dragProps}
          >

            {/* 1. QUADRATO SUPERIORE (VISIBILE IN STEP 1 & 2) */}
            <AnimatePresence>
              {step >= 1 && (
                <motion.div
                  key="top-square"
                  className="card-leaf top-leaf"
                  initial={{ rotateX: -90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: -90, opacity: 0 }}
                  transition={{ duration: 1.6, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ transformOrigin: 'bottom center', transformStyle: 'preserve-3d' }}
                >
                  <div className="square-leaf-surface top-leaf-surface leaf-top-rounded" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="polaroid-frame">
                      <img src="/Copertina.jpg" alt="Copertina" className="polaroid-image" />
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
            <motion.div className="card-leaf center-leaf" layout>
              {/* Il cartoncino blu di fondo fa da cornice SOLO all'anta centrale */}
              <div className="navy-background-plate">
                <div className="navy-embossed-inner-border"></div>
              </div>

              <div className={`square-leaf-surface center-leaf-surface ${step === 0 ? 'leaf-top-rounded leaf-bottom-rounded' : ''} ${step === 1 ? 'leaf-bottom-rounded' : ''}`}>

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
                      <h2 className="cover-couple-names">Katia e Antonio</h2>
                      <div className="anniversary-subtle-tag">
                        <span>{couple.anniversaryType}</span>
                      </div>
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
                    onClick={() => {
                      if (zoomLevel === 0) handleNextStep();
                    }}
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
                    <div
                      className="center-header-intro"
                      dangerouslySetInnerHTML={{ __html: event.anniversaryHeading }}
                    />

                    <div className="center-date-highlight">
                      <span className="event-date-main">{event.formattedDate}<br />{event.ceremonyTime}</span>
                      <span className="event-church-title">{event.ceremony.placeName}</span>
                      {/*<span className="event-church-city">{event.ceremony.city}</span>*/}
                    </div>

                    <div className="center-couple-names-block">
                      <h2 className="couple-name-groom">{couple.groom}</h2>
                      <h2 className="couple-name-bride">{couple.bride}</h2>
                    </div>

                    {/*<div className="center-addresses">
                      {couple.addresses}
                    </div>*/}
                  </motion.div>
                )}

              </div>
            </motion.div>


            {/* 3. QUADRATO INFERIORE (VISIBILE IN STEP 2) */}
            <AnimatePresence>
              {step === 2 && (
                <motion.div
                  key="bottom-square"
                  className="card-leaf bottom-leaf"
                  initial={{ rotateX: 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: 90, opacity: 0 }}
                  transition={{ duration: 1.6, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
                >
                  <div className="square-leaf-surface bottom-leaf-surface leaf-bottom-rounded">
                    <div className="crease-divider top-divider"></div>

                    {event.reception ? (
                      <>
                        <div className="reception-intro-text">
                          {event.reception.introText}
                        </div>

                        <div className="reception-venue-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <h3 className="reception-venue-title">
                            {event.reception.placeName}
                          </h3>

                          <p className="reception-venue-address">
                            {event.reception.address}
                          </p>

                          <p className="reception-venue-address">
                            {event.reception.city}
                          </p>
                        </div>

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

                        <div className="rsvp-section-box">
                          <button
                            type="button"
                            className="btn-rsvp-primary"
                            onClick={() => setIsRsvpOpen(true)}
                          >
                            <Send size={15} />
                            <span>Conferma Presenza (RSVP)</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="ceremony-only-bottom" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1rem', gap: '2rem' }}>
                        <p className="reception-intro-text" style={{ fontSize: '1.2rem', fontStyle: 'italic', lineHeight: '1.6' }}>
                          Saremmo felici di condividere<br />con voi la gioia<br />di questo momento.
                        </p>
                        <EmbossedFloralHeart scale={0.7} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </motion.div>
      </main>

      {/* Pulsante Zoom (visibile da step 1 in poi) */}
      {/* Pulsante Zoom (visibile da step 1 in poi) */}
      {step >= 1 && (
        <div className="zoom-controls-wrapper">
          {!hasZoomed && zoomLevel === 0 && (
            <div className="zoom-tooltip">
              Usa questo tasto per ingrandire
            </div>
          )}
          {step === 1 && zoomLevel === 1 && (
            <div className="zoom-tooltip">
              Clicca per rimpicciolire e continuare ad aprire l'invito
            </div>
          )}
          {step === 2 && zoomLevel === 1 && (
            <div className="zoom-tooltip">
              Clicca ancora per ingrandire di più
            </div>
          )}
          <button
            type="button"
            className="zoom-toggle-button"
            onClick={handleZoomToggle}
            title="Cambia livello di Zoom"
          >
            {(zoomLevel === 2 || (step === 1 && zoomLevel === 1)) ? <ZoomOut size={24} /> : <ZoomIn size={24} />}
          </button>
        </div>
      )}

      {/* Pulsanti di Navigazione in Basso (visibili solo durante l'apertura) */}
      {step === 1 && zoomLevel === 0 && (
        <footer className="bottom-nav-controls">
          <div className="step-buttons-group">
            <button type="button" className="btn-action-secondary" onClick={handlePrevStep}>
              <span> Vai Indietro</span>
            </button>
            <button type="button" className="btn-action-primary" onClick={handleNextStep}>
              <span>Continua ad aprire</span>
              <ChevronDown size={18} />
            </button>
          </div>
        </footer>
      )}

      {/* Modale RSVP */}
      <RsvpModal
        isOpen={isRsvpOpen}
        onClose={() => setIsRsvpOpen(false)}
        rsvpData={event.rsvp}
        coupleData={couple}
        eventData={event}
      />
    </div>
  );
}
