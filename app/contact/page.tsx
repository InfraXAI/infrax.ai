import { Metadata } from 'next';
import SectionHeader from '@/components/SectionHeader';
import LeadCaptureForm from '@/components/LeadCaptureForm';

export const metadata: Metadata = {
  title: 'Contact Us | InfraX AI',
  description: 'Get in touch with the InfraX AI team. Let’s discuss how autonomous monitoring can transform your infrastructure.',
};

export default function ContactPage() {
  return (
    <>
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <SectionHeader
                label="Contact Us"
                title="Let&apos;s Build the Future of Infrastructure"
              />
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Whether you&apos;re a government agency, a system integrator, or a developer — we have the AI platform you need to make your infrastructure autonomous.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">Email Us</h4>
                    <a href="mailto:hello@infrax.ai" className="text-lg text-brand-blue hover:underline">hello@infrax.ai</a>
                    <p className="text-gray-500 text-sm mt-1">We typically respond within 24 hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">Headquarters</h4>
                    <p className="text-lg text-gray-700">NaturNest AI Lab, Ayodhya, UP, India</p>
                    <p className="text-gray-500 text-sm mt-1">Visit us at our new office after Feb 15th.</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">Working Hours</h4>
                    <p className="text-lg text-gray-700">Mon - Sat: 9:00 AM - 7:00 PM IST</p>
                    <p className="text-gray-500 text-sm mt-1">AI Monitoring: 24/7/365</p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-12 bg-gray-100 rounded-2xl h-64 flex items-center justify-center text-gray-400 overflow-hidden relative border border-gray-200">
                <div className="absolute inset-0 bg-brand-blue/5"></div>
                <div className="relative z-10 text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 text-brand-blue/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7l5-2.5 5.553 2.776a1 1 0 01.447.894v10.764a1 1 0 01-1.447.894L15 17l-6 3z" />
                  </svg>
                  <p className="font-medium text-gray-600">Interactive Map Coming Soon</p>
                  <p className="text-sm">Ayodhya, Uttar Pradesh</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Send us a Message</h3>
              <LeadCaptureForm source="contact-page" />
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <SectionHeader
            title="Global Thinking, Local Roots"
            description="From our lab in Ayodhya, we&apos;re building technology that powers critical infrastructure across the nation."
            centered
          />
        </div>
      </section>
    </>
  );
}
