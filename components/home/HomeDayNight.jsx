'use client';
// Day / night compare in the Book a demo band: the same median camera by day (left) and by night (right).
// The divider starts on the highway's median (50%); the visitor drags it, or uses the arrow keys.
import { useState } from 'react';

export default function HomeDayNight() {
  const [p, setP] = useState(50);
  return (
    <div className="hm-dn" style={{ '--p': p + '%' }}>
      <img className="hm-dn-night" src="/img/site-night-sm.webp" srcSet="/img/site-night-sm.webp 768w, /img/site-night.webp 1536w" sizes="(min-width:1024.02px) 380px, 90vw" alt="" width="768" height="432" loading="lazy" decoding="async" />
      <img className="hm-dn-day" src="/img/site-day-sm.webp" srcSet="/img/site-day-sm.webp 768w, /img/site-day.webp 1536w" sizes="(min-width:1024.02px) 380px, 90vw" alt="" width="768" height="432" loading="lazy" decoding="async" />
      <span className="hm-dn-bar" aria-hidden="true"><i></i></span>
      <input className="hm-dn-range" type="range" min="0" max="100" step="0.5" value={p} onChange={(e) => setP(+e.target.value)}
        aria-label="Compare the same highway camera by day and by night" aria-valuetext={p < 50 ? 'More night' : p > 50 ? 'More day' : 'Half day, half night'} />
    </div>
  );
}
