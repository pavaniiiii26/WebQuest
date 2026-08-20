export default function SkeletonCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg animate-pulse">
      <div className="w-full h-48 bg-slate-800" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-800 rounded w-3/4" />
        <div className="h-4 bg-slate-800 rounded w-1/2" />
        <div className="pt-2 flex justify-between items-center">
          <div className="h-6 bg-slate-800 rounded w-20" />
          <div className="h-8 bg-slate-800 rounded-lg w-24" />
        </div>
      </div>
    </div>
  );
}
