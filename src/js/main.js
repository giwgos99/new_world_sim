const canvas = document.getElementById('universe-canvas');
const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true });
const equationDisplay = document.getElementById('equation-display');
const statusDisplay = document.getElementById('status-display');
const generateBtn = document.getElementById('btn-generate');
const autoSearchCheckbox = document.getElementById('auto-search');
const savedList = document.getElementById('saved-list');

if (!gl) alert("WebGL2 is not supported by your browser.");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// ---------------------------------------------------------
// PERSISTENT STORAGE (LocalStorage)
// ---------------------------------------------------------
// Load saved equations from the browser's memory, or start an empty list
let rawSaved = JSON.parse(localStorage.getItem("NewWorld_SavedUniverses")) || [];
let savedEquations = rawSaved.map(item => {
    if (typeof item === 'string') return { eq: item, seed: 0 };
    return item;
});

function renderSavedEquationUI(data) {
    const li = document.createElement("li");
    
    const btnContainer = document.createElement("div");
    btnContainer.className = "li-buttons";
    
    const btn = document.createElement("button");
    btn.className = "load-btn";
    btn.innerText = "LOAD";
    btn.onclick = () => {
        autoSearchCheckbox.checked = false;
        createNewUniverse(data);
        statusDisplay.innerText = "Status: Manually Loaded";
    };
    
    const delBtn = document.createElement("button");
    delBtn.className = "del-btn";
    delBtn.innerText = "X";
    delBtn.onclick = () => {
        savedEquations = savedEquations.filter(e => e !== data);
        localStorage.setItem("NewWorld_SavedUniverses", JSON.stringify(savedEquations));
        li.remove();
    };

    btnContainer.appendChild(btn);
    btnContainer.appendChild(delBtn);
    
    const seedNames = ["STATIC SQUARE", "SINGLE SPARK", "HOLLOW RING", "FOUR CORNERS"];
    li.appendChild(btnContainer);
    
    const seedBadge = document.createElement("div");
    seedBadge.style.color = "#00e5ff";
    seedBadge.style.marginBottom = "5px";
    seedBadge.style.fontWeight = "bold";
    seedBadge.innerText = "[ " + seedNames[data.seed] + " ]";
    
    li.appendChild(seedBadge);
    li.appendChild(document.createTextNode(data.eq));
    savedList.appendChild(li);
}

// Render any existing saved universes when the page loads
savedEquations.forEach(data => renderSavedEquationUI(data));

// ---------------------------------------------------------
// RANDOM MATH GENERATOR (Pure Math Void)
// ---------------------------------------------------------
function generateMath(depth) {
    if (depth <= 0) {
        // Raw matrix indices and completely random numbers. No human concepts.
        const vars = ['val', 'vu', 'vd', 'vl', 'vr', (Math.random() * 2.0).toFixed(3)];
        return vars[Math.floor(Math.random() * vars.length)];
    }
    
    // Pure, unbiased mathematical operators. Absolutely no biology rules.
    const types = ['add', 'mult', 'mod', 'abs', 'fract', 'sin', 'cos', 'tan', 'pow', 'min', 'max'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    if (type === 'add') return `(${generateMath(depth - 1)} + ${generateMath(depth - 1)})`;
    if (type === 'mult') return `(${generateMath(depth - 1)} * ${generateMath(depth - 1)})`;
    if (type === 'mod') return `mod(${generateMath(depth - 1)}, 2.0)`;
    if (type === 'abs') return `abs(${generateMath(depth - 1)})`;
    if (type === 'fract') return `fract(${generateMath(depth - 1)})`;
    if (type === 'sin') return `sin(${generateMath(depth - 1)})`;
    if (type === 'cos') return `cos(${generateMath(depth - 1)})`;
    if (type === 'tan') return `tan(${generateMath(depth - 1)})`;
    if (type === 'pow') return `pow(abs(${generateMath(depth - 1)}), ${generateMath(depth - 1)})`;
    if (type === 'min') return `min(${generateMath(depth - 1)}, ${generateMath(depth - 1)})`;
    if (type === 'max') return `max(${generateMath(depth - 1)}, ${generateMath(depth - 1)})`;
}

// ---------------------------------------------------------
// SHADER BLUEPRINT
// ---------------------------------------------------------
const fragmentShaderTemplate = `#version 300 es
precision highp float;
uniform sampler2D u_prevState;
uniform vec2 u_resolution;
out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 pixel = 1.0 / u_resolution;
    
    // Read My State
    float val = texture(u_prevState, uv).r;
    
    // Read raw matrix indices (The 4 connected cells)
    float vu = texture(u_prevState, uv + vec2(0.0, pixel.y)).r;
    float vd = texture(u_prevState, uv + vec2(0.0, -pixel.y)).r;
    float vl = texture(u_prevState, uv + vec2(-pixel.x, 0.0)).r;
    float vr = texture(u_prevState, uv + vec2(pixel.x, 0.0)).r;
    
    // THE ALIEN LAW OF PHYSICS GOES HERE:
    float next_val = clamp(EQUATION_PLACEHOLDER, 0.0, 1.0);
    
    fragColor = vec4(next_val, next_val, next_val, 1.0);
}
`;

const vertexShaderSource = `#version 300 es
in vec4 a_position;
void main() { gl_Position = a_position; }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
}

const drawFragSource = `#version 300 es
precision highp float;
uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform float u_zoom;
uniform vec2 u_offset;
out vec4 fragColor;
void main() { 
    // Calculate the zoomed and panned coordinate
    vec2 uv = (gl_FragCoord.xy / u_resolution - 0.5) / u_zoom + 0.5 - u_offset;
    
    // If we pan outside the actual universe bounds, draw pure black void
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    // Get the raw physics value (0.0 to 1.0)
    float val = texture(u_tex, uv).r; 
    
    // Soothing Color Palette to prevent eye strain/seizures
    vec3 background = vec3(0.05, 0.08, 0.15); // Dark Navy Blue
    vec3 lifeColor = vec3(0.1, 0.8, 0.7);     // Soft Bioluminescent Teal
    
    // Mix the colors based on the physics value
    vec3 finalColor = mix(background, lifeColor, val);
    
    fragColor = vec4(finalColor, 1.0); 
}
`;
const drawProgram = gl.createProgram();
gl.attachShader(drawProgram, createShader(gl, gl.VERTEX_SHADER, vertexShaderSource));
gl.attachShader(drawProgram, createShader(gl, gl.FRAGMENT_SHADER, drawFragSource));
gl.linkProgram(drawProgram);

function createTextureAndFB(data) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, WIDTH, HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { tex, fb };
}

// ---------------------------------------------------------
// THE BIG BANG (Initial Matter - The Petri Dish)
// ---------------------------------------------------------
let initialData = new Uint8Array(WIDTH * HEIGHT * 4);
function generateBigBang() {
    for(let i=0; i<WIDTH*HEIGHT*4; i+=4) {
        let x = (i/4) % WIDTH; let y = Math.floor((i/4) / WIDTH);
        let cx = WIDTH/2; let cy = HEIGHT/2;
        let val = 0;
        
        if (currentSeedType === 0) { // Dense Square
            if (Math.abs(x - cx) < WIDTH*0.1 && Math.abs(y - cy) < HEIGHT*0.1) {
                val = Math.random() > 0.5 ? 255 : 0;
            }
        } else if (currentSeedType === 1) { // Single Spark
            if (Math.abs(x - cx) < 2 && Math.abs(y - cy) < 2) val = 255;
        } else if (currentSeedType === 2) { // Hollow Ring
            let dist = Math.sqrt((x-cx)*(x-cx) + (y-cy)*(y-cy));
            if (dist > WIDTH*0.1 && dist < WIDTH*0.12) {
                val = Math.random() > 0.5 ? 255 : 0;
            }
        } else if (currentSeedType === 3) { // Four Corners
            if ( (Math.abs(x - cx*0.6) < 2 && Math.abs(y - cy*0.6) < 2) ||
                 (Math.abs(x - cx*1.4) < 2 && Math.abs(y - cy*0.6) < 2) ||
                 (Math.abs(x - cx*0.6) < 2 && Math.abs(y - cy*1.4) < 2) ||
                 (Math.abs(x - cx*1.4) < 2 && Math.abs(y - cy*1.4) < 2) ) val = 255;
        }
        
        initialData[i] = val; initialData[i+1] = val; initialData[i+2] = val; initialData[i+3] = 255;
    }
}

let bufferA = createTextureAndFB(initialData);
let bufferB = createTextureAndFB(null);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

// ---------------------------------------------------------
// UNIVERSE MANAGEMENT
// ---------------------------------------------------------
let currentPhysicsProgram = null;
let currentEquation = "";
let currentSeedType = 0;
let frameCount = 0;
let survivalFrames = 0;

// Variables for the new Edge of Chaos filter
let previousPixelBuffer = new Uint8Array(WIDTH * HEIGHT * 4);
let hasPreviousBuffer = false;

// Track tested equations to never repeat the same physics twice (Stored in RAM)
const testedEquations = new Set();

// Camera Controls for the Observer
let zoom = 1.0;
let offsetX = 0.0;
let offsetY = 0.0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

canvas.addEventListener('wheel', (e) => {
    e.preventDefault(); 
    const zoomSpeed = 0.1;
    if (e.deltaY < 0) zoom *= (1.0 + zoomSpeed);
    else zoom *= (1.0 - zoomSpeed);
    zoom = Math.max(0.5, Math.min(zoom, 50.0));
});

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

window.addEventListener('mouseup', () => { isDragging = false; });

window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        let dx = (e.clientX - lastMouseX) / WIDTH;
        let dy = -(e.clientY - lastMouseY) / HEIGHT; 
        offsetX += dx / zoom;
        offsetY += dy / zoom;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
});

function createNewUniverse(forcedData = null) {
    // Reset camera when a new universe is born
    zoom = 1.0;
    offsetX = 0.0;
    offsetY = 0.0;
    if (forcedData) {
        currentEquation = forcedData.eq;
        currentSeedType = forcedData.seed;
    } else {
        // Keep generating until we find a brand new equation + seed pair
        do {
            currentEquation = generateMath(4); 
            currentSeedType = Math.floor(Math.random() * 4);
        } while (testedEquations.has(currentEquation + "_" + currentSeedType));
        testedEquations.add(currentEquation + "_" + currentSeedType);
    }
    
    const seedNames = ["Static Square", "Single Spark", "Hollow Ring", "Four Corners"];
    equationDisplay.innerText = "Seed: " + seedNames[currentSeedType] + "\nLaw: " + currentEquation;
    
    let fragSource = fragmentShaderTemplate.replace("EQUATION_PLACEHOLDER", currentEquation);
    const vShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, fragSource);
    
    if (!fShader) { createNewUniverse(); return; } 

    const program = gl.createProgram();
    gl.attachShader(program, vShader); gl.attachShader(program, fShader);
    gl.linkProgram(program);
    
    if (currentPhysicsProgram) gl.deleteProgram(currentPhysicsProgram);
    currentPhysicsProgram = program;
    
    generateBigBang();
    gl.bindTexture(gl.TEXTURE_2D, bufferA.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, WIDTH, HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, initialData);
    
    frameCount = 0;
    survivalFrames = 0;
    hasPreviousBuffer = false;
    statusDisplay.innerText = "Status: Running...";
}

function saveUniverse(eq, seedType) {
    // Don't save duplicates
    if (savedEquations.some(e => e.eq === eq && e.seed === seedType)) return;
    
    let newData = { eq: eq, seed: seedType };
    savedEquations.push(newData);
    
    // Keep storage tiny by limiting to 500 saved equations maximum
    if (savedEquations.length > 500) {
        savedEquations.shift(); // Remove the oldest
        savedList.removeChild(savedList.firstChild); // Remove from UI
    }
    
    // Save to browser memory
    localStorage.setItem("NewWorld_SavedUniverses", JSON.stringify(savedEquations));
    
    // Show in UI
    renderSavedEquationUI(newData);
}

const pixelReadBuffer = new Uint8Array(WIDTH * HEIGHT * 4);

function render() {
    if (currentPhysicsProgram) {
        gl.useProgram(currentPhysicsProgram);
        gl.bindFramebuffer(gl.FRAMEBUFFER, bufferB.fb);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, bufferA.tex);
        
        gl.uniform2f(gl.getUniformLocation(currentPhysicsProgram, "u_resolution"), WIDTH, HEIGHT);
        
        let posLoc = gl.getAttribLocation(currentPhysicsProgram, "a_position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(drawProgram);
        gl.bindTexture(gl.TEXTURE_2D, bufferB.tex);
        gl.uniform2f(gl.getUniformLocation(drawProgram, "u_resolution"), WIDTH, HEIGHT);
        gl.uniform1f(gl.getUniformLocation(drawProgram, "u_zoom"), zoom);
        gl.uniform2f(gl.getUniformLocation(drawProgram, "u_offset"), offsetX, offsetY);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        let temp = bufferA; bufferA = bufferB; bufferB = temp;
        
        // ---------------------------------------------------------
        // THE FILTER (Automated God)
        // ---------------------------------------------------------
        if (autoSearchCheckbox.checked) {
            frameCount++;
            survivalFrames++;
            
            // Check viability every 60 frames
            if (frameCount % 60 === 0) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, bufferA.fb);
                gl.readPixels(0, 0, WIDTH, HEIGHT, gl.RGBA, gl.UNSIGNED_BYTE, pixelReadBuffer);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                
                let activity = 0;
                let mass = 0;
                let isCancer = false;
                let pixelsSampled = 0;
                
                // Sample every 4th pixel
                for(let i=0; i<pixelReadBuffer.length; i+=16) {
                    let val = pixelReadBuffer[i];
                    mass += val;
                    pixelsSampled++;
                    
                    // 1. Calculate Activity (Difference from 30 frames ago)
                    if (hasPreviousBuffer) {
                        activity += Math.abs(val - previousPixelBuffer[i]);
                    }
                    
                    // 2. Petri Dish Check (Did it touch the walls?)
                    let pIdx = i / 4;
                    let px = pIdx % WIDTH;
                    let py = Math.floor(pIdx / WIDTH);
                    if (val > 50 && (px < 10 || px > WIDTH - 10 || py < 10 || py > HEIGHT - 10)) {
                        isCancer = true;
                    }
                }
                
                let maxActivity = pixelsSampled * 255;
                let activityRatio = hasPreviousBuffer ? (activity / maxActivity) : 0.05;
                let averageMass = mass / pixelsSampled;
                
                // --- THE EDGE OF CHAOS FILTER ---
                let isDead = (averageMass < 5.0); // Faded away to near-black
                let isFrozen = (hasPreviousBuffer && activityRatio < 0.0005); // Less than 0.05% change — truly frozen crystal
                let isChaos = (hasPreviousBuffer && activityRatio > 0.10); // >10% of the screen is violently flashing
                
                if (isDead || isCancer || isFrozen || isChaos) {
                    createNewUniverse(); // Kill it
                } else {
                    // Save state to compare next time
                    previousPixelBuffer.set(pixelReadBuffer);
                    hasPreviousBuffer = true;
                }
            }
            
            // Only archive if the universe survives ~50 seconds of sustained, non-trivial activity
            if (survivalFrames === 3000) {
                saveUniverse(currentEquation, currentSeedType);
                createNewUniverse(); // Find another one!
            }
        }
    }
    requestAnimationFrame(render);
}

generateBtn.addEventListener('click', () => {
    autoSearchCheckbox.checked = false;
    createNewUniverse();
    statusDisplay.innerText = "Status: Manual Generation";
});

createNewUniverse();
requestAnimationFrame(render);
