import { Metadata } from 'next';
import Image from 'next/image';
import SectionHeader from '@/components/SectionHeader';
import FeatureCard from '@/components/FeatureCard';
import LeadCaptureForm from '@/components/LeadCaptureForm';

export const metadata: Metadata = {
  title: 'Smart City Solutions | InfraX AI',
  description: 'One platform for your entire city. Traffic, lighting, waste, energy — all autonomous, all connected.',
};

export default function SmartCitiesSolution() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-6 pt-[100px] pb-[60px]">
        <div className="max-w-[1080px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#e8f1fa] border border-[rgba(38,115,181,0.15)] rounded-full text-[13px] text-[#2673B5] font-medium mb-8">
            For Smart Cities
          </div>
          <h1 className="text-[clamp(36px,6vw,68px)] font-extrabold leading-[1.08] tracking-[-0.03em] mb-6 text-[#1a1a2e]">
            One Platform.<br />
            <span className="gradient-text">Entire City.</span>
          </h1>
          <p className="text-[clamp(16px,2vw,19px)] text-[#5a5a7a] max-w-[560px] mx-auto mb-10 leading-[1.7]">
            Stop managing 17 different systems from 12 different vendors. Unify your city&apos;s infrastructure under one autonomous AI platform.
          </p>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-[100px] px-6 bg-[#f8f9fb]">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader title="The Smart City That Isn't Actually Smart" centered />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] rounded-2xl overflow-hidden bg-[#e8e8ee]">
            {[
              { title: 'Siloed Systems', desc: "Traffic on one platform. Lighting on another. Waste management on a third. Nothing talks to each other. You need 5 logins just to check what's happening." },
              { title: 'Vendor Lock-In Hell', desc: "Each vendor has their own proprietary system. Want to switch? Start from scratch. Want to integrate? That'll be 6 months and ₹50 lakhs in consulting fees." },
              { title: 'Manual Everything', desc: "You have sensors everywhere, but humans still make every decision. That's not a smart city. That's an expensive dumb city with Wi-Fi." },
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
          <SectionHeader label="The InfraX Solution" title="One Brain for Your Entire City" centered />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative h-96 rounded-xl overflow-hidden">
              <Image src="/smart-cities-v3.png" alt="Smart City Platform" fill className="object-cover" />
            </div>
            <div>
              <h3 className="text-[24px] font-bold text-[#1a1a2e] mb-6">Unified. Autonomous. Actually Smart.</h3>
              <div className="space-y-4">
                {[
                  { title: 'Hardware Agnostic', desc: 'Works with any sensor, any camera, any IoT device. We integrate with what you already have.' },
                  { title: 'One Dashboard', desc: 'Traffic, lighting, waste, energy, parking — everything in one unified view. One login, one platform.' },
                  { title: 'Autonomous Operations', desc: "AI makes decisions in real-time. Traffic lights optimize themselves. Streetlights dim when no one's around." },
                  { title: 'Open APIs', desc: 'Not locked in. Export your data, integrate with other systems, or switch platforms whenever you want.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2673B5" strokeWidth="2" className="shrink-0 mt-1 mr-3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <div>
                      <div className="text-[15px] font-semibold text-[#1a1a2e]">{item.title}</div>
                      <div className="text-[14px] text-[#5a5a7a] leading-[1.65]">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <SectionHeader title="What You Can Monitor & Control" centered />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>} title="Traffic Management" description="Real-time traffic monitoring, adaptive signal control, congestion prediction, and incident detection." />
            <FeatureCard icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/></svg>} title="Smart Lighting" description="Adaptive street lighting, occupancy-based dimming, energy optimization, and fault detection." />
            <FeatureCard icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round"/></svg>} title="Waste Management" description="Smart bin monitoring, optimized collection routes, fill-level prediction, and fleet tracking." />
            <FeatureCard icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>} title="Energy Monitoring" description="Real-time consumption tracking, anomaly detection, load balancing, and renewable integration." />
            <FeatureCard icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" strokeLinecap="round" strokeLinejoin="round"/></svg>} title="Parking Management" description="Real-time occupancy, guidance systems, payment integration, and violation detection." />
            <FeatureCard icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/></svg>} title="Public Safety" description="Smart surveillance, crowd monitoring, emergency response coordination, and incident tracking." />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-[100px] px-6 bg-[#f8f9fb]">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader title="The Results You'll See" centered />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { val: '30-40%', label: 'Energy savings on public lighting' },
              { val: '25%', label: 'Reduction in traffic congestion' },
              { val: '50%', label: 'Waste collection efficiency gain' },
              { val: '80%', label: 'Reduction in manual operations' },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-[#e8e8ee] rounded-xl p-6 text-center">
                <div className="text-[clamp(24px,3.5vw,36px)] font-extrabold text-[#2673B5] leading-[1]">{stat.val}</div>
                <div className="text-[13px] text-[#5a5a7a] mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="divider"></div>
      <section className="py-[100px] px-6 max-w-[1080px] mx-auto text-center">
        <SectionHeader title="Build a Truly Smart City" description="Let's talk about making your city autonomous. Not next year. Now." centered />
        <div className="max-w-[600px] mx-auto">
          <LeadCaptureForm source="smart-cities" />
        </div>
      </section>
    </>
  );
}
