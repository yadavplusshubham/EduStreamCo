'use client';

import dynamic from 'next/dynamic';

const WatchClient = dynamic(() => import('./WatchClient'), { ssr: false });

export default function WatchPageWrapper({ courseId, initialModule }) {
  return <WatchClient courseId={courseId} initialModule={initialModule} />;
}
