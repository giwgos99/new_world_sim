// ==========================================
// THE VOID ENGINE (Pure Abstract State Math)
// ==========================================

class VoidEngine {
    constructor(numEntities) {
        // The Void randomly decides how many "Dimensions" (properties) exist
        this.D = Math.floor(Math.random() * 5) + 3; // 3 to 7 Dimensions
        
        this.entities = [];
        this.events = [];
        this.totalEvents = 0;

        // Initialize entities with random states in D dimensions
        for (let i = 0; i < numEntities; i++) {
            let states = [];
            for (let d = 0; d < this.D; d++) {
                states.push(Math.random() * 2 - 1); // Range -1 to 1
            }
            this.entities.push({ id: i, states: states });
        }

        // Generate a random mathematical "Affinity Law"
        // This is what defines "closeness" without using spatial distance!
        this.laws = [
            { 
                name: "Harmonic Resonance (Sum matching)", 
                check: (a, b) => {
                    let sumA = a.reduce((acc, val) => acc + val, 0);
                    let sumB = b.reduce((acc, val) => acc + val, 0);
                    return Math.abs(sumA - sumB) < 0.05;
                }
            },
            {
                name: "Cross-Dimensional Mirror (a[0] == b[end])",
                check: (a, b) => Math.abs(a[0] - b[b.length - 1]) < 0.02
            },
            {
                name: "Dot Product Alignment (Vectors point same way)",
                check: (a, b) => {
                    let dot = 0;
                    for(let i=0; i<a.length; i++) dot += a[i]*b[i];
                    return dot > (this.D * 0.4); 
                }
            },
            {
                name: "Orthogonal Silence (Dot Product is 0)",
                check: (a, b) => {
                    let dot = 0;
                    for(let i=0; i<a.length; i++) dot += a[i]*b[i];
                    return Math.abs(dot) < 0.01;
                }
            }
        ];

        this.currentLaw = this.laws[Math.floor(Math.random() * this.laws.length)];
    }

    tick() {
        this.events = []; // Clear old events

        // 1. Mutate states (The entities "wander" through abstract state-space)
        for (let ent of this.entities) {
            for (let d = 0; d < this.D; d++) {
                // Add random noise
                ent.states[d] += (Math.random() - 0.5) * 0.02;
                // Bounce off abstract boundaries [-1, 1]
                if (ent.states[d] > 1) ent.states[d] = 1;
                if (ent.states[d] < -1) ent.states[d] = -1;
            }
        }

        // 2. Check for interactions based purely on abstract math, NOT physical distance!
        // (We only check a random subset each tick for performance)
        for (let i = 0; i < 200; i++) {
            let idxA = Math.floor(Math.random() * this.entities.length);
            let idxB = Math.floor(Math.random() * this.entities.length);
            if (idxA === idxB) continue;

            let entA = this.entities[idxA];
            let entB = this.entities[idxB];

            if (this.currentLaw.check(entA.states, entB.states)) {
                // AN EVENT OCCURRED!
                this.events.push([entA, entB]);
                this.totalEvents++;
                
                // Interaction effect: They exchange some state data (Energy transfer)
                let temp = entA.states[0];
                entA.states[0] = entB.states[0];
                entB.states[0] = temp;
            }
        }
    }
}


// ==========================================
// THE OBSERVER (Three.js WebGL Renderer)
// ==========================================

const engine = new VoidEngine(2000);

// Update UI
document.getElementById('dim-count').innerText = engine.D;
document.getElementById('affinity-law').innerText = engine.currentLaw.name;

// Three.js Setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050510, 0.02); // The dark volumetric fog

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Visual Representation of Entities (Particles)
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(engine.entities.length * 3);
const colors = new Float32Array(engine.entities.length * 3);

// Projection: We map abstract Dimensions 0, 1, 2 to spatial X, Y, Z for our human eyes
const SPACE_SCALE = 30;

for (let i = 0; i < engine.entities.length; i++) {
    let states = engine.entities[i].states;
    // Map D0 -> X, D1 -> Y, D2 -> Z (If D < 3, it defaults to 0)
    positions[i * 3] = (states[0] || 0) * SPACE_SCALE;
    positions[i * 3 + 1] = (states[1] || 0) * SPACE_SCALE;
    positions[i * 3 + 2] = (states[2] || 0) * SPACE_SCALE;

    // Map D3 or D4 to colors (if they exist)
    let r = states[3] ? (states[3] + 1)/2 : 0.2;
    let g = states[4] ? (states[4] + 1)/2 : 0.5;
    let b = states[5] ? (states[5] + 1)/2 : 0.8;

    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({ 
    size: 0.3, 
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(geometry, material);
scene.add(particleSystem);

// Lines to show Events (Resonances)
const eventMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });

// ==========================================
// FREE CAMERA CONTROLS (WASD + Mouse)
// ==========================================
let pitch = 0;
let yaw = 0;
const speed = 0.5;
const keys = { w: false, a: false, s: false, d: false, q: false, e: false };

document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false;
});

// Pointer lock for Mouse Look
document.body.addEventListener('click', () => {
    document.body.requestPointerLock();
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;
        // Clamp pitch to avoid flipping
        pitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, pitch));
    }
});

function updateCamera() {
    // Rotation
    camera.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    
    // Direction vectors
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0); // Absolute up

    // Movement
    if (keys.w) camera.position.addScaledVector(forward, speed);
    if (keys.s) camera.position.addScaledVector(forward, -speed);
    if (keys.d) camera.position.addScaledVector(right, speed);
    if (keys.a) camera.position.addScaledVector(right, -speed);
    if (keys.e) camera.position.addScaledVector(up, speed);
    if (keys.q) camera.position.addScaledVector(up, -speed);
}


// ==========================================
// SIMULATION LOOP
// ==========================================
let activeLines = [];

function animate() {
    requestAnimationFrame(animate);

    // 1. Tick the Void Engine (Abstract Math)
    engine.tick();
    document.getElementById('event-count').innerText = engine.totalEvents;

    // 2. Sync visual particles to abstract states
    const positions = particleSystem.geometry.attributes.position.array;
    for (let i = 0; i < engine.entities.length; i++) {
        let states = engine.entities[i].states;
        // Project abstract N-dimensions to visual 3D
        positions[i * 3] = (states[0] || 0) * SPACE_SCALE;
        positions[i * 3 + 1] = (states[1] || 0) * SPACE_SCALE;
        positions[i * 3 + 2] = (states[2] || 0) * SPACE_SCALE;
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;

    // 3. Render Events (Flashes of Resonance)
    // Clean up old lines
    for(let line of activeLines) {
        line.material.opacity -= 0.05;
        if(line.material.opacity <= 0) {
            scene.remove(line);
        }
    }
    activeLines = activeLines.filter(l => l.material.opacity > 0);

    // Draw new event lines
    for (let [entA, entB] of engine.events) {
        let p1 = new THREE.Vector3(entA.states[0]*SPACE_SCALE, entA.states[1]*SPACE_SCALE, (entA.states[2]||0)*SPACE_SCALE);
        let p2 = new THREE.Vector3(entB.states[0]*SPACE_SCALE, entB.states[1]*SPACE_SCALE, (entB.states[2]||0)*SPACE_SCALE);
        
        let lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        let line = new THREE.Line(lineGeo, eventMaterial.clone());
        scene.add(line);
        activeLines.push(line);
    }

    // 4. Update Observer Camera
    updateCamera();

    // 5. Render
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Ignite the Big Bang
animate();
