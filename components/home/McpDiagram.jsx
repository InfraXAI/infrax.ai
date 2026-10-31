// MCP diagram: AI models -> MCP gateway (four checks) -> Ulka tool groups, with call, result and refused tags on the wires.
// Tool groups and counts follow the Ops MCP server's ops.* tools.
import { ICONS } from '@/lib/mcp-icons';

function Ic({ n }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[n] }} />;
}

const MODELS = [['sparkles', 'Claude', 'Anthropic'], ['message-square-text', 'GPT', 'OpenAI'], ['gem', 'Gemini', 'Google'], ['bot', 'Your own Being', 'any MCP client']];
const CHECKS = [['key-round', 'Access token', 'per Being'], ['list-checks', 'Scope per tool', 'read / write'], ['building-2', 'Your tenant only', 'row-level'], ['scroll-text', 'Every call logged', 'audit trail']];
const TOOLS = [['clipboard-list', 'Work orders', '5 tools', 'c1'], ['map-pin', 'Sites', '2 tools', 'c2'], ['wrench', 'Equipment', '2 tools', 'c3'],
  ['users', 'People', '4 tools', 'c4'], ['calendar-days', 'Schedules', '1 tool', 'c5'], ['newspaper', 'Digest', '1 tool', 'c6']];

export default function McpDiagram() {
  return (
    <div className="mcp-d" role="img" aria-label="Claude, GPT, Gemini or your own Being call Ulka through the MCP gateway, which checks the access token, the scope of each tool and the tenant, and logs every call. Ulka offers 15 tools in six groups.">
      <div className="mcp-models">
        {MODELS.map(([i, n, s]) => <div className="mcp-mdl" key={n}><span className="mcp-ic"><Ic n={i} /></span><div><b>{n}</b><small>{s}</small></div></div>)}
      </div>
      <div className="mcp-lane" aria-hidden="true">
        <i className="w" /><i className="w" /><i className="w dash" />
        <span className="mcp-pkt call t1"><Ic n="arrow-right" />digest</span>
        <span className="mcp-pkt res t2"><Ic n="arrow-left" />result</span>
        <span className="mcp-pkt no t3"><Ic n="ban" />write</span>
      </div>
      <div className="mcp-gw"><span className="mcp-ring" aria-hidden="true" />
        <div className="mcp-gw-top"><span className="mcp-ic big"><Ic n="shield-check" /></span><div><b>MCP gateway</b><small>every call checked</small></div></div>
        <ul>
          {CHECKS.map(([i, n, s]) => <li key={n}><span className="mcp-ic"><Ic n={i} /></span><div>{n}<small>{s}</small></div></li>)}
        </ul>
      </div>
      <div className="mcp-lane" aria-hidden="true">
        <i className="w" /><i className="w" />
        <span className="mcp-pkt call t1"><Ic n="arrow-right" />allowed</span>
        <span className="mcp-pkt res t2"><Ic n="arrow-left" />result</span>
      </div>
      <div className="mcp-ulka">
        <div className="mcp-ulka-h"><span className="mcp-ic big ulka"><Ic n="hard-hat" /></span><div><b>Ulka</b><small>15 tools in 6 groups</small></div></div>
        <div className="mcp-mods">
          {TOOLS.map(([i, n, s, c]) => <div className="mcp-mod" key={n}><span className={'mcp-ic ' + c}><Ic n={i} /></span><div><b>{n}</b><small>{s}</small></div></div>)}
        </div>
      </div>
      <div className="mcp-legend" aria-hidden="true"><span><i className="call" />call in</span><span><i className="res" />result back</span><span><i className="no" />refused at the gateway</span></div>
    </div>
  );
}
