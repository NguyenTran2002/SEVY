import React from 'react';

export const ThumbsDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.05 4.95a2.25 2.25 0 00-3.181 0l-2.25 2.25a2.25 2.25 0 000 3.182l4.5 4.5a2.25 2.25 0 003.182 0l2.25-2.25a2.25 2.25 0 000-3.181l-4.5-4.5zM15 15.75l-4.5 4.5a2.25 2.25 0 01-3.182 0l-2.25-2.25a2.25 2.25 0 010-3.182l4.5-4.5a2.25 2.25 0 013.182 0l2.25 2.25a2.25 2.25 0 010 3.181z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5"
    />
  </svg>
);