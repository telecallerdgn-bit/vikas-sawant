export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-gray-500">This module is coming soon.</p>
    </div>
  );
}