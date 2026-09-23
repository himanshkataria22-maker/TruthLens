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
          value: 85,
          density: {
            enable: true,
            width: 1920,
            height: 1080,
          },
        },
        color: {
          value: ['#00D9FF', '#00F0FF', '#7FE0FF', '#FFD700', '#FFA500', '#FF6B9D'],
        },
        shape: {
          type: 'circle',
        },
        opacity: {
          value: { min: 0.3, max: 0.9 },
          animation: {
            enable: true,
            speed: 1.5,
            minimumValue: 0.1,
            sync: false,
          },
        },
        size: {
          value: { min: 3, max: 9 },
          animation: {
            enable: true,
            speed: 2,
            minimumValue: 1.5,
            sync: false,
          },
        },
        shadow: {
          enable: true,
          blur: 15,
          color: {
            value: '#00D9FF',
          },
          offset: {
            x: 0,
            y: 0,
          },
        },
        links: {
          enable: true,
          distance: 200,
          color: '#00D9FF',
          opacity: 0.08,
          width: 1,
          frequency: 1,
          duration: 3,
          sleep: false,
          triangles: {
            enable: true,
            frequency: 0.5,
          },
        },
        move: {
          enable: true,
          speed: 1.2,
          direction: 'none',
          random: true,
          straight: false,
          outModes: {
            default: 'bounce',
          },
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200,
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
            enable: true,
            mode: 'repulse',
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          grab: {
            distance: 200,
            links: {
              opacity: 0.5,
            },
          },
          repulse: {
            distance: 150,
            duration: 0.4,
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
