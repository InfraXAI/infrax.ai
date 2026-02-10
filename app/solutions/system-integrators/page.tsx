import { Metadata } from 'next';
import Image from 'next/image';
import SectionHeader from '@/components/SectionHeader';
import FeatureCard from '@/components/FeatureCard';
import LeadCaptureForm from '@/components/LeadCaptureForm';

export const metadata: Metadata = {
  title: 'For System Integrators | InfraX AI',
  description: 'You do hardware. We do everything else. White-label AI infrastructure monitoring for system integrators.',
};

export default function SystemIntegratorsSolution() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-6 pt-[100px] pb-[60px]">
        <div className="max-w-[1080px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#e8f1fa] border border-[rgba(38,115,181,0.15)] rounded-full text-[13px] text-[#2673B5] font-medium mb-8">
            For System Integrators
          </div>
          <h1 className="text-[clamp(36px,6vw,68px)] font-extrabold leading-[1.08] tracking-[-0.03em] mb-6 text-[#1a1a2e]">
            You Do Hardware.<br />
            <span className="gradient-text">We Do Everything Else.</span>
          </h1>
          <p className="text-[clamp(16px,2vw,19px)] text-[#5a5a7a] max-w-[560px] mx-auto mb-10 leading-[1.7]">
            Stop wrestling with software complexity. White-label our AI platform and deliver autonomous infrastructure monitoring to your clients — without writing a single line of code.
          </p>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-[100px] px-6 bg-[#f8f9fb]">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader title="You Know This Pain" centered />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] rounded-2xl overflow-hidden bg-[#e8e8ee]">
            <div className="bg-white p-8 border-l-4 border-[#dc2626]">
              <h3 className="text-[18px] font-bold text-[#1a1a2e] mb-2.5">Hardware is Your Strength. Software is Hell.</h3>
              <p className="text-[14px] text-[#5a5a7a] leading-[1.65] mb-3">
                You&apos;re great at deploying cameras, sensors, and IoT devices. But then your client asks: &quot;Where&apos;s the AI? Where&apos;s the dashboard? Where are the automatic alerts?&quot;
              </p>
              <p className="text-[14px] text-[#5a5a7a] leading-[1.65]">
                You either say no to the contract, hire expensive developers, or cobble together some half-working solution that becomes a maintenance nightmare.
              </p>
            </div>
            <div className="bg-white p-8 border-l-4 border-[#dc2626]">
              <h3 className="text-[18px] font-bold text-[#1a1a2e] mb-2.5">Your Clients Want Autonomous Systems. You Give Them... Cameras.</h3>
              <p className="text-[14px] text-[#5a5a7a] leading-[1.65] mb-3">
                They don&apos;t want to watch 50 camera feeds. They want AI that watches for them. They want automatic incident detection. They want reports that write themselves.
              </p>
              <p className="text-[14px] text-[#5a5a7a] leading-[1.65]">
                But building that kind of software? That&apos;s a 12-month project with a 7-figure budget. Most SIs can&apos;t afford it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-[100px] px-6">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader label="The InfraX Solution" title="Your Hardware. Our AI. Their Problem Solved." centered />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-[24px] font-bold text-[#1a1a2e] mb-4">Stop building software. Start deploying intelligence.</h3>
              <p className="text-[15px] text-[#5a5a7a] leading-[1.7] mb-6">
                InfraX AI is the missing software layer for your hardware deployments. We handle all the complexity — AI, analytics, dashboards, alerts, reports — so you can focus on what you do best: hardware.
              </p>
              <div className="space-y-3">
                {[
                  'White-label our entire platform under your brand',
                  'Works with any camera, sensor, or IoT device',
                  'Deploy in days, not months',
                  'Revenue share or license — your choice',
                  'We handle updates, maintenance, and support',
                ].map((item) => (
                  <div key={item} className="flex items-start">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2673B5" strokeWidth="2" className="shrink-0 mt-0.5 mr-3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-[15px] text-[#5a5a7a]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-96 rounded-xl overflow-hidden">
              <Image src="/control-room-v2.png" alt="InfraX AI Dashboard" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-[100px] px-6 bg-[#f8f9fb]">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader title="How It Works" centered />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] rounded-2xl overflow-hidden bg-[#e8e8ee]">
            {[
              { num: '1', title: 'You Deploy Hardware', desc: 'Install your cameras, sensors, and IoT devices like you always do. We work with any brand, any protocol.' },
              { num: '2', title: 'We Connect Our AI', desc: 'Point your devices to our platform. We handle all the AI processing, analytics, and intelligence. White-labeled under your brand.' },
              { num: '3', title: 'Client Gets Autonomous System', desc: "Your client sees a fully autonomous monitoring system with AI, dashboards, and reports — all under your brand. You look like a hero." },
            ].map((step) => (
              <div key={step.num} className="bg-white py-10 px-8 text-center">
                <div className="w-14 h-14 bg-[#2673B5] text-white rounded-full flex items-center justify-center text-[22px] font-bold mx-auto mb-5">{step.num}</div>
                <h3 className="text-[18px] font-bold text-[#1a1a2e] mb-2.5">{step.title}</h3>
                <p className="text-[14px] text-[#5a5a7a] leading-[1.65]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-[100px] px-6">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader title="What You Get" centered />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" strokeLinecap="round" strokeLinejoin="round"/></svg>} title="White-Label Platform" description="Our entire platform under your brand. Your logo, your colors, your domain. Clients never know we exist." />
            <FeatureCard icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/></svg>} title="AI Vision Models" description="Pre-trained models for incident detection, vehicle counting, object tracking, and more. Or we train custom models for your use case." />
            <FeatureCard icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/></svg>} title="Real-Time Dashboards" description="Beautiful, responsive dashboards for web and mobile. Live camera feeds, analytics, alerts — all in real-time." />
            <FeatureCard icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"/></svg>} title="Smart Alerts" description="Automated alerts via SMS, email, WhatsApp, or API. Configurable rules, escalation workflows, and context-aware notifications." />
            <FeatureCard icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>} title="Automated Reports" description="Daily, weekly, monthly reports generated automatically. Compliance-ready, client-ready, no manual work." />
            <FeatureCard icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>} title="Full API Access" description="REST APIs for custom integrations. Connect to your ERP, ticketing systems, or any other software." />
          </div>
        </div>
      </section>

      {/* Pricing Models */}
      <section className="py-[100px] px-6 bg-[#f8f9fb]">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader title="Flexible Business Models" description="Choose what works for you" centered />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
            <div className="bg-white rounded-xl p-8 border-2 border-[#2673B5]">
              <h3 className="text-[22px] font-bold text-[#1a1a2e] mb-2.5">Revenue Share</h3>
              <p className="text-[14px] text-[#5a5a7a] leading-[1.65] mb-5">You charge your client. We take a percentage. Simple, scalable, no upfront costs.</p>
              <ul className="space-y-2.5">
                {['No upfront fees', 'Pay only when you earn', 'Scales with your growth', 'Perfect for new partnerships'].map((item) => (
                  <li key={item} className="flex items-start">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2673B5" strokeWidth="2" className="shrink-0 mt-0.5 mr-2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-[14px] text-[#5a5a7a]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl p-8 border border-[#e8e8ee]">
              <h3 className="text-[22px] font-bold text-[#1a1a2e] mb-2.5">White-Label License</h3>
              <p className="text-[14px] text-[#5a5a7a] leading-[1.65] mb-5">Full platform access, unlimited deployments, fixed annual fee. For established SIs doing volume.</p>
              <ul className="space-y-2.5">
                {['Unlimited projects', 'Predictable costs', 'Maximum margins', 'Full control'].map((item) => (
                  <li key={item} className="flex items-start">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2673B5" strokeWidth="2" className="shrink-0 mt-0.5 mr-2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-[14px] text-[#5a5a7a]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="divider"></div>
      <section className="py-[100px] px-6 max-w-[1080px] mx-auto text-center">
        <SectionHeader title="Let's Build Together" description="Stop losing deals because you can't deliver the software layer. Partner with InfraX AI and win every smart infrastructure contract." centered />
        <div className="max-w-[600px] mx-auto">
          <LeadCaptureForm source="system-integrators" />
        </div>
      </section>
    </>
  );
}
