import { Metadata } from 'next';
import Image from 'next/image';
import SectionHeader from '@/components/SectionHeader';
import FeatureCard from '@/components/FeatureCard';
import LeadCaptureForm from '@/components/LeadCaptureForm';

export const metadata: Metadata = {
  title: 'Smart Building Solutions | InfraX AI',
  description: 'Buildings that think. HVAC optimization, occupancy sensing, predictive maintenance — all automated.',
};

export default function SmartBuildingsSolution() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-sm font-semibold mb-6">
            For Smart Buildings
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Buildings That
            <br />
            <span className="text-brand-blue">Think.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Turn your commercial building into an autonomous system. HVAC that optimizes itself. Lights that know when to dim. Maintenance that predicts itself.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="The Building Management Nightmare"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border-l-4 border-red-500">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Energy Bills Are Insane</h3>
              <p className="text-gray-600">
                HVAC running full blast in empty conference rooms. Lights on all night. Chillers working overtime because nobody optimized them. You're paying for waste.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border-l-4 border-red-500">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reactive Maintenance is Expensive</h3>
              <p className="text-gray-600">
                Equipment breaks. You scramble to fix it. Tenants complain. Downtime costs money. And it happens over and over because you can't predict failures.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border-l-4 border-red-500">
              <h3 className="text-xl font-bold text-gray-900 mb-3">BMS is Just Logging Data</h3>
              <p className="text-gray-600">
                Your Building Management System collects data. Great. But it doesn't DO anything with it. It doesn't optimize, predict, or automate. It's a glorified logger.
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
            title="Turn Your BMS Into an AI Brain"
            centered
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                From Data Logging to Autonomous Operations
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                InfraX AI sits on top of your existing BMS and transforms it into an intelligent, autonomous system. No rip and replace. Just add intelligence.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Predictive HVAC', desc: 'AI learns occupancy patterns and optimizes cooling/heating before people arrive. 30-40% energy savings typical.' },
                  { title: 'Smart Lighting', desc: 'Occupancy-based controls, daylight harvesting, and automated scheduling. No more lights in empty rooms.' },
                  { title: 'Predictive Maintenance', desc: 'Detect equipment anomalies before they fail. Schedule maintenance during low-occupancy periods.' },
                  { title: 'Works With Your BMS', desc: 'Integrates with Honeywell, Johnson Controls, Siemens, and any BACnet/Modbus system.' },
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
            <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/smart-buildings-v3.png"
                alt="Smart Building Operations"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Capabilities */}
          <SectionHeader
            title="What InfraX AI Can Do For Your Building"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              title="HVAC Optimization"
              description="Predictive controls based on occupancy, weather, and schedules. Reduce energy use without sacrificing comfort."
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              title="Intelligent Lighting"
              description="Occupancy detection, daylight integration, and automated scheduling. Lights only on when needed."
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Energy Analytics"
              description="Real-time consumption monitoring, anomaly detection, and optimization recommendations."
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              }
              title="Occupancy Sensing"
              description="Camera-based people counting, space utilization analytics, and desk/room booking optimization."
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="Predictive Maintenance"
              description="Detect equipment anomalies, predict failures, and schedule maintenance before breakdowns occur."
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Access Control Integration"
              description="Integrate with access systems for automated lighting, HVAC, and security workflows."
            />
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Typical ROI in 12-18 Months"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-brand-blue mb-2">30-40%</div>
              <div className="text-gray-600">Energy cost reduction</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-brand-blue mb-2">50%</div>
              <div className="text-gray-600">Maintenance cost savings</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-brand-blue mb-2">80%</div>
              <div className="text-gray-600">Reduction in manual tasks</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-brand-blue mb-2">2x</div>
              <div className="text-gray-600">Equipment lifespan increase</div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Perfect For"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Commercial Offices', desc: 'Optimize energy for floor-by-floor occupancy. Reduce HVAC waste in empty conference rooms. Automate lighting based on daylight and occupancy.' },
              { title: 'Shopping Malls', desc: 'Zone-based HVAC control. Predictive maintenance for escalators and elevators. Energy optimization during low-traffic hours.' },
              { title: 'Hospitals', desc: 'Critical equipment monitoring. Energy savings without compromising patient comfort. Predictive maintenance for life-safety systems.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="Make Your Building Autonomous"
            description="Let's talk about turning your building into an intelligent, self-optimizing system."
            centered
          />
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12">
            <LeadCaptureForm source="smart-buildings" />
          </div>
        </div>
      </section>
    </>
  );
}
