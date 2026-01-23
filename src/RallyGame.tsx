import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Terminal, Play, X, Code2, Zap, Settings, Book } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RallySimulator, getTrackPosition, SimulationFrame, TRACK_SEGMENTS } from './rally/engine';

function RallyGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [simRunning, setSimRunning] = useState(false);
  const [simStatus, setSimStatus] = useState<'IDLE' | 'SIMULATING' | 'PLAYBACK'>('IDLE');

  const [code, setCode] = useState(`# RALLY CODING CHALLENGE
# Goal: Complete the track safely!
# API:
#   accelerate() - Speed up +5
#   brake()      - Slow down -5
#   turnLeft()   - Turn Left (Only if speed < 20)
#   turnRight()  - Turn Right (Only if speed < 20)
#   watch()      - Returns list of points ahead
#   config(type) - 'AWD', 'RWD', 'FWD'

config('AWD')

while(true) {
    points = watch()
    
    # TODO: Add logic here!
    if (points[0].radius < 40) {
        brake()
    } else {
        accelerate()
    }
    
    # Minimal turn to stay on logical track? 
    # Try experimenting!
    turnLeft() 
}
`);

  const [telemetry, setTelemetry] = useState({
    speed: 0,
    status: 'READY'
  });

  // Simulator Refs
  const simulatorRef = useRef(new RallySimulator());
  const playbackRef = useRef<{
    frames: SimulationFrame[],
    index: number,
    isPlaying: boolean
  }>({ frames: [], index: 0, isPlaying: false });

  // Refs for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carRef = useRef<THREE.Mesh | null>(null);
  const carMeshRef = useRef<THREE.Group | null>(null); // Actual car mesh for rotation


  useEffect(() => {
    if (!mountRef.current) return;

    // Init Three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.Fog(0xffffff, 20, 120);
    sceneRef.current = scene;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 40, 60);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 50, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Track Generation (Shared Logic Visualization)
    // We use the same helper as the engine to ensure visual match

    // 1. Draw Track Segments
    const trackWidth = 8;
    for (let i = 0; i < TRACK_SEGMENTS; i++) {
      const theta1 = (i / TRACK_SEGMENTS) * Math.PI * 2;
      const theta2 = ((i + 1) / TRACK_SEGMENTS) * Math.PI * 2;

      const pos1 = getTrackPosition(theta1);
      const pos2 = getTrackPosition(theta2);

      // Create segment mesh (Trapezoid-like between two points)
      // We'll use a simple approach: Place a mesh at midpoint, oriented correctly
      // Or better: built generic buffer geometry, but for simplicity let's use small planes 
      // oriented along the tangent.

      const dist = Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.z - pos1.z, 2));
      const midX = (pos1.x + pos2.x) / 2;
      const midY = (pos1.y + pos2.y) / 2;
      const midZ = (pos1.z + pos2.z) / 2;

      const geometry = new THREE.BoxGeometry(trackWidth, 1, dist + 1); // +1 overlap
      const material = new THREE.MeshStandardMaterial({
        color: 0x333333, // Asphalt
        roughness: 0.8
      });

      const segment = new THREE.Mesh(geometry, material);
      segment.position.set(midX, midY, midZ);
      segment.lookAt(pos2.x, pos2.y, pos2.z);
      segment.receiveShadow = true;
      scene.add(segment);

      // Add lines/markings
      const lineGeo = new THREE.BoxGeometry(0.5, 1.1, dist / 2);
      const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.copy(segment.position);
      line.quaternion.copy(segment.quaternion);
      line.position.y += 0.1;
      scene.add(line);
    }


    // Center Decoration (Mountain/Terrain)
    const mountainGeo = new THREE.ConeGeometry(40, 30, 32);
    const mountainMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, flatShading: true });
    const mountain = new THREE.Mesh(mountainGeo, mountainMat);
    mountain.position.y = -5;
    scene.add(mountain);

    // Environment Objects (Trees, Pyramids, Sakura)

    // Helper to create tree
    const createTree = (color: number, x: number, z: number, y: number, scale: number = 1) => {
      const group = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5 * scale, 0.6 * scale, 2 * scale),
        new THREE.MeshStandardMaterial({ color: 0x5c4033 })
      );
      const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(2 * scale, 5 * scale),
        new THREE.MeshStandardMaterial({ color })
      );
      leaves.position.y = 3.5 * scale;
      trunk.position.y = 1 * scale;
      trunk.castShadow = true;
      leaves.castShadow = true;
      group.add(trunk);
      group.add(leaves);
      group.position.set(x, y, z);
      return group;
    };

    // Populate Environment
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Place trees based on simplified logic for visual flair
      // Same logic as before roughly, using getTrackPosition to place near track
      const trackP = getTrackPosition(angle);
      const offset = (Math.random() - 0.5) * 40; // Wide spread
      const r = (trackP.radius || 50) + (Math.abs(offset) < 6 ? 10 : offset); // Avoid track

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = trackP.y + (Math.random() * 5 - 2); // Vary height

      // Sakura Trees (Pink) dominant for "Japanese" feel
      const isSakura = Math.random() > 0.3;
      const color = isSakura ? 0xffb7c5 : 0x228b22;

      scene.add(createTree(color, x, z, y, 0.8 + Math.random() * 0.5));
    }

    // Car
    // Car
    const carGeo = new THREE.BoxGeometry(2, 1, 4);
    const carMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4 }); // Cyan car
    const car = new THREE.Mesh(carGeo, carMat);
    car.castShadow = true;

    // Add some details to car (Roof)
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 2), new THREE.MeshStandardMaterial({ color: 0x000000 }));
    roof.position.y = 0.8;
    car.add(roof);

    scene.add(car);
    carRef.current = car;

    // Initial Position
    const startP = getTrackPosition(0);
    car.position.set(startP.x, startP.y + 1, startP.z);
    car.lookAt(getTrackPosition(0.01).x, getTrackPosition(0.01).y + 1, getTrackPosition(0.01).z);

    // Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Playback Logic
      if (playbackRef.current.isPlaying && playbackRef.current.frames.length > 0) {
        const { frames, index } = playbackRef.current;

        if (index < frames.length) {
          const frame = frames[index];

          if (carRef.current) {
            // Position
            carRef.current.position.set(frame.x, frame.y + 1, frame.z);

            // Rotation
            // We need to calculate rotation from angle or velocity vector
            // The engine stores 'angle' as the heading in radians
            carRef.current.rotation.y = -frame.angle; // Invert for ThreeJS usually

            // Bobbing
            carRef.current.position.y += Math.sin(Date.now() * 0.02) * 0.05;

            // Update Camera
            if (cameraRef.current) {
              // Smooth follow
              cameraRef.current.position.x += (carRef.current.position.x + 30 - cameraRef.current.position.x) * 0.1;
              cameraRef.current.position.z += (carRef.current.position.z + 30 - cameraRef.current.position.z) * 0.1;
              cameraRef.current.lookAt(carRef.current.position);
            }

            // UI Updates
            setTelemetry({
              speed: Math.floor(frame.speed * 1000), // Scale for display
              status: frame.status
            });
          }

          playbackRef.current.index++;
        } else {
          // End of Tape
          playbackRef.current.isPlaying = false;
          setSimStatus('IDLE');
          setSimRunning(false);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (mountRef.current && cameraRef.current && rendererRef.current) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []); // Run once on mount

  const runSimulation = () => {
    // 1. Reset
    setSimRunning(true);
    setSimStatus('SIMULATING');

    // 2. Run Physics Engine (Instant)
    setTimeout(() => {
      const frames = simulatorRef.current.run(code);
      console.log("Simulation finished with frames:", frames.length);

      // 3. Start Playback
      playbackRef.current = {
        frames,
        index: 0,
        isPlaying: true
      };
      setSimStatus('PLAYBACK');
    }, 100);
  };

  return (
    <div className="flex h-screen bg-black pt-16"> {/* pt-16 for navbar space */}

      {/* LEFT: 3D Simulation */}
      <div className="relative w-3/5 h-full bg-slate-900 overflow-hidden" ref={mountRef}>
        <div className="absolute top-4 left-4 z-10 bg-slate-900/80 p-4 rounded-lg border border-slate-700 backdrop-blur-md">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Telemetry</h4>
          <div className="text-3xl font-mono font-bold text-white mb-1">
            {telemetry.speed} <span className="text-sm text-slate-500">km/h</span>
          </div>
          <div className="text-xs font-mono font-bold mt-1 text-slate-400">
            DRIVETRAIN: Managed by Code
          </div>
        </div>

        {/* Status Overlay */}
        {simStatus === 'SIMULATING' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-2xl flex flex-col items-center">
              <Zap className="w-10 h-10 text-yellow-400 animate-pulse mb-4" />
              <div className="text-xl font-bold text-white">Compiling & Simulating...</div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Editor */}
      <div className="w-2/5 flex flex-col bg-[#1e1e1e] border-l border-slate-800">

        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 h-12 bg-[#252526] border-b border-[#3e3e42]">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-300 font-mono">
            <Code2 className="w-4 h-4 text-blue-400" />
            rally_optimizer.py
          </div>
          <Link to="/challenges">
            <button className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </Link>
        </div>

        <div className="flex-1 relative flex flex-col">
          {/* API Docs */}
          <div className="bg-[#1e1e1e] p-4 border-b border-[#3e3e42] overflow-y-auto max-h-40">
            <h5 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
              <Book className="w-3 h-3" /> API Reference
            </h5>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
              <div className="p-2 bg-slate-800 rounded border border-slate-700">
                <strong className="text-cyan-400">accelerate()</strong>
                <div className="text-slate-500">Speed +5</div>
              </div>
              <div className="p-2 bg-slate-800 rounded border border-slate-700">
                <strong className="text-cyan-400">brake()</strong>
                <div className="text-slate-500">Speed -5</div>
              </div>
              <div className="p-2 bg-slate-800 rounded border border-slate-700">
                <strong className="text-orange-400">turnLeft/Right()</strong>
                <div className="text-slate-500">Only if speed &lt; 20</div>
              </div>
              <div className="p-2 bg-slate-800 rounded border border-slate-700">
                <strong className="text-purple-400">watch()</strong>
                <div className="text-slate-500">Get track info</div>
              </div>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full flex-1 bg-[#1e1e1e] text-slate-300 p-4 font-mono text-sm outline-none resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* AI Co-Pilot Section */}
        <div className="h-1/3 bg-[#1e1e1e] border-t border-[#3e3e42] flex flex-col">
          <div className="bg-[#252526] px-4 py-2 text-xs font-bold text-cyan-400 uppercase tracking-wider flex justify-between items-center border-b border-[#3e3e42]">
            <span className="flex items-center gap-2">
              <Zap className="w-3 h-3" /> AI CO-PILOT
            </span>
            <span className="text-slate-500 font-mono">GPT-4o (Simulated)</span>
          </div>
          <div className="p-4 flex-1 flex flex-col gap-3">
            <textarea
              className="w-full bg-slate-800/50 text-slate-200 text-sm p-3 rounded border border-slate-700 resize-none focus:border-cyan-500 outline-none flex-1 transition-colors font-mono placeholder:text-slate-600"
              placeholder="Prompt the AI: 'Optimize gear ratios for gravel to reduce slippage...'"
            />
            <div className="flex justify-end">
              <button
                onClick={runSimulation}
                disabled={simRunning}
                className={`
                            px-6 py-2 rounded text-sm font-bold flex items-center gap-2 transition-all
                            ${simRunning
                    ? 'bg-green-600/20 text-green-500 cursor-default'
                    : 'bg-green-600 hover:bg-green-500 text-white hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                  }
                        `}
              >
                {simRunning ? (
                  <>Running Simulation...</>
                ) : (
                  <>
                    <Play className="w-4 h-4" fill="currentColor" /> DEPLOY & RUN
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default RallyGame;

