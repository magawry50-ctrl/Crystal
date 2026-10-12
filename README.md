# 💎 Crystal

> **3D Gemstone, Liquid Glass & Atmospheric Simulation**  
> An advanced real-time WebGL simulation featuring physically-based crystal optics, procedural fracture physics, liquid glass dispersion, and photorealistic HDR atmospheric sky rendering inspired by *MetalForge Meadow*.

---

## 🌟 Key Features

### 1. Three Core Experience Categories
- **🪨 1- Rock (Igloo Inc)**:
  - Authentic photorealistic ice boulders: **Pudgy Penguins (`C0_01`)** and **Overpass (`C0_02`)**.
  - Authentic material parameters, internal veils, and ice crust textures preserved with protected parameter locking.
- **💎 2- Crystals (MetalForge)**:
  - 7 gemstone presets: **Froststone**, **Emberstone**, **Moonstone**, **Tidestone**, **Heartstone**, **Luckstone**, and **Thunderstone**.
  - Real-time rigid-body fracture physics, interactive impact chipping, pointer-driven laser frost crystallization, and internal core symbol illumination.
- **🫧 3- Liquid Glass**:
  - Procedural fluid glass geometries: **Liquid Orb**, **Torus**, **Dispersion**, **Icosahedron**, **Sphere**, **Octahedron**, and more.
  - Physically accurate chromatic dispersion (Abbe number), Cauchy transmission, index of refraction (IOR), and real-time text refraction.

---

### 2. MetalForge Meadow Photorealistic Sky System
- **6 Cinematic Atmospheric Presets**:
  - ☀️ **Day**: Crisp azure atmosphere with volumetric cumulus clouds.
  - 🌅 **Golden**: Radiant golden sunset with warm atmospheric horizon glow.
  - 🌇 **Dusk**: Fiery twilight horizon with violet and rose ambient scattering.
  - ✨ **Night**: Pitch-black cosmic void with a textured crescent Moon, 2 octaves of scintillating pinprick stars, and animated shooting meteors.
  - 🌧️ **Rain**: Heavy overcast storm with diffused slate-grey ambiance.
  - ❄️ **Snow**: Pale ice-blue diffusion tailored for glacial gems.
- **Astrophysics & Solar Rendering**:
  - Solar disk with physically calculated limb-darkening: $\mu = \sqrt{\max(1.0 - a^2 / R^2, 0.0)}$.
  - Multi-tier exponential solar corona and forward Mie scattering.
  - Continuous mathematical atmospheric horizon & planetary grounding (zero vertical streaks or barcode banding).
  - Pure Linear HDR Radiance output seamlessly tone-mapped via **ACES Filmic**.

---

### 3. Real-Time Water & Environments
- **FFT Ocean Simulation**: Real-time spectral ocean wave synthesis with foam dynamics, wind displacement, and environmental sky reflections.
- **Dual Camera Modes**: Smooth 360° orbital navigation and inertial vertical scroll tumble.
- **Interactive Audio**: Spatial procedural glass clinks, shattering, wind ambiance, and UI interactions.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Modern WebGL2-capable web browser (Chrome, Edge, Firefox, Safari)

### Installation

```bash
# Clone the repository
git clone https://github.com/magawry50-ctrl/Crystal.git

# Navigate into the project folder
cd Crystal

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser at `http://localhost:5180/` (or the port specified by Vite).

---

## 🛠️ Tech Stack
- **Three.js** (WebGL 2, MeshPhysicalMaterial, ShaderMaterial, EffectComposer)
- **GLSL** (Custom ray-unprojected atmospheric shaders, Voronoi noise, inverse Reinhard HDR decompression)
- **Vite** (Next-generation frontend tooling)

---

## 📄 License
MIT License. Created by [magawry50-ctrl](https://github.com/magawry50-ctrl).
