# The Quantum Void

## What is this?
This is not a game. It is not a standard physics simulation. **The Quantum Void** is an autonomous, mathematical Multiverse Sandbox and "Life-Mining" engine. 

Instead of simulating creatures walking on a 2D plane with gravity and collision, this engine simulates the fundamental fabric of reality itself. It strips away Euclidean space, replacing physical positions (X, Y, Z) with abstract N-dimensional state arrays. It then relentlessly generates random universes, compiles completely new laws of physics for them on the fly, and tests them to see if complex, self-sustaining structure emerges.

## Why did I build this?
I realized that almost all Artificial Life simulations suffer from a fatal flaw: **Designer Bias**. 

When we hardcode biology—when we explicitly program variables like `health`, `age`, or `hunger`, or when we reward a neural network for "walking forward"—we are playing God. We are forcing reality to obey our preconceived notions of what life should look like. 

Even deeper than that, when we hardcode the *laws of physics* (like gravity, water dynamics, or solid body collision), we trap the simulation inside the limits of human imagination. We evolved in this specific universe, so we can only imagine physics that work like ours. To achieve true emergence, the phenomenon must exist independently.

I built The Quantum Void to escape this bias. Instead of evolving life within a rigid world, I am evolving the universe itself to find the rare mathematical conditions that accidentally breed life.

## What does it do?
1. **The Autonomous Math Generator (AST):** Every time a universe boots up, the engine randomly writes 2 to 4 raw mathematical equations from scratch using a recursive Abstract Syntax Tree generator. It snaps together random variables (up to 10 Dimensions), math operators, and trigonometric functions to invent completely novel laws of thermodynamics.
2. **The Compiler:** It takes those raw text strings and compiles them into hyper-fast, native JavaScript functions instantaneously.
3. **The Simulation:** It runs 2,000 abstract particles through these new physics laws. There is no concept of spatial distance—interaction is defined entirely by mathematical affinity.
4. **The God System (Edge of Chaos Filter):** It evaluates the universe after a few seconds. If the math causes the particles to become a "Dead Gas" (random noise) or collapse into a "Thermodynamic Singularity" (a white glowing ball of zero variance, behaving exactly like a black hole), the system brutally wipes the universe and starts over.
5. **Continuous Mining:** When it discovers a universe that balances perfectly on the "Edge of Chaos"—sustaining complex molecular loops without freezing—it automatically archives the raw math equations to the sidebar and immediately wipes the screen to mine the next universe.

## How to run
1. Clone or download this repository.
2. Simply double-click `index.html` to open it in any modern web browser. (No build steps, no local servers required).
3. Let it run. The God System will rapidly compile and destroy universes. Because it is highly selective, it might take hundreds of iterations to find a stable universe.
4. When it finds one, it will auto-save to your sidebar. Click **LOAD** to enter **Observer Mode** and explore the math in the 3D WebGL volumetric visualizer. 
    *   *Controls:* Click the canvas to lock your mouse. Use `W A S D` to fly, `Q / E` to move vertically, and `ESC` to unlock.
5. Click **RESUME AUTO-MINER** in the sidebar to put the computer back to work.
