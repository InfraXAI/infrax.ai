import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 pt-[100px] pb-[60px] overflow-hidden">
        <div className="relative z-[2]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#e8f1fa] border border-[rgba(38,115,181,0.15)] rounded-full text-[13px] text-[#2673B5] font-medium mb-8">
            Agentic AI · Autonomous Infrastructure
          </div>
          <h1 className="text-[clamp(36px,6vw,68px)] font-extrabold leading-[1.08] tracking-[-0.03em] mb-6 text-[#1a1a2e]">
            Your infrastructure,<br />
            <span className="gradient-text">running itself.</span>
          </h1>
          <p className="text-[clamp(16px,2vw,19px)] text-[#5a5a7a] max-w-[560px] mx-auto mb-10 leading-[1.7]">
            InfraX AI is the agentic operating system for smart infrastructure.
            One platform for highways, cities, and buildings — with AI agents
            that monitor, analyze, and act autonomously.
          </p>
          <div className="flex gap-3.5 flex-wrap justify-center">
            <Link href="#contact" className="inline-block px-8 py-3.5 bg-[#2673B5] text-white rounded-[10px] text-[15px] font-semibold border-none cursor-pointer transition-all hover:bg-[#3a8fd4] hover:-translate-y-[1px]">
              Get in Touch
            </Link>
            <Link href="#platform" className="inline-block px-8 py-3.5 bg-transparent text-[#1a1a2e] rounded-[10px] text-[15px] font-medium border border-[#e8e8ee] cursor-pointer transition-all hover:border-[#ccc] hover:bg-[#f8f9fb]">
              Explore the Platform ↓
            </Link>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="relative">

      {/* THREE VERTICALS */}
      <section id="platform" className="py-[100px] px-6 max-w-[1080px] mx-auto">
        <div className="section-label reveal">The Platform</div>
        <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-[1.15] tracking-[-0.02em] mb-[14px] reveal">One OS. Three worlds.</h2>
        <p className="text-[17px] text-[#5a5a7a] max-w-[600px] leading-[1.7] reveal">
          Every device connected. Every system on one digital twin.
          AI agents running, monitoring, and managing everything — 24/7.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] mt-[56px] rounded-2xl overflow-hidden bg-[#e8e8ee]">
          <Link href="/solutions/government" className="bg-white transition-all duration-300 overflow-hidden hover:bg-[#f8f9fb] hover:-translate-y-[2px] reveal block">
            <img className="w-full h-[180px] object-cover block" src="/smart-highways-v3.png" alt="Smart Highway with IoT sensors" loading="lazy" />
            <div className="px-8 py-7 pb-9">
              <h3 className="text-[20px] font-bold mb-2.5">Smart Highways</h3>
              <p className="text-[14px] text-[#5a5a7a] leading-[1.65]">Complete highway management on one digital twin. All devices connected, all systems managed by AI agents.</p>
              <div className="mt-[18px] flex flex-wrap gap-[5px]">
                {['ATMS', 'TMS', 'MLFF Tolling', 'VIDS', 'Access Control', 'Incident Mgmt', 'VMS', 'Weather'].map(tag => (
                  <span key={tag} className="px-2.5 py-[3px] bg-[#f8f9fb] border border-[#e8e8ee] rounded-md text-[11px] text-[#5a5a7a]">{tag}</span>
                ))}
              </div>
              <div className="mt-4 text-[13px] text-[#2673B5] font-semibold">Learn more →</div>
            </div>
          </Link>
          <Link href="/solutions/smart-cities" className="bg-white transition-all duration-300 overflow-hidden hover:bg-[#f8f9fb] hover:-translate-y-[2px] reveal block">
            <img className="w-full h-[180px] object-cover block" src="/smart-cities-v3.png" alt="Smart City intersection" loading="lazy" />
            <div className="px-8 py-7 pb-9">
              <h3 className="text-[20px] font-bold mb-2.5">Smart Cities</h3>
              <p className="text-[14px] text-[#5a5a7a] leading-[1.65]">City-scale digital twin. Traffic, CCTV, security, waste management — all connected, all AI-managed.</p>
              <div className="mt-[18px] flex flex-wrap gap-[5px]">
                {['Traffic Systems', 'CCTV & Security', 'Waste Mgmt', 'Street Lights', 'Parking', 'Public Transport'].map(tag => (
                  <span key={tag} className="px-2.5 py-[3px] bg-[#f8f9fb] border border-[#e8e8ee] rounded-md text-[11px] text-[#5a5a7a]">{tag}</span>
                ))}
              </div>
              <div className="mt-4 text-[13px] text-[#2673B5] font-semibold">Learn more →</div>
            </div>
          </Link>
          <Link href="/solutions/smart-buildings" className="bg-white transition-all duration-300 overflow-hidden hover:bg-[#f8f9fb] hover:-translate-y-[2px] reveal block">
            <img className="w-full h-[180px] object-cover block" src="/smart-buildings-v3.png" alt="Smart Building at dusk" loading="lazy" />
            <div className="px-8 py-7 pb-9">
              <h3 className="text-[20px] font-bold mb-2.5">Smart Buildings</h3>
              <p className="text-[14px] text-[#5a5a7a] leading-[1.65]">Building-level intelligence. Parking, access, BMS, workspace management — one platform, AI-operated.</p>
              <div className="mt-[18px] flex flex-wrap gap-[5px]">
                {['BMS', 'Parking', 'Access Control', 'Workspace Mgmt', 'Energy', 'HVAC'].map(tag => (
                  <span key={tag} className="px-2.5 py-[3px] bg-[#f8f9fb] border border-[#e8e8ee] rounded-md text-[11px] text-[#5a5a7a]">{tag}</span>
                ))}
              </div>
              <div className="mt-4 text-[13px] text-[#2673B5] font-semibold">Learn more →</div>
            </div>
          </Link>
        </div>
      </section>

      <div className="divider"></div>

      {/* HOW IT WORKS */}
      <section id="how" className="py-[100px] px-6 max-w-[1080px] mx-auto">
        <div className="section-label reveal">How It Works</div>
        <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-[1.15] tracking-[-0.02em] mb-[14px] reveal">Digital twin. Connected. Intelligent.</h2>
        <p className="text-[17px] text-[#5a5a7a] max-w-[600px] leading-[1.7] reveal">
          InfraX AI creates a living digital replica of your infrastructure,
          connects every device and system, then deploys AI agents to run it.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] mt-[56px] rounded-2xl overflow-hidden bg-[#e8e8ee]">
          {[
            { num: '01', title: 'Digital Twin', desc: 'Your entire infrastructure exists as a real-time digital replica.' },
            { num: '02', title: 'Connect', desc: 'All devices, cameras, and sensors connected to one unified platform.' },
            { num: '03', title: 'Deploy Agents', desc: 'AI agents for monitoring, detection, alerting, and autonomous response.' },
            { num: '04', title: 'Intelligence', desc: 'Ask anything in your language. AI handles reports, alerts, and actions.' }
          ].map((step) => (
            <div key={step.num} className="bg-white py-10 px-6 text-center reveal">
              <div className="text-[44px] font-extrabold text-[#2673B5] opacity-20 mb-[14px]">{step.num}</div>
              <h4 className="text-[15px] font-semibold mb-2">{step.title}</h4>
              <p className="text-[13px] text-[#5a5a7a] leading-[1.6]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"></div>

      {/* STATS */}
      <div className="py-[100px] px-6">
        <div className="text-center bg-[#f8f9fb] rounded-[20px] py-[72px] px-10 border border-[#e8e8ee] max-w-[1080px] mx-auto relative overflow-hidden reveal">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.06] z-0" style={{ background: "url('/control-room-v2.png') center/cover no-repeat" }}></div>
          <div className="relative z-[1]">
            <div className="section-label">Proven at Scale</div>
            <div className="text-[clamp(20px,3vw,26px)] font-bold mb-[6px]">Deployed. Operational. Delivering results.</div>
            <div className="text-[15px] text-[#5a5a7a] mb-[44px]">InfraX AI is already managing real infrastructure in production across Bharat.</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-[720px] mx-auto">
              {[
                { val: '227', label: 'KM Monitored' },
                { val: '24', label: 'IoT Devices' },
                { val: '16', label: 'AI Agents' },
                { val: '<2s', label: 'Response Time' }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-[clamp(32px,5vw,52px)] font-extrabold text-[#2673B5] leading-[1]">{stat.val}</div>
                  <div className="text-[12px] text-[#5a5a7a] mt-[6px] uppercase tracking-[0.05em]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI CAPABILITIES */}
      <section id="ai" className="py-[100px] px-6 max-w-[1080px] mx-auto">
        <div className="section-label reveal">AI-Native</div>
        <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-[1.15] tracking-[-0.02em] mb-[14px] reveal">Beyond dashboards.<br />Autonomous intelligence.</h2>
        <p className="text-[17px] text-[#5a5a7a] max-w-[600px] leading-[1.7] reveal">
          Not just monitoring. AI agents that understand your infrastructure
          and act on it — in your language.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] mt-[56px] rounded-2xl overflow-hidden bg-[#e8e8ee]">
          <div className="bg-white py-9 px-8 hover:bg-[#f8f9fb] reveal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2673B5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', marginBottom: '10px' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <h4 className="text-[16px] font-semibold mb-2">Natural Language</h4>
            <p className="text-[14px] text-[#5a5a7a] leading-[1.65]">Ask in English or Hindi. Get instant, context-aware answers from live infrastructure data.</p>
          </div>
          <div className="bg-white py-9 px-8 hover:bg-[#f8f9fb] reveal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2673B5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', marginBottom: '10px' }}><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
            <h4 className="text-[16px] font-semibold mb-2">Autonomous Agents</h4>
            <p className="text-[14px] text-[#5a5a7a] leading-[1.65]">Specialized AI agents that detect incidents, monitor devices, generate reports, and dispatch responses — 24/7.</p>
          </div>
          <div className="bg-white py-9 px-8 hover:bg-[#f8f9fb] reveal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2673B5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', marginBottom: '10px' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <h4 className="text-[16px] font-semibold mb-2">Intelligent Search</h4>
            <p className="text-[14px] text-[#5a5a7a] leading-[1.65]">Search across all devices, incidents, locations, and data. Semantic understanding, not keyword matching.</p>
          </div>
          <div className="bg-white py-9 px-8 hover:bg-[#f8f9fb] reveal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2673B5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', marginBottom: '10px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/></svg>
            <h4 className="text-[16px] font-semibold mb-2">Automated Reports</h4>
            <p className="text-[14px] text-[#5a5a7a] leading-[1.65]">AI generates incident reports, traffic summaries, and device health reports — on schedule or on demand.</p>
          </div>
        </div>
      </section>

      {/* COMPANY */}
      <div className="divider"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[56px] items-center max-w-[1080px] mx-auto py-[100px] px-6" id="company">
        <div>
          <div className="section-label reveal">About Us</div>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-bold leading-[1.2] mb-4 reveal">Built by infrastructure people,<br />for infrastructure people.</h2>
          <p className="text-[15px] text-[#5a5a7a] leading-[1.7] mb-4 reveal">
            NaturNest AI Private Limited builds InfraX AI — the operating system for smart infrastructure.
            We combine deep domain expertise in highways, cities, and buildings with cutting-edge AI
            to deliver systems that don&apos;t just monitor — they act.
          </p>
          <div className="flex flex-col gap-3 mt-6 reveal">
            <div className="flex items-center gap-2.5 text-[14px] text-[#5a5a7a]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2673B5" strokeWidth="2" className="shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              WeWork DLF Forum, Cyber City, Gurugram, Haryana
            </div>
            <div className="flex items-center gap-2.5 text-[14px] text-[#5a5a7a]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2673B5" strokeWidth="2" className="shrink-0"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
              info@infrax.ai
            </div>
            <div className="flex items-center gap-2.5 text-[14px] text-[#5a5a7a]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2673B5" strokeWidth="2" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              www.infrax.ai
            </div>
            <div className="flex items-center gap-2.5 text-[14px] text-[#5a5a7a]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2673B5" strokeWidth="2" className="shrink-0"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Est. 2017
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 reveal">
          <div className="bg-[#f8f9fb] border border-[#e8e8ee] rounded-xl p-6 text-center">
            <div className="text-[28px] font-extrabold text-[#2673B5]">3</div>
            <div className="text-[13px] text-[#5a5a7a] mt-1">Verticals</div>
          </div>
          <div className="bg-[#f8f9fb] border border-[#e8e8ee] rounded-xl p-6 text-center">
            <div className="text-[28px] font-extrabold text-[#2673B5]">15+</div>
            <div className="text-[13px] text-[#5a5a7a] mt-1">Team Members</div>
          </div>
          <div className="bg-[#f8f9fb] border border-[#e8e8ee] rounded-xl p-6 text-center">
            <div className="text-[28px] font-extrabold text-[#2673B5]">227km</div>
            <div className="text-[13px] text-[#5a5a7a] mt-1">Under Management</div>
          </div>
          <div className="bg-[#f8f9fb] border border-[#e8e8ee] rounded-xl p-6 text-center">
            <div className="text-[28px] font-extrabold text-[#2673B5]">AI-First</div>
            <div className="text-[13px] text-[#5a5a7a] mt-1">Architecture</div>
          </div>
        </div>
      </div>

      {/* CTA / CONTACT */}
      <div className="divider"></div>
      <section id="contact" className="py-[100px] px-6 max-w-[1080px] mx-auto text-center">
        <h2 className="text-[clamp(30px,4.5vw,50px)] font-extrabold leading-[1.1] tracking-[-0.03em] mb-5 reveal">
          Ready to make your<br />
          infrastructure <span className="gradient-text">intelligent</span>?
        </h2>
        <p className="text-[17px] text-[#5a5a7a] mb-9 reveal">
          Let&apos;s talk about what InfraX AI can do for your highways, cities, or buildings.
        </p>

        <form className="max-w-[520px] mx-auto grid gap-[14px] reveal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
            <input type="text" name="name" placeholder="Your Name" required className="w-full py-3.5 px-4 border border-[#e8e8ee] rounded-[10px] text-[14px] bg-[#f8f9fb] text-[#1a1a2e] outline-none focus:border-[#2673B5] transition-colors font-[inherit]" />
            <input type="text" name="organization" placeholder="Organization" className="w-full py-3.5 px-4 border border-[#e8e8ee] rounded-[10px] text-[14px] bg-[#f8f9fb] text-[#1a1a2e] outline-none focus:border-[#2673B5] transition-colors font-[inherit]" />
          </div>
          <input type="email" name="email" placeholder="Email Address" required className="w-full py-3.5 px-4 border border-[#e8e8ee] rounded-[10px] text-[14px] bg-[#f8f9fb] text-[#1a1a2e] outline-none focus:border-[#2673B5] transition-colors font-[inherit]" />
          <input type="tel" name="phone" placeholder="Phone Number" className="w-full py-3.5 px-4 border border-[#e8e8ee] rounded-[10px] text-[14px] bg-[#f8f9fb] text-[#1a1a2e] outline-none focus:border-[#2673B5] transition-colors font-[inherit]" />
          <textarea name="message" placeholder="Tell us about your infrastructure needs..." rows={4} className="w-full py-3.5 px-4 border border-[#e8e8ee] rounded-[10px] text-[14px] bg-[#f8f9fb] text-[#1a1a2e] outline-none focus:border-[#2673B5] transition-colors min-h-[100px] resize-y font-[inherit]"></textarea>
          <button type="submit" className="w-full py-3.5 px-8 bg-[#2673B5] text-white rounded-[10px] text-[15px] font-semibold border-none cursor-pointer transition-all hover:bg-[#3a8fd4] hover:-translate-y-[1px] text-center">Send Message</button>
        </form>

        <div className="mt-6 text-[14px] text-[#9090a8] reveal">
          Or reach us directly: <a href="mailto:info@infrax.ai" className="text-[#5a5a7a] hover:text-[#1a1a2e]">info@infrax.ai</a>
        </div>
      </section>

      </div>{/* end bg-white content wrapper */}
    </>
  );
}
