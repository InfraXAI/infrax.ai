import { Metadata } from 'next';
import Image from 'next/image';
import SectionHeader from '@/components/SectionHeader';

export const metadata: Metadata = {
  title: 'About InfraX AI | Our Story & Vision',
  description: 'From NaturNest AI in 2017 to building Treta — the AI City. Learn about our Dharma-driven approach to smart infrastructure.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Building <span className="text-brand-blue">Treta</span> —
            <br />
            The AI City.
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We don&apos;t just build software. We build the digital nervous system for the physical world.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/ai-control-room.png"
                alt="InfraX AI Vision"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <SectionHeader
                label="Our Story"
                title="From Ayodhya to the World"
              />
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                InfraX AI is a NaturNest AI company. Founded in 2017 in the historic city of Ayodhya, our journey began with a simple question: <strong>Can we build technology that cares for the world like a living organism?</strong>
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                What started as a research lab focusing on neural networks and ecological monitoring has evolved into India&apos;s leading autonomous infrastructure platform. Today, we monitor hundreds of kilometers of highways and complex building systems, all powered by our signature &quot;Living Digital Twin&quot; technology.
              </p>
              <div className="flex items-center gap-8 mt-8">
                <div>
                  <div className="text-3xl font-bold text-brand-blue">Est. 2017</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider">Founded</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-brand-blue">100%</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider">Proprietary Tech</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            label="Our Core Values"
            title="Dharma-Driven Innovation"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3v8h8a10.003 10.003 0 00-12.352 5.947" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sustainability First</h3>
              <p className="text-gray-600 leading-relaxed">
                We believe smart infrastructure should be sustainable infrastructure. Our AI is designed to minimize energy waste and maximize resource efficiency.
              </p>
            </div>
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ethical AI</h3>
              <p className="text-gray-600 leading-relaxed">
                Our technology is Dharma-driven. We prioritize transparency, privacy, and safety in every line of code we write and every agent we deploy.
              </p>
            </div>
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Relentless Speed</h3>
              <p className="text-gray-600 leading-relaxed">
                In infrastructure, delay is danger. We are obsessed with sub-2-second response times, ensuring problems are fixed before they escalate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Placeholder */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            label="Our People"
            title="The Minds Behind the Machines"
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group">
                <div className="aspect-square bg-gray-200 rounded-2xl mb-4 overflow-hidden relative">
                  <div className="absolute inset-0 bg-brand-blue mix-blend-multiply opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </div>
                <h4 className="text-xl font-bold text-gray-900">Team Member</h4>
                <p className="text-brand-blue font-medium">Position Name</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision CTA */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            The future isn&apos;t smart.
            <br />
            <span className="text-brand-blue">It&apos;s autonomous.</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Join us in building Treta — the world where infrastructure manages itself, leaving humans free to create.
          </p>
          <button className="bg-brand-blue text-white px-10 py-4 rounded-xl hover:bg-blue-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1">
            Partner With Us
          </button>
        </div>
      </section>
    </>
  );
}
