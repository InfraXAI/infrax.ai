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
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-sm font-semibold mb-6">
            For System Integrators
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            You Do Hardware.
            <br />
            <span className="text-brand-blue">We Do Everything Else.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Stop wrestling with software complexity. White-label our AI platform and deliver autonomous infrastructure monitoring to your clients — without writing a single line of code.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="You Know This Pain"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 border-l-4 border-red-500">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Hardware is Your Strength. Software is Hell.</h3>
              <p className="text-gray-600 mb-4">
                You're great at deploying cameras, sensors, and IoT devices. But then your client asks: "Where's the AI? Where's the dashboard? Where are the automatic alerts?"
              </p>
              <p className="text-gray-600">
                You either say no to the contract, hire expensive developers, or cobble together some half-working solution that becomes a maintenance nightmare.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border-l-4 border-red-500">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Your Clients Want Autonomous Systems. You Give Them... Cameras.</h3>
              <p className="text-gray-600 mb-4">
                They don't want to watch 50 camera feeds. They want AI that watches for them. They want automatic incident detection. They want reports that write themselves.
              </p>
              <p className="text-gray-600">
                But building that kind of software? That's a 12-month project with a 7-figure budget. Most SIs can't afford it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            label="The InfraX Solution"
            title="Your Hardware. Our AI. Their Problem Solved."
            centered
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Stop building software. Start deploying intelligence.
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                InfraX AI is the missing software layer for your hardware deployments. We handle all the complexity — AI, analytics, dashboards, alerts, reports — so you can focus on what you do best: hardware.
              </p>
              <div className="space-y-4">
                {[
                  'White-label our entire platform under your brand',
                  'Works with any camera, sensor, or IoT device',
                  'Deploy in days, not months',
                  'Revenue share or license — your choice',
                  'We handle updates, maintenance, and support',
                ].map((item) => (
                  <div key={item} className="flex items-start">
                    <svg className="w-6 h-6 text-brand-blue mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/control-room-v2.png"
                alt="InfraX AI Dashboard"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="How It Works"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-brand-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">You Deploy Hardware</h3>
              <p className="text-gray-600">
                Install your cameras, sensors, and IoT devices like you always do. We work with any brand, any protocol.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-brand-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">We Connect Our AI</h3>
              <p className="text-gray-600">
                Point your devices to our platform. We handle all the AI processing, analytics, and intelligence. White-labeled under your brand.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-brand-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Client Gets Autonomous System</h3>
              <p className="text-gray-600">
                Your client sees a fully autonomous monitoring system with AI, dashboards, and reports — all under your brand. You look like a hero.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="What You Get"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              }
              title="White-Label Platform"
              description="Our entire platform under your brand. Your logo, your colors, your domain. Clients never know we exist."
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              title="AI Vision Models"
              description="Pre-trained models for incident detection, vehicle counting, object tracking, and more. Or we train custom models for your use case."
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Real-Time Dashboards"
              description="Beautiful, responsive dashboards for web and mobile. Live camera feeds, analytics, alerts — all in real-time."
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              }
              title="Smart Alerts"
              description="Automated alerts via SMS, email, WhatsApp, or API. Configurable rules, escalation workflows, and context-aware notifications."
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="Automated Reports"
              description="Daily, weekly, monthly reports generated automatically. Compliance-ready, client-ready, no manual work."
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              title="Full API Access"
              description="REST APIs for custom integrations. Connect to your ERP, ticketing systems, or any other software."
            />
          </div>
        </div>
      </section>

      {/* Pricing Models */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Flexible Business Models"
            description="Choose what works for you"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 border-2 border-brand-blue">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Revenue Share</h3>
              <p className="text-gray-600 mb-6">
                You charge your client. We take a percentage. Simple, scalable, no upfront costs.
              </p>
              <ul className="space-y-3">
                {['No upfront fees', 'Pay only when you earn', 'Scales with your growth', 'Perfect for new partnerships'].map((item) => (
                  <li key={item} className="flex items-start">
                    <svg className="w-5 h-5 text-brand-blue mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl p-8 border-2 border-gray-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">White-Label License</h3>
              <p className="text-gray-600 mb-6">
                Full platform access, unlimited deployments, fixed annual fee. For established SIs doing volume.
              </p>
              <ul className="space-y-3">
                {['Unlimited projects', 'Predictable costs', 'Maximum margins', 'Full control'].map((item) => (
                  <li key={item} className="flex items-start">
                    <svg className="w-5 h-5 text-brand-blue mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="Let's Build Together"
            description="Stop losing deals because you can't deliver the software layer. Partner with InfraX AI and win every smart infrastructure contract."
            centered
          />
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12">
            <LeadCaptureForm source="system-integrators" />
          </div>
        </div>
      </section>
    </>
  );
}
