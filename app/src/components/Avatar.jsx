import React from 'react';
import umiIconGif from '../components/umi_icon.gif';

export const Avatar = ({ config, size = 'md', onClick }) => {
  const sizes = { sm: 40, md: 80, lg: 120 };
  const s = sizes[size];

  return (
    <div 
      onClick={onClick}
      className={onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    >
      <img src={umiIconGif} className='' style={{filter: 'invert(24%) sepia(63%) saturate(320%) hue-rotate(5deg) brightness(92%) contrast(96%)'}}></img>
    </div>
  );
};