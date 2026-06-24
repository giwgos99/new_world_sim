# The Quantum Void

## What is this?
A little browser experiment with Artificial Life and procedural math. 

Instead of building a normal 2D physics engine with gravity and collision, I wanted to see what happens if we just throw raw math in a multi-dimensional void and see what happensand if life emerges. 

The engine generates random math equations (using Abstract Syntax Trees), compiles them on the fly into Javascript, and uses them as the "laws of physics" for 2,000 abstract particles. 

## Why?
Because the more i think about ALife (Artificial Life), the more i realize that they have a designer bias where the creator hardcodes biology (like hunger) or physics (like gravity) to force the simulation to do something specific. 

I wanted to see if complex, stable systems could just accidentally emerge from completely random, unfiltered math. So, this project doesn't evolve life; it evolves creating rules for basic physics and chemistry in a new universe itself.

## How it works
1. **Math Generator:** Generates random equations using `sin`, `cos`, `+`, `-`, `*` and applies them to random variables across multiple dimensions.
2. **God System:** Runs the simulation for a few seconds. If the particles turn into boring random noise, or if they all crash together into a single identical dot (a singularity), it wipes the universe and tries a new one.
3. **The Archive:** If it accidentally generates a stable, complex universe, it auto-saves the equations to the sidebar!

## How to run
1. Just open `index.html` in your browser. That's it! No servers or builds.
2. Leave it running in the background. It will automatically test and destroy universes until it finds a stable one.
3. Once it saves one, click **LOAD** to fly around and observe the math in 3D using your mouse and WASD.
4. Click **RESUME AUTO-MINER** to keep searching for new universes.
