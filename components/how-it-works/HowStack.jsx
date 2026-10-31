// The pinned layer stack: the three steps (Capture, Detect, Act) beside the 3D diorama stage (#hwStage). lib/pages/how-it-works.js adds the labels.
// Markup from site/src/how-it-works.html, unchanged apart from JSX syntax.
export default function HowStack() {
  return (
    <section className="hw-pin" id="hwPin" aria-labelledby="hw-stack-title"><div className="wrap">
      <div>
        <h2 className="h-sub" id="hw-stack-title" data-reveal="">Capture and detect on site. Act in one control room.</h2>
        <ol className="hw-steps" id="hwSteps">
          <li className="hw-step on" data-step="0">
            <span className="ix" aria-hidden="true"><span className="ix" data-ix="camera" data-size="20"></span></span>
            <div><h3>Capture</h3>
              <p>Cameras, radar and call boxes send what they see to your own servers.</p>
              <div className="tags"><span>IP cameras</span><span>Gantry radar</span><span>Call boxes</span></div></div>
          </li>
          <li className="hw-step" data-step="1">
            <span className="ix" aria-hidden="true"><span className="ix" data-ix="edge" data-size="20"></span></span>
            <div><h3>Detect</h3>
              <p>AI on site reads plates, measures speed and flags incidents, even if the link drops.</p>
              <div className="photo"><img decoding="async" src="/img/edge-box-sm.webp" srcSet="/img/edge-box-sm.webp 768w, /img/edge-box.webp 1536w" sizes="320px" alt="The AI box in a roadside cabinet, beside the network switch" loading="lazy" width="768" height="432" /><small id="hwLinkNote">Link up · reads sent to the control room as they happen.</small></div></div>
          </li>
          <li className="hw-step" data-step="2">
            <span className="ix" aria-hidden="true"><span className="ix" data-ix="wall" data-size="20"></span></span>
            <div><h3>Act</h3>
              <p>The event reaches Central Plexus (ATMS / ICCC) with its clip; your operator dispatches patrol, updates signs or sends it for e-challan.</p></div>
          </li>
        </ol>
      </div>
      <div className="hw-stage" id="hwStage" role="img" aria-label="A miniature road and sites with gantry cameras, radar, call boxes and an LED sign separates into three layers: capture in the field, detection by AI at the site, and one control room where an operator approves. Data flows up into one steady stream, and pauses and resumes when the link drops.">
        <canvas id="hwStackGL"></canvas>
        <div className="hw-nogl"><svg viewBox="0 0 320 260" width="320" height="260" aria-hidden="true"><g fill="none" stroke="#2673B5" strokeWidth="1.5"><ellipse cx="160" cy="215" rx="140" ry="30" fill="#fff" /><ellipse cx="160" cy="135" rx="100" ry="22" fill="#F2F7FC" /><path d="M160 30l60 18v18l-60 18-60-18V48z" fill="#fff" /><path d="M160 190v-45M160 110V84" /></g><g fontFamily="Onest,sans-serif" fontSize="12" fill="#0A1A2B"><text x="232" y="219">Capture</text><text x="230" y="139">Detect · AI on site</text><text x="200" y="60">Act · control room</text></g></svg></div>
        <span className="hw-link" id="hwLink" aria-hidden="true">Link up</span>
        <div className="hw-progress" aria-hidden="true"><span id="hwPhase">On the road</span><i id="hwBar"></i></div>
      </div>
    </div></section>
  );
}
