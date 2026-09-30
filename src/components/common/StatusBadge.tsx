import React from 'react';
import { ResultCategory } from '../../types';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  category: ResultCategory;
  customText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ category, customText, size = 'md' }) => {
  let bg = '#e8f5ed';
  let border = '#a3d9b5';
  let text = '#14532d';
  let icon = <CheckCircle2 size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} />;
  let label = customText || 'Screening Consistent';

  if (category === 'YELLOW') {
    bg = '#fef9c3';
    border = '#fde047';
    text = '#713f12';
    icon = <AlertTriangle size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} />;
    label = customText || 'Review Required';
  } else if (category === 'RED') {
    bg = '#fef2f2';
    border = '#fca5a5';
    text = '#7f1d1d';
    icon = <AlertOctagon size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} />;
    label = customText || 'Lab Confirmation Required';
  } else if (category === 'UNKNOWN') {
    bg = '#f3f4f6';
    border = '#d1d5db';
    text = '#1f2937';
    icon = <HelpCircle size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} />;
    label = customText || 'Unable to Assess';
  }

  const padding = size === 'sm' ? '3px 8px' : size === 'lg' ? '8px 14px' : '5px 10px';
  const fontSize = size === 'sm' ? '0.75rem' : size === 'lg' ? '1.05rem' : '0.85rem';

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: bg,
        border: `1.5px solid ${border}`,
        color: text,
        borderRadius: '9999px',
        fontWeight: 600,
        padding,
        fontSize,
        lineHeight: 1
      }}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
