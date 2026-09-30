import React from 'react';
import { useTranslation } from '../../localization/LanguageContext';
import { WifiOff, Radio, Sparkles } from 'lucide-react';

interface HardwareBannerProps {
  connected: boolean;
  batteryPercentage: number;
  isDemoActive: boolean;
  expertMode: boolean;
  onOpenDevice: () => void;
}

export const HardwareBanner: React.FC<HardwareBannerProps> = ({
  connected,
  batteryPercentage,
  isDemoActive,
  expertMode,
  onOpenDevice
}) => {
  const { t } = useTranslation();

  return (
    <div className="system-status-bar">
      <div className="system-status-left">
        {isDemoActive && (
          <span className="badge-pill badge-demo flex items-center gap-1">
            <Sparkles size={11} style={{ display: 'inline', marginRight: 3 }} />
            {t.demoBadge}
          </span>
        )}
        <span 
          className="badge-pill badge-device" 
          style={{ 
            backgroundColor: connected ? '#15803d' : '#991b1b', 
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
          onClick={onOpenDevice}
          title="Click to view device telemetry"
        >
          <Radio size={11} />
          {connected ? `${t.deviceConnected} (${batteryPercentage}%)` : t.deviceDisconnected}
        </span>
      </div>

      <div className="system-status-right">
        {expertMode && (
          <span className="badge-pill" style={{ backgroundColor: '#334155', color: '#f8fafc' }}>
            {t.expertModeBadge}
          </span>
        )}
        <span className="badge-pill badge-offline" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <WifiOff size={11} />
          {t.offlineBadge}
        </span>
      </div>
    </div>
  );
};
