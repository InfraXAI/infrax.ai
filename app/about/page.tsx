import { Metadata } from 'next';
import Image from 'next/image';
import SectionHeader from '@/components/SectionHeader';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | InfraX AI',
  description: 'NaturNest AI Private Limited builds InfraX AI — the agentic operating system for smart infrastructure. Founded 2017, headquartered in Gurugram.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-6 pt-[100px] pb-[60px]">
        <div className="max-w-[1080px] mx-auto text-center">
          <h1 className="text-[clamp(36px,6vw,68px)] font-extrabold leading-[1.08] tracking-[-0.03em] mb-6 text-[#1a1a2e]">
            Infrastructure that<br />
            <span className="gradient-text">runs itself.</span>
          </h1>
          <p className="text-[clamp(16px,2vw,19px)] text-[#5a5a7a] max-w-[560px] mx-auto leading-[1.7]">
            We build the agentic operating system for highways, cities, and buildings — so infrastructure can monitor, analyze, and act on its own.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-[100px] px-6 bg-[#f8f9fb]">
        <div className="max-w-[1080px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="relative h-96 rounded-xl overflow-hidden">
              <Image src="/control-room-v2.png" alt="InfraX AI Control Room" fill className="object-cover" />
            </div>
            <div>
              <SectionHeader label="Our Story" title="From Ayodhya to Cyber City" />
              <p className="text-[15px] text-[#5a5a7a] leading-[1.7] mb-5">
                InfraX AI is a product of <strong className="text-[#1a1a2e]">NaturNest AI Private Limited</strong>. Founded in 2017 in the historic city of Ayodhya, we started with a question: <strong className="text-[#1a1a2e]">Can infrastructure manage itself?</strong>
              </p>
              <p className="text-[15px] text-[#5a5a7a] leading-[1.7] mb-5">
                Eight years later, the answer is yes. Our AI agents autonomously monitor 227 km of the TransHaryana Expressway — detecting incidents, generating reports, and managing compliance in under 2 seconds. No human intervention required.
              </p>
              <p className="text-[15px] text-[#5a5a7a] leading-[1.7] mb-8">
                Today, we&apos;re headquartered at WeWork DLF Forum in Gurugram, building the platform that will power autonomous infrastructure across Bharat and beyond.
              </p>
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-[28px] font-extrabold text-[#2673B5]">Est. 2017</div>
                  <div className="text-[12px] text-[#5a5a7a] uppercase tracking-[0.05em] mt-1">Founded</div>
                </div>
                <div>
                  <div className="text-[28px] font-extrabold text-[#2673B5]">227km</div>
                  <div className="text-[12px] text-[#5a5a7a] uppercase tracking-[0.05em] mt-1">Under Management</div>
                </div>
                <div>
                  <div className="text-[28px] font-extrabold text-[#2673B5]">100%</div>
                  <div className="text-[12px] text-[#5a5a7a] uppercase tracking-[0.05em] mt-1">Proprietary Tech</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-[100px] px-6">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader label="What We Do" title="One Platform. Three Verticals." centered />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] rounded-2xl overflow-hidden bg-[#e8e8ee]">
            {[
              { title: 'Smart Highways', desc: 'ATMS, incident detection, vehicle classification, speed monitoring, automated compliance — deployed on live expressways across Bharat.', stat: 'Live on TransHaryana' },
              { title: 'Smart Cities', desc: 'Unified city management — traffic, lighting, waste, energy, parking — all on one platform with autonomous AI agents.', stat: 'Coming Soon' },
              { title: 'Smart Buildings', desc: 'Predictive HVAC, occupancy sensing, energy optimization, predictive maintenance — turning BMS data into autonomous operations.', stat: 'Coming Soon' },
            ].map((item) => (
              <div key={item.title} className="bg-white py-10 px-8 text-center">
                <h3 className="text-[20px] font-bold text-[#1a1a2e] mb-2.5">{item.title}</h3>
                <p className="text-[14px] text-[#5a5a7a] leading-[1.65] mb-4">{item.desc}</p>
                <span className="inline-block px-3 py-1 bg-[#e8f1fa] text-[#2673B5] rounded-full text-[12px] font-semibold">{item.stat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-[100px] px-6 bg-[#f8f9fb]">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader label="Our Approach" title="Why We're Different" centered />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] rounded-2xl overflow-hidden bg-[#e8e8ee]">
            {[
              { title: 'Hardware Agnostic', desc: 'We work with any camera, sensor, or IoT device. Hikvision, Dahua, Axis, custom — no vendor lock-in, no rip-and-replace.', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
              { title: 'Sub-2-Second Response', desc: 'Our AI agents detect and respond to incidents faster than any human could. From detection to alert in under 2 seconds.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { title: 'Built for Bharat', desc: 'Designed for Indian infrastructure realities — harsh weather, unreliable connectivity, diverse hardware. Tested in production, not in labs.', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((v) => (
              <div key={v.title} className="bg-white py-10 px-8 text-center">
                <div className="w-14 h-14 bg-[#e8f1fa] text-[#2673B5] rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={v.icon} strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3 className="text-[18px] font-bold text-[#1a1a2e] mb-2.5">{v.title}</h3>
                <p className="text-[14px] text-[#5a5a7a] leading-[1.65]">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-[100px] px-6">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader label="Company" title="NaturNest AI Private Limited" centered />
          <div className="max-w-[600px] mx-auto">
            <div className="flex flex-col gap-4">
              {[
                { icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', extra: '<circle cx="12" cy="10" r="3"/>', text: 'WeWork DLF Forum, Ground Floor, DLF Cyber City, Phase 3, Gurugram, Haryana 122002' },
                { icon: 'M2 7h20v14H2zM2 7l10 7 10-7', text: 'info@infrax.ai' },
                { icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z', text: 'www.infrax.ai · www.naturnest.ai' },
                { icon: 'M3 4h18v14H3zM3 4l9 7 9-7', text: 'Est. 2017 · Ayodhya, Uttar Pradesh' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-[14px] text-[#5a5a7a] bg-[#f8f9fb] border border-[#e8e8ee] rounded-xl px-5 py-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2673B5" strokeWidth="2" className="shrink-0 mt-0.5"><path d={item.icon} strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="divider"></div>
      <section className="py-[120px] px-6 text-center">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-[clamp(30px,4.5vw,50px)] font-extrabold leading-[1.1] tracking-[-0.03em] mb-5 text-[#1a1a2e]">
            Ready to make your infrastructure<br />
            <span className="gradient-text">autonomous?</span>
          </h2>
          <p className="text-[17px] text-[#5a5a7a] mb-10 leading-[1.7]">
            Let&apos;s talk about what InfraX AI can do for your highways, cities, or buildings.
          </p>
          <Link href="/#contact" className="inline-block px-8 py-3.5 bg-[#2673B5] text-white rounded-[10px] text-[15px] font-semibold transition-all hover:bg-[#3a8fd4] hover:-translate-y-[1px]">
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
