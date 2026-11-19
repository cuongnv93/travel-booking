import { HomePageSkeleton } from '@/components/ui/PageSkeleton';

export default function Loading() {
  return (
    <main id="main-content" className="flex-1 w-full">
      <HomePageSkeleton />
    </main>
  );
}
