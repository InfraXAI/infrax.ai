import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SectionHeader from '@/components/SectionHeader';

export const metadata: Metadata = {
  title: 'Case Studies | InfraX AI',
  description: 'Real deployments. Real results. See how InfraX AI is powering autonomous infrastructure across India.',
};

export default function CaseStudies() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Case Studies
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real deployments. Real results. See how InfraX AI is powering autonomous infrastructure across India.
          </p>
        </div>
      </section>

      {/* Featured Case Study */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-block px-4 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-sm font-semibold mb-6">
            Featured
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-96 lg:h-auto">
                <Image
                  src="/smart-highways-v2.png"
                  alt="TransHaryana ATMS"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold mb-4 w-fit">
                  Government · Highways
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  TransHaryana ATMS: 227km of Autonomous Highway Monitoring
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  India's first fully autonomous Advanced Traffic Management System deployed on the TransHaryana Expressway.
                  24 IoT devices, 16 AI agents, monitoring 227 kilometers of 6-lane highway in real-time.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-2xl font-bold text-brand-blue">227km</div>
                    <div className="text-sm text-gray-600">Monitored</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-brand-blue">&lt;2s</div>
                    <div className="text-sm text-gray-600">Response Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-brand-blue">24</div>
                    <div className="text-sm text-gray-600">IoT Devices</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-brand-blue">99.9%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                </div>
                <Link
                  href="/case-studies/transharyana-atms"
                  className="inline-flex items-center text-brand-blue font-semibold text-lg group"
                >
                  Read Full Case Study
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More Case Studies Coming Soon */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="More Success Stories Coming Soon"
            description="We're working with government agencies, system integrators, and smart city developers across India. New case studies launching monthly."
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Smart City Pilot', category: 'Smart Cities', status: 'Deployment in Progress' },
              { title: 'Commercial Tower', category: 'Smart Buildings', status: 'Energy Audit Phase' },
              { title: 'Industrial Campus', category: 'Smart Buildings', status: 'Integration Phase' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-8 border border-gray-200">
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold mb-4">
                  {item.category}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.status}</p>
                <div className="text-sm text-gray-500">Case study coming soon</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Want to Be Our Next Success Story?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            We're always looking for innovative partners ready to deploy autonomous infrastructure monitoring.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center bg-brand-blue text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg group"
          >
            Get in Touch
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
