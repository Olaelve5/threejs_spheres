import * as THREE from "three";

class Sphere {
  constructor(x, y, radius, paint, velocityX, velocityY, scene) {
    (this.geometry = new THREE.SphereGeometry(radius, 256, 128)),
      (this.material = new THREE.MeshStandardMaterial({ color: paint })),
      (this.mesh = new THREE.Mesh(this.geometry, this.material));
    this.mesh.position.set(x, y, 0);
    this.velocity = new THREE.Vector2(velocityX, velocityY);
    scene.add(this.mesh);
  }

  updatePosition() {
    let borderRight = window.innerWidth / 2 - this.geometry.parameters.radius;
    let borderLeft = -borderRight;
    let borderTop = window.innerHeight / 2 - this.geometry.parameters.radius;
    let borderBottom = -borderTop;
    const { x, y } = this.mesh.position;

    if (x >= borderRight || x <= borderLeft) {
      this.velocity.x *= -1;
    }

    if (y >= borderTop || y <= borderBottom) {
      this.velocity.y *= -1;
    }

    if (x > borderRight) {
      this.mesh.position.x -= x - borderRight;
    }
    if (x < borderLeft) {
      this.mesh.position.x += -x + borderLeft;
    }
    if (y > borderTop) {
      this.mesh.position.y -= y - borderTop;
    }
    if (y < borderBottom) {
      this.mesh.position.y += -y + borderBottom;
    }

    this.mesh.position.x += this.velocity.x;
    this.mesh.position.y += this.velocity.y;
  }
}

export default Sphere;
