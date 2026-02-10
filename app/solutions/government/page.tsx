import { Metadata } from 'next';
import Image from 'next/image';
import SectionHeader from '@/components/SectionHeader';
import FeatureCard from '@/components/FeatureCard';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import StatCard from '@/components/StatCard';

export const metadata: Metadata = {
  title: 'Smart Infrastructure for Government | InfraX AI',
  description: 'Autonomous infrastructure monitoring for highways, expressways, and public infrastructure. ATMS compliance, real-time incident detection, automated reporting.',
};

export default function GovernmentSolution() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-6 pt-[100px] pb-[60px]">
        <div className="max-w-[1080px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#e8f1fa] border border-[rgba(38,115,181,0.15)] rounded-full text-[13px] text-[#2673B5] font-medium mb-8">
            For Government
          </div>
          <h1 className="text-[clamp(36px,6vw,68px)] font-extrabold leading-[1.08] tracking-[-0.03em] mb-6 text-[#1a1a2e]">
            Smart Infrastructure for<br />
            <span className="gradient-text">Bharat&apos;s Future</span>
          </h1>
          <p className="text-[clamp(16px,2vw,19px)] text-[#5a5a7a] max-w-[560px] mx-auto mb-10 leading-[1.7]">
            From national highways to smart cities — autonomous monitoring that never sleeps, never misses, never fails.
          </p>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-[100px] px-6 bg-[#f8f9fb]">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader title="The Problems You Face Every Day" centered />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] rounded-2xl overflow-hidden bg-[#e8e8ee]">
            {[
              { title: 'Manual Monitoring is Impossible', desc: "You can't have humans watching 200+ kilometers of highway 24/7. Incidents happen in seconds, and by the time you know, it's too late." },
              { title: 'Compliance is a Nightmare', desc: "ATMS requirements, daily reports, incident logs — it takes hours of manual work. And one missed report means penalties." },
              { title: "Systems Don't Talk to Each Other", desc: "You have cameras from one vendor, sensors from another, software from a third. Nothing works together." },
            ].map((item) => (
              <div key={item.title} className="bg-white p-8 border-l-4 border-[#dc2626]">
                <h3 className="text-[18px] font-bold text-[#1a1a2e] mb-2.5">{item.title}</h3>
                <p className="text-[14px] text-[#5a5a7a] leading-[1.65]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-[100px] px-6">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader label="The InfraX Solution" title="One Platform. Complete Autonomy." centered />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative h-96 rounded-xl overflow-hidden">
              <Image src="/smart-highways-v2.png" alt="Smart Highway Monitoring" fill className="object-cover" />
            </div>
            <div>
              <h3 className="text-[24px] font-bold text-[#1a1a2e] mb-6">Deploy once. Forget forever.</h3>
              <ul className="space-y-4">
                {[
                  { title: 'Zero Manual Work', desc: 'AI agents monitor everything 24/7. You only get alerts when something actually needs your attention.' },
                  { title: 'Automatic Compliance', desc: 'Daily reports, incident logs, performance metrics — all generated automatically. ATMS compliance on autopilot.' },
                  { title: 'Hardware Agnostic', desc: 'Works with any camera, any sensor, any system. We integrate with what you already have.' },
                  { title: 'Sub-2-Second Response', desc: 'From incident detection to alert delivery in under 2 seconds. Faster than any human could ever be.' },
                ].map((item) => (
                  <li key={item.title} className="flex items-start">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2673B5" strokeWidth="2" className="shrink-0 mt-1 mr-3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <div>
                      <div className="text-[15px] font-semibold text-[#1a1a2e]">{item.title}</div>
                      <div className="text-[14px] text-[#5a5a7a] leading-[1.65]">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              title="Incident Detection"
              description="Accidents, breakdowns, debris, wrong-way drivers — detected instantly and reported automatically."
            />
            <FeatureCard
              icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              title="Traffic Analytics"
              description="Vehicle counts, speed monitoring, congestion detection — real-time insights 24/7."
            />
            <FeatureCard
              icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              title="Automated Compliance"
              description="ATMS reports, daily summaries, incident documentation — all generated and submitted automatically."
            />
            <FeatureCard
              icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              title="Smart Alerts"
              description="Only get notified when it matters. Context-aware alerts with full incident details."
            />
            <FeatureCard
              icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              title="Camera Integration"
              description="Works with any IP camera. Hikvision, Dahua, Axis — we support them all."
            />
            <FeatureCard
              icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              title="Central Dashboard"
              description="One unified view of your entire infrastructure. Web-based, mobile-friendly, real-time."
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-[100px] px-6 bg-[#f8f9fb]">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader label="Proven Results" title="Live on TransHaryana Expressway" description="Bharat's first fully autonomous ATMS deployment" centered />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard value="227km" label="Highway Monitored" />
            <StatCard value="24" label="IoT Devices" />
            <StatCard value="16" label="AI Agents" />
            <StatCard value="99.9%" label="Uptime" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="divider"></div>
      <section className="py-[100px] px-6 max-w-[1080px] mx-auto text-center">
        <SectionHeader title="Let's Build Smart Infrastructure Together" description="Whether you're managing highways, expressways, or public infrastructure — we can make it autonomous." centered />
        <div className="max-w-[600px] mx-auto">
          <LeadCaptureForm source="government-solution" />
        </div>
      </section>
    </>
  );
}
