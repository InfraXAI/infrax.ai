interface StatCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export default function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="bg-[#f8f9fb] border border-[#e8e8ee] rounded-xl p-6 text-center">
      <div className="text-[clamp(28px,4vw,44px)] font-extrabold text-[#2673B5] leading-[1]">{value}</div>
      <div className="text-[12px] text-[#5a5a7a] mt-[6px] uppercase tracking-[0.05em]">{label}</div>
    </div>
  );
}
