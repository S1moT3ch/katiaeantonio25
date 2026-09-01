import React, { useState } from 'react';
import { Calendar, Download, ExternalLink } from 'lucide-react';

export default function CalendarButton({ eventData, coupleData }) {
  const [open, setOpen] = useState(false);

  const title = `25° Anniversario di Matrimonio - ${coupleData.bride} & ${coupleData.groom}`;
  const details = `Festeggiamenti per le Nozze d'Argento di ${coupleData.bride} e ${coupleData.groom}.\n\nCerimonia: ${eventData.ceremony.placeName} alle ore ${eventData.ceremonyTime}.\nRicevimento: ${eventData.reception.placeName} alle ore ${eventData.receptionTime}.`;
  const location = `${eventData.ceremony.placeName}, ${eventData.ceremony.address}, ${eventData.ceremony.city}`;

  const startDate = new Date(eventData.dateIso);
  const endDate = new Date(startDate.getTime() + 6 * 60 * 60 * 1000); // +6 hours

  const formatGoogleDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(
    endDate
  )}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(
    location
  )}`;

  const downloadIcs = () => {
    const formatDate = (date) => {
      return date
        .toISOString()
        .replace(/-|:|\.\d+/g, '')
        .slice(0, 15) + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Katia e Antonio//25 Anniversario//IT',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${details.replace(/\n/g, '\\n')}`,
      `LOCATION:${location}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'invito-katia-antonio-25.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setOpen(false);
  };

  return (
    <div className="calendar-dropdown-container">
      <button
        type="button"
        className="btn-calendar-trigger"
        onClick={() => setOpen(!open)}
        aria-label="Aggiungi al Calendario"
      >
        <Calendar size={18} className="btn-icon" />
        <span>Salva la Data nel Calendario</span>
      </button>

      {open && (
        <div className="calendar-dropdown-menu">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="calendar-dropdown-item"
            onClick={() => setOpen(false)}
          >
            <ExternalLink size={16} />
            <span>Google Calendar</span>
          </a>
          <button
            type="button"
            className="calendar-dropdown-item"
            onClick={downloadIcs}
          >
            <Download size={16} />
            <span>Apple / Outlook (.ics)</span>
          </button>
        </div>
      )}
    </div>
  );
}
