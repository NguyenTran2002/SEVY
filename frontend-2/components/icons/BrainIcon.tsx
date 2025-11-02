import React from 'react';

export const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        strokeWidth="1.5" 
        stroke="currentColor" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
        <path d="M15.5 12.8a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" />
        <path d="M8.5 12.8a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8" />
        <path d="M17.5 14.8a3.5 3.5 0 0 0 0 -7h-1.5" />
        <path d="M19 8.1v-2.8a3.5 3.5 0 0 0 -7 0" />
        <path d="M6.5 14.8a3.5 3.5 0 0 1 0 -7h1.5" />
        <path d="M5 8.1v-2.8a3.5 3.5 0 0 1 7 0v10" />
    </svg>
);