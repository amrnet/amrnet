import React from 'react';

export const FranceFlag = ({ width = 24, height = 18 }) => (
  <svg width={width} height={height} viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg">
    <rect width="8" height="18" fill="#002654"/>
    <rect x="8" width="8" height="18" fill="#FFFFFF"/>
    <rect x="16" width="8" height="18" fill="#CE1126"/>
  </svg>
);

export const BrazilFlag = ({ width = 24, height = 18 }) => (
  <svg width={width} height={height} viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="18" fill="#009B3A"/>
    <polygon points="12,2 22,9 12,16 2,9" fill="#FEDF00"/>
    <circle cx="12" cy="9" r="3.5" fill="#002776"/>
    <path d="M 8.5 9 Q 12 7 15.5 9 Q 12 11 8.5 9" fill="#FFFFFF"/>
  </svg>
);

export const SpainFlag = ({ width = 24, height = 18 }) => (
  <svg width={width} height={height} viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="4.5" fill="#AA151B"/>
    <rect y="4.5" width="24" height="9" fill="#F1BF00"/>
    <rect y="13.5" width="24" height="4.5" fill="#AA151B"/>
    <g transform="translate(6,9)">
      <rect x="-1" y="-2" width="2" height="4" fill="#AA151B"/>
      <rect x="-0.5" y="-1.5" width="1" height="3" fill="#F1BF00"/>
    </g>
  </svg>
);

export const USAFlag = ({ width = 24, height = 18 }) => (
  <svg width={width} height={height} viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="18" fill="#B22234"/>
    <rect y="1.4" width="24" height="1.4" fill="#FFFFFF"/>
    <rect y="4.2" width="24" height="1.4" fill="#FFFFFF"/>
    <rect y="7" width="24" height="1.4" fill="#FFFFFF"/>
    <rect y="9.8" width="24" height="1.4" fill="#FFFFFF"/>
    <rect y="12.6" width="24" height="1.4" fill="#FFFFFF"/>
    <rect y="15.4" width="24" height="1.4" fill="#FFFFFF"/>
    <rect width="10" height="9" fill="#3C3B6E"/>
  </svg>
);
