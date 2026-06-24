# Project "New World": Implementation Plan & Phasing

To execute the "Evolving Multiverse" concept, we cannot use standard game objects (RigidBodies, Nodes). We are crunching raw math on millions of pixels 60 times a second.

## Where to Run the Program: The Engine Debate
For this specific project, we have two main choices. Since we are doing pure math, we don't need a heavy game engine.

**Option A: The Browser (WebGPU / WebGL)** *<-- Highly Recommended*
A web browser is actually the perfect environment for this. Using HTML5 Canvas and WebGL/WebGPU, we can run shaders directly on the graphics card. 
*   *Why it's better:* JavaScript is incredibly fast at generating strings of text (our random math equations). Browsers can compile WebGL shaders in milliseconds, allowing us to hot-swap universes blisteringly fast without the overhead of a game engine. Plus, you can easily build the UI with HTML/CSS and share it with anyone via a link.

**Option B: Godot 4 Compute Shaders**
Godot has excellent Compute Shader support. However, compiling new GLSL shaders dynamically at runtime thousands of times (for our automated search) can be slightly clunky inside the Godot engine. 

## Phase 1: The Blank Canvas (GPU Setup)
1.  **The Texture:** Create a `TextureRect` that covers the screen.
2.  **The Compute Shader:** Write a basic Godot Compute Shader (GLSL) that reads the pixel array, applies a basic hardcoded math function (just to test), and writes the new pixels back to the screen. 
3.  *Goal:* Prove we can update a million floats at 60 FPS.

## Phase 2: The Equation Generator (AST)
1.  **The Parser:** Write a C# script that acts as an Abstract Syntax Tree (AST). It randomly combines operators (`+`, `-`, `*`, `sin`, `cos`, `mod`) and variables (`NeighborSum`, `Time`, `Distance`) into a logical tree.
2.  **Shader Generation:** The C# script translates that math tree into raw GLSL Shader code.
3.  **Hot-Swapping:** Godot compiles the new Compute Shader at runtime and injects it into the GPU.
4.  *Goal:* The ability to press a button and instantly load a completely new, randomly generated universe.

## Phase 3: The Automated God (The Filter)
1.  **Static Detection:** We don't want to sit there watching 10,000 blank screens. We write a script that analyzes the screen output.
2.  **The Rules of Death:** 
    *   If all pixels are `0.0` (Black/Void), the universe is dead.
    *   If all pixels are `1.0` (White/Overload), the universe is dead.
    *   If the pixel sum doesn't change for 10 frames (Frozen Static), it is dead.
3.  **Auto-Cycle:** If the universe dies, automatically delete the shader, generate a new one, and restart.

## Phase 4: The Observer UI (The Dashboard)
When we finally find a working universe, we need tools to study it. The UI must be minimalistic.
1.  **The Seed ID:** Every universe is generated from a Random Seed. This is the most critical feature. If you find life, you must save the Seed so you can reload that exact math equation later.
2.  **Equation Viewer:** A text box that prints out the human-readable version of the bizarre math equation that is currently running.
3.  **Time Controls:** Play, Pause, and Fast-Forward (Step Time).
4.  **The "Nudge" Tool:** A brush that lets your mouse paint a circle of `1.0` values onto the screen. This allows you to test if the "creatures" react to foreign interference or if they just instantly collapse.
5.  **Save/Load Universe:** A button to export the current Universe Seed and the current pixel state to a JSON file.
