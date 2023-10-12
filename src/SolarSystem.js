import React, { useEffect, useRef, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";
import { Interaction } from "three.interaction"; // Import the Interaction class

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
    const [zoomThreshold, setZoomThreshold] = useState(500);

    const cameraRef = useRef();
    const controlsRef = useRef();
    const selectedPlanetRef = useRef(null);

    useEffect(() => {
        setupSite();
        animate();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        const planets = scene.children.filter(
            (child) => child.userData.isPlanet
        );
        const interaction = new Interaction(renderer, scene, camera); // Create an instance of the Interaction class

        planets.forEach((planet) => {
            planet.cursor = "pointer"; // Set the cursor style
            planet.on("click", handlePlanetClick); // Add click event listener
        });

        return () => {
            planets.forEach((planet) => {
                planet.off("click", handlePlanetClick); // Remove click event listener
            });
        };
    }, []);

    const handlePlanetClick = (event) => {
        console.log("Planet clicked");
        const planet = event.target;
        selectedPlanetRef.current = planet;

        const camera = cameraRef.current;
        const controls = controlsRef.current;

        camera.position.copy(
            planet.position.clone().add(new THREE.Vector3(0, 10, 30))
        );
        controls.target.copy(planet.position);

        controls.maxDistance = zoomThreshold;
        controls.update();
    };

    const setupSite = () => {
        renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
        scene.background = createStarsBackground();
        createPlanets();

        camera.position.set(-90, 140, 140);
        camera.far = 10000;
        camera.updateProjectionMatrix();

        const orbit = new OrbitControls(camera, renderer.domElement);
        orbit.update();
        controlsRef.current = orbit;

        const ambientLight = new THREE.AmbientLight(0x333333);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
        pointLight.intensity = 1.5;
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
            planet.obj.userData.isPlanet = true;

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

            ringMesh.userData.isRing = true;
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

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    return (
        <div>
            <button onClick={() => setZoomThreshold(100)}>
                Zoom Threshold: 100
            </button>
            <button onClick={() => setZoomThreshold(1000)}>
                Zoom Threshold: 1000
            </button>
            <div
                style={{ padding: "0px", margin: "0px" }}
                ref={(ref) => ref && ref.appendChild(renderer.domElement)}
            />
        </div>
    );
};

export default SolarSystem;
