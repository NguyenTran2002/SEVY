import React from 'react';
import { useTranslations } from '../../lib/i18n';

export const Logo: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }> = ({ title, ...props }) => {
  const { language } = useTranslations();

  const logoFontFamily = language === 'vi' 
    ? 'Helvetica, Poppins, sans-serif' 
    : 'ibrand, Poppins, sans-serif';

  const textToShow = title || 'SEVY';
  // A simple length check is more robust than checking for a specific string
  const viewBox = textToShow.length > 5 ? "0 0 190 40" : "0 0 138 40";

  return (
    <svg
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="logoTitle"
      {...props}
    >
      <title id="logoTitle">{textToShow} Logo</title>
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffc8dd" />
          <stop offset="100%" stopColor="#a2d2ff" />
        </linearGradient>
      </defs>
      <g>
          <path
          d="M20 0C31.0457 0 40 8.9543 40 20C40 31.0457 31.0457 40 20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0Z"
          transform="translate(0 0)"
          fill="url(#logo-gradient)"
          />
          <path
          d="M20 0C31.0457 0 40 8.9543 40 20C40 31.0457 31.0457 40 20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0Z"
          transform="translate(10 0)"
          fill="url(#logo-gradient)"
          style={{ mixBlendMode: 'screen', opacity: 0.8 }}
          />
      </g>
      <text
        x="58"
        y="28"
        fontFamily={logoFontFamily}
        fontSize="26"
        fontWeight="600"
        fill="#1f2937"
        letterSpacing="1"
      >
        {textToShow}
      </text>
    </svg>
  );
};