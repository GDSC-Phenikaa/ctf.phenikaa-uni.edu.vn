"use client";
import { Stack, Text } from '@mantine/core';
// import { Engine } from '@tsparticles/engine';
import { useState, useEffect } from 'react';
import { CreditCard } from "react-kawaii";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import {
  type Container,
  type ISourceOptions,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine";
// import { loadAll } from "@tsparticles/all"; // if you are going to use `loadAll`, install the "@tsparticles/all" package too.
// import { loadFull } from "tsparticles"; // if you are going to use `loadFull`, install the "tsparticles" package too.
import { loadSlim } from "@tsparticles/slim"; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.
// import { loadBasic } from "@tsparticles/basic"; // if you are going to use `loadBasic`, install the "@tsparticles/basic" package too.


export default function Homepage() {
  const text = "PKA CTF";

  const [init, setInit] = useState(false);

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadAll(engine);
      //await loadFull(engine);
      await loadSlim(engine);
      //await loadBasic(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffe4e1',
        height: '85vh',
        overflow: 'hidden',
      }}
    >
      {/* Particles Background */}
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "#ffe4e1",
            },
          },
          fpsLimit: 60,
          particles: {
            color: {
              value: "#ff69b4",
            },
            links: {
              color: "#ff69b4",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            move: {
              enable: true,
              speed: 2,
              direction: "none",
              random: false,
              straight: false,
              outModes: {
                default: "out",
              },
            },
            number: {
              value: 75,
              density: {
                enable: true,
              },
            },
            opacity: {
              value: 0.7,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 3, max: 7 },
            },
          },
          detectRetina: true,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />

      {/* Main Content */}
      <Stack style={{ zIndex: 1 }}> 
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '5px',
            }}
          >
            {text.split('').map((letter, index) => (
              <Text
                key={index}
                style={{
                  fontSize: '90px',
                  fontWeight: 'bold',
                  color: '#ff69b4',
                  textAlign: 'center',
                  textShadow: `
                    -5px -5px 0 white, /* Top-left */
                    5px -5px 0 white,  /* Top-right */
                    -5px 5px 0 white,  /* Bottom-left */
                    5px 5px 0 white    /* Bottom-right */
                  `,
                  animation: `smooth-boggle ${1.4 + index * 0.1}s infinite ease-in-out`, 
                }}
              >
                {letter}
              </Text>
            ))}
          </div>

          <CreditCard
            size={240}
            mood="lovestruck"
            color="#ffbae1"
            style={{
              animation: `smooth-boggle ${2}s infinite ease-in-out`,
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '20px',
          }}
        >
          <Text
            style={{
              fontSize: '24px',
            }}
          >
            Welcome to PKA CTF!
          </Text>
        </div>
      </Stack>

      <style jsx>{`
        @keyframes smooth-boggle {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(-3px, 3px) rotate(-3deg);
          }
          50% {
            transform: translate(3px, -3px) rotate(3deg);
          }
          75% {
            transform: translate(-3px, -3px) rotate(-2deg);
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}