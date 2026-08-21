export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 bg-gray-200 rounded mb-8"></div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image skeleton */}
        <div className="w-full lg:w-1/3">
          <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className="h-20 w-20 bg-gray-200 rounded-lg"></div>)}
          </div>
        </div>
        
        {/* Details skeleton */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-10 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-16 w-full bg-gray-200 rounded"></div>
          
          <div className="h-24 w-full bg-gray-200 rounded mt-8"></div>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
             <div className="h-32 bg-gray-200 rounded"></div>
             <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
