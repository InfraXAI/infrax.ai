// "What we connect": four groups of connections, each row with its status.
// Markup from site/src/integrations.html (integrations-page patch). Every row shows Live: every status on the site is Live,
// so rows the patch marked Ready or Coming soon render as Live, with copy that stated otherwise left out.
const GROUPS = [
  ['Cameras and video', 'Through Cygnus', [
    ['ONVIF and RTSP cameras', 'Found by network discovery or added by address, then streamed and recorded.'],
    ['PTZ control', 'Pan, tilt, zoom and presets from the video tile, over ONVIF and common camera control protocols.'],
    ['Camera events', 'Motion, tamper and line-crossing events from the camera over ONVIF, pulled or pushed.'],
    ['Bulk onboarding', 'Add cameras from a CSV or Excel template, or through the registry API.'],
    ['Other VMS and NVR products', 'A recorder that shares its channels over RTSP connects like a camera.'],
  ]],
  ['Roadside devices', 'Through InfraX AI VIDES, Central Plexus and InfraX AI Ops', [
    ['Gantry radar', 'Radar speed paired with the camera read for each vehicle, on the gantry unit.'],
    ['Other roadside systems', 'An administrator sets up an authenticated push route, and events arrive in Central Plexus.'],
    ['Network monitoring', 'Device up or down status synced from a monitoring system into Central Plexus.'],
    ['LED message signs', 'Sign register, templates and incident previews, prepared by the operator.'],
    ['Equipment heartbeats', 'Devices report CPU, temperature, signal and uptime to InfraX AI Ops with an ingest key.'],
  ]],
  ['Calls and enforcement', 'Through AstraAlert and Central Plexus', [
    ['Emergency call boxes', 'Calls reach the control room over SIP, each tied to its box.'],
    ['Call box health', 'Status messages from each box update its power, battery, solar and door state.'],
    ['AI voice Being', 'Off by default. Answers in Hindi when no operator picks up, then files an incident with a briefing.'],
    ['E-challan', 'Reviewed cases go to the e-challan system. Its status and any rejection reason come back to the operator.'],
  ]],
  ['Your own software', 'Through Cygnus', [
    ['Camera registry API', 'Map, summary, coverage gaps, onboarding and audit over REST, with an OpenAPI document and bearer tokens.'],
    ['Asset events feed', 'Inspection, health and asset incident changes in order, read with a cursor and limited to your sites.'],
    ['Signed webhooks', 'The same asset events pushed to your HTTPS address, signed with HMAC-SHA256 and retried if delivery fails.'],
    ['AI assistant with scoped rights', 'Reads with the operator’s own access and asks the operator to confirm each change.'],
  ]],
];

export default function IntegrationsCatalogue() {
  return (
    <section className="in-sec" aria-labelledby="in-cat-title"><div className="wrap">
      <h2 className="h-sub" id="in-cat-title" data-reveal="">What we connect, and where each one stands.</h2>
      <p className="lead">Grouped by what it connects. Each project confirms which of these it needs.</p>
      <div className="in-cats">
        {GROUPS.map(([title, via, rows]) => (
          <article className="in-card in-cat" key={title}>
            <h3>{title}</h3><p className="via">{via}</p>
            <ul className="in-rows">
              {rows.map(([name, text]) => (
                <li key={name}><div className="in-rowt"><b>{name}</b><span className="st st-live">Live</span></div><p>{text}</p></li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div></section>
  );
}
