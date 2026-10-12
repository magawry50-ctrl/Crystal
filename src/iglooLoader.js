import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

let dracoLoader = null;
let ktx2Loader = null;
let exrLoader = null;

export function initLoaders(renderer) {
  if (!dracoLoader) {
    dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    dracoLoader.preload();
  }

  if (!ktx2Loader && renderer) {
    ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('/basis/');
    ktx2Loader.detectSupport(renderer);
  }

  if (!exrLoader) {
    exrLoader = new EXRLoader();
  }

  return { dracoLoader, ktx2Loader, exrLoader };
}

export function loadDracoGeometry(url) {
  return new Promise((resolve, reject) => {
    if (!dracoLoader) {
      dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/');
    }
    dracoLoader.load(
      url,
      (geometry) => {
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        resolve(geometry);
      },
      undefined,
      (err) => {
        console.warn(`[DRACOLoader] Could not load ${url}:`, err);
        reject(err);
      }
    );
  });
}

export function loadKTX2Texture(url, renderer) {
  return new Promise((resolve, reject) => {
    if (!ktx2Loader) {
      initLoaders(renderer);
    }
    ktx2Loader.load(
      url,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        resolve(texture);
      },
      undefined,
      (err) => {
        console.warn(`[KTX2Loader] Could not load ${url}:`, err);
        reject(err);
      }
    );
  });
}

export function loadEXREnvMap(url, renderer) {
  return new Promise((resolve, reject) => {
    if (!exrLoader) exrLoader = new EXRLoader();
    exrLoader.load(
      url,
      (texture) => {
        const pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();
        const envMap = pmrem.fromEquirectangular(texture).texture;
        pmrem.dispose();
        texture.dispose();
        resolve(envMap);
      },
      undefined,
      (err) => {
        console.warn(`[EXRLoader] Could not load ${url}:`, err);
        reject(err);
      }
    );
  });
}
