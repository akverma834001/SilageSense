import React, { useState, useEffect } from 'react';
import { DeviceTelemetry, CalibrationRecord } from '../../types';
import { deviceSimulator } from '../../services/deviceSimulator';
import { storage } from '../../services/storage';
import { useTranslation } from '../../localization/LanguageContext';
import { 
  Radio, 
  BatteryCharging, 
  ShieldCheck, 
  RotateCw, 
  Wrench, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  FlaskConical
} from 'lucide-react';

export const DeviceScreen: React.FC = () => {
  const { t } = useTranslation();
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>(deviceSimulator.getTelemetry());
  const [selfTestRunning, setSelfTestRunning] = useState<boolean>(false);
  const [selfTestResult, setSelfTestResult] = useState<string | null>(null);

  // Calibration Wizard State (Buffer 7.00 -> Buffer 4.00)
  const [showCalibrationWizard, setShowCalibrationWizard] = useState<boolean>(false);
  const [calStep, setCalStep] = useState<1 | 2 | 3>(1);
  const [calReadings, setCalReadings] = useState<{ b7: number; b4: number }>({ b7: 7.01, b4: 4.02 });
  const [calStable, setCalStable] = useState<boolean>(false);

  // Hardware Sandbox Expandable Drawer
  const [showSandbox, setShowSandbox] = useState<boolean>(false);
  const [faults, setFaults] = useState(deviceSimulator.faults);

  useEffect(() => {
    const unsub = deviceSimulator.subscribe(data => {
      setTelemetry(data);
      setFaults({ ...deviceSimulator.faults });
    });
    return unsub;
  }, []);

  const handleRunSelfTest = async () => {
    setSelfTestRunning(true);
    setSelfTestResult(null);
    const res = await deviceSimulator.runDeviceCheck();
    setSelfTestRunning(false);
    setSelfTestResult(res.ok ? 'All hardware systems operational. Sensor drift is within ±0.02 pH.' : res.message);
  };

  const handleStartCalibration = () => {
    setShowCalibrationWizard(true);
    setCalStep(1);
    setCalStable(false);
    setTimeout(() => setCalStable(true), 1200);
  };

  const handleConfirmBuffer7 = () => {
    setCalStep(2);
    setCalStable(false);
    setTimeout(() => setCalStable(true), 1200);
  };

  const handleConfirmBuffer4 = () => {
    // Save calibration record
    const record: CalibrationRecord = {
      id: `CAL-${Date.now().toString().slice(-6)}`,
      deviceId: telemetry.deviceId,
      sensor: 'PH_ELECTRODE',
      timestamp: new Date().toISOString(),
      operator: 'Ramesh Patil',
      referencePoints: [
        { target: 'Buffer 7.00', measured: calReadings.b7 },
        { target: 'Buffer 4.00', measured: calReadings.b4 }
      ],
      slope: 58.6,
      offset: 1.8,
      status: 'SUCCESS',
      versionTag: `CAL-${new Date().toISOString().slice(0, 10)}`
    };
    storage.saveCalibrationRecord(record);
    deviceSimulator.resetFaults();
    setCalStep(3);
  };

  const handleToggleFault = (key: keyof typeof faults, value: any) => {
    const next = { ...faults, [key]: value };
    deviceSimulator.setFaults(next);
    setFaults(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)' }}>
          {t.devicePageTitle}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Hardware status, probe calibration, and sensor health
        </p>
      </div>

      {/* Realistic Device Visual */}
      <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)', backgroundColor: '#ffffff' }}>
        <img 
          src="/assets/silagesense_device.jpg" 
          alt="SilageSense portable testing device" 
          style={{ width: '100%', height: '190px', objectFit: 'cover' }}
        />
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fafbfa' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
              {telemetry.deviceId}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Firmware: {telemetry.firmwareVersion} • BLE Connected
            </div>
          </div>
          <span style={{ fontSize: '0.78rem', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 600, padding: '4px 10px', borderRadius: '999px' }}>
            ● Ready
          </span>
        </div>
      </div>

      {/* Hardware Telemetry Card */}
      <div className="indicators-card">
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
          Instrument Telemetry
        </h3>

        <div className="indicator-row">
          <span className="indicator-name">Connection</span>
          <span className="indicator-val" style={{ color: '#15803d' }}>
            <Radio size={16} />
            <span>Bluetooth Low Energy</span>
          </span>
        </div>

        <div className="indicator-row">
          <span className="indicator-name">{t.batteryLabel}</span>
          <span className="indicator-val">
            <BatteryCharging size={16} color="#15803d" />
            <span>{telemetry.batteryPercentage}% (LiFePO4 3200mAh)</span>
          </span>
        </div>

        <div className="indicator-row">
          <span className="indicator-name">{t.calibrationLabel}</span>
          <span className="indicator-val" style={{ color: '#15803d' }}>
            <ShieldCheck size={16} />
            <span>{t.upToDate}</span>
          </span>
        </div>

        <div className="indicator-row">
          <span className="indicator-name">pH Electrode</span>
          <span className="indicator-val">
            {telemetry.sensors.phProbe.statusText}
          </span>
        </div>

        <div className="indicator-row">
          <span className="indicator-name">Load Cell</span>
          <span className="indicator-val">
            {telemetry.sensors.loadCell.statusText}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="btn-primary" onClick={handleStartCalibration} id="start-calibration-btn">
          <Wrench size={18} />
          <span>{t.calibrateDeviceBtn}</span>
        </button>

        <button className="btn-secondary" onClick={handleRunSelfTest} disabled={selfTestRunning} id="self-test-btn">
          <RotateCw size={18} style={{ animation: selfTestRunning ? 'spin 1s linear infinite' : 'none' }} />
          <span>{selfTestRunning ? 'Running Diagnostic Scan…' : t.runDeviceCheckBtn}</span>
        </button>

        {selfTestResult && (
          <div style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
            ✓ {selfTestResult}
          </div>
        )}
      </div>

      {/* Hardware Simulation Sandbox Drawer for Evaluators */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '6px' }}>
        <button
          type="button"
          onClick={() => setShowSandbox(!showSandbox)}
          style={{
            background: 'none',
            border: 'none',
            color: '#b45309',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 0'
          }}
        >
          <Sliders size={16} />
          <span>{showSandbox ? 'Hide Hardware Simulation Sandbox' : 'Show Hardware Simulation Sandbox (Evaluators)'}</span>
        </button>

        {showSandbox && (
          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef08a', borderRadius: 'var(--radius-md)', padding: '14px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: 600 }}>
              Simulate sensor faults & abnormal test conditions to test edge cases:
            </p>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', cursor: 'pointer' }}>
              <span>Dirty / Unstable pH Probe</span>
              <input
                type="checkbox"
                checked={faults.dirtyPHProbe}
                onChange={e => handleToggleFault('dirtyPHProbe', e.target.checked)}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', cursor: 'pointer' }}>
              <span>Sample Weight Fault</span>
              <select
                value={faults.sampleWeightFault}
                onChange={e => handleToggleFault('sampleWeightFault', e.target.value)}
                style={{ fontSize: '0.8rem', padding: '3px 6px', borderRadius: '4px' }}
              >
                <option value="NONE">Normal (124g)</option>
                <option value="UNDERFILL">Underfill (45g)</option>
                <option value="OVERFILL">Overfill (210g)</option>
              </select>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', cursor: 'pointer' }}>
              <span>Camera Optics Fault</span>
              <select
                value={faults.cameraFault}
                onChange={e => handleToggleFault('cameraFault', e.target.value)}
                style={{ fontSize: '0.8rem', padding: '3px 6px', borderRadius: '4px' }}
              >
                <option value="NONE">Normal Clear Optics</option>
                <option value="BLUR">Blurred Image</option>
                <option value="DARK_OBSTRUCTION">Dark / Lens Obstructed</option>
              </select>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', cursor: 'pointer' }}>
              <span>Chamber Lid Left Open</span>
              <input
                type="checkbox"
                checked={faults.chamberOpen}
                onChange={e => handleToggleFault('chamberOpen', e.target.checked)}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', cursor: 'pointer' }}>
              <span>Out-Of-Distribution Sample</span>
              <input
                type="checkbox"
                checked={faults.outOfDistributionSample}
                onChange={e => handleToggleFault('outOfDistributionSample', e.target.checked)}
              />
            </label>

            <button 
              type="button" 
              onClick={() => deviceSimulator.resetFaults()}
              style={{ padding: '6px', fontSize: '0.78rem', background: '#fef3c7', border: '1px solid #d97706', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, color: '#92400e' }}
            >
              Reset All Simulator Faults
            </button>
          </div>
        )}
      </div>

      {/* 2-Point pH Calibration Modal */}
      {showCalibrationWizard && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-sheet">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlaskConical size={24} style={{ color: 'var(--primary)' }} />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>
                  2-Point pH Buffer Calibration
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Standard NIST buffer calibration for dairy field probes
                </p>
              </div>
            </div>

            {calStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                  <strong>Step 1:</strong> Rinse electrode in clean water. Immerse probe in <strong>Buffer 7.00</strong> solution.
                </p>
                <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary)' }}>
                    7.01 pH
                  </div>
                  <div style={{ fontSize: '0.82rem', color: calStable ? '#15803d' : '#b45309', fontWeight: 600, marginTop: '4px' }}>
                    {calStable ? 'Signal Stable ✓' : 'Stabilizing signal…'}
                  </div>
                </div>
                <button className="btn-primary" onClick={handleConfirmBuffer7} disabled={!calStable}>
                  Confirm Buffer 7.00
                </button>
              </div>
            )}

            {calStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                  <strong>Step 2:</strong> Rinse probe again. Immerse in <strong>Buffer 4.00</strong> solution.
                </p>
                <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary)' }}>
                    4.02 pH
                  </div>
                  <div style={{ fontSize: '0.82rem', color: calStable ? '#15803d' : '#b45309', fontWeight: 600, marginTop: '4px' }}>
                    {calStable ? 'Signal Stable ✓' : 'Stabilizing signal…'}
                  </div>
                </div>
                <button className="btn-primary" onClick={handleConfirmBuffer4} disabled={!calStable}>
                  Calculate & Save Calibration
                </button>
              </div>
            )}

            {calStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#166534' }}>
                  Calibration Successful!
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Electrode slope: 58.6 mV/pH (98.4% Nernst efficiency). Zero offset: +1.8 mV. Calibration saved to local memory.
                </p>
                <button className="btn-primary" onClick={() => setShowCalibrationWizard(false)}>
                  Done
                </button>
              </div>
            )}

            {calStep !== 3 && (
              <button className="btn-subtle" onClick={() => setShowCalibrationWizard(false)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
