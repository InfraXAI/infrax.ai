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
      <section className="relative min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-sm font-semibold mb-6">
            For Smart Cities
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            One Platform.
            <br />
            <span className="text-brand-blue">Entire City.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Stop managing 17 different systems from 12 different vendors. Unify your city's infrastructure under one autonomous AI platform.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="The Smart City That Isn't Actually Smart"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border-l-4 border-red-500">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Siloed Systems</h3>
              <p className="text-gray-600">
                Traffic on one platform. Lighting on another. Waste management on a third. Nothing talks to each other. You need 5 logins just to check what's happening.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border-l-4 border-red-500">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vendor Lock-In Hell</h3>
              <p className="text-gray-600">
                Each vendor has their own proprietary system. Want to switch? Start from scratch. Want to integrate? That'll be 6 months and ₹50 lakhs in consulting fees.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border-l-4 border-red-500">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Manual Everything</h3>
              <p className="text-gray-600">
                You have sensors everywhere, but humans still make every decision. That's not a smart city. That's an expensive dumb city with Wi-Fi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            label="The InfraX Solution"
            title="One Brain for Your Entire City"
            centered
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/smart-cities-v3.png"
                alt="Smart City Platform"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Unified. Autonomous. Actually Smart.
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'Hardware Agnostic', desc: 'Works with any sensor, any camera, any IoT device. We integrate with what you already have.' },
                  { title: 'One Dashboard', desc: 'Traffic, lighting, waste, energy, parking — everything in one unified view. One login, one platform.' },
                  { title: 'Autonomous Operations', desc: 'AI makes decisions in real-time. Traffic lights optimize themselves. Streetlights dim when no one\u0027s around. Waste collection routes itself.' },
                  { title: 'Open APIs', desc: 'Not locked in. Export your data, integrate with other systems, or switch platforms whenever you want.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start">
                    <svg className="w-6 h-6 text-brand-blue mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <div className="text-gray-600">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <SectionHeader
            title="What You Can Monitor & Control"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              }
              title="Traffic Management"
              description="Real-time traffic monitoring, adaptive signal control, congestion prediction, and incident detection."
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              title="Smart Lighting"
              description="Adaptive street lighting, occupancy-based dimming, energy optimization, and fault detection."
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
              title="Waste Management"
              description="Smart bin monitoring, optimized collection routes, fill-level prediction, and fleet tracking."
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              title="Energy Monitoring"
              description="Real-time consumption tracking, anomaly detection, load balancing, and renewable integration."
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              }
              title="Parking Management"
              description="Real-time occupancy, guidance systems, payment integration, and violation detection."
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              }
              title="Public Safety"
              description="Smart surveillance, crowd monitoring, emergency response coordination, and incident tracking."
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="The Results You'll See"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-brand-blue mb-2">30-40%</div>
              <div className="text-gray-600">Energy savings on public lighting</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-brand-blue mb-2">25%</div>
              <div className="text-gray-600">Reduction in traffic congestion</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-brand-blue mb-2">50%</div>
              <div className="text-gray-600">Waste collection efficiency gain</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-brand-blue mb-2">80%</div>
              <div className="text-gray-600">Reduction in manual operations</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="Build a Truly Smart City"
            description="Let's talk about making your city autonomous. Not next year. Now."
            centered
          />
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12">
            <LeadCaptureForm source="smart-cities" />
          </div>
        </div>
      </section>
    </>
  );
}
