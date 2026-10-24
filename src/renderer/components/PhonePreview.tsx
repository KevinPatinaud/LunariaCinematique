import React, { useEffect, useState } from 'react';
import './phonePreview.css';

const FORMATS = [
  { id: '20:9', label: '20:9', aspect: 20 / 9 },
  { id: '19.5:9', label: '19,5:9', aspect: 19.5 / 9 },
  { id: '18:9', label: '18:9', aspect: 2 },
  { id: '16:9', label: '16:9', aspect: 16 / 9 },
] as const;
type PhoneFormat = typeof FORMATS[number];
const STORAGE_KEY = 'lunaria-phone-preview-format';

export function usePhonePreview() {
  const [format, setFormat] = useState<PhoneFormat>(() => {
    try { return FORMATS.find(item => item.id === localStorage.getItem(STORAGE_KEY)) ?? FORMATS[0]; }
    catch { return FORMATS[0]; }
  });
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, format.id); }
    catch { /* Preview remains usable when preferences cannot be saved. */ }
  }, [format]);
  return { format, setFormat, width: format.aspect * 900 };
}

export function PhoneFormatSelector({ format, onChange }: { format: PhoneFormat; onChange: (format: PhoneFormat) => void }) {
  return <label className="phone-format">
    <svg width="16" height="12" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="1" y="1" width="22" height="14" rx="3"/><path d="M4 6v4"/></svg>
    <span>Téléphone · paysage</span>
    <select aria-label="Format de l’écran du téléphone" value={format.id} onChange={event => onChange(FORMATS.find(item => item.id === event.target.value) ?? FORMATS[0])}>
      {FORMATS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
    </select>
  </label>;
}

export function PhonePreview({ format, children }: { format: PhoneFormat; children: React.ReactNode }) {
  // Include the 8 px bezel on both sides when fitting the available height.
  const style = { width: `min(100cqw, calc(${format.aspect * 100}cqh - ${(format.aspect - 1) * 16}px))` };
  return <div className="phone-device" style={style} data-testid="phone-preview">
    <div className="canvas-frame phone-screen" style={{ aspectRatio: String(format.aspect) }}>{children}</div>
  </div>;
}
