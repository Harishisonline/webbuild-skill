// scene.js — a minimal, performance-safe Three.js hero you then make specific.
// Replace the placeholder mesh with the business's object: a GLB of the product,
// an extruded logo, a shader that echoes their material (wood, water, steel, dough…).
import * as THREE from "three";
import { gsap } from "gsap";
// import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

export function initScene(section, { small }) {
  const canvas = section.querySelector("#gl");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2)); // DPR cap: biggest single perf win
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Light like a photographer: one key, one soft fill, one rim. Not ambient soup.
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2); rim.position.set(-4, 2, -3);
  scene.add(key, rim, new THREE.HemisphereLight(0xffffff, 0x222222, 0.4));

  // PLACEHOLDER — swap for the real subject.
  const mesh = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.32, small ? 128 : 256, 32),
    new THREE.MeshPhysicalMaterial({ color: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#888888", roughness: 0.35, metalness: 0.1, clearcoat: 0.6 })
  );
  scene.add(mesh);

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  resize();

  // pointer parallax (desktop only), eased
  const target = { x: 0, y: 0 };
  if (!small) addEventListener("pointermove", (e) => { target.x = (e.clientX / innerWidth - 0.5) * 0.4; target.y = (e.clientY / innerHeight - 0.5) * 0.3; });

  // scroll choreography: the object does something MEANINGFUL as you scroll (turns to show a detail, opens, assembles)
  gsap.to(mesh.rotation, { y: Math.PI * 1.5, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true } });

  // pause rendering when off-screen or tab hidden
  let visible = true;
  // observe the SECTION: a canvas inside a pinned section can report "not visible" forever
  new IntersectionObserver((es) => (visible = es.some((e) => e.isIntersecting))).observe(section);
  section.classList.add("is-ready");

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible || document.hidden) return;
    const t = clock.getElapsedTime();
    mesh.rotation.x += (target.y - mesh.rotation.x) * 0.05;
    mesh.position.x += (target.x - mesh.position.x) * 0.05;
    mesh.position.y = Math.sin(t * 0.6) * 0.06;
    renderer.render(scene, camera);
  });
}
