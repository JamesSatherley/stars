import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const ThreeScene = () => {
    const sceneRef = useRef(null);

    useEffect(() => {
        // Set up the scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
        sceneRef.current.appendChild(renderer.domElement);

        // Create the sun
        const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        scene.add(sun);

        // Create the earth
        const earthOrbitRadius = 5;
        const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
        const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        sun.add(earth);

        // Create the moon
        const moonOrbitRadius = 2;
        const moonGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        earth.add(moon);

        // Set initial positions and rotations
        sun.position.set(0, 0, 0);
        earth.position.set(5, 0, 0);
        moon.position.set(2, 0, 0);

        // Set camera position
        camera.position.set(0, 10, 0);
        camera.lookAt(scene.position);

        let earthOrbitAngle = 0;
        let moonOrbitAngle = 0;

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            // Rotate the sun
            sun.rotation.y += 0.001;

            // Rotate the earth on its own axis
            earth.rotation.y += 0.01;

            // Orbit the earth
            const earthX = Math.cos(earthOrbitAngle) * earthOrbitRadius;
            const earthZ = Math.sin(earthOrbitAngle) * earthOrbitRadius;
            earth.position.set(earthX, 0, earthZ);
            earthOrbitAngle += 0.01;

            // Orbit the moon
            const moonX = Math.cos(moonOrbitAngle) * moonOrbitRadius;
            const moonZ = Math.sin(moonOrbitAngle) * moonOrbitRadius;
            moon.position.set(moonX, 0, moonZ);
            moonOrbitAngle += 0.03;

            renderer.render(scene, camera);
        }

        animate();

        // Clean up Three.js resources on component unmount
        return () => {
            scene.remove(sun);
            renderer.dispose();
        };
    }, []);

    return <div ref={sceneRef} />;
};

export default ThreeScene;
