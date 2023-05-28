import React, { useEffect } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";

import textures from "./assets/textures";
import planetsData from "./planetsData";

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const SolarSystem: React.FC = () => {
    useEffect(() => {
        setupSite();
        animate();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div
            style={{ padding: "0px", margin: "0px" }}
            ref={(ref) => ref && ref.appendChild(renderer.domElement)}
        />
    );
};

const setupSite = (): void => {
    /* Setup Renderer */
    renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);

    /* Setup Scene */
    scene.background = createStarsBackground();
    createPlanets();

    /* Setup Camera */
    camera.position.set(-90, 140, 140);
    camera.far = 10000;
    camera.updateProjectionMatrix();

    /* Setup Orbit Controls */
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update();

    /* Setup Lighting */
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
    pointLight.intensity = 1.5;
    scene.add(pointLight);
};

const createStarsBackground = (): THREE.CubeTexture => {
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    return cubeTextureLoader.load([
        textures.stars,
        textures.stars,
        textures.stars,
        textures.stars,
        textures.stars,
        textures.stars,
    ]);
};

interface Planet {
    mesh: THREE.Mesh;
    obj: THREE.Object3D;
}

interface PlanetData {
    size: number;
    texture: string;
    position: number;
    ring?: {
        innerRadius: number;
        outerRadius: number;
        texture: string;
    };
    initialAngle: number;
    moons?: MoonData[];
}

interface MoonData {
    size: number;
    texture: string;
    position: number;
    initialAngle: number;
}

const createPlanets = (): { sun: THREE.Mesh; planets: Planet[] } => {
    const sun = createSun();
    scene.add(sun);

    const planets: Planet[] = planetsData.map((planetData) => {
        const planet = createPlanet(planetData);
        scene.add(planet.obj);

        if (planetData.moons) {
            planetData.moons.forEach((moonData) => {
                const moon = createMoon(moonData, planet.obj);
                scene.add(moon.obj);
            });
        }

        return planet;
    });

    return { sun, planets };
};

const createSun = (): THREE.Mesh => {
    const sunGeo = new THREE.SphereGeometry(16, 30, 30);
    const sunMat = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(textures.sun),
    });
    return new THREE.Mesh(sunGeo, sunMat);
};

const createPlanet = ({
    size,
    texture,
    position,
    ring,
    initialAngle,
}: PlanetData): Planet => {
    position = position * 1.5;
    const textureLoader = new THREE.TextureLoader();

    const geo = new THREE.SphereGeometry(size, 30, 30);
    const mat = new THREE.MeshStandardMaterial({
        map: textureLoader.load(texture),
    });

    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.add(mesh);

    if (ring) {
        const ringGeo = new THREE.RingGeometry(
            ring.innerRadius,
            ring.outerRadius,
            32
        );
        const ringMat = new THREE.MeshBasicMaterial({
            map: textureLoader.load(ring.texture),
            side: THREE.DoubleSide,
        });

        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        obj.add(ringMesh);
        ringMesh.position.x =
            position * Math.cos(initialAngle * (Math.PI / 180));
        ringMesh.position.z =
            position * Math.sin(initialAngle * (Math.PI / 180));
        ringMesh.rotation.x = -0.5 * Math.PI;

        ringMesh.userData.isRing = true;
    }

    mesh.position.x = position * Math.cos(initialAngle * (Math.PI / 180));
    mesh.position.z = position * Math.sin(initialAngle * (Math.PI / 180));

    return { mesh, obj };
};

const createMoon = (
    { size, texture, position, initialAngle }: MoonData,
    parentObject: THREE.Object3D
): { mesh: THREE.Mesh; obj: THREE.Object3D } => {
    const textureLoader = new THREE.TextureLoader();

    const geo = new THREE.SphereGeometry(size, 30, 30);
    const mat = new THREE.MeshStandardMaterial({
        map: textureLoader.load(texture),
    });

    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.add(mesh);

    const distanceFromPlanet = position * 2;
    obj.position.set(distanceFromPlanet, 0, 0);

    mesh.position.x =
        distanceFromPlanet * Math.cos(initialAngle * (Math.PI / 180));
    mesh.position.z =
        distanceFromPlanet * Math.sin(initialAngle * (Math.PI / 180));

    parentObject.add(obj);

    return { mesh, obj };
};

const generateRandomNumber = (): number => {
    return Math.random() * (0.0002 - 0.0005) + 0.0005;
};

const animate = (): void => {
    renderer.setAnimationLoop(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh && !child.userData.isRing) {
                child.rotateY(generateRandomNumber());
            }
        });

        scene.traverse((child) => {
            if (child instanceof THREE.Object3D && !child.userData.isRing) {
                child.rotateY(generateRandomNumber());
            }
        });

        renderer.render(scene, camera);
    });
};

const handleResize = (): void => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

export default SolarSystem;
