import React from 'react';

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = '20px',
  count = 1
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-r from-gray-800 to-gray-700 animate-pulse rounded"
          style={{ width, height }}
        />
      ))}
    </div>
  );
};

export const TabLoadingFallback: React.FC = () => (
  <div className="p-4 space-y-4">
    <SkeletonLoader width="100%" height="40px" count={1} />
    <SkeletonLoader width="100%" height="200px" count={3} />
  </div>
);
