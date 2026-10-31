// AI Beings: VAYU, KRITYA, NOAH, ASTRA cards with their example chats, and the full-width MCP box.
// Markup from site/src/home.html, unchanged apart from JSX syntax.
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
            <div className="hm-ag-chat" aria-hidden="true"><span className="q">What needs attention right now?</span><span className="a">2 incidents open · 1 camera offline · opening the dashboard</span></div>
          </article>
          <article className="hm-agc">
            <p className="hm-ag-k"><span className="hm-ag-dot" aria-hidden="true"></span>In InfraX AI Ops</p>
            <h3>KRITYA</h3>
            <p className="d">Drafts work orders, shift plans and daily digests for field teams. A person approves before anything goes out.</p>
            <div className="hm-ag-chat" aria-hidden="true"><span className="q">Draft today's maintenance orders</span><span className="a">6 work orders drafted · waiting for approval</span></div>
          </article>
          <article className="hm-agc">
            <p className="hm-ag-k"><span className="hm-ag-dot" aria-hidden="true"></span>In Central Plexus (ATMS / ICCC)</p>
            <h3>NOAH</h3>
            <p className="d">Summarises incidents and call-box calls, gathers the evidence and drafts the next step for the operator.</p>
            <div className="hm-ag-chat" aria-hidden="true"><span className="q">Incident #4471 · stopped vehicle</span><span className="a">Summary ready · patrol suggested · confirm?</span></div>
          </article>
          <article className="hm-agc">
            <p className="hm-ag-k"><span className="hm-ag-dot" aria-hidden="true"></span>In AstraAlert</p>
            <h3>ASTRA</h3>
            <p className="d">Answers every call-box press, asks what happened and opens the incident with the box's location. An operator takes over at any time.</p>
            <div className="hm-ag-chat" aria-hidden="true"><span className="q">Call box ECB-07 · car broken down</span><span className="a">Incident opened · location sent · patrol alerted</span></div>
          </article>
        </div>
        <article className="hm-mcp">
          <div className="hm-mcp-t">
            <p className="hm-ag-k"><span className="hm-ag-dot" aria-hidden="true"></span>For your own Beings</p>
            <h3>MCP</h3>
            <p className="d">Connect your own AI Beings to InfraX AI Ops through MCP (Model Context Protocol). Beings call Ops features as tools, using only the access you grant them.</p>
          </div>
          <div className="hm-mcp-flow" aria-hidden="true">
            {/* a Being, scoped MCP access, InfraX AI Ops (both ways); MCP runs for Ops only today */}
            <span className="hm-mcp-node">Being</span>
            <span className="hm-mcp-line two"></span>
            <span className="hm-mcp-node hub">MCP<small>scoped access</small></span>
            <span className="hm-mcp-line two"></span>
            <span className="hm-mcp-node">InfraX AI Ops</span>
            <span className="hm-mcp-back">↩ Result goes back to your Being</span>
          </div>
          <div className="hm-ag-chat" aria-hidden="true"><span className="q">Being → get today's ops digest</span><span className="a">Daily digest returned from Ops</span></div>
        </article>
        <p className="hm-ag-note">Example exchanges, illustrative data.</p>
      </div>
    </section>
  );
}
