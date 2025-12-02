export function RunHistoryCardSkeletonLoader() {
  return (
    <div className="w-full flex flex-col gap-4 p-6 h-screen">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex flex-row justify-between">
          <div className="flex items-center flex-row gap-2">
            <div className="w-32 h-4 bg-gray-200 animate-pulse rounded" />{' '}
            {/* Date */}
            <div className="flex items-center justify-center gap-1">
              <div className="w-4 h-4 bg-gray-200 animate-pulse rounded" />{' '}
              {/* Timer icon */}
              <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />{' '}
              {/* Duration */}
            </div>
          </div>
          <div className="w-20 h-5 bg-gray-200 animate-pulse rounded-full" />{' '}
          {/* Status badge */}
        </div>
        <div className="flex items-center justify-between">
          <div className="w-40 h-8 bg-gray-200 animate-pulse rounded" />{' '}
          {/* Application name */}
          <div className="flex flex-row gap-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-gray-200 animate-pulse rounded" />{' '}
              {/* Chrome icon */}
              <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />{' '}
              {/* Browser text */}
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-gray-200 animate-pulse rounded" />{' '}
              {/* Info icon */}
              <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />{' '}
              {/* Purpose text */}
            </div>
          </div>
        </div>
        <div className="w-20 h-4 bg-gray-200 animate-pulse rounded" />{' '}
        {/* PAC number */}
      </div>

      {/* Tab Section */}
      <div className="w-full flex flex-row bg-gray-100 items-center p-1 rounded-xl">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="flex-1 flex justify-center px-4 py-2 rounded-xl"
          >
            <div className="w-24 h-5 bg-gray-200 animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Test Suites Section */}
      <div className="overflow-auto flex flex-col gap-4">
        {[1, 2].map((suiteIndex) => (
          <div
            key={suiteIndex}
            className="bg-white rounded-lg p-4 border border-gray-100"
          >
            {/* Suite Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-40 h-6 bg-gray-200 animate-pulse rounded" />{' '}
              {/* Suite name */}
              <div className="w-4 h-4 bg-gray-200 animate-pulse rounded" />{' '}
              {/* Expand icon */}
            </div>

            {/* Test Cases */}
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((caseIndex) => (
                <div
                  key={caseIndex}
                  className="p-4 border border-gray-200 rounded hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-baseline gap-2">
                    <div className="w-4 h-4 bg-gray-200 animate-pulse rounded" />{' '}
                    {/* Status icon */}
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex flex-row items-center justify-between">
                        <div className="w-64 h-5 bg-gray-200 animate-pulse rounded" />{' '}
                        {/* Test name */}
                        <div className="w-16 h-5 bg-gray-200 animate-pulse rounded-full" />{' '}
                        {/* Status */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
