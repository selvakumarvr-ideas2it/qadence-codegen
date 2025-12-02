export function TestCaseSkeletonLoader() {
  return (
    <div className="w-full overflow-auto h-screen flex flex-col">
      {/* Header with back button and title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 border border-gray-200 rounded-md bg-white">
            <div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="w-24 h-6 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>

      {/* Test Case Title and Status */}
      <div className="bg-white rounded-lg p-6 mb-4 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="w-48 h-7 bg-gray-200 animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="w-16 h-6 bg-gray-200 animate-pulse rounded-full" />
            <div className="w-24 h-6 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>

        {/* Info Cards */}
        <div className="flex gap-4">
          {/* Run Time Card */}
          <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
              <div className="flex flex-col gap-1">
                <div className="w-14 h-4 bg-gray-200 animate-pulse rounded" />
                <div className="w-20 h-5 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          </div>

          {/* Retry Card */}
          <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
              <div className="flex flex-col gap-1">
                <div className="w-14 h-4 bg-gray-200 animate-pulse rounded" />
                <div className="w-20 h-5 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          </div>

          {/* Browser Card */}
          <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
              <div className="flex flex-col gap-1">
                <div className="w-14 h-4 bg-gray-200 animate-pulse rounded" />
                <div className="w-20 h-5 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="flex flex-col gap-2">
        {['Errors', 'Test Steps', 'Screenshots', 'Videos'].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 border border-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
              <div className="w-20 h-5 bg-gray-200 animate-pulse rounded" />
              <div className="w-4 h-4 bg-gray-200 animate-pulse rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
