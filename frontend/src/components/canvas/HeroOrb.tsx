'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useUI } from '../../context/UIContext';

// Cursor tracking point light inside the WebGL context
function MouseLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const { viewport } = useThree();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouse({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!lightRef.current) return;
    
    // Convert normalized mouse coordinates to 3D space coordinates relative to viewport
    const targetX = mouse.x * viewport.width / 2;
    const targetY = mouse.y * viewport.height / 2;
    
    // Smooth interpolation (lerping)
    lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, targetX, 0.1);
    lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, targetY, 0.1);
  });

  return <pointLight ref={lightRef} intensity={25} distance={15} color="#00f3ff" position={[0, 0, 3]} />;
}

// Morphing glass orb component
function Orb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { accentColor } = useUI();
  const [hovered, setHovered] = useState(false);

  // Mappings from accent to hexadecimal colors
  const colorMap = {
    purple: '#a824ff',
    cyan: '#00f3ff',
    pink: '#ff007f',
    green: '#39ff14'
  };

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Subtle continuous rotation
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.15;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;

    // Smoothly interpolate scale inside the R3F WebGL loop
    const targetScale = hovered ? 1.05 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <Float speed={2.5} rotationIntensity={0.6} floatIntensity={0.8}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshDistortMaterial
          color={colorMap[accentColor]}
          distort={hovered ? 0.45 : 0.35}
          speed={2.2}
          roughness={0.12}
          metalness={0.88}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          bumpScale={0.05}
        />
      </mesh>
    </Float>
  );
}

export default function HeroOrb() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full bg-gradient-to-tr from-purple-600/30 to-cyan-500/30 animate-pulse blur-md" />
    );
  }

  return (
    <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] relative select-none">
      {/* Visual background backing glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-neon-purple/10 to-neon-cyan/10 blur-[80px] pointer-events-none" />
      
      <Canvas camera={{ position: [0, 0, 4.5], fov: 65 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        
        {/* Colorful stationary point lights */}
        <pointLight position={[-6, 3, -2]} intensity={8} color="#ff007f" />
        <pointLight position={[6, -3, -2]} intensity={8} color="#a824ff" />
        
        {/* Interactive light that tracks the cursor */}
        <MouseLight />
        
        <Orb />
      </Canvas>
    </div>
  );
}
