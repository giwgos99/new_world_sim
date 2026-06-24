# Changelog: Project "New World" (Math Void Branch)

## [Unreleased] - Current Active Branch

### Added
- **3D Quantum Void Visualizer**: Replaced the 2D canvas with a Three.js WebGL volumetric particle shader that maps N-dimensional abstract entities down to 3D space.
- **Abstract State Engine**: Removed spatial positions (X,Y) and replaced them with N-dimensional state arrays for every entity.
- **Affinity Laws**: Interaction is no longer based on physical distance, but on mathematical similarity between state arrays (Harmonic Resonance, Dot Product Alignment, etc.).
- **Decaying Memory Matrix (Bonds)**: Entities track interactions. If they stop interacting, the bond decays over 100 frames to prevent memory leaks and track homeostasis.
- **Universal Constants Generator**: All laws are always active. Universes are now distinguished by randomly generated constants (thresholds) determining when laws trigger.
- **The "Edge of Chaos" Filter**: The God System now aggressively evaluates the number of active strong bonds after 400 frames. Wipes the universe if it acts like a random gas (<20 bonds) or a frozen crystal (>800 bonds).
- **Auto-Save Archive Sidebar**: Stable universes are automatically saved to `localStorage` and displayed in a sidebar UI. Saved configs include the Dimension count and the specific Universal Constants. Users can manually load and delete these saved architectures.

- **AST Math Generator (V3)**: The engine now completely writes its own Abstract Syntax Trees for physics rules, compiling raw math strings into native JS functions dynamically.
- **Continuous Autonomous Mining Loop**: The God System no longer stops when it finds life. It instantly archives the AST laws and resets the universe to keep mining infinitely.
- **The Singularity Filter (Variance Check)**: Added a state-space variance check to accurately detect and wipe universes that collapse into perfectly identical states (white glowing balls).
- **Camera Reset Button**: Added a UI button to instantly snap the WebGL free-camera back to origin [0, 0, 20].
- **Observer Mode**: Loading a saved universe now pauses the auto-restart loop, allowing infinite observation of stable universes without them being prematurely wiped.
- **Resume Auto-Miner Button**: Added a button to the sidebar to easily exit Observer Mode, wipe the screen, and immediately resume autonomous testing of new random equations.

### Removed
- **Box2D / Matter.js Physics Engine**: Completely removed spatial Euclidean collision and gravity rules.
- **Hardcoded Laws of Physics**: Completely removed all human-written interaction equations (Harmonic Resonance, Dimensional Mirroring, etc.) to achieve 100% generative purity.
