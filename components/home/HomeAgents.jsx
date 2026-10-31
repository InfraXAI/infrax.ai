// AI Beings: VAYU, KRITYA, NOAH, ASTRA cards with their example chats, and the full-width MCP box.
// Markup from site/src/home.html, unchanged apart from JSX syntax.
import McpDiagram from './McpDiagram';

export default function HomeAgents() {
  return (
    <section className="scene" id="agents" aria-labelledby="hmAgT">
      <div className="wrap">
        <div className="hm-head hm-c">
          <div><h2 className="h-1" id="hmAgT" data-reveal="">AI Beings that work across every product.</h2></div>
          <p className="body">Each product has a Being for the routine work, and a person approves what matters. Your own Beings can plug in too.</p>
        </div>
        <div className="hm-ag" id="hmAg">
          <article className="hm-agc">
            <p className="hm-ag-k"><span className="hm-ag-dot" aria-hidden="true"></span>In Cygnus</p>
            <h3>VAYU</h3>
            <p className="d">Ask in plain words. VAYU answers from your cameras, events and incidents, opens the right screen and proposes actions an operator confirms.</p>
            <div className="hm-ag-chat" aria-hidden="true"><span className="q">Why does camera R-14 keep dropping at night?</span><span className="a">Offline after 22:00 on 9 of the last 10 nights, along with R-12 on the same switch · likely pole power · site check proposed</span></div>
          </article>
          <article className="hm-agc">
            <p className="hm-ag-k"><span className="hm-ag-dot" aria-hidden="true"></span>In Ulka</p>
            <h3>KRITYA</h3>
            <p className="d">Drafts work orders, shift plans and daily digests for field teams. A person approves before anything goes out.</p>
            <div className="hm-ag-chat" aria-hidden="true"><span className="q">Only two crews today. Which repairs can't wait?</span><span className="a">14 open faults ranked by traffic, deadline and repeat failures · top 5 planned for 2 crews · approve?</span></div>
          </article>
          <article className="hm-agc">
            <p className="hm-ag-k"><span className="hm-ag-dot" aria-hidden="true"></span>In Plexus (ATMS / ICCC)</p>
            <h3>NOAH</h3>
            <p className="d">Summarises incidents and call-box calls, gathers the evidence and drafts the next step for the operator.</p>
            <div className="hm-ag-chat" aria-hidden="true"><span className="q">Car stopped at km 41.2. Breakdown, or just a driver taking a break?</span><span className="a">Stopped 6 min, hazards on, in lane 1 · 3rd breakdown at this spot this week · Patrol 3 is 4 km away · send?</span></div>
          </article>
          <article className="hm-agc">
            <p className="hm-ag-k"><span className="hm-ag-dot" aria-hidden="true"></span>In AstraAlert</p>
            <h3>ASTRA</h3>
            <p className="d">Answers every call-box press, asks what happened and opens the incident with the box's location. An operator takes over at any time.</p>
            <div className="hm-ag-chat" aria-hidden="true"><span className="q">ECB-07: “Smoke is coming from my bonnet”</span><span className="a">Fire risk, not a breakdown · priority incident opened · fire unit and Patrol 3 alerted · upstream sign warns drivers</span></div>
          </article>
        </div>
        <article className="hm-mcp">
          <div className="hm-mcp-t">
            <p className="hm-ag-k"><span className="hm-ag-dot" aria-hidden="true"></span>For your own Beings</p>
            <h3>MCP</h3>
            <p className="d">Bring any model. Every call goes through one gateway that checks the token, the scope and the tenant before it reaches Ulka.</p>
          </div>
          <McpDiagram />
        </article>
        <p className="hm-ag-note">Example exchanges, illustrative data.</p>
      </div>
    </section>
  );
}
