import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SectionHeader from '@/components/SectionHeader';

export const metadata: Metadata = {
  title: 'Blog | InfraX AI Insights',
  description: 'Latest insights on autonomous infrastructure, AI vision, and the future of smart cities.',
};

// This would typically come from a CMS or local MDX files
const posts = [
  {
    slug: 'the-death-of-manual-monitoring',
    title: 'The Death of Manual Monitoring: Why CCTV Operators are a Single Point of Failure',
    excerpt: 'Human attention spans are not designed for watching 200 camera feeds. Learn how autonomous AI agents are solving the fatigue problem.',
    date: 'Feb 10, 2026',
    category: 'Industry Insights',
    image: '/control-room-v2.png'
  },
  {
    slug: 'sub-2-second-rule',
    title: 'The 2-Second Rule: How We Achieved Ultra-Low Latency for ATMS',
    excerpt: 'In highway safety, every millisecond counts. This is the story of how we engineered a sub-2-second detection-to-resolution pipeline.',
    date: 'Feb 5, 2026',
    category: 'Engineering',
    image: '/smart-highways-v3.png'
  },
  {
    slug: 'building-treta-ai-city',
    title: 'Building Treta: Our Vision for the Fully Autonomous AI City',
    excerpt: 'What happens when a city can think for itself? Exploring the roadmap for Treta — the world’s first truly autonomous urban environment.',
    date: 'Jan 28, 2026',
    category: 'Vision',
    image: '/smart-cities-v3.png'
  }
];

export default function BlogListing() {
  return (
    <>
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            label="InfraX AI Blog"
            title="Insights into the Autonomous Future"
            description="Exploring the intersection of AI, IoT, and critical infrastructure."
            centered
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-16">
            {posts.map((post) => (
              <article key={post.slug} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-brand-blue transition-all hover:shadow-xl">
                <Link href={`/blog/${post.slug}`} className="relative h-64 block overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-full uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="text-sm text-gray-500">{post.date}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-brand-blue transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                    {post.excerpt}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-brand-blue font-bold group-hover:gap-2 transition-all"
                  >
                    Read Article
                    <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-brand-blue rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Stay Informed</h2>
          <p className="text-xl text-white/80 mb-10 relative z-10">
            Get the latest updates on autonomous infrastructure delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto relative z-10">
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="flex-grow px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="bg-white text-brand-blue px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
