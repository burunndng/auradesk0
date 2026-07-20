import React from 'react';

/**
 * ConsciousNodeIcon
 *
 * Concept: Expanded consciousness via neural network nodes and pathways
 * Geometry: Central node with 8 radiating connection pathways (8-fold symmetry)
 * Symbolism: Neural junction with expanding pathways representing awakened awareness
 *
 * Design: Central circle with 8 lines radiating outward, nodes at endpoints and center,
 * representing the hub of consciousness with connections extending to all directions of experience.
 */

interface ConsciousNodeIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function ConsciousNodeIcon({
  size = 64,
  color = 'currentColor',
  className = ''
}: ConsciousNodeIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* EIGHT RADIATING PATHWAYS (2px) - 8-fold symmetry */}
      {/* Cardinal directions: North, South, East, West */}
      <line x1="12" y1="12" x2="12" y2="2" strokeWidth="2" />     {/* North */}
      <line x1="12" y1="12" x2="12" y2="22" strokeWidth="2" />    {/* South */}
      <line x1="12" y1="12" x2="2" y2="12" strokeWidth="2" />     {/* West */}
      <line x1="12" y1="12" x2="22" y2="12" strokeWidth="2" />    {/* East */}

      {/* Diagonal directions: NE, NW, SE, SW */}
      <line x1="12" y1="12" x2="19" y2="5" strokeWidth="2" />     {/* Northeast */}
      <line x1="12" y1="12" x2="5" y2="5" strokeWidth="2" />      {/* Northwest */}
      <line x1="12" y1="12" x2="19" y2="19" strokeWidth="2" />    {/* Southeast */}
      <line x1="12" y1="12" x2="5" y2="19" strokeWidth="2" />     {/* Southwest */}

      {/* SECONDARY CONNECTION RINGS (1.5px) */}
      <circle cx="12" cy="12" r="4" strokeWidth="1.5" />

      {/* TERTIARY EXPANSION RING (1px) */}
      <circle cx="12" cy="12" r="7" strokeWidth="1" opacity="0.6" />

      {/* CENTRAL NODE NEXUS (Filled) - Largest filled node */}
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />

      {/* CARDINAL ENDPOINT NODES (Filled) */}
      <circle cx="12" cy="2" r="0.9" fill={color} stroke="none" />  {/* North */}
      <circle cx="12" cy="22" r="0.9" fill={color} stroke="none" />  {/* South */}
      <circle cx="2" cy="12" r="0.9" fill={color} stroke="none" />   {/* West */}
      <circle cx="22" cy="12" r="0.9" fill={color} stroke="none" />  {/* East */}

      {/* DIAGONAL ENDPOINT NODES (Filled) */}
      <circle cx="19" cy="5" r="0.8" fill={color} stroke="none" opacity="0.85" />   {/* NE */}
      <circle cx="5" cy="5" r="0.8" fill={color} stroke="none" opacity="0.85" />    {/* NW */}
      <circle cx="19" cy="19" r="0.8" fill={color} stroke="none" opacity="0.85" />  {/* SE */}
      <circle cx="5" cy="19" r="0.8" fill={color} stroke="none" opacity="0.85" />   {/* SW */}

      {/* INNER JUNCTION NODES (0.6px) - Intermediate awareness points */}
      <circle cx="12" cy="6" r="0.5" fill={color} stroke="none" opacity="0.7" />
      <circle cx="12" cy="18" r="0.5" fill={color} stroke="none" opacity="0.7" />
      <circle cx="6" cy="12" r="0.5" fill={color} stroke="none" opacity="0.7" />
      <circle cx="18" cy="12" r="0.5" fill={color} stroke="none" opacity="0.7" />
    </svg>
  );
}
