import { Metadata } from 'next';
import SectionHeader from '@/components/SectionHeader';
import LeadCaptureForm from '@/components/LeadCaptureForm';

export const metadata: Metadata = {
  title: 'Contact Us | InfraX AI',
  description: 'Get in touch with the InfraX AI team. Let us discuss how autonomous monitoring can transform your infrastructure.',
};

export default function ContactPage() {
  return (
    <>
      <section className="pt-[120px] pb-[100px] px-6">
        <div className="max-w-[1080px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
            {/* Contact Info */}
            <div>
              <SectionHeader label="Contact Us" title="Let's Build the Future of Infrastructure" />
              <p className="text-[15px] text-[#5a5a7a] leading-[1.7] mb-10">
                Whether you&apos;re a government agency, a system integrator, or a developer — we have the AI platform you need to make your infrastructure autonomous.
              </p>

              <div className="flex flex-col gap-7">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-[#e8f1fa] text-[#2673B5] rounded-xl flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-semibold text-[#1a1a2e] mb-1">Email Us</h4>
                    <a href="mailto:info@infrax.ai" className="text-[15px] text-[#2673B5] hover:underline">info@infrax.ai</a>
                    <p className="text-[13px] text-[#9090a8] mt-1">We typically respond within 24 hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-[#e8f1fa] text-[#2673B5] rounded-xl flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-semibold text-[#1a1a2e] mb-1">Office</h4>
                    <p className="text-[15px] text-[#5a5a7a]">WeWork DLF Forum, Ground Floor<br />DLF Cyber City, Phase 3<br />Gurugram, Haryana 122002</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-[#e8f1fa] text-[#2673B5] rounded-xl flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-semibold text-[#1a1a2e] mb-1">Working Hours</h4>
                    <p className="text-[15px] text-[#5a5a7a]">Mon – Sat: 9:00 AM – 7:00 PM IST</p>
                    <p className="text-[13px] text-[#9090a8] mt-1">AI Monitoring: 24/7/365</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-[#e8f1fa] text-[#2673B5] rounded-xl flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-semibold text-[#1a1a2e] mb-1">Web</h4>
                    <p className="text-[15px] text-[#5a5a7a]">www.infrax.ai · www.naturnest.ai</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <h3 className="text-[22px] font-bold text-[#1a1a2e] mb-6">Send us a Message</h3>
              <LeadCaptureForm source="contact-page" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
