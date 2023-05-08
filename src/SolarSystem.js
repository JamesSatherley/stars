import React, { useEffect } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";

import textures from "./assets/textures";

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const SolarSystem = () => {
    console.log("SolarSystem rendered");
    useEffect(() => {
        setupRenderer();
        setupScene();
        setupCamera();
        setupOrbitControls();
        setupLighting();

        animate();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return <div ref={(ref) => ref && ref.appendChild(renderer.domElement)} />;
};

const setupRenderer = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
};

const setupScene = () => {
    scene.background = createStarsBackground();
    createPlanets();
};

const setupCamera = () => {
    camera.position.set(-90, 140, 140);
};

const setupOrbitControls = () => {
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update();
};

const setupLighting = () => {
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2, 300);
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

    const planetsData = [
        {
            size: 3.2,
            texture: textures.mercury,
            position: 28,
            initialAngle: Math.random() * 360,
        },
        {
            size: 5.8,
            texture: textures.venus,
            position: 44,
            initialAngle: Math.random() * 360,
        },
        {
            size: 6,
            texture: textures.earth,
            position: 62,
            initialAngle: Math.random() * 360,
        },
        {
            size: 4,
            texture: textures.mars,
            position: 78,
            initialAngle: Math.random() * 360,
        },
        {
            size: 12,
            texture: textures.jupiter,
            position: 100,
            initialAngle: Math.random() * 360,
        },
        {
            size: 10,
            texture: textures.saturn,
            position: 138,
            ring: {
                innerRadius: 10,
                outerRadius: 20,
                texture: textures.saturnRing,
            },
            initialAngle: Math.random() * 360,
        },
        {
            size: 7,
            texture: textures.uranus,
            position: 176,
            ring: {
                innerRadius: 7,
                outerRadius: 12,
                texture: textures.uranusRing,
            },
            initialAngle: Math.random() * 360,
        },
        {
            size: 7,
            texture: textures.neptune,
            position: 200,
            initialAngle: Math.random() * 360,
        },
        {
            size: 2.8,
            texture: textures.pluto,
            position: 216,
            initialAngle: Math.random() * 360,
        },
    ];

    const planets = planetsData.map((planetData) => {
        const planet = createPlanet(planetData);
        scene.add(planet.obj);
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
    }

    mesh.position.x = position * Math.cos(initialAngle * (Math.PI / 180));
    mesh.position.z = position * Math.sin(initialAngle * (Math.PI / 180));

    return { mesh, obj };
};

const generateRandomNumber = () => {
    return Math.random() * (0.0002 - 0.0005) + 0.0005;
};

const animate = () => {
    renderer.setAnimationLoop(() => {
        // Self-rotation
        scene.traverse((child) => {
            if (
                child instanceof THREE.Mesh &&
                !(child.parent instanceof THREE.RingGeometry)
            ) {
                child.rotateY(generateRandomNumber());
            }
        });

        // Around-sun-rotation
        scene.traverse((child) => {
            if (
                child instanceof THREE.Object3D &&
                !child.children.some((c) => c instanceof THREE.RingGeometry)
            ) {
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
