// ==========================================
// THE VOID ENGINE (Abstract State Math)
// ==========================================

class VoidEngine {
    constructor(numEntities, config = null) {
        // Apply config or generate random universal constants
        // (We check c_harmonic to ensure we aren't loading an outdated save file)
        if (config && config.c_harmonic !== undefined) {
            this.D = config.D;
            this.c_harmonic = config.c_harmonic;
            this.c_mirror = config.c_mirror;
            this.c_dot = config.c_dot;
            this.c_ortho = config.c_ortho;
        } else {
            this.D = Math.floor(Math.random() * 5) + 3; // 3 to 7 Dimensions
            
            // The "Fine-Tuning" Constants of this specific Universe
            this.c_harmonic = Math.random() * 0.4 + 0.05; // Easier to trigger
            this.c_mirror   = Math.random() * 0.3 + 0.05;
            this.c_dot      = Math.random() * 0.5 + 0.2;
            this.c_ortho    = Math.random() * 0.2 + 0.01;
        }
        
        // State tracking
        this.entities = [];
        this.events = []; // Just for drawing lines this frame
        this.totalEvents = 0;
        this.age = 0;
        this.isStable = false;

        // Initialize entities
        for (let i = 0; i < numEntities; i++) {
            let states = [];
            for (let d = 0; d < this.D; d++) {
                states.push(Math.random() * 2 - 1);
            }
            this.entities.push({ id: i, states: states, bonds: {} });
        }
    }

    tick() {
        this.age++;
        this.events = [];

        // 1. Mutate states & Decay Bonds
        for (let ent of this.entities) {
            for (let d = 0; d < this.D; d++) {
                ent.states[d] += (Math.random() - 0.5) * 0.02; // Random thermal wander
                // Clamp aggressively to prevent Infinity explosions
                if (ent.states[d] > 1) ent.states[d] = 1;
                if (ent.states[d] < -1) ent.states[d] = -1;
            }
            // Memory Management: Decay Adjacency Matrix
            for (let partnerId in ent.bonds) {
                ent.bonds[partnerId] -= 0.01; // Decays over 100 frames
                if (ent.bonds[partnerId] <= 0) delete ent.bonds[partnerId];
            }
        }

        // 2. Physics Interactions: ALL RULES APPLY, BUT EFFECTS VARY BY PARTICLE STATE
        for (let i = 0; i < 400; i++) {
            let idxA = Math.floor(Math.random() * this.entities.length);
            let idxB = Math.floor(Math.random() * this.entities.length);
            if (idxA === idxB) continue;

            let entA = this.entities[idxA];
            let entB = this.entities[idxB];
            let a = entA.states;
            let b = entB.states;

            let triggered = false;

            // LAW 1: Harmonic Resonance
            let sumA = a.reduce((s,v)=>s+v,0);
            let sumB = b.reduce((s,v)=>s+v,0);
            if (Math.abs(sumA - sumB) < this.c_harmonic) {
                // EFFECT: Thermal Averaging (They "stick" together by becoming identical)
                for(let d=0; d<this.D; d++){ let avg = (a[d]+b[d])/2; a[d]=avg; b[d]=avg; }
                triggered = true;
            }

            // LAW 2: Dimensional Mirror (Puzzle Pieces)
            if (Math.abs(a[0] - b[this.D - 1]) < this.c_mirror) {
                // EFFECT: Parasite (A drains B to fuel itself)
                for(let d=0; d<this.D; d++){ a[d] += b[d]*0.1; b[d] -= b[d]*0.1; }
                triggered = true;
            }

            // LAW 3: Dot Product
            let dot = 0;
            for(let d=0; d<this.D; d++) dot += a[d]*b[d];
            
            if (dot > (this.D * this.c_dot)) {
                // EFFECT: Inversion / Repulsion (Pauli Exclusion)
                // Two particles that are too similar violently repel each other
                for(let d=0; d<this.D; d++){ a[d] *= -1.1; b[d] *= -1.1; }
                triggered = true;
            }

            // LAW 4: Orthogonal Silence
            if (Math.abs(dot) < this.c_ortho) {
                // EFFECT: Cross-pollination
                let randD = Math.floor(Math.random() * this.D);
                let t = a[randD]; a[randD] = b[randD]; b[randD] = t;
                triggered = true;
            }

            if (triggered) {
                this.events.push([entA, entB]);
                this.totalEvents++;
                // Strengthen the bond (Memory)
                entA.bonds[entB.id] = (entA.bonds[entB.id] || 0) + 0.5;
                entB.bonds[entA.id] = (entB.bonds[entA.id] || 0) + 0.5;
                if (entA.bonds[entB.id] > 1) entA.bonds[entB.id] = 1;
                if (entB.bonds[entA.id] > 1) entB.bonds[entA.id] = 1;
            }
        }

        // 3. God System Evaluation (The Edge of Chaos)
        if (!this.isStable) {
            if (this.age > 400) { // Evaluate after ~6.5 seconds
                
                let strongBonds = 0;
                for (let ent of this.entities) {
                    for (let partner in ent.bonds) {
                        if (ent.bonds[partner] > 0.8) strongBonds++;
                    }
                }
                // Avoid double counting
                strongBonds = Math.floor(strongBonds / 2);

                // Check for Singularity (Did they all glue into a single white ball?)
                // We measure state-space variance. If it's near zero, they lost all diversity.
                let sumD0 = 0;
                for(let ent of this.entities) sumD0 += ent.states[0];
                let avgD0 = sumD0 / this.entities.length;
                let variance = 0;
                for(let ent of this.entities) variance += Math.pow(ent.states[0] - avgD0, 2);
                variance /= this.entities.length;

                // WHAT IS LIFE? The Edge of Chaos.
                // < 20 strong bonds = A Dead Gas (pure random noise)
                // > 400 strong bonds = A Dead Crystal (too rigidly glued together)
                // variance < 0.1 = A Singularity (all particles perfectly identical)
                if (strongBonds < 20 || strongBonds > 400 || variance < 0.1) {
                    return "DEAD"; 
                } else {
                    this.isStable = true;
                }
            }
        }

        return this.isStable ? "ALIVE" : "EVALUATING";
    }

    getActiveBondCount() {
        let count = 0;
        for (let ent of this.entities) {
            for (let partner in ent.bonds) {
                if (ent.bonds[partner] > 0.5) count++;
            }
        }
        return Math.floor(count / 2);
    }
}


// ==========================================
// ARCHIVE SYSTEM (Sidebar)
// ==========================================
function saveCurrentUniverse() {
    if (!engine) return;
    let saved = JSON.parse(localStorage.getItem('voidArchive')) || [];
    let config = {
        id: Date.now(),
        name: `Void D${engine.D} [C:${engine.c_harmonic.toFixed(2)}]`,
        D: engine.D,
        c_harmonic: engine.c_harmonic,
        c_mirror: engine.c_mirror,
        c_dot: engine.c_dot,
        c_ortho: engine.c_ortho
    };
    saved.push(config);
    localStorage.setItem('voidArchive', JSON.stringify(saved));
    renderArchive();
}

function loadUniverse(id) {
    let saved = JSON.parse(localStorage.getItem('voidArchive')) || [];
    let config = saved.find(u => u.id === id);
    if (config) {
        startUniverse(config);
    }
}

function deleteUniverse(id) {
    let saved = JSON.parse(localStorage.getItem('voidArchive')) || [];
    saved = saved.filter(u => u.id !== id);
    localStorage.setItem('voidArchive', JSON.stringify(saved));
    renderArchive();
}

function renderArchive() {
    const list = document.getElementById('saved-list');
    list.innerHTML = '';
    let saved = JSON.parse(localStorage.getItem('voidArchive')) || [];
    
    // CRITICAL FIX: Delete any old incompatible saves that crash the script
    const validSaves = saved.filter(u => u.c_harmonic !== undefined);
    if (validSaves.length !== saved.length) {
        localStorage.setItem('voidArchive', JSON.stringify(validSaves));
        saved = validSaves;
    }

    saved.forEach(u => {
        let div = document.createElement('div');
        div.className = 'saved-item';
        div.innerHTML = `
            <div class="saved-item-title">${u.name}</div>
            <div style="font-size: 10px; margin-bottom: 5px; color: #888;">
                Constants: [H:${u.c_harmonic.toFixed(2)}, M:${u.c_mirror.toFixed(2)}, D:${u.c_dot.toFixed(2)}]
            </div>
            <div class="saved-actions">
                <button onclick="loadUniverse(${u.id})">LOAD</button>
                <button onclick="deleteUniverse(${u.id})">DEL</button>
            </div>
        `;
        list.appendChild(div);
    });
}

document.getElementById('btn-save').addEventListener('click', saveCurrentUniverse);


// ==========================================
// THE OBSERVER (Three.js WebGL Renderer)
// ==========================================
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050510, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let engine;
let particleSystem;
let autoSaved = false;
const eventMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
let activeLines = [];

function startUniverse(config = null) {
    // Clear old visualizer objects
    if (particleSystem) {
        scene.remove(particleSystem);
        particleSystem.geometry.dispose();
        particleSystem.material.dispose();
    }
    for (let l of activeLines) {
        scene.remove(l);
        l.geometry.dispose();
    }
    activeLines = [];
    autoSaved = false;

    // Create new Engine
    engine = new VoidEngine(2000, config);

    // Update UI
    document.getElementById('dim-count').innerText = engine.D;
    
    // Render the universal constants in UI
    const rulesContainer = document.getElementById('active-rules-container');
    rulesContainer.innerHTML = `
        <span class="highlight-pink">ALL LAWS ACTIVE</span><br>
        <span style="color:#aaa">Universal Constants tuned:</span><br>
        Harmonic = ${engine.c_harmonic.toFixed(3)}<br>
        Mirror = ${engine.c_mirror.toFixed(3)}<br>
        Dot Align = ${engine.c_dot.toFixed(3)}<br>
        Orthogonal = ${engine.c_ortho.toFixed(3)}
    `;

    document.getElementById('status-banner').innerText = "EVALUATING (Finding Life...)";
    document.getElementById('status-banner').style.color = "#ff0";
    document.getElementById('status-banner').style.borderColor = "#ff0";

    // Setup Geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(engine.entities.length * 3);
    const colors = new Float32Array(engine.entities.length * 3);
    
    // Initialize particles slightly visible to avoid instant black screen
    for(let i=0; i<engine.entities.length; i++) {
        let s = engine.entities[i].states;
        positions[i*3] = (s[0] || 0) * 30;
        positions[i*3+1] = (s[1] || 0) * 30;
        positions[i*3+2] = (s[2] || 0) * 30;
        colors[i*3] = 0.5; colors[i*3+1] = 0.5; colors[i*3+2] = 0.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.3, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    
    // Ensure the archive is rendered with the proper engine context
    renderArchive();
}

// ==========================================
// FREE CAMERA & RENDER LOOP
// ==========================================
let pitch = 0, yaw = 0;
const speed = 0.5;
const keys = { w: false, a: false, s: false, d: false, q: false, e: false };

document.addEventListener('keydown', (e) => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', (e) => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });
document.addEventListener('click', (e) => { if (e.target.tagName !== 'BUTTON') document.body.requestPointerLock(); });

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;
        pitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, pitch));
    }
});

function updateCamera() {
    camera.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0);
    if (keys.w) camera.position.addScaledVector(forward, speed);
    if (keys.s) camera.position.addScaledVector(forward, -speed);
    if (keys.d) camera.position.addScaledVector(right, speed);
    if (keys.a) camera.position.addScaledVector(right, -speed);
    if (keys.e) camera.position.addScaledVector(up, speed);
    if (keys.q) camera.position.addScaledVector(up, -speed);
}

function animate() {
    requestAnimationFrame(animate);
    if (!engine) return;

    // 1. Tick Engine
    let status = engine.tick();

    // 2. God System Auto-Restart & Auto-Save
    if (status === "DEAD") {
        document.getElementById('status-banner').innerText = "WIPING DEAD UNIVERSE...";
        startUniverse(); // Auto restart
        return;
    } else if (status === "ALIVE") {
        document.getElementById('status-banner').innerText = "LIFE ARCHIVED! Mining next universe...";
        document.getElementById('status-banner').style.color = "#0f0";
        document.getElementById('status-banner').style.borderColor = "#0f0";
        
        saveCurrentUniverse(); // Auto-save
        startUniverse(); // Immediately wipe and keep mining!
        return;
    }

    // 3. Update UI text
    document.getElementById('event-count').innerText = engine.totalEvents;
    document.getElementById('bond-count').innerText = engine.getActiveBondCount();
    document.getElementById('void-age').innerText = engine.age;

    // 4. Update Particles
    const positions = particleSystem.geometry.attributes.position.array;
    const colors = particleSystem.geometry.attributes.color.array;
    const SPACE_SCALE = 30;

    for (let i = 0; i < engine.entities.length; i++) {
        let states = engine.entities[i].states;
        positions[i*3] = (states[0] || 0) * SPACE_SCALE;
        positions[i*3+1] = (states[1] || 0) * SPACE_SCALE;
        positions[i*3+2] = (states[2] || 0) * SPACE_SCALE;
        colors[i*3] = states[3] ? (states[3]+1)/2 : 0.2;
        colors[i*3+1] = states[4] ? (states[4]+1)/2 : 0.5;
        colors[i*3+2] = states[5] ? (states[5]+1)/2 : 0.8;
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.color.needsUpdate = true;

    // 5. Render Events
    for(let line of activeLines) {
        line.material.opacity -= 0.05;
        if(line.material.opacity <= 0) scene.remove(line);
    }
    activeLines = activeLines.filter(l => l.material.opacity > 0);

    for (let [entA, entB] of engine.events) {
        let p1 = new THREE.Vector3(entA.states[0]*SPACE_SCALE, entA.states[1]*SPACE_SCALE, (entA.states[2]||0)*SPACE_SCALE);
        let p2 = new THREE.Vector3(entB.states[0]*SPACE_SCALE, entB.states[1]*SPACE_SCALE, (entB.states[2]||0)*SPACE_SCALE);
        let lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        let line = new THREE.Line(lineGeo, eventMaterial.clone());
        scene.add(line);
        activeLines.push(line);
    }

    updateCamera();
    renderer.render(scene, camera);
}

// Start the first universe
startUniverse();
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
