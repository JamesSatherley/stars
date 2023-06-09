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

const SolarSystem = () => {
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
            style={{ padding: "0px", margin: "0px" }} // didn't change white borders
            ref={(ref) => ref && ref.appendChild(renderer.domElement)}
        />
    );
};

const setupSite = () => {
    /* Setup Renderer */
    renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);

    /* Setup Scene */
    scene.background = createStarsBackground();
    createPlanets();

    /* Setup Camera */
    camera.position.set(-90, 140, 140);
    camera.far = 10000; // Increase the far value
    camera.updateProjectionMatrix();

    /* Setup Orbit Controls */
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update();

    /* Setup Lighting */
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2, 1000); // Increase the distance
    pointLight.intensity = 1.5; // Adjust the intensity
    scene.add(pointLight);
};

const createStarsBackground = () => {
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

const createPlanets = () => {
    const sun = createSun();
    scene.add(sun);

    const planets = planetsData.map((planetData) => {
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

const createSun = () => {
    const sunGeo = new THREE.SphereGeometry(16, 30, 30);
    const sunMat = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(textures.sun),
    });
    return new THREE.Mesh(sunGeo, sunMat);
};

const createPlanet = ({ size, texture, position, ring, initialAngle }) => {
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

        ringMesh.userData.isRing = true; // Set custom property for the ring
    }

    mesh.position.x = position * Math.cos(initialAngle * (Math.PI / 180));
    mesh.position.z = position * Math.sin(initialAngle * (Math.PI / 180));

    return { mesh, obj };
};

const createMoon = (
    { size, texture, position, initialAngle },
    parentObject
) => {
    const textureLoader = new THREE.TextureLoader();

    const geo = new THREE.SphereGeometry(size, 30, 30);
    const mat = new THREE.MeshStandardMaterial({
        map: textureLoader.load(texture),
    });

    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.add(mesh);

    // Position the moon relative to the parent planet
    const distanceFromPlanet = position * 2;
    obj.position.set(distanceFromPlanet, 0, 0);

    mesh.position.x =
        distanceFromPlanet * Math.cos(initialAngle * (Math.PI / 180));
    mesh.position.z =
        distanceFromPlanet * Math.sin(initialAngle * (Math.PI / 180));

    parentObject.add(obj);

    return { mesh, obj };
};

const generateRandomNumber = () => {
    return Math.random() * (0.0002 - 0.0005) + 0.0005;
};

const animate = () => {
    renderer.setAnimationLoop(() => {
        // Self-rotation
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh && !child.userData.isRing) {
                child.rotateY(generateRandomNumber());
            }
        });

        // Around-sun-rotation
        scene.traverse((child) => {
            if (child instanceof THREE.Object3D && !child.userData.isRing) {
                child.rotateY(generateRandomNumber());
            }
        });

        renderer.render(scene, camera);
    });
};

const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

export default SolarSystem;
