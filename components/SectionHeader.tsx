interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  centered?: boolean;
}

export default function SectionHeader({ label, title, description, centered = false }: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${centered ? 'text-center max-w-[720px] mx-auto' : ''}`}>
      {label && (
        <div className="section-label">{label}</div>
      )}
      <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-[1.15] tracking-[-0.02em] mb-[14px] text-[#1a1a2e]">
        {title}
      </h2>
      {description && (
        <p className="text-[17px] text-[#5a5a7a] leading-[1.7]">
          {description}
        </p>
      )}
    </div>
  );
}
