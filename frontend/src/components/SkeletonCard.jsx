export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-[22px] overflow-hidden shadow-sm animate-pulse">
      <div className="w-full h-48 bg-cream-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-cream-200 rounded w-3/4" />
        <div className="h-4 bg-cream-200 rounded w-1/2" />
        <div className="pt-2 flex justify-between items-center">
          <div className="h-6 bg-cream-200 rounded w-20" />
          <div className="h-8 bg-cream-200 rounded-lg w-24" />
        </div>
      </div>
    </div>
  );
}
