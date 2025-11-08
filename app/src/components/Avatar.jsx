import React from 'react';

export const Avatar = ({ config, size = 'md', onClick }) => {
  const sizes = { sm: 40, md: 80, lg: 120 };
  const s = sizes[size];

  return (
    <div 
      onClick={onClick}
      className={onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    >
      <svg width={s} height={s} viewBox="0 0 100 100">
        {/* Head */}
        <circle cx="50" cy="40" r="25" fill={config.skinTone} />
        
        {/* Hair */}
        {config.hairStyle === 'short' && (
          <path d="M 25 35 Q 25 15 50 15 Q 75 15 75 35" fill={config.hairColor} />
        )}
        {config.hairStyle === 'long' && (
          <>
            <path d="M 25 35 Q 25 15 50 15 Q 75 15 75 35" fill={config.hairColor} />
            <rect x="20" y="35" width="10" height="30" fill={config.hairColor} />
            <rect x="70" y="35" width="10" height="30" fill={config.hairColor} />
          </>
        )}
        {config.hairStyle === 'curly' && (
          <>
            <circle cx="30" cy="25" r="8" fill={config.hairColor} />
            <circle cx="45" cy="20" r="8" fill={config.hairColor} />
            <circle cx="55" cy="20" r="8" fill={config.hairColor} />
            <circle cx="70" cy="25" r="8" fill={config.hairColor} />
          </>
        )}
        {config.hairStyle === 'ponytail' && (
          <>
            <path d="M 25 35 Q 25 15 50 15 Q 75 15 75 35" fill={config.hairColor} />
            <ellipse cx="50" cy="15" rx="6" ry="15" fill={config.hairColor} />
          </>
        )}
        
        {/* Eyes */}
        {config.eyes === 'happy' && (
          <>
            <path d="M 40 35 Q 42 37 44 35" stroke="#000" strokeWidth="2" fill="none" />
            <path d="M 56 35 Q 58 37 60 35" stroke="#000" strokeWidth="2" fill="none" />
          </>
        )}
        {config.eyes === 'neutral' && (
          <>
            <circle cx="42" cy="36" r="2" fill="#000" />
            <circle cx="58" cy="36" r="2" fill="#000" />
          </>
        )}
        {config.eyes === 'excited' && (
          <>
            <circle cx="42" cy="36" r="3" fill="#000" />
            <circle cx="58" cy="36" r="3" fill="#000" />
          </>
        )}
        {config.eyes === 'sleepy' && (
          <>
            <line x1="38" y1="36" x2="46" y2="36" stroke="#000" strokeWidth="2" />
            <line x1="54" y1="36" x2="62" y2="36" stroke="#000" strokeWidth="2" />
          </>
        )}
        
        {/* Mouth */}
        {config.mouth === 'smile' && (
          <path d="M 40 45 Q 50 50 60 45" stroke="#000" strokeWidth="2" fill="none" />
        )}
        {config.mouth === 'neutral' && (
          <line x1="42" y1="47" x2="58" y2="47" stroke="#000" strokeWidth="2" />
        )}
        {config.mouth === 'grin' && (
          <path d="M 40 45 Q 50 52 60 45" stroke="#000" strokeWidth="2.5" fill="none" />
        )}
        {config.mouth === 'laugh' && (
          <ellipse cx="50" cy="47" rx="8" ry="5" fill="#000" />
        )}
        
        {/* Body/Clothing */}
        {config.clothing === 'tshirt' && (
          <rect x="25" y="65" width="50" height="35" fill={config.clothingColor} rx="5" />
        )}
        {config.clothing === 'hoodie' && (
          <>
            <rect x="25" y="65" width="50" height="35" fill={config.clothingColor} rx="5" />
            <circle cx="50" cy="65" r="15" fill={config.clothingColor} />
          </>
        )}
        {config.clothing === 'formal' && (
          <>
            <rect x="25" y="65" width="50" height="35" fill={config.clothingColor} rx="5" />
            <rect x="47" y="65" width="6" height="35" fill="#FFF" />
          </>
        )}
        {config.clothing === 'casual' && (
          <rect x="25" y="65" width="50" height="35" fill={config.clothingColor} rx="8" />
        )}
      </svg>
    </div>
  );
};