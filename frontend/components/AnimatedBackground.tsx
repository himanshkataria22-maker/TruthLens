'use client';

import React, { useMemo } from 'react';
import Particles, { ParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions, Engine, Container } from '@tsparticles/engine';

const initParticles = async (engine: Engine) => {
  await loadSlim(engine);
};

export default function AnimatedBackground() {
  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: 'transparent',
        },
      },
      fullScreen: {
        enable: false,
      },
      fpsLimit: 60,
      particles: {
        number: {
          value: 70,
          density: {
            enable: true,
            width: 1920,
            height: 1080,
          },
        },
        color: {
          value: ['#FFFFFF', '#E1E6F0', '#C8D0DE'],
        },
        shape: {
          type: 'circle',
        },
        opacity: {
          value: { min: 0.45, max: 0.75 },
          animation: {
            enable: false,
          },
        },
        size: {
          value: { min: 2, max: 3.5 },
          animation: {
            enable: false,
          },
        },
        shadow: {
          enable: true,
          blur: 12,
          color: {
            value: '#FFFFFF',
          },
        },
        links: {
          enable: true,
          distance: 140,
          color: '#FFFFFF',
          opacity: 0.18,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.65,
          direction: 'none',
          random: true,
          straight: false,
          outModes: {
            default: 'bounce',
          },
        },
      },
      interactivity: {
        detectsOn: 'window',
        events: {
          onHover: {
            enable: true,
            mode: 'grab',
          },
          onClick: {
            enable: false,
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          grab: {
            distance: 160,
            links: {
              opacity: 0.3,
            },
          },
        },
      },
      detectRetina: true,
    }),
    []
  );

  const particlesLoaded = async (container?: Container) => {
    if (container) {
      console.log('[TruthLens Particles] Minimal canvas loaded:', {
        count: container.particles.count,
        width: container.canvas.size.width,
        height: container.canvas.size.height,
      });
    }
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ width: '100%', height: '100%' }}
    >
      <ParticlesProvider init={initParticles}>
        <Particles
          id="tsparticles"
          options={options}
          particlesLoaded={particlesLoaded}
          className="w-full h-full pointer-events-auto"
          style={{ width: '100%', height: '100%' }}
        />
      </ParticlesProvider>
    </div>
  );
}
