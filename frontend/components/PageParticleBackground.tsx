'use client';

import dynamic from 'next/dynamic';

const AnimatedBackground = dynamic(() => import('./AnimatedBackground'), {
  ssr: false,
  loading: () => null,
});

/**
 * Single fixed particle canvas for the whole app.
 * Mounted once in root layout — does not remount on route changes.
 */
export default function PageParticleBackground() {
  return (
    <div
      className="pointer-events-none"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
      }}
      aria-hidden
    >
      <AnimatedBackground />
    </div>
  );
}
