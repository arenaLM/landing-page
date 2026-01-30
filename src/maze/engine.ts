
export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

export interface Point2D {
    x: number;
    y: number;
}

export interface SimulationFrame {
    x: number;
    z: number;
    angle: number; // 0 = North, -Math.PI/2 = East, etc.
    status: 'RUNNING' | 'CRASHED' | 'FINISHED';
    log?: string;
}

// 0 = Path, 1 = Wall, 2 = Start, 3 = End
export const MAZE_GRID = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 2, 1], // Start at (8,1) (Top-Right)
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 3, 1, 1, 1, 0, 1, 1, 0, 1], // End at (1,8) (Bottom-Left)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export const TILE_SIZE = 5; // World units per tile

export class MazeSimulator {
    private frames: SimulationFrame[] = [];
    private x = 8;
    private y = 1; // Start at Top-Right
    private direction: Direction = 'SOUTH'; // Facing South initially? Or West?
    private stepCount = 0;
    private maxSteps = 1000;
    private finished = false;

    constructor() {
        this.reset();
    }

    reset() {
        this.x = 8;
        this.y = 1;
        this.direction = 'WEST'; // Let's face West into the open space
        this.frames = [];
        this.stepCount = 0;
        this.finished = false;
        this.recordFrame('RUNNING');
    }

    private recordFrame(status: 'RUNNING' | 'CRASHED' | 'FINISHED', log?: string) {
        // Convert Grid (x, y) to World (x, z)
        // Center of tile (x, y) is at (x * TILE_SIZE, z * TILE_SIZE)
        // Let's center the maze around 0,0? Or just use positive coordinates?
        // Let's use positive coordinates for simplicity.
        // offset to center visually: - (10 * TILE_SIZE) / 2
        const offset = - (10 * TILE_SIZE) / 2;
        
        const worldX = this.x * TILE_SIZE + TILE_SIZE/2 + offset;
        const worldZ = this.y * TILE_SIZE + TILE_SIZE/2 + offset;
        
        let angle = 0;
        if (this.direction === 'NORTH') angle = Math.PI;
        if (this.direction === 'EAST') angle = -Math.PI / 2;
        if (this.direction === 'SOUTH') angle = 0;
        if (this.direction === 'WEST') angle = Math.PI / 2;

        this.frames.push({
            x: worldX,
            z: worldZ,
            angle,
            status,
            log
        });
    }

    // -- API --

    api_moveForward() {
        if (this.finished || this.stepCount >= this.maxSteps) return;
        this.stepCount++;

        let nextX = this.x;
        let nextY = this.y;

        if (this.direction === 'NORTH') nextY -= 1;
        if (this.direction === 'SOUTH') nextY += 1;
        if (this.direction === 'EAST') nextX += 1;
        if (this.direction === 'WEST') nextX -= 1;

        // Check collision
        if (MAZE_GRID[nextY][nextX] === 1) {
            this.recordFrame('CRASHED', 'Hit Wall!');
            this.finished = true;
            return;
        }

        this.x = nextX;
        this.y = nextY;

        // Check Finish
        if (MAZE_GRID[nextY][nextX] === 3) {
            this.recordFrame('FINISHED', 'Goal Reached!');
            this.finished = true;
            return;
        }

        this.recordFrame('RUNNING', 'Moved Forward');
    }

    api_turnLeft() {
        if (this.finished || this.stepCount >= this.maxSteps) return;
        this.stepCount++;
        
        const dirs: Direction[] = ['NORTH', 'WEST', 'SOUTH', 'EAST'];
        const idx = dirs.indexOf(this.direction);
        this.direction = dirs[(idx + 1) % 4];
        
        this.recordFrame('RUNNING', 'Turned Left');
    }

    api_turnRight() {
        if (this.finished || this.stepCount >= this.maxSteps) return;
        this.stepCount++;

        const dirs: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
        const idx = dirs.indexOf(this.direction);
        this.direction = dirs[(idx + 1) % 4];

        this.recordFrame('RUNNING', 'Turned Right');
    }

    api_check() {
        // Sensor: Returns what is in front
        let checkX = this.x;
        let checkY = this.y;

        if (this.direction === 'NORTH') checkY -= 1;
        if (this.direction === 'SOUTH') checkY += 1;
        if (this.direction === 'EAST') checkX += 1;
        if (this.direction === 'WEST') checkX -= 1;

        const cell = MAZE_GRID[checkY][checkX];
        if (cell === 1) return 'WALL';
        if (cell === 3) return 'FINISH';
        return 'EMPTY'; 
    }

    public run(userCode: string): SimulationFrame[] {
        this.reset();

        const api = {
            moveForward: () => this.api_moveForward(),
            turnLeft: () => this.api_turnLeft(),
            turnRight: () => this.api_turnRight(),
            check: () => this.api_check(),
            log: (msg: any) => console.log("User:", msg)
        };

        try {
            // Replace comments
            const jsCode = userCode.replace(/# /g, '// ');

            // Infinite loop protection
             const wrappedCode = `
                with (API) {
                    ${jsCode}
                }
            `;

            const safeApi = { ...api };
             // Add check in API calls to stop execution if finished
            const check = () => { 
                if (this.stepCount >= this.maxSteps) throw new Error("SIM_TIMEOUT");
                if (this.finished) throw new Error("SIM_COMPLETE");
            };
            
            safeApi.moveForward = () => { check(); api.moveForward(); };
            safeApi.turnLeft = () => { check(); api.turnLeft(); };
            safeApi.turnRight = () => { check(); api.turnRight(); };

            const fn = new Function('API', wrappedCode);
            fn(safeApi);

        } catch (e: any) {
            if (e.message !== "SIM_COMPLETE" && e.message !== "SIM_TIMEOUT") {
                console.error("Maze User Code Error", e);
                 this.frames.push({ ...this.frames[this.frames.length-1], log: "ERROR: " + e.message });
            }
        }

        return this.frames;
    }
}
