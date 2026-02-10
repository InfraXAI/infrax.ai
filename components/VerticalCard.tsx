import Image from 'next/image';
import Link from 'next/link';

interface VerticalCardProps {
  image: string;
  title: string;
  description: string;
  href: string;
}

export default function VerticalCard({ image, title, description, href }: VerticalCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-brand-blue transition-all duration-300 hover:shadow-xl">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-blue transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            {description}
          </p>
          <div className="flex items-center text-brand-blue font-semibold group-hover:gap-2 transition-all">
            Learn More
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
