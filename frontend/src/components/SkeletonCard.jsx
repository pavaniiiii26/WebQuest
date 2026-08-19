export default function SkeletonCard({ className = '' }) {
  return (
    <div className={`card p-4 space-y-3 ${className}`}>
      <div className="skeleton h-40 w-full rounded-xl" />
      <div className="skeleton h-4 w-3/4 rounded-full" />
      <div className="skeleton h-3 w-1/2 rounded-full" />
      <div className="skeleton h-3 w-5/6 rounded-full" />
      <div className="skeleton h-3 w-2/3 rounded-full" />
    </div>
  );
}
