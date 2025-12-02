import { cn } from '@/utils/util';

interface ISkeletonLoaderProps {
  height: string;
  width: string;
  borderRadius?: string;
  className?: string;
}

export default function SkeletonLoader({
  height,
  width,
  borderRadius,
  className,
}: ISkeletonLoaderProps) {
  const styles = { height, width, borderRadius };

  return (
    <div
      style={styles}
      className={cn('bg-gray-200 animate-pulse', className)}
    />
  );
}
