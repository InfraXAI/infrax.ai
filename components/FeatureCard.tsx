interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-xl p-8 border border-[#e8e8ee] hover:bg-[#f8f9fb] transition-all duration-300 hover:-translate-y-[2px]">
      <div className="text-[#2673B5] mb-4">
        {icon}
      </div>
      <h3 className="text-[18px] font-bold text-[#1a1a2e] mb-2.5">{title}</h3>
      <p className="text-[14px] text-[#5a5a7a] leading-[1.65]">{description}</p>
    </div>
  );
}
