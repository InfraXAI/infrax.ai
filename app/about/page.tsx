import { Metadata } from 'next';
import Image from 'next/image';
import SectionHeader from '@/components/SectionHeader';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About InfraX AI | Our Story & Vision',
  description: 'From NaturNest AI in 2017 to building Treta — the AI City. Learn about our Dharma-driven approach to smart infrastructure.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-6 pt-[100px] pb-[60px]">
        <div className="max-w-[1080px] mx-auto text-center">
          <h1 className="text-[clamp(36px,6vw,68px)] font-extrabold leading-[1.08] tracking-[-0.03em] mb-6 text-[#1a1a2e]">
            Building <span className="gradient-text">Treta</span> —<br />
            The AI City.
          </h1>
          <p className="text-[clamp(16px,2vw,19px)] text-[#5a5a7a] max-w-[560px] mx-auto leading-[1.7]">
            We don&apos;t just build software. We build the digital nervous system for the physical world.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-[100px] px-6 bg-[#f8f9fb]">
        <div className="max-w-[1080px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="relative h-96 rounded-xl overflow-hidden">
              <Image src="/control-room-v2.png" alt="InfraX AI Vision" fill className="object-cover" />
            </div>
            <div>
              <SectionHeader label="Our Story" title="From Ayodhya to the World" />
              <p className="text-[15px] text-[#5a5a7a] leading-[1.7] mb-5">
                InfraX AI is a NaturNest AI company. Founded in 2017 in the historic city of Ayodhya, our journey began with a simple question: <strong className="text-[#1a1a2e]">Can we build technology that cares for the world like a living organism?</strong>
              </p>
              <p className="text-[15px] text-[#5a5a7a] leading-[1.7] mb-8">
                What started as a research lab focusing on neural networks and ecological monitoring has evolved into Bharat&apos;s leading autonomous infrastructure platform. Today, we monitor hundreds of kilometers of highways and complex building systems, all powered by our signature &quot;Living Digital Twin&quot; technology.
              </p>
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-[28px] font-extrabold text-[#2673B5]">Est. 2017</div>
                  <div className="text-[12px] text-[#5a5a7a] uppercase tracking-[0.05em] mt-1">Founded</div>
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

      {/* Values */}
      <section className="py-[100px] px-6">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeader label="Our Core Values" title="Dharma-Driven Innovation" centered />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] rounded-2xl overflow-hidden bg-[#e8e8ee]">
            {[
              { title: 'Sustainability First', desc: 'We believe smart infrastructure should be sustainable infrastructure. Our AI is designed to minimize energy waste and maximize resource efficiency.', icon: 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3v8h8a10.003 10.003 0 00-12.352 5.947' },
              { title: 'Ethical AI', desc: 'Our technology is Dharma-driven. We prioritize transparency, privacy, and safety in every line of code we write and every agent we deploy.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              { title: 'Relentless Speed', desc: 'In infrastructure, delay is danger. We are obsessed with sub-2-second response times, ensuring problems are fixed before they escalate.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
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

      {/* Vision CTA */}
      <div className="divider"></div>
      <section className="py-[120px] px-6 text-center">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-[clamp(30px,4.5vw,50px)] font-extrabold leading-[1.1] tracking-[-0.03em] mb-5 text-[#1a1a2e]">
            The future isn&apos;t smart.<br />
            <span className="gradient-text">It&apos;s autonomous.</span>
          </h2>
          <p className="text-[17px] text-[#5a5a7a] mb-10 leading-[1.7]">
            Join us in building Treta — the world where infrastructure manages itself, leaving humans free to create.
          </p>
          <Link href="/#contact" className="inline-block px-8 py-3.5 bg-[#2673B5] text-white rounded-[10px] text-[15px] font-semibold transition-all hover:bg-[#3a8fd4] hover:-translate-y-[1px]">
            Partner With Us
          </Link>
        </div>
      </section>
    </>
  );
}
