// ==========================================
// AST MATH GENERATOR
// ==========================================
function generateMath(depth, vars) {
    if (depth <= 0 || Math.random() < 0.25) {
        if (Math.random() < 0.4) {
            let sign = Math.random() < 0.5 ? 1 : -1;
            let exp = Math.random() * 10 - 5; // Allows constants from 0.00001 up to 100,000
            return (sign * Math.pow(10, exp)).toFixed(4); 
        }
        return vars[Math.floor(Math.random() * vars.length)]; // Random variable
    }
    // The math is now fully chaotic. No safety nets. Division, powers, and logs allowed.
    const ops = ['+', '-', '*', '/', '%']; 
    const funcs = ['Math.sin', 'Math.cos', 'Math.abs', 'Math.tanh', 'Math.sign', 'Math.exp', 'Math.log'];
    // Special forms that need wrapping (sqrt of abs to prevent NaN)
    const specialFuncs = ['sqrtabs', 'mod'];
    
    let roll = Math.random();
    if (roll < 0.1) {
        // Special forms (10% chance)
        let sf = specialFuncs[Math.floor(Math.random() * specialFuncs.length)];
        if (sf === 'sqrtabs') return `Math.sqrt(Math.abs(${generateMath(depth - 1, vars)}))`;
        if (sf === 'mod') return `((${generateMath(depth - 1, vars)} % 2.0 + 2.0) % 2.0 - 1.0)`;
    } else if (roll < 0.4) {
        // Unary function (30% chance)
        let f = funcs[Math.floor(Math.random() * funcs.length)];
        return `${f}(${generateMath(depth - 1, vars)})`;
    }
    // Binary operator (60% chance)
    let o = ops[Math.floor(Math.random() * ops.length)];
    return `(${generateMath(depth - 1, vars)} ${o} ${generateMath(depth - 1, vars)})`;    
}


// ==========================================
// THE VOID ENGINE (AST Evaluator)
// ==========================================

class VoidEngine {
    constructor(numEntities, config = null) {
        this.rules = [];
        
        if (config && config.rules) {
            this.D = config.D;
            // Restore Universal Constants from saved config
            this.interactionsPerTick = config.interactionsPerTick || 400;
            this.initialState = config.initialState || 'chaos';
            
            // Compile saved string formulas back into native JS functions
            this.rules = config.rules.map(r => ({
                triggerStr: r.triggerStr,
                effectAStr: r.effectAStr,
                effectBStr: r.effectBStr,
                triggerFunc: new Function("a", "b", r.triggerStr),
                effectFunc: new Function("a", "b", "D", `for(let d=0; d<D; d++) { let tA = ${r.effectAStr}; let tB = ${r.effectBStr}; a[d]=tA; b[d]=tB; }`)
            }));
        } else {
            this.D = Math.floor(Math.random() * 18) + 3; // 3 to 20 Potential Dimensions
            let numRules = Math.floor(Math.random() * 3) + 2; // 2 to 4 AST equations
            
            // --- RANDOMIZED UNIVERSAL CONSTANTS ---
            // These are the ONLY hardcoded scaffolding. Each universe gets random values.
            this.interactionsPerTick = Math.floor(Math.random() * 900) + 100; // 100 to 1000
            
            // Initial State: chaos (scattered) vs singularity (Big Bang from exactly 0)
            this.initialState = Math.random() > 0.5 ? 'chaos' : 'singularity';
            
            // Build the variable pools available to the AST Generator
            let triggerVars = [];
            for(let d=0; d<this.D; d++) { triggerVars.push(`a[${d}]`); triggerVars.push(`b[${d}]`); }
            
            // Effect vars allow cross-dimensional bleeding with wider reach
            let effectVars = ["a[d]", "b[d]", "a[(d+1)%D]", "b[(d+1)%D]", "a[(d+2)%D]", "b[(d+2)%D]"];
            
            for (let i = 0; i < numRules; i++) {
                // Generate raw math text
                let tStr = `return (${generateMath(4, triggerVars)}) > 0.5;`;
                let eAStr = generateMath(3, effectVars);
                let eBStr = generateMath(3, effectVars);
                
                try {
                    // Compile text into hyper-fast native JS code
                    this.rules.push({
                        triggerStr: tStr,
                        effectAStr: eAStr,
                        effectBStr: eBStr,
                        triggerFunc: new Function("a", "b", tStr),
                        effectFunc: new Function("a", "b", "D", `for(let d=0; d<D; d++) { let tA = ${eAStr}; let tB = ${eBStr}; a[d]=tA; b[d]=tB; }`)
                    });
                } catch(e) {
                    console.error("Math Generator built an invalid syntax tree. Skipping rule.");
                }
            }
        }
        
        // State tracking
        this.entities = [];
        this.events = [];
        this.totalEvents = 0;
        this.age = 0;
        this.isStable = false;

        // Initialize entities
        for (let i = 0; i < numEntities; i++) {
            let states = [];
            for (let d = 0; d < this.D; d++) {
                if (this.initialState === 'chaos') {
                    states.push(Math.random() * 2 - 1);
                } else {
                    states.push(0.0); // Big Bang Singularity
                }
            }
            this.entities.push({ id: i, states: states, bonds: {} });
        }
    }

    tick() {
        this.age++;
        this.events = [];

        // 1. Decay Bonds (The Tracer Dye for the Observer Screen)
        for (let ent of this.entities) {
            for (let partnerId in ent.bonds) {
                ent.bonds[partnerId] -= 0.01; // OBS_BOND_DECAY
                if (ent.bonds[partnerId] <= 0) delete ent.bonds[partnerId];
            }
        }

        // 2. Physics Interactions: Using pure AST Generated Math!
        for (let i = 0; i < this.interactionsPerTick; i++) {
            let idxA = Math.floor(Math.random() * this.entities.length);
            let idxB = Math.floor(Math.random() * this.entities.length);
            if (idxA === idxB) continue;
            
            let entA = this.entities[idxA];
            let entB = this.entities[idxB];
            let triggered = false;

            for (let r of this.rules) {
                try {
                    if (r.triggerFunc(entA.states, entB.states)) {
                        r.effectFunc(entA.states, entB.states, this.D);
                        triggered = true;
                    }
                } catch(e) {
                    // If the math explodes, we ignore it.
                }
            }

            if (triggered) {
                this.events.push([entA, entB]);
                this.totalEvents++;
                entA.bonds[entB.id] = (entA.bonds[entB.id] || 0) + this.bondIncrement;
                entB.bonds[entA.id] = (entB.bonds[entA.id] || 0) + this.bondIncrement;
                if (entA.bonds[entB.id] > this.bondCap) entA.bonds[entB.id] = this.bondCap;
                if (entB.bonds[entA.id] > this.bondCap) entB.bonds[entA.id] = this.bondCap;
            }
        }

        // 3. God System Evaluation (The Edge of Chaos) — v0.5 Ultimate Filter
        if (!this.isStable) {
            if (this.age === 400 || this.age === 500) {
                
                // --- BOND COUNT & NETWORK TOPOLOGY ---
                let strongBonds = 0;
                let maxDegree = 0;
                for (let ent of this.entities) {
                    let degree = 0;
                    for (let partner in ent.bonds) {
                        if (ent.bonds[partner] > this.bondCap * 0.8) {
                            strongBonds++;
                            degree++;
                        }
                    }
                    if (degree > maxDegree) maxDegree = degree;
                }
                strongBonds = Math.floor(strongBonds / 2);

                // --- MULTI-DIMENSIONAL VARIANCE ---
                let diverseDims = 0;
                let totalVariance = 0;
                for (let d = 0; d < this.D; d++) {
                    let sum = 0;
                    for (let ent of this.entities) sum += ent.states[d];
                    let avg = sum / this.entities.length;
                    let dimVar = 0;
                    for (let ent of this.entities) dimVar += Math.pow(ent.states[d] - avg, 2);
                    dimVar /= this.entities.length;
                    totalVariance += dimVar;
                    if (dimVar > 0.1) diverseDims++; 
                }
                let avgVariance = totalVariance / this.D;

                // --- SPATIAL DISTRIBUTION CHECK ---
                let spreadAxes = 0;
                for (let d = 0; d < this.D; d++) {
                    let minV = Infinity, maxV = -Infinity;
                    for (let ent of this.entities) {
                        if (ent.states[d] < minV) minV = ent.states[d];
                        if (ent.states[d] > maxV) maxV = ent.states[d];
                    }
                    if ((maxV - minV) > 0.5) spreadAxes++; 
                }

                if (isNaN(avgVariance)) return "DEAD";

                // Snapshots for Time-Based check
                if (this.age === 400) {
                    this.history_variance = avgVariance;
                    
                    // Track microscopic bond persistence
                    this.history_bond_set = new Set();
                    for (let ent of this.entities) {
                        for (let partner in ent.bonds) {
                            if (ent.bonds[partner] > this.bondCap * 0.8) {
                                let edgeId = ent.id < partner ? `${ent.id}-${partner}` : `${partner}-${ent.id}`;
                                this.history_bond_set.add(edgeId);
                            }
                        }
                    }
                    return null; // Keep waiting
                }

                if (this.age === 500) {
                    let varianceDelta = Math.abs(avgVariance - this.history_variance);
                    
                    // Calculate Microscopic Bond Persistence
                    let persistentBonds = 0;
                    let currentBonds = new Set();
                    for (let ent of this.entities) {
                        for (let partner in ent.bonds) {
                            if (ent.bonds[partner] > this.bondCap * 0.8) {
                                let edgeId = ent.id < partner ? `${ent.id}-${partner}` : `${partner}-${ent.id}`;
                                currentBonds.add(edgeId);
                            }
                        }
                    }
                    for (let edge of currentBonds) {
                        if (this.history_bond_set.has(edge)) persistentBonds++;
                    }
                    let oldTotal = this.history_bond_set.size;
                    let persistenceRatio = oldTotal > 0 ? (persistentBonds / oldTotal) : 0;

                    // --- THE VERDICT (v0.6 - Microscopic Persistence Filter) ---
                    
                    // 1. Crystal Check (Frozen)
                    // If 98%+ of bonds persisted and variance barely moved, it's a dead crystal.
                    if (persistenceRatio > 0.98 && varianceDelta < 0.005) return "DEAD"; 
                    
                    // 2. Gas Check (Chaotic Noise)
                    // If less than 20% of bonds persisted, the structure is constantly dissolving. Pure noise.
                    if (persistenceRatio < 0.20) return "DEAD"; 
                    
                    // 3. Network Volume Check
                    let minAllowedBonds = this.entities.length * 0.01; 
                    let maxAllowedBonds = this.entities.length * 0.5;  
                    if (strongBonds < minAllowedBonds || strongBonds > maxAllowedBonds) return "DEAD";
                    
                    // 4. Scale-Free / Complexity Check
                    if (maxDegree < 3 || maxDegree > this.entities.length * 0.25) return "DEAD";

                    // 5. Dimensionality Check
                    if (diverseDims < Math.floor(this.D * 0.6) || avgVariance < 0.05) return "DEAD"; 
                    if (spreadAxes < 3) return "DEAD"; 
                    
                    this.isStable = true;
                }
            } else if (this.age > 500) {
                // If it wasn't stable by 500, kill it (shouldn't reach here if verdict worked)
                if (!this.isStable) return "DEAD";
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
        name: `AST Void D${engine.D} Bonds:${engine.getActiveBondCount()}`,
        D: engine.D,
        // Save Universal Constants so the universe can be perfectly reproduced
        interactionsPerTick: engine.interactionsPerTick,
        initialState: engine.initialState,
        entityCount: engine.entities.length,
        rules: engine.rules.map(r => ({
            triggerStr: r.triggerStr,
            effectAStr: r.effectAStr,
            effectBStr: r.effectBStr
        }))
    };
    saved.push(config);
    localStorage.setItem('voidArchive', JSON.stringify(saved));
    renderArchive();
}

function loadUniverse(id) {
    let saved = JSON.parse(localStorage.getItem('voidArchive')) || [];
    let config = saved.find(u => u.id === id);
    if (config) {
        loadedUniverseId = id;
        startUniverse(config);
        renderArchive(); // Re-render to show highlight
    }
}

function deleteUniverse(id) {
    let saved = JSON.parse(localStorage.getItem('voidArchive')) || [];
    saved = saved.filter(u => u.id !== id);
    localStorage.setItem('voidArchive', JSON.stringify(saved));
    if (loadedUniverseId === id) loadedUniverseId = null;
    renderArchive();
}

function renameUniverse(id) {
    let saved = JSON.parse(localStorage.getItem('voidArchive')) || [];
    let universe = saved.find(u => u.id === id);
    if (!universe) return;
    let newName = prompt('Rename universe:', universe.name);
    if (newName && newName.trim()) {
        universe.name = newName.trim();
        localStorage.setItem('voidArchive', JSON.stringify(saved));
        renderArchive();
    }
}

function renderArchive() {
    const list = document.getElementById('saved-list');
    list.innerHTML = '';
    let saved = JSON.parse(localStorage.getItem('voidArchive')) || [];
    
    // Clear legacy incompatible saves
    const validSaves = saved.filter(u => u.rules !== undefined);
    if (validSaves.length !== saved.length) {
        localStorage.setItem('voidArchive', JSON.stringify(validSaves));
        saved = validSaves;
    }

    saved.forEach(u => {
        let div = document.createElement('div');
        div.className = 'saved-item';
        // Highlight the currently loaded universe
        if (loadedUniverseId === u.id) {
            div.classList.add('saved-item-active');
        }
        div.innerHTML = `
            <div class="saved-item-title">${u.name}</div>
            <div style="font-size: 10px; margin-bottom: 5px; color: #888;">
                Rules: ${u.rules.length}${u.boundaryMode ? ' | ' + u.boundaryMode : ''}
            </div>
            <div class="saved-actions">
                <button onclick="loadUniverse(${u.id})">LOAD</button>
                <button onclick="renameUniverse(${u.id})">RENAME</button>
                <button onclick="deleteUniverse(${u.id})">DEL</button>
            </div>
        `;
        list.appendChild(div);
    });
}

document.getElementById('btn-save').addEventListener('click', saveCurrentUniverse);
document.getElementById('btn-resume-mining').addEventListener('click', () => {
    isMining = true;
    loadedUniverseId = null;
    startUniverse();
    renderArchive();
});


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
let isMining = true;
let ticksPerFrame = 1; // Speed control: how many simulation ticks per animation frame
let maxEventLines = 20; // Controllable via slider: how many bond lines to render
const eventMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
let activeLines = [];
let projDims = [0, 1, 2]; // Which dimensions map to X, Y, Z (auto-updated)
let loadedUniverseId = null; // Track which saved universe is currently loaded

function startUniverse(config = null) {
    if (particleSystem) {
        scene.remove(particleSystem);
        particleSystem.geometry.dispose();
        particleSystem.material.dispose();
    }
    for (let l of activeLines) {
        scene.remove(l);
        l.geometry.dispose();
        if (l.material) l.material.dispose();
    }
    activeLines = [];
    autoSaved = false;

    // Create new Engine with random entity count (or saved count)
    let entityCount = config ? (config.entityCount || 2000) : (Math.floor(Math.random() * 1500) + 500); // 500 to 2000
    engine = new VoidEngine(entityCount, config);

    // Update UI
    // Calculate "Effective Dimensions" (Dimensions with variance > 0.05)
    let effectiveDims = 0;
    for (let d = 0; d < engine.D; d++) {
        let sum = 0;
        for (let ent of engine.entities) sum += ent.states[d] || 0;
        let avg = sum / engine.entities.length;
        let variance = 0;
        for (let ent of engine.entities) variance += Math.pow((ent.states[d] || 0) - avg, 2);
        variance /= engine.entities.length;
        if (variance > 0.05) effectiveDims++;
    }

    document.getElementById('dim-count').innerText = `${effectiveDims} (of ${engine.D})`;
    
    // Show Universal Constants
    const constantsHtml = `
        <div style="margin: 8px 0; padding: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); font-size: 10px; line-height: 1.6;">
            <strong style="color:#ff0">Universal Constants:</strong><br>
            Entities: <span style="color:#0ff">${engine.entities.length}</span> |
            Origin: <span style="color:#0ff">${engine.initialState}</span><br>
            Interactions/Tick: <span style="color:#0ff">${engine.interactionsPerTick}</span>
        </div>
    `;
    
    // Render the AST Math Strings
    const rulesContainer = document.getElementById('active-rules-container');
    rulesContainer.innerHTML = constantsHtml + engine.rules.map((r, i) => `
        <div style="margin-bottom: 12px; line-height: 1.4;">
            <strong style="color:#0ff">R${i+1} Trigger:</strong><br> <span style="color:#aaa">${r.triggerStr}</span><br>
            <strong style="color:#f0f">R${i+1} Effect A:</strong><br> <span style="color:#aaa">a[d] = ${r.effectAStr}</span><br>
            <strong style="color:#f0f">R${i+1} Effect B:</strong><br> <span style="color:#aaa">b[d] = ${r.effectBStr}</span>
        </div>
    `).join('');

    if (config) {
        isMining = false;
        document.getElementById('status-banner').innerText = "OBSERVING SAVED UNIVERSE";
        document.getElementById('status-banner').style.color = "#0ff";
        document.getElementById('status-banner').style.borderColor = "#0ff";
    } else {
        isMining = true;
        document.getElementById('status-banner').innerText = "EVALUATING (Compiling Math...)";
        document.getElementById('status-banner').style.color = "#ff0";
        document.getElementById('status-banner').style.borderColor = "#ff0";
    }

    // Reset projection dims
    projDims = [0, 1, 2];

    // Setup Geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(engine.entities.length * 3);
    const colors = new Float32Array(engine.entities.length * 3);
    const sizes = new Float32Array(engine.entities.length);
    
    for(let i=0; i<engine.entities.length; i++) {
        let s = engine.entities[i].states;
        positions[i*3] = (s[0] || 0) * 30;
        positions[i*3+1] = (s[1] || 0) * 30;
        positions[i*3+2] = (s[2] || 0) * 30;
        colors[i*3] = 0.5; colors[i*3+1] = 0.5; colors[i*3+2] = 0.5;
        sizes[i] = 1.0;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom shader material for variable-size particles
    const material = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            varying float vSize;
            void main() {
                vColor = color;
                vSize = size;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (150.0 / -mvPosition.z);
                gl_PointSize = clamp(gl_PointSize, 0.0, 12.0); // Allow 0 size
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vSize;
            void main() {
                if (vSize < 0.1) discard; // Invisible if 0 bonds
                
                // Hard circle with thin soft edge (crisp, not blurry)
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                if (dist > 0.45) discard;
                float alpha = 1.0 - smoothstep(0.35, 0.45, dist);
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    
    renderArchive();
}

// ==========================================
// FREE CAMERA & RENDER LOOP
// ==========================================
let pitch = 0, yaw = 0;
const speed = 0.5;
const keys = { w: false, a: false, s: false, d: false, q: false, e: false };

document.getElementById('btn-reset-cam').addEventListener('click', (e) => {
    e.stopPropagation(); // prevent locking pointer
    camera.position.set(0, 0, 20);
    pitch = 0;
    yaw = 0;
});

document.addEventListener('keydown', (e) => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', (e) => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });
document.querySelector('canvas').addEventListener('click', () => { document.body.requestPointerLock(); });

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

// Auto-detect best 3 dimensions for projection (most variance = most interesting)
function updateProjectionDims() {
    if (!engine || engine.D <= 3) {
        projDims = [0, 1, 2];
        return;
    }
    // Calculate variance per dimension
    let dimVariances = [];
    for (let d = 0; d < engine.D; d++) {
        let sum = 0;
        for (let ent of engine.entities) sum += ent.states[d];
        let avg = sum / engine.entities.length;
        let v = 0;
        for (let ent of engine.entities) v += Math.pow(ent.states[d] - avg, 2);
        dimVariances.push({ dim: d, var: v / engine.entities.length });
    }
    // Sort by variance descending, pick top 3
    dimVariances.sort((a, b) => b.var - a.var);
    projDims = [dimVariances[0].dim, dimVariances[1].dim, dimVariances[2].dim];
}

function animate() {
    requestAnimationFrame(animate);
    if (!engine) return;

    // Run multiple ticks per frame (speed control)
    let status = "EVALUATING";
    for (let t = 0; t < ticksPerFrame; t++) {
        status = engine.tick();
        if (status === "DEAD" || status === "ALIVE") break;
    }

    if (isMining) {
        // God System Auto-Restart & Auto-Save
        if (status === "DEAD") {
            document.getElementById('status-banner').innerText = "WIPING DEAD UNIVERSE...";
            startUniverse(); 
            return;
        } else if (status === "ALIVE") {
            document.getElementById('status-banner').innerText = "LIFE ARCHIVED! Mining next universe...";
            document.getElementById('status-banner').style.color = "#0f0";
            document.getElementById('status-banner').style.borderColor = "#0f0";
            
            if (!autoSaved) {
                saveCurrentUniverse(); 
                autoSaved = true;
            }
            startUniverse(); // IMMEDIATELY CONTINUE MINING
            return;
        }
    } else {
        // Observer Mode
        if (status === "DEAD") {
            document.getElementById('status-banner').innerText = "OBSERVING: Universe Collapsed";
            document.getElementById('status-banner').style.color = "#f00";
        } else if (status === "ALIVE") {
            document.getElementById('status-banner').innerText = "OBSERVING: Stable Universe";
            document.getElementById('status-banner').style.color = "#0f0";
        }
    }

    // UI Updates
    document.getElementById('event-count').innerText = engine.totalEvents;
    document.getElementById('bond-count').innerText = engine.getActiveBondCount();
    document.getElementById('void-age').innerText = engine.age;

    // Auto-update projection every 60 frames to find best viewing dimensions
    if (engine.age % 60 === 0) updateProjectionDims();

    // Update Particles — using auto-projected best dimensions
    const positions = particleSystem.geometry.attributes.position.array;
    const colors = particleSystem.geometry.attributes.color.array;
    const sizes = particleSystem.geometry.attributes.size.array;
    const SPACE_SCALE = 30;
    const dX = projDims[0], dY = projDims[1], dZ = projDims[2];

    for (let i = 0; i < engine.entities.length; i++) {
        let ent = engine.entities[i];
        let states = ent.states;
        // Project using the 3 most interesting dimensions
        positions[i*3]   = (states[dX] || 0) * SPACE_SCALE;
        positions[i*3+1] = (states[dY] || 0) * SPACE_SCALE;
        positions[i*3+2] = (states[dZ] || 0) * SPACE_SCALE;
        
        // Color from higher dimensions (use whichever dims are NOT used for position)
        let colorDims = [];
        for (let cd = 0; cd < engine.D; cd++) {
            if (cd !== dX && cd !== dY && cd !== dZ) colorDims.push(cd);
        }
        colors[i*3]   = colorDims[0] !== undefined ? (states[colorDims[0]]+1)/2 : 0.2;
        colors[i*3+1] = colorDims[1] !== undefined ? (states[colorDims[1]]+1)/2 : 0.5;
        colors[i*3+2] = colorDims[2] !== undefined ? (states[colorDims[2]]+1)/2 : 0.8;
        
        // Dynamic particle size based on bond count (more bonds = bigger = more visible)
        let bondCount = Object.keys(ent.bonds).length;
        sizes[i] = bondCount > 0 ? (1.0 + bondCount * 0.5) : 0.0;
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.color.needsUpdate = true;
    particleSystem.geometry.attributes.size.needsUpdate = true;

    // Render Event Lines — THROTTLED: only top N strongest interactions
    // Fade existing lines (4x faster than before)
    for(let line of activeLines) {
        line.material.opacity -= 0.2;
        if(line.material.opacity <= 0) {
            scene.remove(line);
            line.geometry.dispose();
            if (line.material) line.material.dispose();
        }
    }
    activeLines = activeLines.filter(l => l.material.opacity > 0);

    // Only render the top maxEventLines interactions (by bond strength)
    let sortedEvents = engine.events.slice();
    if (sortedEvents.length > maxEventLines) {
        // Score each event by the bond strength between the two entities
        sortedEvents.sort((a, b) => {
            let strengthA = (a[0].bonds[a[1].id] || 0);
            let strengthB = (b[0].bonds[b[1].id] || 0);
            return strengthB - strengthA;
        });
        sortedEvents = sortedEvents.slice(0, maxEventLines);
    }

    for (let [entA, entB] of sortedEvents) {
        let p1 = new THREE.Vector3(entA.states[dX]*SPACE_SCALE, entA.states[dY]*SPACE_SCALE, (entA.states[dZ]||0)*SPACE_SCALE);
        let p2 = new THREE.Vector3(entB.states[dX]*SPACE_SCALE, entB.states[dY]*SPACE_SCALE, (entB.states[dZ]||0)*SPACE_SCALE);
        let lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        let line = new THREE.Line(lineGeo, eventMaterial.clone());
        scene.add(line);
        activeLines.push(line);
    }

    updateCamera();
    renderer.render(scene, camera);
}

startUniverse();
animate();

// Speed slider control
document.getElementById('speed-slider').addEventListener('input', (e) => {
    ticksPerFrame = parseInt(e.target.value);
    document.getElementById('speed-label').innerText = ticksPerFrame;
});

// Bond lines slider control
document.getElementById('lines-slider').addEventListener('input', (e) => {
    maxEventLines = parseInt(e.target.value);
    document.getElementById('lines-label').innerText = maxEventLines;
});

// Update projection dims display in the animate loop
setInterval(() => {
    const projEl = document.getElementById('proj-dims');
    if (projEl) projEl.innerText = projDims.join(', ');
}, 500);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
