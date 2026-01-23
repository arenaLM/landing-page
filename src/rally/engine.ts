
export interface Point3D {
    x: number;
    y: number;
    z: number;
    radius?: number; // Visual track radius at this point
}

export interface TrackConfig {
    segments: number;
    getPos: (theta: number) => Point3D;
    totalLength: number; // Approximate
}

export interface CarState {
    x: number;
    z: number;
    y: number; // Elevation
    angle: number;
    speed: number;
    drivenDistance: number; // theta basically
}

export type DrivetrainType = 'AWD' | 'RWD' | 'FWD';

export interface SimulationFrame {
    x: number;
    y: number;
    z: number;
    angle: number;
    speed: number;
    status: 'RUNNING' | 'CRASHED' | 'FINISHED';
    log?: string;
}

// -- Track Logic --
// We define this here so both the Visualizer and the Physics Engine use the EXACT same math.
export const TRACK_SEGMENTS = 200;
export const getTrackPosition = (theta: number): Point3D => {
    // "Curves": Variable radius based on sine waves
    const baseRadius = 50;
    const radius = baseRadius + Math.cos(theta * 3) * 15 + Math.sin(theta * 7) * 5;

    // "Elevation": Height based on angle (Mountain pass style)
    const y = Math.sin(theta * 2) * 10 + Math.cos(theta * 5) * 5;

    return {
        x: Math.cos(theta) * radius,
        y: y,
        z: Math.sin(theta) * radius,
        radius
    };
};


// -- Simulator Engine --
export class RallySimulator {
    private frames: SimulationFrame[] = [];
    private state: CarState;
    private drivetrain: DrivetrainType = 'AWD';
    private stepCount = 0;
    private maxSteps = 1000;
    
    // Physics Configs (Tunable)
    private config = {
        accelRate: 0,
        turnRate: 0,
        maxSpeed: 0.8, // Reduced max speed overall
        friction: 0.02,
        turnSpeedLimit: 20 // km/h (arbitrary units in logic)
    };

    constructor() {
        this.state = {
            x: 0, z: 0, y: 0,
            angle: 0, // Starts at 0 radians on the circle
            speed: 0,
            drivenDistance: 0 // Track progress in radians
        };
        this.reset();
    }

    reset() {
        const startPos = getTrackPosition(0);
        // Calculate tangent for initial angle
        const nextPos = getTrackPosition(0.01);
        const initialAngle = Math.atan2(startPos.x - nextPos.x, startPos.z - nextPos.z); // Standard ThreeJS orientation fix?
        // Actually lets just match the visualizer logic: 
        // Visualizer: carAngle -= speed. 
        // We will track 'theta' (drivenDistance) and mapped position.
        
        this.state = {
            x: startPos.x,
            y: startPos.y,
            z: startPos.z,
            angle: 0, // In this abstract simulation, let's track position on the CURVE directly for simplicity? 
            // NO, users need to steer. We must allow them to drive OFF the track.
            // So we track X/Z in world space.
            speed: 0,
            drivenDistance: 0 // Only for determining start point
        };

        // Align car to track tangent initially
        const dx = nextPos.x - startPos.x;
        const dz = nextPos.z - startPos.z;
        this.state.angle = Math.atan2(dz, dx); // Heading
        
        this.frames = [];
        this.stepCount = 0;
        this.setDrivetrain('AWD');
        this.recordFrame('RUNNING');
    }

    setDrivetrain(type: DrivetrainType) {
        this.drivetrain = type;
        if (type === 'AWD') {
            this.config.accelRate = 0.005; // Fast accel
            this.config.turnRate = 0.03;   // Low turn
        } else if (type === 'RWD') {
            this.config.accelRate = 0.002; // Slow accel
            this.config.turnRate = 0.07;   // Fast turn (oversteer)
        } else if (type === 'FWD') {
            this.config.accelRate = 0.002;
            this.config.turnRate = 0.03;
        }
    }

    // -- API Exposed to User Code --

    // 1. Action: Accelerate
    api_accelerate() {
        if (this.checkLimit()) return;
        this.state.speed += this.config.accelRate;
        this.physicsStep("Accelerating");
    }

    // 2. Action: Brake
    api_brake() {
        if (this.checkLimit()) return;
        this.state.speed = Math.max(0, this.state.speed - 0.01);
        this.physicsStep("Braking");
    }

    // 3. Action: Turn Left
    api_turnLeft() {
        if (this.checkLimit()) return;
        this.handleTurn(1);
    }

    // 4. Action: Turn Right
    api_turnRight() {
        if (this.checkLimit()) return;
        this.handleTurn(-1);
    }

    // 5. Sensor: Watch
    // Returns array of points ahead of the car based on *track path*
    // This allows user to "see" the perfect line.
    api_watch() {
        // Find nearest point on track (approximate by current track theta if we tracked it, 
        // but since we allow off-roading, we might need to search or just use the last known 'progress' idx?
        // For this simple usage, let's assume 'perfect' sensors that know where the road IS at the current angular position relative to world center.
        
        // Simple projection: Get angle of car relative to center (0,0)
        const centerAngle = Math.atan2(this.state.z, this.state.x); 
        // Normalize 
        let theta = Math.atan2(this.state.z, this.state.x);
        if (theta < 0) theta += Math.PI * 2;
        
        // Return next 5 points
        const points = [];
        for(let i=1; i<=5; i++) {
             const lookAhead = theta + (i * 0.1); // Look ahead logic
             const p = getTrackPosition(lookAhead);
             points.push(p);
        }
        return points;
    }

    // -- Helpers --
    private checkLimit() {
        return this.stepCount >= this.maxSteps;
    }

    private handleTurn(dir: number) {
        // "turnLeft() and turnRight() this must be done when the car is slower than 20KM/h, otherwise the car will side slide"
        // 20kmh approx 0.2 speed units in our arbitrary scale? Let's say 0.2
        const SLIDE_THRESHOLD = 0.2; 
        
        if (this.state.speed > SLIDE_THRESHOLD) {
            // Sliding! No turn happens, skidding effect (or minimal turn)
            this.physicsStep("Skidding! Too fast to turn");
            // Maybe add drag?
            this.state.speed *= 0.95;
        } else {
            // Normal turn
            this.state.angle += dir * this.config.turnRate;
            this.physicsStep(`Turning ${dir > 0 ? 'Left' : 'Right'}`);
        }
    }

    private physicsStep(log: string) {
        this.stepCount++;
        
        // Apply velocity
        this.state.x += Math.cos(this.state.angle) * this.state.speed;
        this.state.z += Math.sin(this.state.angle) * this.state.speed;
        
        // Friction / Drag
        this.state.speed *= (1 - this.config.friction);
        if (this.state.speed < 0.0001) this.state.speed = 0;

        // Ground clamping (simple: calculate height at this X/Z if on track, roughly)
        // For simplicity in this version, we re-calculate 'ideal' Y based on angle-to-center, 
        // but maybe just keep Y from last track node?
        // Let's use the 'nearest track node' Y for visual consistency so it doesn't float.
        const theta = Math.atan2(this.state.z, this.state.x);
        const trackP = getTrackPosition(theta);
        
        // Check "Crash" - if distance from track centerline is too large
        const dx = this.state.x - trackP.x;
        const dz = this.state.z - trackP.z;
        const distFromCenter = Math.sqrt(dx*dx + dz*dz);
        
        let status: 'RUNNING' | 'CRASHED' | 'FINISHED' = 'RUNNING';
        
        if (distFromCenter > 10) { // Track width 8 / 2 = 4, plus margin
            status = 'CRASHED';
            // Stop simulation immediately? Or just mark it?
            // Mark last frame and stop next interaction
            this.stepCount = this.maxSteps; 
        }

        // Height matching
        this.state.y = trackP.y;

        this.recordFrame(status, log);
    }

    private recordFrame(status: 'RUNNING' | 'CRASHED' | 'FINISHED', log?: string) {
        this.frames.push({
            x: this.state.x,
            y: this.state.y,
            z: this.state.z,
            angle: this.state.angle,
            speed: this.state.speed,
            status,
            log
        });
    }

    public run(userCode: string): SimulationFrame[] {
        this.reset();
        
        // Create Safe Execution Sandox (Function constructor with scoped 'this')
        // We will expose functions: acc, brake, left, right, watch, etc.
        
        const api = {
            accelerate: () => this.api_accelerate(),
            brake: () => this.api_brake(),
            turnLeft: () => this.api_turnLeft(),
            turnRight: () => this.api_turnRight(),
            watch: () => this.api_watch(),
            config: (t: DrivetrainType) => this.setDrivetrain(t),
            log: (msg:any) => console.log("User:", msg)
        };

        try {
            // Function wrapping user code
            // Note: We use a loop guard to prevent true infinite loops in JS if they don't call our API
            // But since user writes the loop usually, we rely on them calling API to advance steps.
            // If they write `while(true) {}` without API calls, browser hangs.
            // To fix this, we can't easily transform code without a parser.
            // Requirement was: "interactive commands".
            // If user writes:
            // while(true) { accelerate(); } 
            
            // We can inject a loop protector? Or just trust 'accelerate' counts steps.
            // If they write `while(true) {}` it will hang.
            // SIMPLE FIX for now: Just run it. If it hangs, it hangs (User error).
            // Better: Use a simple regex to insert a check? No, too fragile.
            // Let's just wrap in a Promise with timeout? No, 'new Function' is synchronous.
            // We will trust the user uses the API. The API limits 'stepCount' so `accelerate()` eventually throws or returns?
            // Actually, if we throw an error "Simulation Complete" inside accelerate when maxSteps reached, we break the loop!
            
            // Preprocess Code to allow Python-like syntax (comments)
            // 1. Replace # comments with //
            const jsCode = userCode.replace(/# /g, '// ');

            const wrappedCode = `
                with (API) {
                    ${jsCode}
                }
            `;
            
            // We override API methods to throw if done
            const safeApi = { ...api };
            const check = () => { if(this.stepCount >= this.maxSteps) throw new Error("SIM_COMPLETE"); };
            safeApi.accelerate = () => { check(); api.accelerate(); };
            safeApi.brake = () => { check(); api.brake(); };
            safeApi.turnLeft = () => { check(); api.turnLeft(); };
            safeApi.turnRight = () => { check(); api.turnRight(); };
            
            const fn = new Function('API', wrappedCode);
            fn(safeApi);
            
        } catch (e: any) {
            if (e.message !== "SIM_COMPLETE") {
                console.error("User Code Error", e);
                this.frames.push({ ...this.frames[this.frames.length-1], log: "ERROR: " + e.message });
            }
        }

        return this.frames;
    }
}
