import React from 'react';

export default function EmbossedFloralHeart({ className = "" }) {
  return (
    <div className={`embossed-floral-wrapper ${className}`}>
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="embossed-vector-art"
      >
        <defs>
          {/* Filtro per effetto bassorilievo su carta panna */}
          <filter id="paperEmboss" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="1" dy="1.5" stdDeviation="1" floodColor="#C2BAB0" floodOpacity="0.6" />
            <feDropShadow dx="-1" dy="-1" stdDeviation="0.8" floodColor="#FFFFFF" floodOpacity="0.95" />
          </filter>
        </defs>

        <g filter="url(#paperEmboss)">
          {/* Cornice Quadrata Doppia Esterna a Rilievo */}
          <rect
            x="36"
            y="36"
            width="228"
            height="228"
            rx="4"
            fill="none"
            stroke="#DCD5C9"
            strokeWidth="1.2"
          />
          <rect
            x="44"
            y="44"
            width="212"
            height="212"
            rx="2"
            fill="none"
            stroke="#C8C0B2"
            strokeWidth="1"
            strokeDasharray="2 3"
          />

          {/* Cuore Centrale a Rilievo */}
          <path
            d="M150 205 
               C150 205 92 168 92 124 
               C92 100 110 84 132 84 
               C143 84 150 91 150 91 
               C150 91 157 84 168 84 
               C190 84 208 100 208 124 
               C208 168 150 205 150 205 Z"
            fill="#FAF6EE"
            stroke="#D2C9BB"
            strokeWidth="1.5"
          />

          {/* Perline decorative intorno al cuore */}
          <path
            d="M150 196 
               C150 196 98 162 98 124 
               C98 104 114 90 132 90 
               C142 90 150 97 150 97 
               C150 97 158 90 168 90 
               C186 90 202 104 202 124 
               C202 162 150 196 150 196 Z"
            fill="none"
            stroke="#C0B8AA"
            strokeWidth="0.8"
            strokeDasharray="2 3"
          />

          {/* Fiori e Foglie di Giglio a sinistra del Cuore */}
          {/* Fiore grande sinistra */}
          <path
            d="M102 120 C82 102 62 118 74 140 C84 148 100 138 102 120 Z"
            fill="#F6F1E6"
            stroke="#D0C7B9"
            strokeWidth="1"
          />
          <path
            d="M82 110 C62 92 50 108 66 122 Z"
            fill="#F3ECE0"
            stroke="#D0C7B9"
            strokeWidth="0.8"
          />
          {/* Foglie che escono in alto a sinistra */}
          <path
            d="M92 90 C70 68 56 82 76 100 Z"
            fill="#F6F1E6"
            stroke="#D0C7B9"
            strokeWidth="0.8"
          />
          <path
            d="M74 72 C58 56 46 68 64 80 Z"
            fill="#F3ECE0"
            stroke="#D0C7B9"
            strokeWidth="0.7"
          />

          {/* Fiori e Foglie di Giglio a destra del Cuore */}
          {/* Fiore grande destra */}
          <path
            d="M198 120 C218 102 238 118 226 140 C216 148 200 138 198 120 Z"
            fill="#F6F1E6"
            stroke="#D0C7B9"
            strokeWidth="1"
          />
          <path
            d="M218 110 C238 92 250 108 234 122 Z"
            fill="#F3ECE0"
            stroke="#D0C7B9"
            strokeWidth="0.8"
          />
          {/* Foglie che escono in alto a destra */}
          <path
            d="M208 90 C230 68 244 82 224 100 Z"
            fill="#F6F1E6"
            stroke="#D0C7B9"
            strokeWidth="0.8"
          />
          <path
            d="M226 72 C242 56 254 68 236 80 Z"
            fill="#F3ECE0"
            stroke="#D0C7B9"
            strokeWidth="0.7"
          />

          {/* Ramo inferiore che scende con bocciolo */}
          <path
            d="M150 205 C142 225 138 245 146 265 C152 248 156 226 150 205 Z"
            fill="#F6F1E6"
            stroke="#D0C7B9"
            strokeWidth="1"
          />
          <path
            d="M138 235 C122 242 126 256 142 248 Z"
            fill="#F3ECE0"
            stroke="#D0C7B9"
            strokeWidth="0.8"
          />
          <path
            d="M162 235 C178 242 174 256 158 248 Z"
            fill="#F3ECE0"
            stroke="#D0C7B9"
            strokeWidth="0.8"
          />

          {/* Ramo superiore sopra al cuore */}
          <path
            d="M150 84 C146 68 140 52 130 46 C128 58 140 74 150 84 Z"
            fill="#F3ECE0"
            stroke="#D0C7B9"
            strokeWidth="0.8"
          />
          <circle cx="129" cy="45" r="3.5" fill="#FAF6EE" stroke="#D0C7B9" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
}
