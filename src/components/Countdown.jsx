import React, { useState, useEffect } from 'react';

export default function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date();
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isPassed: false,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isPassed) {
    return (
      <div className="countdown-container passed">
        <span className="countdown-badge">✨ Oggi si festeggia! ✨</span>
      </div>
    );
  }

  const items = [
    { label: 'Giorni', value: timeLeft.days },
    { label: 'Ore', value: timeLeft.hours },
    { label: 'Minuti', value: timeLeft.minutes },
    { label: 'Secondi', value: timeLeft.seconds },
  ];

  return (
    <div className="countdown-wrapper">
      <div className="countdown-title">Mancano esattamente</div>
      <div className="countdown-grid">
        {items.map((item, index) => (
          <div key={index} className="countdown-card">
            <div className="countdown-number">
              {String(item.value).padStart(2, '0')}
            </div>
            <div className="countdown-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
