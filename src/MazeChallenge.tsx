import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, X, Code2, Book, Square } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MazeSimulator, SimulationFrame, MAZE_GRID, TILE_SIZE } from './maze/engine';

const DEFAULT_CODE = `// MAZE SOLVER - DFS with Memory
// Goal: Reach the Green Zone
// API: moveForward(), turnLeft(), turnRight(), check() -> 'WALL'|'EMPTY'|'FINISH'

// 1. Maintain Relative Position (x, y, facing)
let x = 0, y = 0;
let facing = 0; // 0=N, 1=E, 2=S, 3=W
const visited = {}; // 'x,y' -> true
const pathStack = []; // Stack for backtracking

function markVisited() {
    visited[x + ',' + y] = true;
}

function isVisited(nx, ny) {
    return visited[nx + ',' + ny];
}

// Helper to update position based on move
function updatePos() {
    if (facing == 0) y -= 1;
    if (facing == 2) y += 1;
    if (facing == 1) x += 1;
    if (facing == 3) x -= 1;
}

// Helper to get coordinates of cell in front
function getFrontPos() {
    let nx = x, ny = y;
    if (facing == 0) ny -= 1;
    if (facing == 2) ny += 1;
    if (facing == 1) nx += 1;
    if (facing == 3) nx -= 1;
    return {nx, ny};
}

// Turn helpers that update 'facing'
function turnL() { turnLeft(); facing = (facing + 3) % 4; }
function turnR() { turnRight(); facing = (facing + 1) % 4; }

markVisited();

// DFS Loop
while (check() != 'FINISH') {
    let moved = false;
    
    // Try all 3 directions: Front, Left, Right
    // Order preference: Front -> Right -> Left (or random?)
    
    // Strategy: Check neighbors. If unvisited and accessible, move there.
    // If no unvisited neighbors, backtrack.
    
    // 1. Check Front
    let {nx, ny} = getFrontPos();
    if (check() != 'WALL' && !isVisited(nx, ny)) {
        moveForward();
        updatePos();
        markVisited();
        pathStack.push('F'); // Record move to backtrack
        continue;
    }
    
    // 2. Check Right
    turnR();
    ({nx, ny} = getFrontPos());
    if (check() != 'WALL' && !isVisited(nx, ny)) {
        moveForward();
        updatePos();
        markVisited();
        pathStack.push('R');
        continue;
    }
    turnL(); // Undo turn to face original
    
    // 3. Check Left
    turnL();
    ({nx, ny} = getFrontPos());
    if (check() != 'WALL' && !isVisited(nx, ny)) {
        moveForward();
        updatePos();
        markVisited();
        pathStack.push('L');
        continue;
    }
    turnR(); // Undo turn
    
    // Dead End? Backtrack!
    // Simple Randomized Walk with Visited Avoidance fallback:
    const directions = ['F', 'L', 'R'];
    let possible = [];
     
    // Check Front
    let f = getFrontPos();
    if (check() != 'WALL') possible.push({dir: 'F', visited: isVisited(f.nx, f.ny)});
     
    // Check Left
    turnL();
    let l = getFrontPos();
    if (check() != 'WALL') possible.push({dir: 'L', visited: isVisited(l.nx, l.ny)});
    turnR(); // Reset
     
    // Check Right
    turnR();
    let r = getFrontPos();
    if (check() != 'WALL') possible.push({dir: 'R', visited: isVisited(r.nx, r.ny)});
    turnL(); // Reset
     
    // Filter unvisited
    let unvisited = possible.filter(p => !p.visited);
     
    if (unvisited.length > 0) {
        // Pick random unvisited
        const p = unvisited[Math.floor(Math.random() * unvisited.length)];
        if (p.dir == 'F') { moveForward(); updatePos(); }
        if (p.dir == 'L') { turnL(); moveForward(); updatePos(); }
        if (p.dir == 'R') { turnR(); moveForward(); updatePos(); }
        markVisited();
    } else {
        // All blocked or visited? Pick random valid to get out of loop
        let valid = possible[Math.floor(Math.random() * possible.length)];
        if (valid && Math.random() > 0.1) {
            if (valid.dir == 'F') { moveForward(); updatePos(); }
            if (valid.dir == 'L') { turnL(); moveForward(); updatePos(); }
            if (valid.dir == 'R') { turnR(); moveForward(); updatePos(); }
        } else {
            turnL(); turnL();
        }
    }
}
`;

function MazeChallenge() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [simRunning, setSimRunning] = useState(false);
  const [simStatus, setSimStatus] = useState<'IDLE' | 'SIMULATING' | 'PLAYBACK' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [statusMsg, setStatusMsg] = useState('');

  // Simulator Refs
  const simulatorRef = useRef(new MazeSimulator());
  const playbackRef = useRef<{
    frames: SimulationFrame[],
    index: number,
    isPlaying: boolean
  }>({ frames: [], index: 0, isPlaying: false });

  // Refs for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const ballRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Init Three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 60, 40);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // -- Build Maze Visuals --
    const offsetX = - (MAZE_GRID[0].length * TILE_SIZE) / 2;
    const offsetZ = - (MAZE_GRID.length * TILE_SIZE) / 2;

    const wallGeo = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE, TILE_SIZE);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const floorGeo = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const finishMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
    const startMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });

    const group = new THREE.Group();

    MAZE_GRID.forEach((row, zIndex) => {
      row.forEach((cell, xIndex) => {
        const x = xIndex * TILE_SIZE + TILE_SIZE / 2 + offsetX;
        const z = zIndex * TILE_SIZE + TILE_SIZE / 2 + offsetZ;

        const floor = new THREE.Mesh(floorGeo, cell === 3 ? finishMat : (cell === 2 ? startMat : floorMat));
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(x, 0, z);
        floor.receiveShadow = true;
        group.add(floor);

        if (cell === 1) {
          const wall = new THREE.Mesh(wallGeo, wallMat);
          wall.position.set(x, TILE_SIZE / 2, z);
          wall.castShadow = true;
          wall.receiveShadow = true;
          group.add(wall);
        }
      });
    });
    scene.add(group);

    const ballGeo = new THREE.SphereGeometry(TILE_SIZE * 0.3, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.5, roughness: 0.2 });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.castShadow = true;
    ballRef.current = ball;
    scene.add(ball);

    const startX = 8 * TILE_SIZE + TILE_SIZE / 2 + offsetX;
    const startZ = 1 * TILE_SIZE + TILE_SIZE / 2 + offsetZ;
    ball.position.set(startX, TILE_SIZE / 2, startZ);

    let animationId: number;
    let lastStepTime = 0;
    const stepInterval = 500;

    const animate = (time: number) => {
      animationId = requestAnimationFrame(animate);

      if (playbackRef.current.isPlaying && playbackRef.current.frames.length > 0) {
        if (time - lastStepTime > stepInterval) {
          lastStepTime = time;
          const { frames, index } = playbackRef.current;

          if (index < frames.length) {
            const frame = frames[index];
            if (ballRef.current) {
              ballRef.current.position.set(frame.x, TILE_SIZE / 2, frame.z);
            }

            if (frame.status === 'FINISHED') {
              setStatusMsg('SUCCESS: Goal Reached!');
              setSimStatus('SUCCESS');
            } else if (frame.status === 'CRASHED') {
              setStatusMsg('CRASH: ' + frame.log);
              setSimStatus('FAILED');
            }
            playbackRef.current.index++;
          } else {
            playbackRef.current.isPlaying = false;
            setSimRunning(false);
          }
        }
      }
      renderer.render(scene, camera);
    };

    requestAnimationFrame(animate);

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
  }, []);

  const runSimulation = () => {
    setSimRunning(true);
    setSimStatus('SIMULATING');
    setStatusMsg('Simulating...');

    setTimeout(() => {
      const frames = simulatorRef.current.run(code);
      playbackRef.current = {
        frames,
        index: 0,
        isPlaying: true
      };
      setSimStatus('PLAYBACK');
    }, 100);
  };

  const stopSimulation = () => {
    playbackRef.current.isPlaying = false;
    setSimRunning(false);
    setSimStatus('IDLE');
    setStatusMsg('Stopped');
  };

  return (
    <div className="flex h-screen bg-black pt-16">
      <div className="relative w-3/5 h-full bg-slate-900 overflow-hidden" ref={mountRef}>
        <div className="absolute top-4 left-4 z-10 bg-slate-900/80 p-4 rounded-lg border border-slate-700 backdrop-blur-md">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Status</h4>
          <div className={`text-xl font-mono font-bold ${simStatus === 'SUCCESS' ? 'text-green-400' :
              simStatus === 'FAILED' ? 'text-red-400' : 'text-white'
            }`}>
            {simStatus}
          </div>
          <div className="text-xs text-slate-500 mt-1">{statusMsg}</div>
        </div>
      </div>

      <div className="w-2/5 flex flex-col bg-[#1e1e1e] border-l border-slate-800">
        <div className="flex items-center justify-between px-4 h-12 bg-[#252526] border-b border-[#3e3e42]">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-300 font-mono">
            <Code2 className="w-4 h-4 text-green-400" />
            maze_bot.js
          </div>
          <Link to="/challenges">
            <button className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </Link>
        </div>

        <div className="flex-1 relative flex flex-col">
          <div className="bg-[#1e1e1e] p-4 border-b border-[#3e3e42] overflow-y-auto max-h-40">
            <h5 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
              <Book className="w-3 h-3" /> API Reference
            </h5>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
              <div className="p-2 bg-slate-800 rounded border border-slate-700">
                <strong className="text-cyan-400">moveForward()</strong>
              </div>
              <div className="p-2 bg-slate-800 rounded border border-slate-700">
                <strong className="text-orange-400">turnLeft/Right()</strong>
              </div>
              <div className="p-2 bg-slate-800 rounded border border-slate-700">
                <strong className="text-purple-400">check()</strong> &rarr; 'WALL'
              </div>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full flex-1 bg-[#1e1e1e] text-slate-300 p-4 font-mono text-sm outline-none resize-none"
            spellCheck={false}
          />
        </div>

        <div className="h-16 bg-[#252526] border-t border-[#3e3e42] flex items-center justify-end px-4">
          <button
            onClick={simRunning ? stopSimulation : runSimulation}
            className={`
              px-6 py-2 rounded text-sm font-bold flex items-center gap-2 transition-all
              ${simRunning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}
            `}
          >
            {simRunning ? (
              <><Square className="w-4 h-4" fill="currentColor" /> STOP</>
            ) : (
              <><Play className="w-4 h-4" fill="currentColor" /> RUN SOLUTION</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MazeChallenge;
