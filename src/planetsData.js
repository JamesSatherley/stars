import textures from "./assets/textures";

const planetsData = [
    {
        size: 3.2,
        texture: textures.mercury,
        position: 28,
        initialAngle: Math.random() * 360,
        moons: [
            {
                size: 1,
                texture: textures.moon,
                position: 4,
                initialAngle: Math.random() * 360,
            },
        ],
    },
    {
        size: 5.8,
        texture: textures.venus,
        position: 44,
        initialAngle: Math.random() * 360,
        moons: [
            {
                size: 2,
                texture: textures.moon,
                position: 6,
                initialAngle: Math.random() * 360,
            },
            // Add more moons for Venus if applicable
        ],
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

export { planetsData as default };
