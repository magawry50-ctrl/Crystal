import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/**
 * High Dynamic Range Studio Environment using RoomEnvironment
 * 1:1 Matching MetalForge's PMREM Studio Setup
 */
export function createIceStudioEnvironment(renderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomScene = new RoomEnvironment();
  const envMap = pmremGenerator.fromScene(roomScene, 0.04).texture;
  pmremGenerator.dispose();
  return envMap;
}
