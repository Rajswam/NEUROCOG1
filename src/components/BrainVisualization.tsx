import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface BrainNodesProps {
  activityLevel?: number; // 0 to 1, modulates firing intensity
}

const BrainNodes = ({ activityLevel = 0.2 }: BrainNodesProps) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  
  const numNodes = 1200;

  const { dummy, colorData, phases, layers, nodePositions, linkPositions } = useMemo(() => {
    const d = new THREE.Object3D();
    const cData = new Float32Array(numNodes * 3);
    const phs = new Float32Array(numNodes);
    const ls = new Int32Array(numNodes);
    const nPos = new Float32Array(numNodes * 3);
    
    // Brighter, highly contrastive colors
    const colorMap = {
      internal: new THREE.Color('#00ffff'), // Neon Cyan (Cortex/Disease)
      active: new THREE.Color('#ff007f'),   // Neon Pink/Red (Interventions/Actions)
      sensory: new THREE.Color('#39ff14'),  // Neon Green (Vitals/Perceptions)
      external: new THREE.Color('#e2e8f0'), // Bright Silver/White (Symptoms/Environment)
    };

    const layerNodes: { [key: number]: number[] } = { 0: [], 1: [], 2: [], 3: [] };

    for (let i = 0; i < numNodes; i++) {
      // Concentric spherical distribution reflecting hierarchical processing
      // Medulla/Spinal -> Midbrain -> Cortex
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      
      // Assign layer
      let r = 0;
      let mState: keyof typeof colorMap = 'internal';
      
      if (i < numNodes * 0.25) {
        // Internal (Cortex/Deep inference: Pathophysiology, Disease)
        r = Math.cbrt(Math.random()) * 3.5;
        mState = 'internal';
        ls[i] = 0;
      } else if (i < numNodes * 0.45) {
        // Active (Action outputs, interventions)
        r = 3.5 + Math.cbrt(Math.random()) * 1.5;
        mState = 'active';
        ls[i] = 1;
      } else if (i < numNodes * 0.7) {
        // Sensory (Peripheral receptors, incoming vitals)
        r = 5.0 + Math.cbrt(Math.random()) * 1.5;
        mState = 'sensory';
        ls[i] = 2;
      } else {
        // External (Environment, Clinical history, Symptoms, Toxins)
        r = 6.5 + Math.cbrt(Math.random()) * 2.5;
        mState = 'external';
        ls[i] = 3;
      }
      
      const px = r * Math.sin(phi) * Math.cos(theta);
      const py = r * Math.sin(phi) * Math.sin(theta);
      const pz = r * Math.cos(phi);
      
      nPos[i * 3] = px;
      nPos[i * 3 + 1] = py;
      nPos[i * 3 + 2] = pz;
      
      layerNodes[ls[i]].push(i);

      const color = colorMap[mState];
      cData[i * 3] = color.r;
      cData[i * 3 + 1] = color.g;
      cData[i * 3 + 2] = color.b;

      phs[i] = Math.random() * Math.PI * 2;
    }

    // Create biological mechanism links (e.g., Copper discoloration -> Wilson's disease)
    const links: number[] = [];
    
    // Connect External -> Sensory
    layerNodes[3].forEach(extIdx => {
      // Find a nearby sensory node
      const targetIdx = layerNodes[2][Math.floor(Math.random() * layerNodes[2].length)];
      links.push(extIdx, targetIdx);
    });
    
    // Connect Sensory -> Internal
    layerNodes[2].forEach(sensIdx => {
      if (Math.random() > 0.3) {
        const targetIdx = layerNodes[0][Math.floor(Math.random() * layerNodes[0].length)];
        links.push(sensIdx, targetIdx);
      }
    });

    // Connect Internal -> Active
    layerNodes[0].forEach(intIdx => {
      if (Math.random() > 0.5) {
        const targetIdx = layerNodes[1][Math.floor(Math.random() * layerNodes[1].length)];
        links.push(intIdx, targetIdx);
      }
    });

    const lPos = new Float32Array(links.length * 3);
    for (let i = 0; i < links.length; i++) {
        const nodeIdx = links[i];
        lPos[i * 3] = nPos[nodeIdx * 3];
        lPos[i * 3 + 1] = nPos[nodeIdx * 3 + 1];
        lPos[i * 3 + 2] = nPos[nodeIdx * 3 + 2];
    }

    return { dummy: d, colorData: cData, phases: phs, layers: ls, nodePositions: nPos, linkPositions: lPos };
  }, [numNodes]);

  useEffect(() => {
    if (meshRef.current) {
      const color = new THREE.Color();
      for (let i = 0; i < numNodes; i++) {
        const r = colorData[i * 3];
        const g = colorData[i * 3 + 1];
        const b = colorData[i * 3 + 2];
        
        dummy.position.set(
            nodePositions[i * 3],
            nodePositions[i * 3 + 1],
            nodePositions[i * 3 + 2]
        );
        
        // Scale down external nodes to make them less prominent, internal more prominent
        const scale = layers[i] === 0 ? 1.6 : (layers[i] === 3 ? 0.7 : 1.1);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);

        color.setRGB(r, g, b);
        meshRef.current.setColorAt(i, color);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [dummy, numNodes, colorData, layers, nodePositions]);

  useFrame((state) => {
    const time = state.clock.elapsedTime * (1 + activityLevel * 1.5);
    
    if (meshRef.current && meshRef.current.instanceColor) {
      const color = new THREE.Color();
      
      for (let i = 0; i < numNodes; i++) {
        const origR = colorData[i * 3];
        const origG = colorData[i * 3 + 1];
        const origB = colorData[i * 3 + 2];
        
        // Modulate intensity based on phase, time, and global activity level
        const pulse = (Math.sin(time + phases[i]) + 1) / 2;
        
        // Action potentials (flashes)
        let flash = 0;
        if (Math.random() > (0.985 - (activityLevel * 0.03))) {
            flash = 0.6 * activityLevel;
        }

        const intensity = pulse * 0.4 + flash;
        
        color.setRGB(
          Math.min(1, origR + intensity * origR),
          Math.min(1, origG + intensity * origG),
          Math.min(1, origB + intensity * origB)
        );
        meshRef.current.setColorAt(i, color);
      }
      meshRef.current.instanceColor.needsUpdate = true;
      
      // Rotate the entire complex
      meshRef.current.rotation.y += 0.001 + (activityLevel * 0.002);
      meshRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    }
    
    if (linesRef.current) {
      linesRef.current.rotation.y = meshRef.current?.rotation.y || 0;
      linesRef.current.rotation.x = meshRef.current?.rotation.x || 0;
      (linesRef.current.material as THREE.LineBasicMaterial).opacity = 0.1 + (activityLevel * 0.3);
    }
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, numNodes]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshPhysicalMaterial 
          transparent 
          opacity={0.9}
          roughness={0.1}
          metalness={0.8}
          transmission={0.2}
          thickness={0.5}
        />
      </instancedMesh>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linkPositions.length / 3}
            array={linkPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.15} 
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
};

export default function BrainVisualization({ className, hideLegend, caseActive = false }: { className?: string, hideLegend?: boolean, caseActive?: boolean }) {
  // Activity level is higher if a case is currently active/selected
  const activityLevel = caseActive ? 0.8 : 0.2;

  return (
    <div className={`bg-[#020617] rounded-xl overflow-hidden shadow-2xl relative border border-slate-800 ${className || 'w-full h-[600px]'}`}>
      {!hideLegend && (
        <div className="absolute top-4 left-4 z-10 bg-slate-900/80 p-5 rounded-xl border border-slate-700/80 backdrop-blur-md pointer-events-none shadow-2xl">
          <h3 className="font-bold text-white mb-4 tracking-tight border-b border-slate-800 pb-2">Hierarchical Markov Blanket</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 mt-1 rounded-full bg-[#00ffff] shadow-[0_0_10px_#00ffff] shrink-0"></div> 
              <div>
                <div className="font-semibold text-slate-100 leading-none">Internal States (Cortex/Disease)</div>
                <div className="text-slate-400 text-xs mt-1 leading-snug">Complex pathogeneses, inference, biological mechanisms</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 mt-1 rounded-full bg-[#ff007f] shadow-[0_0_10px_#ff007f] shrink-0"></div> 
              <div>
                <div className="font-semibold text-slate-100 leading-none">Active States (Action)</div>
                <div className="text-slate-400 text-xs mt-1 leading-snug">Clinical interventions, neuro-motor outputs</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 mt-1 rounded-full bg-[#39ff14] shadow-[0_0_10px_#39ff14] shrink-0"></div> 
              <div>
                <div className="font-semibold text-slate-100 leading-none">Sensory States (Perception)</div>
                <div className="text-slate-400 text-xs mt-1 leading-snug">Vitals, pain/temp receptors, incoming stimuli</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 mt-1 rounded-full bg-[#e2e8f0] shadow-[0_0_10px_#e2e8f0] shrink-0"></div> 
              <div>
                <div className="font-semibold text-slate-100 leading-none">External States (Environment)</div>
                <div className="text-slate-400 text-xs mt-1 leading-snug">History, symptoms, toxins, clinical narrative</div>
              </div>
            </div>
          </div>

          {caseActive && (
             <div className="mt-5 pt-3 border-t border-slate-700/50">
               <span className="flex items-center gap-2 text-[#39ff14] font-mono text-xs font-bold tracking-wider">
                 <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse shadow-[0_0_8px_#39ff14]"></span>
                 CASE DATA SYNCED & INFERRING
               </span>
             </div>
          )}
        </div>
      )}
      <Canvas camera={{ position: [0, 0, 16], fov: 60 }}>
        <fog attach="fog" args={['#020617', 5, 25]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#00ffff" />
        <pointLight position={[0, 0, 0]} intensity={0.5} color="#ff007f" />
        <BrainNodes activityLevel={activityLevel} />
        <OrbitControls enablePan={true} maxDistance={25} minDistance={2} dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}

