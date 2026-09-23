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
          value: 120,
          density: {
            enable: true,
            area: 800,
          },
        },
        color: {
          value: ['#00D9FF', '#8B7CFF', '#FFB800'],
        },
        shape: {
          type: 'circle',
        },
        opacity: {
          value: { min: 0.4, max: 0.9 },
          animation: {
            enable: true,
            speed: 1.2,
            sync: false,
          },
        },
        size: {
          value: { min: 1.5, max: 4 },
          animation: {
            enable: true,
            speed: 3,
            sync: false,
          },
        },
        shadow: {
          enable: true,
          blur: 15,
          color: {
            value: '#00D9FF',
          },
        },
        links: {
          enable: true,
          distance: 140,
          color: '#00D9FF',
          opacity: 0.45,
          width: 1.2,
        },
        move: {
          enable: true,
          speed: 1.3,
          direction: 'none',
          random: true,
          straight: false,
          outModes: {
            default: 'bounce',
          },
        },
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: 'grab',
          },
          onClick: {
            enable: true,
            mode: 'push',
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          grab: {
            distance: 200,
            links: {
              opacity: 0.8,
            },
          },
          push: {
            quantity: 3,
          },
        },
      },
      detectRetina: true,
    }),
    []
  );

  const particlesLoaded = async (container?: Container) => {
    if (container) {
      console.log('[TruthLens Particles] Canvas Loaded Successfully:', {
        count: container.particles.count,
        width: container.canvas.size.width,
        height: container.canvas.size.height,
      });
    }
  };

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
    >
      <ParticlesProvider init={initParticles}>
        <Particles
          id="tsparticles"
          options={options}
          particlesLoaded={particlesLoaded}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </ParticlesProvider>
    </div>
  );
}
