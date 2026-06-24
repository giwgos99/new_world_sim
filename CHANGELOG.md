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

### Removed
- **Box2D / Matter.js Physics Engine**: Completely removed spatial Euclidean collision and gravity rules.
- **Single-Rule Architecture**: Removed the logic that forced only one interaction rule per universe. All rules now apply simultaneously based on particle states.
