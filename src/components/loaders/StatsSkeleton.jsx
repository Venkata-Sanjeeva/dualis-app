const StatSkeleton = ({ appMode }) => {
  const isCorp = appMode === 'corporate';
  const shimmerClass = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
          <div className={cn(
            "w-10 h-10 rounded-xl mb-4", 
            isCorp ? "bg-blue-100" : "bg-emerald-100"
          )} />
          <div className="h-3 w-24 bg-gray-100 rounded-full mb-2" />
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>
      ))}
    </div>
  );
};

export default StatSkeleton;