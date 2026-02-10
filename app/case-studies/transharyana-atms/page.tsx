import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import StatCard from '@/components/StatCard';
import LeadCaptureForm from '@/components/LeadCaptureForm';

export const metadata: Metadata = {
  title: 'TransHaryana ATMS Case Study | InfraX AI',
  description: 'Detailed case study of the first fully autonomous ATMS deployment on 227km of TransHaryana Expressway.',
};

export default function TransHaryanaCaseStudy() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-block px-4 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-sm font-semibold mb-6">
            Case Study: Infrastructure
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Autonomous Monitoring for India&apos;s
            <br />
            <span className="text-brand-blue">TransHaryana Expressway</span>
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard value="227km" label="Length Monitored" />
            <StatCard value="6-lane" label="Highway Class" />
            <StatCard value="&lt;2s" label="Incident Response" />
            <StatCard value="24/7" label="AI Monitoring" />
          </div>
        </div>
      </section>

      {/* Overview Image */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative h-[60vh] rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src="/smart-highways-v2.png"
            alt="TransHaryana Expressway"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Detailed Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg prose-blue">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Challenge</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Monitoring 227 kilometers of a high-speed 6-lane expressway is a monumental task. Traditional monitoring relies on human operators watching dozens of CCTV screens—a process prone to fatigue, missed incidents, and delayed response times. With vehicles travelling at 100km/h, every second counts.
            </p>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Requirement</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              NHAI (National Highways Authority of India) mandated an Advanced Traffic Management System (ATMS) that could ensure 100% compliance, detect accidents instantly, and manage traffic flow autonomously. The system needed to handle:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-8 space-y-2">
              <li>Automatic Incident Detection (AID)</li>
              <li>Vehicle Counting and Classification (VCC)</li>
              <li>Wrong-way Driver Detection</li>
              <li>Speed Violation Alerts</li>
              <li>Real-time Weather Monitoring</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">The InfraX Solution</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              InfraX AI deployed a network of 24 high-performance IoT devices and 16 specialized AI Agents across the expressway. Unlike traditional systems that just record video, our AI Agents <strong>process video at the edge</strong>, detecting incidents the moment they happen.
            </p>
            
            <div className="bg-brand-blue/5 border-l-4 border-brand-blue p-8 my-12 rounded-r-xl">
              <h4 className="text-xl font-bold text-brand-blue mb-2">The 2-Second Rule</h4>
              <p className="text-gray-700 italic">
                &quot;From the moment a vehicle stops on the highway or an accident occurs, the InfraX AI Agent identifies the incident, classifies it, and alerts the control room in under 2 seconds. No human intervention required.&quot;
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2">Zero Fatigue</h4>
                <p className="text-sm text-gray-600">The system monitors 100% of the highway 100% of the time. No missed incidents due to operator distraction.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2">Instant Compliance</h4>
                <p className="text-sm text-gray-600">Daily reports and logs required by highway authorities are generated automatically every 24 hours.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2">Cost Reduction</h4>
                <p className="text-sm text-gray-600">Reduced the need for a massive manual monitoring team by 85%, while increasing safety.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2">Live Integration</h4>
                <p className="text-sm text-gray-600">Seamlessly integrated with existing Variable Message Signs (VMS) to alert drivers of incidents ahead.</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Deployment Specs</h2>
            <div className="bg-gray-50 rounded-xl p-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-4 font-bold text-gray-900">Component</th>
                    <th className="py-4 font-bold text-gray-900">Quantity / Spec</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-4">AI Vision Agents</td>
                    <td className="py-4">16 Units</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4">IoT Integration Points</td>
                    <td className="py-4">24 Units</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4">Processing Latency</td>
                    <td className="py-4">&lt; 150ms</td>
                  </tr>
                  <tr>
                    <td className="py-4">Uptime (SLA)</td>
                    <td className="py-4">99.9%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <blockquote className="text-2xl md:text-3xl font-medium italic mb-8">
            &quot;InfraX AI has redefined what we expect from highway management. The speed and accuracy of the autonomous agents are lightyears ahead of manual monitoring.&quot;
          </blockquote>
          <div className="text-brand-blue font-bold text-xl">— Project Lead, TransHaryana ATMS Deployment</div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="Deploy This in Your Project"
            description="Our ATMS solution is ready for deployment on any highway or expressway. Get in touch for a technical demo."
            centered
          />
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12">
            <LeadCaptureForm source="case-study-transharyana" />
          </div>
        </div>
      </section>
    </>
  );
}
