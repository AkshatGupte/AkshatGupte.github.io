import * as THREE from "three";

/**
 * Antigravity particle field.
 *
 * Vanilla port of the React Bits <Antigravity /> component. The original ships
 * as React + @react-three/fiber; this site has no build step, so the same math
 * runs against three.js directly. Canvas/useFrame/useThree are replaced by a
 * renderer, a rAF loop, and a manually computed viewport.
 */

const DEFAULTS = {
  count: 300,
  magnetRadius: 10,
  ringRadius: 10,
  waveSpeed: 0.4,
  waveAmplitude: 1,
  particleSize: 2,
  lerpSpeed: 0.1,
  color: "#FF9FFC",
  autoAnimate: false,
  particleVariance: 1,
  rotationSpeed: 0,
  depthFactor: 1,
  pulseSpeed: 3,
  particleShape: "capsule",
  fieldStrength: 10,
  opacity: 1,
};

function buildGeometry(shape) {
  switch (shape) {
    case "sphere":
      return new THREE.SphereGeometry(0.2, 16, 16);
    case "box":
      return new THREE.BoxGeometry(0.3, 0.3, 0.3);
    case "tetrahedron":
      return new THREE.TetrahedronGeometry(0.3);
    default:
      return new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
  }
}

export default function antigravity(container, options = {}) {
  const o = { ...DEFAULTS, ...options };

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
  camera.position.z = 50;

  const material = new THREE.MeshBasicMaterial({
    color: o.color,
    transparent: o.opacity < 1,
    opacity: o.opacity,
  });
  const mesh = new THREE.InstancedMesh(buildGeometry(o.particleShape), material, o.count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  const dummy = new THREE.Object3D();
  const clock = new THREE.Clock();
  const viewport = { width: 100, height: 100 };

  // Rest positions are seeded from the viewport, so they are re-seeded on resize.
  const particles = [];
  function seedParticles() {
    particles.length = 0;
    for (let i = 0; i < o.count; i++) {
      const x = (Math.random() - 0.5) * viewport.width;
      const y = (Math.random() - 0.5) * viewport.height;
      const z = (Math.random() - 0.5) * 20;

      particles.push({
        t: Math.random() * 100,
        speed: 0.01 + Math.random() / 200,
        mx: x,
        my: y,
        mz: z,
        cx: x,
        cy: y,
        cz: z,
        randomRadiusOffset: (Math.random() - 0.5) * 2,
      });
    }
  }

  function resize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    // three.js equivalent of r3f's `viewport`: world units visible at z = 0.
    const vFov = (camera.fov * Math.PI) / 180;
    viewport.height = 2 * Math.tan(vFov / 2) * camera.position.z;
    viewport.width = viewport.height * camera.aspect;

    seedParticles();
  }

  // Pointer, normalised to -1..1 the way r3f reports it.
  const pointer = { x: 0, y: 0 };
  const lastMousePos = { x: 0, y: 0 };
  const virtualMouse = { x: 0, y: 0 };
  let lastMouseMoveTime = 0;

  function onPointerMove(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function step() {
    const mouseDist = Math.hypot(pointer.x - lastMousePos.x, pointer.y - lastMousePos.y);
    if (mouseDist > 0.001) {
      lastMouseMoveTime = Date.now();
      lastMousePos.x = pointer.x;
      lastMousePos.y = pointer.y;
    }

    let destX = (pointer.x * viewport.width) / 2;
    let destY = (pointer.y * viewport.height) / 2;

    if (o.autoAnimate && Date.now() - lastMouseMoveTime > 2000) {
      const time = clock.getElapsedTime();
      destX = Math.sin(time * 0.5) * (viewport.width / 4);
      destY = Math.cos(time * 0.5 * 2) * (viewport.height / 4);
    }

    const smoothFactor = 0.05;
    virtualMouse.x += (destX - virtualMouse.x) * smoothFactor;
    virtualMouse.y += (destY - virtualMouse.y) * smoothFactor;

    const targetX = virtualMouse.x;
    const targetY = virtualMouse.y;
    const globalRotation = clock.getElapsedTime() * o.rotationSpeed;

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      const { mx, my, mz, cz, randomRadiusOffset } = particle;
      const t = (particle.t += particle.speed / 2);

      const projectionFactor = 1 - cz / 50;
      const projectedTargetX = targetX * projectionFactor;
      const projectedTargetY = targetY * projectionFactor;

      const dx = mx - projectedTargetX;
      const dy = my - projectedTargetY;
      const dist = Math.hypot(dx, dy);

      const targetPos = { x: mx, y: my, z: mz * o.depthFactor };

      if (dist < o.magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotation;
        const wave = Math.sin(t * o.waveSpeed + angle) * (0.5 * o.waveAmplitude);
        const deviation = randomRadiusOffset * (5 / (o.fieldStrength + 0.1));
        const currentRingRadius = o.ringRadius + wave + deviation;

        targetPos.x = projectedTargetX + currentRingRadius * Math.cos(angle);
        targetPos.y = projectedTargetY + currentRingRadius * Math.sin(angle);
        targetPos.z = mz * o.depthFactor + Math.sin(t) * (1 * o.waveAmplitude * o.depthFactor);
      }

      particle.cx += (targetPos.x - particle.cx) * o.lerpSpeed;
      particle.cy += (targetPos.y - particle.cy) * o.lerpSpeed;
      particle.cz += (targetPos.z - particle.cz) * o.lerpSpeed;

      dummy.position.set(particle.cx, particle.cy, particle.cz);
      dummy.lookAt(projectedTargetX, projectedTargetY, particle.cz);
      dummy.rotateX(Math.PI / 2);

      const currentDistToMouse = Math.hypot(
        particle.cx - projectedTargetX,
        particle.cy - projectedTargetY
      );
      const distFromRing = Math.abs(currentDistToMouse - o.ringRadius);
      const scaleFactor = Math.max(0, Math.min(1, 1 - distFromRing / 10));

      const finalScale =
        scaleFactor * (0.8 + Math.sin(t * o.pulseSpeed) * 0.2 * o.particleVariance) * o.particleSize;
      dummy.scale.set(finalScale, finalScale, finalScale);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }

  let frame = null;
  function loop() {
    frame = requestAnimationFrame(loop);
    step();
  }

  function start() {
    if (frame === null) {
      clock.getDelta();
      loop();
    }
  }
  function stop() {
    if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  }

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) {
    step(); // draw the field once, hold it still
  } else {
    start();
  }

  return function destroy() {
    stop();
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    mesh.geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
