import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SelectionHaloProps {
  position: [number, number, number];
  scale?: number;
  color?: string;
}

export function SelectionHalo({ position, scale = 1, color = '#00bcd4' }: SelectionHaloProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.7;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale * 2.2}>
      <torusGeometry args={[1, 0.03, 16, 64]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.8} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
      />
    </mesh>
  );
}
