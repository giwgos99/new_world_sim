// ==========================================
// AST MATH GENERATOR
// ==========================================
function generateMath(depth, vars) {
    if (depth <= 0 || Math.random() < 0.4) {
        if (Math.random() < 0.4) return (Math.random() * 2 - 1).toFixed(3); // Random constant
        return vars[Math.floor(Math.random() * vars.length)]; // Random variable
    }
    // Removed division (/) to prevent instant Infinity/NaN explosions
    const ops = ['+', '-', '*']; 
    const funcs = ['Math.sin', 'Math.cos', 'Math.abs'];
    
    if (Math.random() < 0.3) {
        let f = funcs[Math.floor(Math.random() * funcs.length)];
        return `${f}(${generateMath(depth - 1, vars)})`;
    } else {
        let o = ops[Math.floor(Math.random() * ops.length)];
        return `(${generateMath(depth - 1, vars)} ${o} ${generateMath(depth - 1, vars)})`;
    }
}


// ==========================================
// THE VOID ENGINE (AST Evaluator)
// ==========================================

class VoidEngine {
    constructor(numEntities, config = null) {
        this.rules = [];
        
        if (config && config.rules) {
            this.D = config.D;
            // Compile saved string formulas back into native JS functions
            this.rules = config.rules.map(r => ({
                triggerStr: r.triggerStr,
                effectAStr: r.effectAStr,
                effectBStr: r.effectBStr,
                triggerFunc: new Function("a", "b", r.triggerStr),
                effectFunc: new Function("a", "b", "D", `for(let d=0; d<D; d++) { let tA = ${r.effectAStr}; let tB = ${r.effectBStr}; a[d]=tA; b[d]=tB; }`)
            }));
        } else {
            this.D = Math.floor(Math.random() * 6) + 5; // Increased: 5 to 10 Dimensions!
            let numRules = Math.floor(Math.random() * 3) + 2; // 2 to 4 AST equations
            
            // Build the variable pools available to the AST Generator
            let triggerVars = [];
            for(let d=0; d<this.D; d++) { triggerVars.push(`a[${d}]`); triggerVars.push(`b[${d}]`); }
            
            // Effect vars allow cross-dimensional bleeding! a[(d+1)%D]
            let effectVars = ["a[d]", "b[d]", "a[(d+1)%D]", "b[(d+1)%D]"];
            
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
                ent.states[d] += (Math.random() - 0.5) * 0.02; // Thermal wander
                if (isNaN(ent.states[d])) ent.states[d] = 0; // Fix AST explosion NaNs instantly
                if (ent.states[d] > 1) ent.states[d] = 1;
                if (ent.states[d] < -1) ent.states[d] = -1;
            }
            for (let partnerId in ent.bonds) {
                ent.bonds[partnerId] -= 0.01;
                if (ent.bonds[partnerId] <= 0) delete ent.bonds[partnerId];
            }
        }

        // 2. Physics Interactions: Using pure AST Generated Math!
        for (let i = 0; i < 400; i++) {
            let idxA = Math.floor(Math.random() * this.entities.length);
            let idxB = Math.floor(Math.random() * this.entities.length);
            if (idxA === idxB) continue;

            let entA = this.entities[idxA];
            let entB = this.entities[idxB];
            let triggered = false;

            for (let r of this.rules) {
                try {
                    // Execute the dynamic AST boolean
                    if (r.triggerFunc(entA.states, entB.states)) {
                        // Execute the dynamic AST effect
                        r.effectFunc(entA.states, entB.states, this.D);
                        triggered = true;
                    }
                } catch(e) {
                    // If the math explodes, we ignore it. The universe will fail the life filter anyway.
                }
            }

            if (triggered) {
                this.events.push([entA, entB]);
                this.totalEvents++;
                entA.bonds[entB.id] = (entA.bonds[entB.id] || 0) + 0.5;
                entB.bonds[entA.id] = (entB.bonds[entA.id] || 0) + 0.5;
                if (entA.bonds[entB.id] > 1) entA.bonds[entB.id] = 1;
                if (entB.bonds[entA.id] > 1) entB.bonds[entA.id] = 1;
            }
        }

        // 3. God System Evaluation (The Edge of Chaos)
        if (!this.isStable) {
            if (this.age > 250) { // Speed up mining: Evaluate after ~4 seconds
                
                let strongBonds = 0;
                for (let ent of this.entities) {
                    for (let partner in ent.bonds) {
                        if (ent.bonds[partner] > 0.8) strongBonds++;
                    }
                }
                strongBonds = Math.floor(strongBonds / 2);

                // Variance Check
                let sumD0 = 0;
                for(let ent of this.entities) sumD0 += ent.states[0];
                let avgD0 = sumD0 / this.entities.length;
                let variance = 0;
                for(let ent of this.entities) variance += Math.pow(ent.states[0] - avgD0, 2);
                variance /= this.entities.length;

                // WHAT IS AST LIFE? 
                if (strongBonds < 20 || strongBonds > 300 || variance < 0.1 || isNaN(variance)) {
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
        name: `AST Void D${engine.D} [Bonds: ${engine.getActiveBondCount()}]`,
        D: engine.D,
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
    
    // Clear legacy incompatible saves
    const validSaves = saved.filter(u => u.rules !== undefined);
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
                Rules: ${u.rules.length}
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
document.getElementById('btn-resume-mining').addEventListener('click', () => {
    isMining = true;
    startUniverse();
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
const eventMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
let activeLines = [];

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

    // Create new Engine
    engine = new VoidEngine(2000, config);

    // Update UI
    document.getElementById('dim-count').innerText = engine.D;
    
    // Render the AST Math Strings
    const rulesContainer = document.getElementById('active-rules-container');
    rulesContainer.innerHTML = engine.rules.map((r, i) => `
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

    // Setup Geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(engine.entities.length * 3);
    const colors = new Float32Array(engine.entities.length * 3);
    
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

    let status = engine.tick();

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

    // Update Particles
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

    // Render Events
    for(let line of activeLines) {
        line.material.opacity -= 0.05;
        if(line.material.opacity <= 0) {
            scene.remove(line);
            line.geometry.dispose();
            if (line.material) line.material.dispose();
        }
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

startUniverse();
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
