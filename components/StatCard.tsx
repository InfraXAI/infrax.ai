interface StatCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export default function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:border-brand-blue transition-all duration-300 hover:shadow-lg">
      {icon && <div className="text-brand-blue mb-3">{icon}</div>}
      <div className="text-4xl font-bold text-brand-blue mb-2">{value}</div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  );
}
