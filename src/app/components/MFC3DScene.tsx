/**
 * MFC3DScene — Animated interactive 3D model of a Microbial Fuel Cell
 *
 * Shows:
 *  - Anode chamber (left, deep-green) with pulsing bacteria colonies
 *  - Cathode chamber (right, olive-yellow) with rising water bubbles
 *  - Proton Exchange Membrane (PEM) between chambers
 *  - Carbon electrodes in each chamber
 *  - External circuit wire + load resistor
 *  - Animated electrons flowing through the circuit
 *  - Animated protons flowing through the PEM
 *  - Organic matter particles sinking in anode
 *  - HTML labels for all components (theme-aware via CSS vars)
 *
 * Colour palette follows the landing-page design tokens:
 *  Primary green : #6B7E49 / #8EA468
 *  Accent green  : #DDE4C3
 *  Accent yellow : #F6F4D4 / #9a9040
 *  Labels        : var(--lp-*) CSS variables (light / dark adaptive)
 */

import { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

// ── Typography / colour constants (mirrors GM in constants.ts) ────────────────

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// Hardcoded brand colours used in WebGL materials (cannot use CSS vars there)
const CLR = {
  anodeGlass:    '#6B7E49',   // deep green  – anode chamber
  anodeEdge:     '#8EA468',
  cathodeGlass:  '#9a9040',   // olive-yellow – cathode chamber
  cathodeEdge:   '#b5a840',
  electrode:     '#14200e',   // very dark green-black carbon
  pem:           '#b5a040',   // amber-olive membrane
  wire:          '#7a8a70',   // muted sage-grey wire
  load:          '#6B7E49',   // deep green load block
  loadEmissive:  '#4a5e30',
  electron:      '#c8dba8',   // pale sage sphere
  electronEmis:  '#8EA468',   // sage emissive
  proton:        '#F6F4D4',   // pastel yellow sphere
  protonEmis:    '#b5a040',   // olive emissive
  bacteria:      '#8EA468',   // mid-green blob
  bacteriaEmis:  '#DDE4C3',
  bubble:        '#6888a8',   // dusty slate-blue bubble
  organic:       '#c8d498',   // pale olive-yellow particle
} as const;

// CSS-variable label styles (theme-aware)
const labelBase: React.CSSProperties = {
  fontFamily:    FONT,
  whiteSpace:    'nowrap',
  backdropFilter:'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

const chipGreen: React.CSSProperties = {
  ...labelBase,
  color:        'var(--lp-green-text)',
  fontWeight:   700,
  fontSize:     '10px',
  letterSpacing:'0.06em',
  background:   'var(--lp-glass-bg)',
  border:       '1px solid var(--lp-green-border)',
  padding:      '2px 9px',
  borderRadius: '100px',
};

const chipYellow: React.CSSProperties = {
  ...labelBase,
  color:        'var(--lp-yellow-text)',
  fontWeight:   700,
  fontSize:     '10px',
  letterSpacing:'0.06em',
  background:   'var(--lp-glass-bg)',
  border:       '1px solid var(--lp-yellow-border)',
  padding:      '2px 9px',
  borderRadius: '100px',
};


const cardMuted: React.CSSProperties = {
  ...labelBase,
  color:        'var(--lp-text-muted)',
  fontSize:     '9px',
  textAlign:    'center',
  background:   'var(--lp-glass-bg)',
  border:       '1px solid var(--lp-glass-border)',
  padding:      '5px 9px',
  borderRadius: '8px',
  lineHeight:   1.5,
};

const tinyLabel: React.CSSProperties = {
  ...labelBase,
  color:        'var(--lp-text-muted)',
  fontSize:     '8px',
  background:   'var(--lp-glass-bg)',
  border:       '1px solid var(--lp-glass-border)',
  padding:      '1px 5px',
  borderRadius: '4px',
};

// ── Geometry constants ────────────────────────────────────────────────────────

const ANODE_X    = -1.75;
const CATHODE_X  =  1.75;
const CHAMBER_W  = 3.2;
const CHAMBER_H  = 2.5;
const CHAMBER_D  = 2.5;
const ELECTRODE_X = 0.5;   // distance from centre to electrode plate

// ── Electron: animated sphere along the external circuit ─────────────────────

function Electron({
  path,
  offset,
}: {
  path: THREE.CatmullRomCurve3;
  offset: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const t   = useRef(offset);

  useFrame((_, dt) => {
    t.current = (t.current + dt * 0.22) % 1;
    ref.current.position.copy(path.getPoint(t.current));
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.085, 14, 14]} />
      <meshStandardMaterial
        color={CLR.electron}
        emissive={CLR.electronEmis}
        emissiveIntensity={2.8}
      />
    </mesh>
  );
}

// ── Proton: animated sphere through the membrane (left → right) ───────────────

function Proton({ y, z, offset }: { y: number; z: number; offset: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const t   = useRef(offset);

  useFrame((_, dt) => {
    t.current = (t.current + dt * 0.3) % 1;
    ref.current.position.x = THREE.MathUtils.lerp(-0.9, 0.9, t.current);
  });

  const startX = THREE.MathUtils.lerp(-0.9, 0.9, offset);

  return (
    <mesh ref={ref} position={[startX, y, z]}>
      <sphereGeometry args={[0.065, 10, 10]} />
      <meshStandardMaterial
        color={CLR.proton}
        emissive={CLR.protonEmis}
        emissiveIntensity={2.0}
      />
    </mesh>
  );
}

// ── Bacteria: pulsing green blob in the anode chamber ────────────────────────

function Bacteria({
  position,
  speed,
}: {
  position: [number, number, number];
  speed: number;
}) {
  const ref   = useRef<THREE.Mesh>(null!);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((_, dt) => {
    phase.current += dt * speed;
    ref.current.scale.setScalar(1 + 0.22 * Math.sin(phase.current));
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.22, 12, 12]} />
      <meshStandardMaterial
        color={CLR.bacteria}
        transparent
        opacity={0.82}
        emissive={CLR.bacteriaEmis}
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

// ── Bubble: rising droplet in the cathode chamber ─────────────────────────────

function Bubble({ x, z, offset }: { x: number; z: number; offset: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef  = useRef<THREE.MeshStandardMaterial>(null!);
  const t       = useRef(offset);
  const baseY   = -CHAMBER_H / 2 + 0.25;
  const travel  = CHAMBER_H - 0.5;

  useFrame((_, dt) => {
    t.current = (t.current + dt * 0.28) % 1;
    meshRef.current.position.y = baseY + t.current * travel;
    matRef.current.opacity      = 0.72 * (1 - t.current * 0.65);
  });

  return (
    <mesh ref={meshRef} position={[x, baseY + offset * travel, z]}>
      <sphereGeometry args={[0.072, 8, 8]} />
      <meshStandardMaterial ref={matRef} color={CLR.bubble} transparent opacity={0.72} />
    </mesh>
  );
}

// ── OrganicParticle: wastewater particle sinking in anode ─────────────────────

function OrganicParticle({
  x,
  z,
  offset,
}: {
  x: number;
  z: number;
  offset: number;
}) {
  const ref    = useRef<THREE.Mesh>(null!);
  const t      = useRef(offset);
  const topY   = CHAMBER_H / 2 - 0.25;
  const travel = CHAMBER_H - 0.5;

  useFrame((_, dt) => {
    t.current = (t.current + dt * 0.2) % 1;
    ref.current.position.y = topY - t.current * travel;
  });

  return (
    <mesh ref={ref} position={[x, topY - offset * travel, z]}>
      <sphereGeometry args={[0.055, 8, 8]} />
      <meshStandardMaterial color={CLR.organic} transparent opacity={0.55} />
    </mesh>
  );
}

// ── MFCModel: the full scene graph ────────────────────────────────────────────

function MFCModel() {
  // Shared edge geometry for both chambers (disposed on unmount)
  const chamberEdges = useMemo(() => {
    const box   = new THREE.BoxGeometry(CHAMBER_W, CHAMBER_H, CHAMBER_D);
    const edges = new THREE.EdgesGeometry(box);
    box.dispose();
    return edges;
  }, []);

  // External circuit path: electrode top → arched wire → load → other electrode
  const circuitPath = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-ELECTRODE_X, CHAMBER_H / 2 - 0.08, 0),
        new THREE.Vector3(-ELECTRODE_X, CHAMBER_H / 2 + 0.55, 0),
        new THREE.Vector3(-0.24,        CHAMBER_H / 2 + 1.05, 0),
        new THREE.Vector3(0,            CHAMBER_H / 2 + 1.28, 0), // ← load here
        new THREE.Vector3(0.24,         CHAMBER_H / 2 + 1.05, 0),
        new THREE.Vector3(ELECTRODE_X,  CHAMBER_H / 2 + 0.55, 0),
        new THREE.Vector3(ELECTRODE_X,  CHAMBER_H / 2 - 0.08, 0),
      ]),
    [],
  );

  const wireGeo = useMemo(
    () => new THREE.TubeGeometry(circuitPath, 64, 0.042, 8, false),
    [circuitPath],
  );

  useEffect(() => () => { chamberEdges.dispose(); wireGeo.dispose(); }, [chamberEdges, wireGeo]);

  const loadY = CHAMBER_H / 2 + 1.28;

  return (
    <group>

      {/* ── Anode Chamber (left, deep-green) ──────────────────────────────── */}

      <mesh position={[ANODE_X, 0, 0]}>
        <boxGeometry args={[CHAMBER_W, CHAMBER_H, CHAMBER_D]} />
        <meshPhysicalMaterial color={CLR.anodeGlass} transparent opacity={0.07} roughness={0.05} side={THREE.FrontSide} />
      </mesh>

      <lineSegments position={[ANODE_X, 0, 0]} geometry={chamberEdges}>
        <lineBasicMaterial color={CLR.anodeEdge} transparent opacity={0.50} />
      </lineSegments>

      {/* Carbon anode electrode */}
      <mesh position={[-ELECTRODE_X, 0, 0]}>
        <boxGeometry args={[0.07, CHAMBER_H * 0.9, CHAMBER_D * 0.9]} />
        <meshStandardMaterial color={CLR.electrode} metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Anode label */}
      <Html position={[ANODE_X, -CHAMBER_H / 2 - 0.52, 0]} center distanceFactor={6}>
        <span style={chipGreen}>ANODE (−)</span>
      </Html>

      {/* Wastewater-in label */}
      <Html position={[ANODE_X - CHAMBER_W / 2 - 0.2, 0.5, 0]} center distanceFactor={7}>
        <div style={cardMuted}>
          <div style={{ fontWeight: 600, color: 'var(--lp-green-text)' }}>Wastewater IN</div>
          <div style={{ fontSize: '8px' }}>Bacteria + Organics</div>
        </div>
      </Html>

      {/* ── Cathode Chamber (right, olive-yellow) ─────────────────────────── */}

      <mesh position={[CATHODE_X, 0, 0]}>
        <boxGeometry args={[CHAMBER_W, CHAMBER_H, CHAMBER_D]} />
        <meshPhysicalMaterial color={CLR.cathodeGlass} transparent opacity={0.07} roughness={0.05} side={THREE.FrontSide} />
      </mesh>

      <lineSegments position={[CATHODE_X, 0, 0]} geometry={chamberEdges}>
        <lineBasicMaterial color={CLR.cathodeEdge} transparent opacity={0.50} />
      </lineSegments>

      {/* Carbon cathode electrode */}
      <mesh position={[ELECTRODE_X, 0, 0]}>
        <boxGeometry args={[0.07, CHAMBER_H * 0.9, CHAMBER_D * 0.9]} />
        <meshStandardMaterial color={CLR.electrode} metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Cathode label */}
      <Html position={[CATHODE_X, -CHAMBER_H / 2 - 0.52, 0]} center distanceFactor={6}>
        <span style={chipYellow}>CATHODE (+)</span>
      </Html>

      {/* Clean-water-out label */}
      <Html position={[CATHODE_X + CHAMBER_W / 2 + 0.2, 0.5, 0]} center distanceFactor={7}>
        <div style={cardMuted}>
          <div style={{ fontWeight: 600, color: 'var(--lp-yellow-text)' }}>Clean Water OUT</div>
          <div style={{ fontSize: '8px' }}>O₂ + H₂O</div>
        </div>
      </Html>

      {/* ── Proton Exchange Membrane (PEM) ────────────────────────────────── */}

      <mesh>
        <boxGeometry args={[0.28, CHAMBER_H, CHAMBER_D]} />
        <meshPhysicalMaterial color={CLR.pem} transparent opacity={0.32} roughness={0.25} />
      </mesh>

      <Html position={[0, CHAMBER_H / 2 - 0.18, CHAMBER_D / 2 + 0.18]} center distanceFactor={7}>
        <span style={{ ...chipYellow, fontSize: '9px' }}>PEM</span>
      </Html>

      {/* H⁺ flow hint */}
      <Html position={[0, 0, CHAMBER_D / 2 + 0.18]} center distanceFactor={7}>
        <span style={tinyLabel}>H⁺ flow →</span>
      </Html>

      {/* ── External Circuit Wire ─────────────────────────────────────────── */}

      <mesh geometry={wireGeo}>
        <meshStandardMaterial color={CLR.wire} metalness={0.85} roughness={0.18} />
      </mesh>

      {/* e⁻ direction hint on wire */}
      <Html position={[-0.75, CHAMBER_H / 2 + 1.12, 0]} center distanceFactor={7}>
        <span style={{ ...tinyLabel, color: 'var(--lp-green-text)' }}>e⁻ →</span>
      </Html>

      {/* ── Load / Resistor ───────────────────────────────────────────────── */}

      <mesh position={[0, loadY, 0]}>
        <boxGeometry args={[0.5, 0.17, 0.17]} />
        <meshStandardMaterial
          color={CLR.load}
          roughness={0.55}
          emissive={CLR.loadEmissive}
          emissiveIntensity={0.5}
        />
      </mesh>

      <Html position={[0, loadY + 0.42, 0]} center distanceFactor={7}>
        <span style={{ ...chipGreen, fontSize: '10px' }}>⚡ LOAD</span>
      </Html>

      {/* ── Bacteria colonies in anode ────────────────────────────────────── */}

      {([
        [-1.95, -0.25,  0.40, 1.4],
        [-1.60,  0.50, -0.50, 1.1],
        [-2.35,  0.70,  0.30, 1.6],
        [-1.50, -0.65, -0.35, 1.3],
        [-2.25,  0.10, -0.60, 1.5],
        [-1.80,  0.90,  0.60, 1.2],
        [-2.55, -0.50,  0.10, 1.7],
        [-1.40,  0.30, -0.70, 1.0],
      ] as [number, number, number, number][]).map(([x, y, z, spd], i) => (
        <Bacteria key={i} position={[x, y, z]} speed={spd} />
      ))}

      {/* ── Electrons flowing along circuit ───────────────────────────────── */}

      {[0, 0.25, 0.5, 0.75].map((offset, i) => (
        <Electron key={i} path={circuitPath} offset={offset} />
      ))}

      {/* ── Protons through the membrane ──────────────────────────────────── */}

      {([
        [-0.30,  0.30, 0.00],
        [ 0.42, -0.42, 0.33],
        [-0.60, -0.20, 0.66],
        [ 0.22,  0.55, 0.50],
        [-0.12, -0.70, 0.18],
      ] as [number, number, number][]).map(([y, z, offset], i) => (
        <Proton key={i} y={y} z={z} offset={offset} />
      ))}

      {/* ── Rising water bubbles in cathode ───────────────────────────────── */}

      {([
        [1.40,  0.30, 0.10],
        [1.90, -0.40, 0.50],
        [2.30,  0.60, 0.80],
        [1.65, -0.55, 0.35],
        [2.10,  0.15, 0.65],
        [1.55,  0.50, 0.20],
      ] as [number, number, number][]).map(([x, z, offset], i) => (
        <Bubble key={i} x={x} z={z} offset={offset} />
      ))}

      {/* ── Organic matter particles sinking in anode ─────────────────────── */}

      {([
        [-2.00,  0.40, 0.10],
        [-1.55,  0.55, 0.45],
        [-2.40, -0.30, 0.75],
        [-1.70, -0.45, 0.30],
        [-2.20,  0.35, 0.60],
      ] as [number, number, number][]).map(([x, z, offset], i) => (
        <OrganicParticle key={i} x={x} z={z} offset={offset} />
      ))}

    </group>
  );
}

// ── Canvas wrapper (exported) ──────────────────────────────────────────────────

export function MFC3DScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.6, 9.5], fov: 45 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      dpr={[1, 1.5]}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', e => e.preventDefault());
      }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      {/* Lighting — green-olive family */}
      <ambientLight intensity={0.60} />
      <directionalLight position={[5, 9, 6]} intensity={0.85} />
      <pointLight position={[-6, 3, 5]} intensity={0.80} color="#8EA468" />
      <pointLight position={[ 6, 3, 5]} intensity={0.70} color="#6B7E49" />
      <pointLight position={[ 0, 6, 3]} intensity={0.40} color="#c5b040" />

      {/* Scene */}
      <Suspense fallback={null}>
        <MFCModel />
      </Suspense>

      {/* Camera controls */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.75}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI * 0.65}
        target={[0, 0.15, 0]}
      />
    </Canvas>
  );
}
