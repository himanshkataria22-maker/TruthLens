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
            area: 800,
          },
        },
        color: {
          value: ['#FFFFFF', '#E1E6F0', '#C8D0DE'],
        },
        shape: {
          type: 'circle',
        },
        opacity: {
          value: { min: 0.3, max: 0.6 },
          animation: {
            enable: true,
            speed: 0.8,
            minimumValue: 0.2,
            sync: false,
          },
        },
        size: {
          value: { min: 1, max: 2.5 },
          animation: {
            enable: true,
            speed: 1.5,
            minimumValue: 0.5,
            sync: false,
          },
        },
        shadow: {
          enable: true,
          blur: 6,
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
          speed: 0.6,
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
            distance: 180,
            links: {
              opacity: 0.3,
            },
          },
          push: {
            quantity: 2,
          },
        },
      },
      detectRetina: true,
    }),
    []
  );

  const particlesLoaded = async (container?: Container) => {
    if (container) {
      console.log('[TruthLens Particles] Canvas Loaded (Minimal Style):', {
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
