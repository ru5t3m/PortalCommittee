import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export const HERO_INITIAL_YAW = Math.PI + 0.3;

function disposeObject(root: THREE.Object3D) {
  const textures = new Set<THREE.Texture>();
  const materials = new Set<THREE.Material>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    if (object instanceof THREE.SkinnedMesh) object.skeleton.dispose();
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  for (const texture of textures) {
    if (typeof ImageBitmap !== "undefined" && texture.image instanceof ImageBitmap) texture.image.close();
    texture.dispose();
  }
  for (const material of materials) material.dispose();
}

export async function createHeroScene(host: HTMLDivElement, signal: AbortSignal, onContextLost: () => void) {
  const response = await fetch("/media/characters/swat-operator-v1.glb", { signal });
  if (!response.ok) throw new Error("Model unavailable");
  const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), "");
  if (signal.aborted) { disposeObject(gltf.scene); throw new DOMException("Aborted", "AbortError"); }

  const scene = new THREE.Scene();
  const figure = new THREE.Group();
  scene.add(figure);
  const model = gltf.scene;
  figure.add(model);
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" }); }
  catch (error) { disposeObject(scene); throw error; }
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const constrained = (deviceMemory !== undefined && deviceMemory <= 4)
    || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
  const maxPixelRatio = constrained ? 1.5 : 2;
  const maxPixels = constrained ? 1800000 : 3000000;
  const anisotropy = Math.min(constrained ? 2 : 4, renderer.capabilities.getMaxAnisotropy());
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.anisotropy = anisotropy;
    }
  });

  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const scale = 1.85 / size.y;
  model.scale.multiplyScalar(scale);
  model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
  model.updateMatrixWorld(true);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x777766, 2));
  const key = new THREE.DirectionalLight(0xffffff, 3);
  key.position.set(2, 4, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd4e8ff, 2);
  fill.position.set(-3, 3, -2);
  scene.add(fill);
  const camera = new THREE.PerspectiveCamera(30, 2 / 3, 0.1, 20);
  camera.position.set(0, 1, 4.2);
  camera.lookAt(0, 0.95, 0);

  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 1024;
  labelCanvas.height = 256;
  const context = labelCanvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.06), new THREE.MeshBasicMaterial({ map: texture }));
  const ray = new THREE.Raycaster(new THREE.Vector3(0.04, 1.415, -2), new THREE.Vector3(0, 0, 1));
  const hit = ray.intersectObject(model, true)[0];
  patch.position.set(0.04, 1.415, hit ? hit.point.z - 0.006 : -0.22);
  patch.rotation.y = Math.PI;
  figure.add(patch);
  figure.rotation.y = HERO_INITIAL_YAW;

  let frame = 0;
  let disposed = false;
  const render = () => {
    if (disposed || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; if (!disposed) renderer.render(scene, camera); });
  };
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio, Math.sqrt(maxPixels / (width * height))));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  const contextLost = (event: Event) => { event.preventDefault(); onContextLost(); };
  renderer.domElement.addEventListener("webglcontextlost", contextLost);

  return {
    rotate(delta: number) { figure.rotation.y += delta; render(); },
    reset() { figure.rotation.y = HERO_INITIAL_YAW; render(); },
    setName(name: string) {
      context.fillStyle = "#20221e";
      context.fillRect(0, 0, 1024, 256);
      context.strokeStyle = "#4b4e41";
      context.lineWidth = 12;
      context.strokeRect(8, 8, 1008, 240);
      let fontSize = 150;
      context.font = `700 ${fontSize}px Arial, sans-serif`;
      while (context.measureText(name).width > 940 && fontSize > 24) context.font = `700 ${--fontSize}px Arial, sans-serif`;
      context.fillStyle = "#eee9d6";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(name, 512, 137, 940);
      texture.needsUpdate = true;
      render();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      disposeObject(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    }
  };
}
