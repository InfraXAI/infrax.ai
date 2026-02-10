import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Mock data to simulate content fetching
const posts: Record<string, any> = {
  'the-death-of-manual-monitoring': {
    title: 'The Death of Manual Monitoring: Why CCTV Operators are a Single Point of Failure',
    date: 'Feb 10, 2026',
    category: 'Industry Insights',
    image: '/control-room-v2.png',
    author: 'InfraX AI Team',
    content: `
      <p>For decades, the standard approach to infrastructure security and monitoring has been "cameras and screens." The logic was simple: install more cameras, hire more people to watch them, and you'll have better security. But as infrastructure has scaled, this logic has collapsed.</p>
      
      <h2>The Cognitive Load Problem</h2>
      <p>Research consistently shows that after just 20 minutes of watching surveillance monitors, a human operator's attention level drops significantly. When one person is tasked with watching 50, 100, or 200 feeds—common in modern highways and smart cities—the chance of them catching a critical incident in real-time is effectively zero.</p>
      
      <blockquote>"Humans are excellent at complex problem-solving, but we are fundamentally ill-equipped for the monotonous task of watching hours of nothing, waiting for a split-second event."</blockquote>

      <h2>The Single Point of Failure</h2>
      <p>In traditional setups, the human operator is the single point of failure. If they are distracted, fatigued, or simply looking at the wrong screen at the wrong time, an incident goes undetected. On a high-speed expressway, that delay can be fatal.</p>

      <h2>The Autonomous Shift</h2>
      <p>Autonomous AI monitoring flips the script. Our AI agents don't get tired. They don't blink. They watch every pixel of every camera, every millisecond of every day. They aren't "watching video"—they are "processing data."</p>
      
      <p>When an AI agent is the first line of defense, the human role changes from a <em>monitor</em> to a <em>resolver</em>. The AI detects, classifies, and alerts. The human confirms and acts. This is the only way to scale infrastructure monitoring for the 21st century.</p>
    `
  },
  'sub-2-second-rule': {
    title: 'The 2-Second Rule: How We Achieved Ultra-Low Latency for ATMS',
    date: 'Feb 5, 2026',
    category: 'Engineering',
    image: '/smart-highways-v3.png',
    author: 'Engineering Lead, InfraX AI',
    content: `
      <p>In the world of Advanced Traffic Management Systems (ATMS), speed is everything. We aren't talking about the speed of vehicles, but the speed of data. We call it the "Detection to Resolution" pipeline.</p>
      
      <h2>Why 2 Seconds?</h2>
      <p>If a vehicle stops suddenly on a 6-lane highway, the risk of a secondary collision increases exponentially every second. Our goal was to ensure that within 2 seconds of an incident, the control room has a high-priority alert with full visual context.</p>

      <h2>Edge Computing is Key</h2>
      <p>Traditional "Cloud AI" is too slow. Sending high-resolution video streams to a central server, processing them, and sending back an alert can take 10-15 seconds. On a highway, that's too long.</p>
      
      <p>We solved this by moving the intelligence to the edge. Our AI agents run on specialized hardware co-located with the sensors. Detection happens locally. Only the <em>intelligence</em>—the alert and the relevant clip—is transmitted.</p>

      <h2>Optimized Neural Architectures</h2>
      <p>We spent months optimizing our vision models to run at high frame rates without sacrificing accuracy. By using pruned architectures and hardware-specific acceleration, we reduced inference time to under 150ms.</p>
      
      <p>The result is a system that feels alive. It reacts to the physical world in near real-time, providing a level of safety that was previously impossible.</p>
    `
  },
  'building-treta-ai-city': {
    title: 'Building Treta: Our Vision for the Fully Autonomous AI City',
    date: 'Jan 28, 2026',
    category: 'Vision',
    image: '/smart-cities-v3.png',
    author: 'CEO, InfraX AI',
    content: `
      <p>Treta isn't just a project name. It's our vision for the next stage of human civilization. It is the concept of a "Self-Correcting City."</p>
      
      <h2>The Living Digital Twin</h2>
      <p>A smart city shouldn't just be a city with an app. It should be a city with a nervous system. We believe every piece of public infrastructure—from streetlights to trash bins to water mains—should be part of a single, unified, autonomous network.</p>

      <h2>Decentralized Intelligence</h2>
      <p>Treta is built on the principle of decentralized intelligence. Instead of one "God-system" trying to manage everything, we deploy thousands of specialized AI agents, each responsible for a small part of the city. These agents communicate and coordinate, much like cells in a body.</p>

      <h2>Dharma-Driven Tech</h2>
      <p>As we build Treta, we are guided by the principle of Dharma—the right way of living. For technology, this means building systems that are inherently sustainable, private by design, and focused on the well-being of the citizens. Treta is about using the most advanced AI to help us live more human lives.</p>
    `
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return { title: 'Post Not Found' };
  
  return {
    title: `${post.title} | InfraX AI Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts[slug];
  
  if (!post) {
    notFound();
  }

  return (
    <article className="pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/blog" className="hover:text-brand-blue transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-brand-blue font-medium">{post.category}</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-6 mb-12 py-6 border-y border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center font-bold text-brand-blue">
              IA
            </div>
            <div>
              <div className="text-gray-900 font-bold">{post.author}</div>
              <div className="text-gray-500 text-sm">{post.date}</div>
            </div>
          </div>
        </div>

        <div className="relative h-[50vh] rounded-3xl overflow-hidden mb-12 shadow-2xl">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>

        <div 
          className="prose prose-xl prose-blue max-w-none text-gray-700 leading-relaxed
            prose-h2:text-3xl prose-h2:font-bold prose-h2:text-gray-900 prose-h2:mt-12 prose-h2:mb-6
            prose-p:mb-8 prose-blockquote:border-l-4 prose-blockquote:border-brand-blue prose-blockquote:bg-gray-50 prose-blockquote:p-8 prose-blockquote:rounded-r-xl prose-blockquote:italic"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-20 pt-10 border-t border-gray-100 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to see our technology in action?</h3>
          <Link
            href="/contact"
            className="inline-flex items-center bg-brand-blue text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Contact Our Engineering Team
          </Link>
        </div>
      </div>
    </article>
  );
}
