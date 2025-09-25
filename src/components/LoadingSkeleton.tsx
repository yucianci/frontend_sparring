const shimmerClass = 'animate-pulse rounded bg-gray-200 dark:bg-gray-800/60';

const LoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className={`${shimmerClass} h-6 w-48`} aria-hidden="true" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`${shimmerClass} h-24 border border-transparent`} aria-hidden="true" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className={`${shimmerClass} h-40`} aria-hidden="true" />
          <div className={`${shimmerClass} h-40`} aria-hidden="true" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className={`${shimmerClass} h-52`} aria-hidden="true" />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className={`${shimmerClass} h-52`} aria-hidden="true" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center mb-8 gap-4">
        <div className={`${shimmerClass} h-12 w-full sm:w-48`} aria-hidden="true" />
        <div className={`${shimmerClass} h-12 w-full sm:w-48`} aria-hidden="true" />
      </div>
    </div>
  );
};

export default LoadingSkeleton;
