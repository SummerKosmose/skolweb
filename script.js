 
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* =========================================
   BEYOND THE VISIBLE
   Interactive Science Exhibition
   ========================================= */


/* ---------- DOM ELEMENTS ---------- */

const sceneContainer = document.getElementById("scene-container");

const modelTabs = document.querySelectorAll(".model-tab");

const modelTitle = document.getElementById("model-title");
const modelDescription = document.getElementById("model-description");
const modelFact = document.getElementById("model-fact");
const infoIndex = document.getElementById("info-index");
const sceneCaption = document.getElementById("scene-caption");

const resetCameraButton = document.getElementById("reset-camera");

const atomControls = document.getElementById("atom-controls");
const dnaControls = document.getElementById("dna-controls");
const reactionControls = document.getElementById("reaction-controls");
const gravityControls = document.getElementById("gravity-controls");

const reactionSelect = document.getElementById("reaction-select");
const runReactionButton = document.getElementById("run-reaction");
const reactionEquation = document.getElementById("reaction-equation");
const reactionResult = document.getElementById("reaction-result");

const massSlider = document.getElementById("mass-slider");
const massValue = document.getElementById("mass-value");


/* ---------- THREE.JS SCENE ---------- */

const scene = new THREE.Scene();

scene.background = new THREE.Color("#090a13");

scene.fog = new THREE.FogExp2("#090a13", 0.025);

const camera = new THREE.PerspectiveCamera(
    45,
    1,
    0.1,
    1000
);

camera.position.set(0, 2, 9);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

sceneContainer.appendChild(renderer.domElement);


/* ---------- CAMERA CONTROLS ---------- */

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.06;

controls.minDistance = 3;
controls.maxDistance = 18;

controls.target.set(0, 0, 0);


/* ---------- LIGHTING ---------- */

const ambientLight = new THREE.AmbientLight("#b9b8ff", 1.5);
scene.add(ambientLight);

const mainLight = new THREE.PointLight("#a78bfa", 90, 30);
mainLight.position.set(4, 5, 6);
scene.add(mainLight);

const cyanLight = new THREE.PointLight("#67e8f9", 65, 25);
cyanLight.position.set(-5, -2, 4);
scene.add(cyanLight);

const pinkLight = new THREE.PointLight("#f0abfc", 45, 25);
pinkLight.position.set(0, 5, -5);
scene.add(pinkLight);


/* ---------- GROUPS ---------- */

const modelGroup = new THREE.Group();
scene.add(modelGroup);

let currentModel = "atom";
let currentModelObjects = [];

let animationTime = 0;
let gravityMass = 0.5;

let reactionRunning = false;
let reactionParticles = [];
let reactionAnimationStart = 0;

let currentReaction = "vinegar";


/* ---------- MATERIAL HELPERS ---------- */

function createMaterial(color, options = {}) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness: options.roughness ?? 0.3,
        metalness: options.metalness ?? 0.15,
        emissive: options.emissive ?? color,
        emissiveIntensity: options.emissiveIntensity ?? 0.15
    });
}


function createSphere(radius, color, position, options = {}) {
    const geometry = new THREE.SphereGeometry(radius, 32, 24);

    const material = createMaterial(color, options);

    const sphere = new THREE.Mesh(geometry, material);

    sphere.position.set(
        position.x,
        position.y,
        position.z
    );

    sphere.userData.isInteractive = true;

    modelGroup.add(sphere);
    currentModelObjects.push(sphere);

    return sphere;
}


function createLine(points, color, opacity = 0.6) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity
    });

    const line = new THREE.Line(geometry, material);

    modelGroup.add(line);

    return line;
}


function createRing(radius, color, rotation = [0, 0, 0]) {
    const geometry = new THREE.TorusGeometry(radius, 0.012, 8, 120);

    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6
    });

    const ring = new THREE.Mesh(geometry, material);

    ring.rotation.set(...rotation);

    modelGroup.add(ring);

    return ring;
}


/* ---------- CLEAN UP PREVIOUS MODEL ---------- */

function clearModel() {
    modelGroup.traverse((object) => {
        if (object.geometry) {
            object.geometry.dispose();
        }

        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach((material) => material.dispose());
            } else {
                object.material.dispose();
            }
        }
    });

    while (modelGroup.children.length > 0) {
        modelGroup.remove(modelGroup.children[0]);
    }

    currentModelObjects = [];
    reactionParticles = [];
    reactionRunning = false;
}


/* ---------- STAR PARTICLES ---------- */

function createStars() {
    const starCount = 350;

    const positions = [];

    for (let i = 0; i < starCount; i++) {
        positions.push(
            (Math.random() - 0.5) * 35,
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 25
        );
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
        color: "#bcb5ff",
        size: 0.035,
        transparent: true,
        opacity: 0.7
    });

    const stars = new THREE.Points(geometry, material);

    scene.add(stars);

    return stars;
}

const stars = createStars();


/* =========================================
   MODEL 1: ATOMIC WORLD
   ========================================= */

function buildAtom() {
    clearModel();

    const protonColors = ["#fb7185", "#ff8a9e"];
    const neutronColors = ["#8b5cf6", "#b09aff"];

    // Illustrative nucleus containing 3 protons and 4 neutrons.
    // This represents the composition of a lithium-7 nucleus.

    const nucleusParticles = [
        { color: protonColors[0], position: [-0.25, 0.15, 0] },
        { color: protonColors[1], position: [0.22, -0.08, 0.15] },
        { color: protonColors[0], position: [0.05, 0.3, -0.2] },

        { color: neutronColors[0], position: [-0.12, -0.25, 0.12] },
        { color: neutronColors[1], position: [0.3, 0.18, 0.2] },
        { color: neutronColors[0], position: [-0.3, 0, -0.2] },
        { color: neutronColors[1], position: [0.05, -0.32, -0.15] }
    ];

    nucleusParticles.forEach((particle) => {
        createSphere(
            0.24,
            particle.color,
            {
                x: particle.position[0],
                y: particle.position[1],
                z: particle.position[2]
            },
            {
                roughness: 0.25,
                metalness: 0.1,
                emissiveIntensity: 0.35
            }
        );
    });

    // Electron shells are illustrative paths, not exact electron orbits.

    createRing(1.65, "#a78bfa", [0, 0, 0]);
    createRing(1.65, "#67e8f9", [Math.PI / 2, 0.25, 0]);
    createRing(1.65, "#f0abfc", [0.7, 0.5, 0.8]);

    // Electron objects orbit around the nucleus.

    const electronData = [
        { angle: 0, radius: 1.65, speed: 0.8, tilt: 0 },
        { angle: 2.1, radius: 1.65, speed: -0.65, tilt: 1.57 },
        { angle: 4.2, radius: 1.65, speed: 0.5, tilt: 0.8 }
    ];

    electronData.forEach((electron) => {
        const mesh = createSphere(
            0.09,
            "#67e8f9",
            { x: 0, y: 0, z: 0 },
            {
                roughness: 0.15,
                metalness: 0.2,
                emissiveIntensity: 1.5
            }
        );

        mesh.userData.orbit = electron;
        mesh.userData.isElectron = true;
    });

    modelGroup.scale.setScalar(1.05);

    updateInformation("atom");
}


/* =========================================
   MODEL 2: DNA EXPLORER
   ========================================= */

function buildDNA() {
    clearModel();

    const basePairs = 65;
    const helixHeight = 5.5;
    const helixRadius = 1.05;
    const turns = 2.5;

    const strandOne = [];
    const strandTwo = [];

    for (let i = 0; i <= basePairs; i++) {
        const t = i / basePairs;

        const angle = t * Math.PI * 2 * turns;
        const y = t * helixHeight - helixHeight / 2;

        const x1 = Math.cos(angle) * helixRadius;
        const z1 = Math.sin(angle) * helixRadius;

        const x2 = Math.cos(angle + Math.PI) * helixRadius;
        const z2 = Math.sin(angle + Math.PI) * helixRadius;

        strandOne.push(new THREE.Vector3(x1, y, z1));
        strandTwo.push(new THREE.Vector3(x2, y, z2));

        // Sugar-phosphate backbone beads.

        if (i % 2 === 0) {
            createSphere(
                0.075,
                "#a78bfa",
                { x: x1, y, z: z1 },
                { emissiveIntensity: 0.5 }
            );

            createSphere(
                0.075,
                "#67e8f9",
                { x: x2, y, z: z2 },
                { emissiveIntensity: 0.5 }
            );
        }

        // Base-pair connectors.

        if (i % 3 === 0) {
            const color = i % 2 === 0 ? "#f0abfc" : "#fbbf24";

            createLine(
                [
                    new THREE.Vector3(x1, y, z1),
                    new THREE.Vector3(x2, y, z2)
                ],
                color,
                0.8
            );

            const middle = {
                x: (x1 + x2) / 2,
                y,
                z: (z1 + z2) / 2
            };

            createSphere(
                0.055,
                color,
                middle,
                { emissiveIntensity: 0.6 }
            );
        }
    }

    // Continuous double-helix strands.

    createLine(strandOne, "#a78bfa", 0.95);
    createLine(strandTwo, "#67e8f9", 0.95);

    modelGroup.rotation.z = -0.1;

    updateInformation("dna");
}


/* =========================================
   MODEL 3: REACTION LAB
   ========================================= */

function buildReaction() {
    clearModel();

    // Two containers represented by transparent outlines.

    const containerMaterial = new THREE.LineBasicMaterial({
        color: "#7379a8",
        transparent: true,
        opacity: 0.65
    });

    function makeContainer(xPosition) {
        const points = [
            new THREE.Vector3(-0.8, 1.2, 0),
            new THREE.Vector3(-0.8, -1.2, 0),
            new THREE.Vector3(0.8, -1.2, 0),
            new THREE.Vector3(0.8, 1.2, 0)
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const container = new THREE.LineLoop(
            geometry,
            containerMaterial.clone()
        );

        container.position.x = xPosition;

        modelGroup.add(container);
    }

    makeContainer(-2);
    makeContainer(2);

    // Reaction particles.

    const colors = [
        "#67e8f9",
        "#a78bfa",
        "#f0abfc",
        "#fbbf24",
        "#fb7185"
    ];

    for (let i = 0; i < 24; i++) {
        const side = i < 12 ? -2 : 2;

        const particle = createSphere(
            0.11 + Math.random() * 0.06,
            colors[i % colors.length],
            {
                x: side + (Math.random() - 0.5) * 1.1,
                y: (Math.random() - 0.5) * 1.8,
                z: (Math.random() - 0.5) * 0.4
            },
            {
                roughness: 0.2,
                emissiveIntensity: 0.5
            }
        );

        particle.userData.reactionSide = side;
        particle.userData.originalPosition = particle.position.clone();

        reactionParticles.push(particle);
    }

    // Arrow indicating mixing.

    const arrowPoints = [
        new THREE.Vector3(-0.75, 0, 0),
        new THREE.Vector3(0.75, 0, 0)
    ];

    createLine(arrowPoints, "#67e8f9", 0.9);

    createSphere(
        0.07,
        "#67e8f9",
        { x: 0.75, y: 0, z: 0 },
        { emissiveIntensity: 1 }
    );

    updateInformation("reaction");
    updateReactionDetails();
}


/* =========================================
   MODEL 4: GRAVITY LAB
   ========================================= */

let gravityGrid = null;
let gravitySphere = null;

function buildGravity() {
    clearModel();

    gravityGrid = null;
    gravitySphere = null;

    // Grid warped around a massive object.
    // This is a visual illustration of gravity.

    const gridSize = 8;
    const divisions = 34;
    const gridLines = [];

    for (let i = 0; i <= divisions; i++) {
        const offset = -gridSize / 2 + (i / divisions) * gridSize;

        const horizontalPoints = [];
        const verticalPoints = [];

        for (let j = 0; j <= divisions; j++) {
            const along = -gridSize / 2 + (j / divisions) * gridSize;

            const hx = along;
            const hz = offset;

            const vx = offset;
            const vz = along;

            const hRadiusSquared = hx * hx + hz * hz;
            const vRadiusSquared = vx * vx + vz * vz;

            const hY = -gravityMass *
                1.8 / (1 + hRadiusSquared * 0.8);

            const vY = -gravityMass *
                1.8 / (1 + vRadiusSquared * 0.8);

            horizontalPoints.push(
                new THREE.Vector3(hx, hY, hz)
            );

            verticalPoints.push(
                new THREE.Vector3(vx, vY, vz)
            );
        }

        gridLines.push(horizontalPoints);
        gridLines.push(verticalPoints);
    }

    gridLines.forEach((points) => {
        createLine(points, "#8b7cff", 0.5);
    });

    // Central massive object.

    gravitySphere = createSphere(
        0.65,
        "#8b5cf6",
        { x: 0, y: -0.1, z: 0 },
        {
            roughness: 0.2,
            metalness: 0.25,
            emissiveIntensity: 0.6
        }
    );

    // Outer glowing ring.

    createRing(0.95, "#67e8f9", [Math.PI / 2, 0, 0]);

    modelGroup.rotation.x = -0.15;

    updateInformation("gravity");
}


/* ---------- INFORMATION FOR EACH MODEL ---------- */

const modelInformation = {
    atom: {
        index: "01 / 04",
        title: "The Atomic World",
        description:
            "Zoom into the structure of matter and explore the tiny particles that make up everything around us.",
        fact:
            "The nucleus of an atom contains protons and neutrons. Electrons occupy regions around the nucleus."
    },

    dna: {
        index: "02 / 04",
        title: "The DNA Explorer",
        description:
            "Discover the twisted double-helix structure of DNA, the molecule that carries genetic information.",
        fact:
            "DNA contains four nitrogenous bases: adenine, thymine, guanine, and cytosine. Their sequence helps store genetic instructions."
    },

    reaction: {
        index: "03 / 04",
        title: "The Reaction Lab",
        description:
            "Choose a chemical process and observe an illustration of particles moving and mixing during an experiment.",
        fact:
            "Chemical reactions rearrange atoms. In a chemical reaction, atoms are conserved even when new substances form."
    },

    gravity: {
        index: "04 / 04",
        title: "The Gravity Lab",
        description:
            "Explore a visual model of how mass affects the shape of a simplified gravitational field.",
        fact:
            "Gravity is an attractive interaction between objects with mass. In general relativity, mass and energy influence spacetime curvature."
    }
};


function updateInformation(modelName) {
    const information = modelInformation[modelName];

    modelTitle.textContent = information.title;
    modelDescription.textContent = information.description;
    modelFact.textContent = information.fact;
    infoIndex.textContent = information.index;

    const captions = {
        atom: "ATOMIC STRUCTURE",
        dna: "DNA DOUBLE HELIX",
        reaction: "CHEMICAL REACTIONS",
        gravity: "GRAVITATIONAL FIELD"
    };

    sceneCaption.textContent = captions[modelName];

    atomControls.classList.toggle("hidden", modelName !== "atom");
    dnaControls.classList.toggle("hidden", modelName !== "dna");
    reactionControls.classList.toggle("hidden", modelName !== "reaction");
    gravityControls.classList.toggle("hidden", modelName !== "gravity");
}


/* ---------- SWITCH MODELS ---------- */

function switchModel(modelName) {
    currentModel = modelName;

    modelTabs.forEach((tab) => {
        const isActive = tab.dataset.model === modelName;

        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-pressed", String(isActive));
    });

    switch (modelName) {
        case "atom":
            buildAtom();
            break;

        case "dna":
            buildDNA();
            break;

        case "reaction":
            buildReaction();
            break;

        case "gravity":
            buildGravity();
            break;

        default:
            buildAtom();
    }

    resetCamera();
}


modelTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        switchModel(tab.dataset.model);
    });
});


/* ---------- RESET CAMERA ---------- */

function resetCamera() {
    camera.position.set(0, 2, 9);

    controls.target.set(0, 0, 0);

    controls.update();
}

resetCameraButton.addEventListener("click", resetCamera);


/* =========================================
   CHEMICAL REACTION INFORMATION
   ========================================= */

const reactionInformation = {
    vinegar: {
        equation: "CH₃COOH + NaHCO₃",
        result:
            "Vinegar (acetic acid) reacts with baking soda to form sodium acetate, water, and carbon dioxide gas.",
        product:
            "CH₃COONa + H₂O + CO₂",
        observation:
            "Bubbles form because carbon dioxide gas is released."
    },

    chalk: {
        equation: "2CH₃COOH + CaCO₃",
        result:
            "Vinegar reacts with calcium carbonate in chalk to produce calcium acetate, water, and carbon dioxide.",
        product:
            "Ca(CH₃COO)₂ + H₂O + CO₂",
        observation:
            "Fizzing occurs as carbon dioxide gas is released."
    },

    citric: {
        equation: "C₆H₈O₇ + 3NaHCO₃",
        result:
            "Citric acid reacts with baking soda to form sodium citrate, water, and carbon dioxide.",
        product:
            "Na₃C₆H₅O₇ + 3H₂O + 3CO₂",
        observation:
            "Bubbles appear as carbon dioxide is produced."
    },

    salt: {
        equation: "NaCl + H₂O",
        result:
            "Salt dissolves in water. Its ions become dispersed throughout the water; this is generally a physical change.",
        product:
            "Na⁺(aq) + Cl⁻(aq)",
        observation:
            "The salt crystals gradually disappear as the salt dissolves."
    }
};


function updateReactionDetails() {
    currentReaction = reactionSelect.value;

    const information = reactionInformation[currentReaction];

    reactionEquation.textContent = information.equation;

    reactionResult.textContent =
        "Choose Run Reaction to begin the experiment.";
}


reactionSelect.addEventListener("change", updateReactionDetails);


runReactionButton.addEventListener("click", () => {
    if (reactionRunning) {
        return;
    }

    currentReaction = reactionSelect.value;

    const information = reactionInformation[currentReaction];

    reactionRunning = true;
    reactionAnimationStart = animationTime;

    runReactionButton.disabled = true;
    runReactionButton.textContent = "Experiment Running...";

    reactionResult.textContent = "Observing the experiment...";

    reactionParticles.forEach((particle, index) => {
        const side = particle.userData.reactionSide;

        const targetX = (Math.random() - 0.5) * 2.4;
        const targetY = (Math.random() - 0.5) * 2.2;
        const targetZ = (Math.random() - 0.5) * 1.5;

        particle.userData.startPosition = particle.position.clone();

        particle.userData.targetPosition = new THREE.Vector3(
            targetX,
            targetY,
            targetZ
        );

        particle.userData.animationDelay = index * 0.025;

        particle.userData.reactionSide = side;
    });

    setTimeout(() => {
        if (currentModel !== "reaction") {
            return;
        }

        reactionRunning = false;

        runReactionButton.disabled = false;
        runReactionButton.innerHTML = 'Run Again <span>↗</span>';

        reactionEquation.textContent = information.product;

        reactionResult.textContent =
            information.observation + " " + information.result;
    }, 1800);
});


/* =========================================
   GRAVITY MASS SLIDER
   ========================================= */

massSlider.addEventListener("input", () => {
    gravityMass = Number(massSlider.value) / 100;

    massValue.textContent = `${massSlider.value}%`;

    if (currentModel === "gravity") {
        buildGravity();
    }
});


/* =========================================
   INTERACTION WITH 3D OBJECTS
   ========================================= */

const raycaster = new THREE.Raycaster();

const pointer = new THREE.Vector2();

let pointerDownPosition = null;


renderer.domElement.addEventListener("pointerdown", (event) => {
    pointerDownPosition = {
        x: event.clientX,
        y: event.clientY
    };
});


renderer.domElement.addEventListener("pointerup", (event) => {
    if (!pointerDownPosition) {
        return;
    }

    const distance = Math.hypot(
        event.clientX - pointerDownPosition.x,
        event.clientY - pointerDownPosition.y
    );

    pointerDownPosition = null;

    // Ignore a drag gesture; only handle actual clicks.

    if (distance > 5) {
        return;
    }

    const rect = renderer.domElement.getBoundingClientRect();

    pointer.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;

    pointer.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(
        currentModelObjects,
        false
    );

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;

        selectedObject.userData.selectedAt = animationTime;

        selectedObject.scale.setScalar(1.3);

        modelFact.textContent = getSelectedObjectFact();
    }
});


function getSelectedObjectFact() {
    const facts = {
        atom:
            "You selected a particle in the atomic model. Protons have a positive charge, neutrons have no charge, and electrons have a negative charge.",

        dna:
            "You selected a part of the DNA illustration. DNA is made from nucleotides containing a sugar, phosphate group, and nitrogenous base.",

        reaction:
            "You selected a particle in the reaction illustration. During a chemical reaction, atoms rearrange to form new substances.",

        gravity:
            "You selected an object in the gravity illustration. Objects with mass attract one another through gravity."
    };

    return facts[currentModel];
}


/* =========================================
   WINDOW RESIZING
   ========================================= */

function resizeRenderer() {
    const width = sceneContainer.clientWidth;
    const height = sceneContainer.clientHeight;

    if (width === 0 || height === 0) {
        return;
    }

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);
}

const resizeObserver = new ResizeObserver(resizeRenderer);

resizeObserver.observe(sceneContainer);

window.addEventListener("resize", resizeRenderer);

resizeRenderer();


/* =========================================
   ANIMATION LOOP
   ========================================= */

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    animationTime += delta;

    controls.update();

    // Slowly rotate the background stars.

    stars.rotation.y += delta * 0.008;

    // Animate the atom's electrons.

    if (currentModel === "atom") {
        currentModelObjects.forEach((object) => {
            if (!object.userData.isElectron) {
                return;
            }

            const orbit = object.userData.orbit;

            const angle = orbit.angle +
                animationTime * orbit.speed;

            const x = Math.cos(angle) * orbit.radius;

            const z = Math.sin(angle) * orbit.radius;

            object.position.set(
                x,
                Math.sin(angle) * 0.3,
                z
            );

            if (orbit.tilt > 1) {
                object.position.applyAxisAngle(
                    new THREE.Vector3(1, 0, 0),
                    orbit.tilt
                );
            }
        });

        modelGroup.rotation.y += delta * 0.08;
    }

    // Slowly rotate the DNA helix.

    if (currentModel === "dna") {
        modelGroup.rotation.y += delta * 0.12;
    }

    // Animate particles mixing in the reaction lab.

    if (currentModel === "reaction" && reactionRunning) {
        const elapsed = animationTime - reactionAnimationStart;

        reactionParticles.forEach((particle) => {
            const start = particle.userData.startPosition;
            const target = particle.userData.targetPosition;
            const delay = particle.userData.animationDelay;

            if (!start || !target) {
                return;
            }

            const progress = THREE.MathUtils.clamp(
                (elapsed - delay) / 1.2,
                0,
                1
            );

            const eased = progress * progress * (3 - 2 * progress);

            particle.position.lerpVectors(start, target, eased);
        });
    }

    // Make the gravity object gently pulse.

    if (currentModel === "gravity" && gravitySphere) {
        const pulse = 1 + Math.sin(animationTime * 2) * 0.025;

        gravitySphere.scale.setScalar(pulse);
    }

    // Restore clicked-object scale after a short highlight.

    currentModelObjects.forEach((object) => {
        if (object.userData.selectedAt === undefined) {
            return;
        }

        const elapsed = animationTime - object.userData.selectedAt;

        if (elapsed > 0.25) {
            object.scale.setScalar(1);
            delete object.userData.selectedAt;
        }
    });

    renderer.render(scene, camera);
}


/* ---------- START WEBSITE ---------- */

switchModel("atom");

animate();
