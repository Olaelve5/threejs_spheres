import "./style.css";

import * as THREE from "three";
import Sphere from "./sphere.js";

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(
  0 - window.innerWidth / 2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  0 - window.innerHeight / 2
);

camera.position.setZ(80);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setClearColor(0xffffff, 0);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(200, 700, 500);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(pointLight, ambientLight);

const canvas = document.querySelector("#bg");

const spheres = [];

canvas.addEventListener("click", (e) => {
  const x = e.clientX - window.innerWidth / 2;
  const y = -(e.clientY - window.innerHeight / 2);
  const color = Math.random() * 0xffffff;
  const velocityX = Math.random() * 10 * (Math.random() < 0.5 ? -1 : 1);
  const velocityY = Math.random() * 10 * (Math.random() < 0.5 ? -1 : 1);

  const sphere = new Sphere(
    x,
    y,
    Math.random() * 50 + 5,
    color,
    velocityX,
    velocityY,
    scene
  );
  spheres.push(sphere);
});

function monitorCollision() {
  for (let i = 0; i < spheres.length - 1; i++) {
    const sphere1 = spheres[i];
    for (let j = i + 1; j < spheres.length; j++) {
      const sphere2 = spheres[j];
      const distance =
        Math.abs(sphere1.mesh.position.x - sphere2.mesh.position.x) +
        Math.abs(sphere1.mesh.position.y - sphere2.mesh.position.y);

      if (
        distance <=
        sphere1.geometry.parameters.radius +
          sphere2.geometry.parameters.radius +
          5
      ) {
        penetrationResolve(sphere1, sphere2);
        collision(sphere1, sphere2);
      }
    }
  }
}

function penetrationResolve(sphere1, sphere2) {
  const normal = new THREE.Vector2(
    sphere1.mesh.position.x - sphere2.mesh.position.x,
    sphere1.mesh.position.y - sphere2.mesh.position.y
  ).normalize();

  const depth =
    sphere1.geometry.parameters.radius +
    sphere2.geometry.parameters.radius -
    normal.dot(
      new THREE.Vector2(
        sphere1.mesh.position.x - sphere2.mesh.position.x,
        sphere1.mesh.position.y - sphere2.mesh.position.y
      )
    );

  sphere1.mesh.position.x += normal.x * (depth / 2);
  sphere1.mesh.position.y += normal.y * (depth / 2);
  sphere2.mesh.position.x += -normal.x * (depth / 2);
  sphere2.mesh.position.y += -normal.y * (depth / 2);
}

function collision(sphere1, sphere2) {
  const pos1 = new THREE.Vector2(
    sphere1.mesh.position.x,
    sphere1.mesh.position.y
  );
  const pos2 = new THREE.Vector2(
    sphere2.mesh.position.x,
    sphere2.mesh.position.y
  );

  const sphere1Mass = sphere1.geometry.parameters.radius;
  const sphere2Mass = sphere2.geometry.parameters.radius;

  const unitVector = new THREE.Vector2().subVectors(pos1, pos2).normalize();
  const unitTangentVector = new THREE.Vector2(-unitVector.y, unitVector.x);

  const sphere1Scal = unitVector.dot(sphere1.velocity);
  const sphere1ScalTan = unitTangentVector.dot(sphere1.velocity);

  const sphere2Scal = unitVector.dot(sphere2.velocity);
  const sphere2ScalTan = unitTangentVector.dot(sphere2.velocity);

  const sphere1ScalAfter =
    (sphere1Scal * (sphere1Mass - sphere2Mass) +
      2 * sphere2Mass * sphere2Scal) /
    (sphere1Mass + sphere2Mass);

  const sphere2ScalAfter =
    (sphere2Scal * (sphere2Mass - sphere1Mass) +
      2 * sphere1Mass * sphere1Scal) /
    (sphere1Mass + sphere2Mass);

  const sphere1ScalFinal = new THREE.Vector2(
    unitVector.x * sphere1ScalAfter,
    unitVector.y * sphere1ScalAfter
  );

  const sphere2ScalFinal = new THREE.Vector2(
    unitVector.x * sphere2ScalAfter,
    unitVector.y * sphere2ScalAfter
  );

  const sphere1ScalTanFinal = new THREE.Vector2(
    unitTangentVector.x * sphere1ScalTan,
    unitTangentVector.y * sphere1ScalTan
  );

  const sphere2ScalTanFinal = new THREE.Vector2(
    unitTangentVector.x * sphere2ScalTan,
    unitTangentVector.y * sphere2ScalTan
  );

  const finalVelocity1 = new THREE.Vector2(
    sphere1ScalFinal.x + sphere1ScalTanFinal.x,
    sphere1ScalFinal.y + sphere1ScalTanFinal.y
  );

  const finalVelocity2 = new THREE.Vector2(
    sphere2ScalFinal.x + sphere2ScalTanFinal.x,
    sphere2ScalFinal.y + sphere2ScalTanFinal.y
  );

  sphere1.velocity = finalVelocity1;
  sphere2.velocity = finalVelocity2;
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  spheres.forEach((sphere) => {
    sphere.updatePosition();
    monitorCollision();
  });
}

animate();
