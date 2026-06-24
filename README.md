# The Quantum Void

## What is this?
**The Quantum Void** is an autonomous, mathematical Multiverse Sandbox and "Life-Mining" engine. 

Instead of simulating creatures walking on a 2D plane with standard physics, this engine simulates the fundamental fabric of an abstract reality. It strips away Euclidean space, replacing physical positions with N-dimensional state arrays. It relentlessly generates random universes, compiles completely new laws of physics for them on the fly, and tests them to see if complex, self-sustaining structures emerge.

## Why did I build this?
Most Artificial Life simulations suffer from **Designer Bias**. 

When we explicitly program biological variables like `health`, `age`, or `hunger`, or when we reward a neural network specifically for "walking forward", we force the simulation to obey our preconceived notions of what life should look like. 

Furthermore, when we hardcode the *laws of physics* (like gravity or solid body collision), we trap the simulation inside the limits of human imagination. To achieve true emergence, the phenomenon must exist independently.

The Quantum Void was built to escape this bias. Instead of evolving life within a rigid, human-designed world, the engine evolves the universe itself to find the rare mathematical conditions that naturally breed life.

## What does it do?
1. **The Autonomous Math Generator (AST):** Every time a universe boots up, the engine randomly writes raw mathematical equations from scratch using a recursive Abstract Syntax Tree generator. It snaps together random variables (up to 10 Dimensions), math operators, and trigonometric functions to invent completely novel laws of thermodynamics.
2. **The Compiler:** It takes those raw text strings and compiles them into native JavaScript functions instantaneously.
3. **The Simulation:** It runs 2,000 abstract particles through these new physics laws. There is no concept of spatial distance—interaction is defined entirely by mathematical affinity.
4. **The God System (Edge of Chaos Filter):** It evaluates the universe after a few seconds. If the math causes the particles to become a "Dead Gas" (random noise) or collapse into a "Thermodynamic Singularity" (a white glowing ball of zero variance), the system wipes the universe and starts over.
5. **Continuous Mining:** When it discovers a universe that balances perfectly on the "Edge of Chaos"—sustaining complex molecular loops without freezing—it automatically archives the raw math equations to the sidebar and immediately wipes the screen to mine the next universe.

## How to run
1. Clone or download this repository.
2. Double-click `index.html` to open it in any modern web browser. (No build steps, no local servers required).
3. Let it run. The God System will rapidly compile and destroy universes. Because the filter is highly selective, it might take hundreds of iterations to find a stable universe.
4. When it finds one, it will auto-save to your sidebar. Click **LOAD** to enter **Observer Mode** and explore the math in the 3D WebGL volumetric visualizer. 
    *   *Controls:* Click the canvas to lock your mouse. Use `W A S D` to fly, `Q / E` to move vertically, and `ESC` to unlock.
5. Click **RESUME AUTO-MINER** in the sidebar to put the computer back to work.
