// Icon sprite: the <symbol>s every topology node, tray tile and registry row <use>s (LEDs animate inside them).
// Markup from site/src/deployment.html, unchanged apart from JSX syntax.
export default function DeploymentSprite() {
  return (
    <>
    {/* icon sprite: equipment drawn as hardware, centred in a 96×72 box */}
    <svg width="0" height="0" style={{ 'position': 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <symbol id="ic-bullet" viewBox="-48 -36 96 72">
          <path d="M-30 -18H26l8-5" fill="none" stroke="#0E3B66" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="-30" y="-14" width="56" height="22" rx="5" fill="#fff" stroke="#0E3B66" strokeWidth="2" />
          <rect x="24" y="-12" width="9" height="18" rx="2.5" fill="#DCEBF7" stroke="#0E3B66" strokeWidth="1.6" />
          <circle cx="29" cy="-3" r="5" fill="#0E3B66" /><circle cx="30.6" cy="-4.6" r="1.4" fill="#5A9FD4" />
          <path d="M-22 -8h20M-22 -3h14" stroke="#C5D4E2" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M-8 8v9h-14v8" fill="none" stroke="#0E3B66" strokeWidth="2.2" strokeLinejoin="round" />
          <rect x="-30" y="24" width="16" height="7" rx="2" fill="#DCEBF7" stroke="#0E3B66" strokeWidth="1.6" />
          <circle cx="16" cy="3" r="1.8" fill="#2673B5" className="led" />
        </symbol>
        <symbol id="ic-dome" viewBox="-48 -36 96 72">
          <rect x="-30" y="-26" width="60" height="11" rx="4" fill="#fff" stroke="#0E3B66" strokeWidth="2" />
          <path d="M-24 -15a24 24 0 0 0 48 0z" fill="#DCEBF7" stroke="#0E3B66" strokeWidth="2" />
          <path d="M-15 -12a15 15 0 0 0 30 0" fill="none" stroke="#5A9FD4" strokeWidth="1.4" />
          <circle cx="0" cy="-2" r="7" fill="#0E3B66" /><circle cx="2" cy="-4" r="2" fill="#5A9FD4" />
          <circle cx="-20" cy="-20.5" r="1.6" fill="#0E3B66" /><circle cx="20" cy="-20.5" r="1.6" fill="#0E3B66" />
          <circle cx="0" cy="-20.5" r="1.8" fill="#2673B5" className="led" />
        </symbol>
        <symbol id="ic-anpr" viewBox="-48 -36 96 72">
          <path d="M-36 -20H26l8-5" fill="none" stroke="#0E3B66" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="-36" y="-16" width="58" height="28" rx="5" fill="#fff" stroke="#0E3B66" strokeWidth="2" />
          <rect x="20" y="-17" width="18" height="30" rx="4" fill="#DCEBF7" stroke="#0E3B66" strokeWidth="1.6" />
          <circle cx="29" cy="-2" r="5.5" fill="#0E3B66" />
          <g fill="#2673B5"><circle cx="29" cy="-12" r="1.5" /><circle cx="36" cy="-8.5" r="1.5" /><circle cx="36" cy="4.5" r="1.5" /><circle cx="29" cy="8" r="1.5" /><circle cx="22" cy="4.5" r="1.5" /><circle cx="22" cy="-8.5" r="1.5" /></g>
          <rect x="-28" y="-8" width="26" height="10" rx="2" fill="#F2F7FC" stroke="#5A9FD4" strokeWidth="1.2" />
          <path d="M-25 -3h20" stroke="#5A9FD4" strokeWidth="1.6" strokeDasharray="3 2" />
          <path d="M-10 12v10h-16v8" fill="none" stroke="#0E3B66" strokeWidth="2.2" strokeLinejoin="round" />
        </symbol>
        <symbol id="ic-ptz" viewBox="-48 -36 96 72">
          <rect x="-12" y="-34" width="24" height="7" rx="2" fill="#DCEBF7" stroke="#0E3B66" strokeWidth="1.6" />
          <path d="M0 -27v9" stroke="#0E3B66" strokeWidth="3" />
          <rect x="-18" y="-19" width="36" height="12" rx="4" fill="#fff" stroke="#0E3B66" strokeWidth="2" />
          <circle cx="0" cy="8" r="17" fill="#DCEBF7" stroke="#0E3B66" strokeWidth="2" />
          <rect x="-10" y="2" width="20" height="12" rx="5" fill="#0E3B66" /><circle cx="3" cy="8" r="3" fill="#5A9FD4" />
        </symbol>
        <symbol id="ic-fisheye" viewBox="-48 -36 96 72">
          <ellipse cx="0" cy="-4" rx="30" ry="9" fill="#fff" stroke="#0E3B66" strokeWidth="2" />
          <path d="M-18 -2a18 13 0 0 0 36 0z" fill="#DCEBF7" stroke="#0E3B66" strokeWidth="1.8" />
          <circle cx="0" cy="3" r="5" fill="#0E3B66" /><circle cx="1.5" cy="1.5" r="1.4" fill="#5A9FD4" />
          <path d="M-26 -6h6M20 -6h6" stroke="#C5D4E2" strokeWidth="1.6" />
        </symbol>
        <symbol id="ic-box" viewBox="-48 -36 96 72">
          <rect x="-30" y="-14" width="40" height="26" rx="3" fill="#fff" stroke="#0E3B66" strokeWidth="2" />
          <rect x="10" y="-10" width="16" height="18" rx="2" fill="#DCEBF7" stroke="#0E3B66" strokeWidth="1.6" />
          <rect x="26" y="-8" width="6" height="14" rx="1.5" fill="#0E3B66" />
          <path d="M-24 -6h20M-24 -1h12M-24 4h16" stroke="#C5D4E2" strokeWidth="1.6" />
          <path d="M-10 12v12" stroke="#0E3B66" strokeWidth="2.2" /><rect x="-20" y="24" width="20" height="5" rx="2" fill="#0E3B66" />
        </symbol>
        <symbol id="ic-edge" viewBox="-48 -36 96 72">
          <rect x="-42" y="-24" width="84" height="48" rx="5" fill="#fff" stroke="#0E3B66" strokeWidth="2" />
          <g stroke="#0E3B66" strokeWidth="2.4"><path d="M-34 -18v14M-27 -18v14M-20 -18v14M-13 -18v14M-6 -18v14M1 -18v14M8 -18v14M15 -18v14M22 -18v14M29 -18v14M36 -18v14" /></g>
          <path d="M-42 2H42" stroke="#C5D4E2" strokeWidth="1.4" />
          <circle cx="-33" cy="12" r="2.3" fill="#2673B5" className="led" /><circle cx="-26" cy="12" r="2.3" fill="#2673B5" className="led l2" /><circle cx="-19" cy="12" r="2.3" fill="#5A9FD4" className="led l3" />
          <g fill="#DCEBF7" stroke="#0E3B66" strokeWidth="1.4"><rect x="2" y="7" width="9" height="8" rx="1" /><rect x="14" y="7" width="9" height="8" rx="1" /><rect x="26" y="7" width="9" height="8" rx="1" /></g>
          <rect x="-10" y="8" width="7" height="5" rx="1" fill="#0E3B66" />
        </symbol>
        <symbol id="ic-rack" viewBox="-48 -36 96 72">
          <rect x="-30" y="-34" width="60" height="68" rx="4" fill="#F2F7FC" stroke="#0E3B66" strokeWidth="2" />
          <g fill="#fff" stroke="#0E3B66" strokeWidth="1.6">
            <rect x="-25" y="-29" width="50" height="13" rx="2" /><rect x="-25" y="-13" width="50" height="13" rx="2" /><rect x="-25" y="3" width="50" height="13" rx="2" /><rect x="-25" y="19" width="50" height="10" rx="2" />
          </g>
          <g fill="#C5D4E2"><rect x="-21" y="-26" width="5" height="7" /><rect x="-14" y="-26" width="5" height="7" /><rect x="-7" y="-26" width="5" height="7" /><rect x="0" y="-26" width="5" height="7" />
            <rect x="-21" y="-10" width="5" height="7" /><rect x="-14" y="-10" width="5" height="7" /><rect x="-7" y="-10" width="5" height="7" /><rect x="0" y="-10" width="5" height="7" />
            <rect x="-21" y="6" width="5" height="7" /><rect x="-14" y="6" width="5" height="7" /><rect x="-7" y="6" width="5" height="7" /><rect x="0" y="6" width="5" height="7" /></g>
          <circle cx="18" cy="-22.5" r="2" fill="#2673B5" className="led" /><circle cx="18" cy="-6.5" r="2" fill="#2673B5" className="led l2" /><circle cx="18" cy="9.5" r="2" fill="#2673B5" className="led l3" />
          <path d="M-20 24h28" stroke="#5A9FD4" strokeWidth="1.6" />
        </symbol>
        <symbol id="ic-console" viewBox="-48 -36 96 72">
          <rect x="-44" y="-30" width="42" height="30" rx="3" fill="#fff" stroke="#0E3B66" strokeWidth="2" />
          <rect x="2" y="-30" width="42" height="30" rx="3" fill="#fff" stroke="#0E3B66" strokeWidth="2" />
          <g fill="#DCEBF7"><rect x="-40" y="-26" width="10" height="7" /><rect x="-28" y="-26" width="10" height="7" /><rect x="-16" y="-26" width="10" height="7" /><rect x="-40" y="-17" width="10" height="7" /><rect x="-28" y="-17" width="10" height="7" /><rect x="-16" y="-17" width="10" height="7" /></g>
          <path d="M7 -10l8-8 7 5 9-11 9 6" fill="none" stroke="#2673B5" strokeWidth="1.8" />
          <circle cx="31" cy="-24" r="2.4" fill="#D6453D" className="led" />
          <path d="M-23 0v8M23 0v8" stroke="#0E3B66" strokeWidth="2.4" />
          <rect x="-46" y="8" width="92" height="7" rx="2" fill="#0E3B66" />
          <rect x="-14" y="17" width="28" height="5" rx="2" fill="#C5D4E2" />
        </symbol>
        <symbol id="ic-dc" viewBox="-48 -36 96 72">
          <path d="M-38 -16L0 -32 38 -16" fill="none" stroke="#0E3B66" strokeWidth="2" />
          <rect x="-38" y="-16" width="76" height="46" rx="3" fill="#fff" stroke="#0E3B66" strokeWidth="2" />
          <g fill="#F2F7FC" stroke="#0E3B66" strokeWidth="1.4"><rect x="-31" y="-10" width="16" height="34" rx="1.5" /><rect x="-8" y="-10" width="16" height="34" rx="1.5" /><rect x="15" y="-10" width="16" height="34" rx="1.5" /></g>
          <g stroke="#5A9FD4" strokeWidth="1.6"><path d="M-28 -4h10M-28 2h10M-28 8h10M-5 -4h10M-5 2h10M-5 8h10M18 -4h10M18 2h10M18 8h10" /></g>
          <g fill="#2673B5"><circle cx="-23" cy="17" r="1.8" className="led" /><circle cx="0" cy="17" r="1.8" className="led l2" /><circle cx="23" cy="17" r="1.8" className="led l3" /></g>
          <rect x="22" y="-36" width="24" height="15" rx="3" fill="#2673B5" /><text x="34" y="-25" textAnchor="middle" fontFamily="Geist Mono,monospace" fontSize="12" fontWeight="600" fill="#fff">IN</text>
        </symbol>
        <symbol id="ic-fw" viewBox="-48 -36 96 72">
          <path d="M0 -32l26 9v16c0 18-11 30-26 37C-15 23-26 11-26-7v-16z" fill="#fff" stroke="#0E3B66" strokeWidth="2" />
          <g stroke="#5A9FD4" strokeWidth="1.6"><path d="M-20 -12h40M-20 0h40M-17 12h34M-8 -24v12M8 -24v12M0 -12v12M-12 0v12M12 0v12M0 12v10" /></g>
        </symbol>
        <symbol id="ic-radar" viewBox="-48 -36 96 72">
          <path d="M-30 -24H18l8-5" fill="none" stroke="#0E3B66" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="-30" y="-20" width="44" height="36" rx="6" fill="#fff" stroke="#0E3B66" strokeWidth="2" />
          <rect x="12" y="-18" width="8" height="32" rx="3" fill="#0E3B66" />
          <g fill="#5A9FD4"><circle cx="-21" cy="-11" r="2" /><circle cx="-13" cy="-11" r="2" /><circle cx="-5" cy="-11" r="2" /><circle cx="3" cy="-11" r="2" /><circle cx="-21" cy="-2" r="2" /><circle cx="-13" cy="-2" r="2" /><circle cx="-5" cy="-2" r="2" /><circle cx="3" cy="-2" r="2" /><circle cx="-21" cy="7" r="2" /><circle cx="-13" cy="7" r="2" /><circle cx="-5" cy="7" r="2" /><circle cx="3" cy="7" r="2" /></g>
          <path d="M26 -12a16 16 0 0 1 0 22M32 -18a24 24 0 0 1 0 34" fill="none" stroke="#2673B5" strokeWidth="2" strokeLinecap="round" className="led" />
          <path d="M-8 16v8h-14v6" fill="none" stroke="#0E3B66" strokeWidth="2.2" strokeLinejoin="round" />
        </symbol>
        <symbol id="ic-callbox" viewBox="-48 -36 96 72">
          <rect x="-14" y="-34" width="28" height="6" rx="1.5" fill="#DCEBF7" stroke="#0E3B66" strokeWidth="1.6" />
          <path d="M-16 -27h32v6h-32z" fill="#2673B5" />
          <rect x="-15" y="-21" width="30" height="46" rx="3" fill="#fff" stroke="#0E3B66" strokeWidth="2" />
          <g fill="#C5D4E2"><circle cx="-6" cy="-13" r="1.5" /><circle cx="0" cy="-13" r="1.5" /><circle cx="6" cy="-13" r="1.5" /><circle cx="-6" cy="-8" r="1.5" /><circle cx="0" cy="-8" r="1.5" /><circle cx="6" cy="-8" r="1.5" /></g>
          <circle cx="0" cy="4" r="6" fill="#2673B5" /><path d="M-3 4h6" stroke="#fff" strokeWidth="1.6" />
          <circle cx="9" cy="16" r="1.8" fill="#2673B5" className="led" />
          <rect x="-10" y="25" width="20" height="8" rx="1.5" fill="#0E3B66" />
        </symbol>
        <symbol id="ic-vms" viewBox="-48 -36 96 72">
          <path d="M-40 -30H40" stroke="#0E3B66" strokeWidth="2.6" />
          <rect x="-42" y="-24" width="84" height="30" rx="3" fill="#0E3B66" />
          <rect x="-38" y="-20" width="76" height="22" rx="1.5" fill="#1B5A94" />
          <g fill="#DCEBF7"><rect x="-32" y="-15" width="44" height="3" rx="1" /><rect x="-32" y="-8" width="30" height="3" rx="1" /></g>
          <circle cx="28" cy="-9" r="5" fill="none" stroke="#DCEBF7" strokeWidth="1.6" /><path d="M28 -12v4" stroke="#DCEBF7" strokeWidth="1.6" />
          <path d="M-30 6v26M30 6v26" stroke="#0E3B66" strokeWidth="2.6" />
        </symbol>
        <symbol id="ic-laptop" viewBox="-48 -36 96 72">
          <rect x="-32" y="-28" width="64" height="40" rx="3" fill="#fff" stroke="#0E3B66" strokeWidth="2" />
          <rect x="-27" y="-23" width="54" height="30" fill="#F2F7FC" />
          <path d="M-22 0l9-8 8 5 9-10 9 4 9-6" fill="none" stroke="#2673B5" strokeWidth="1.8" />
          <circle cx="17" cy="-17" r="2.2" fill="#2673B5" />
          <path d="M-42 14h84l-6 9h-72z" fill="#0E3B66" />
        </symbol>
      </defs>
    </svg>
    </>
  );
}
