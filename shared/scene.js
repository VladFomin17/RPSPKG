import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

/**
 * Общая обвязка сцены: рендерер, камера, орбитальное управление, цикл кадров.
 * Единая точка настройки для всех лабораторных 5–8.
 */
export function createView(container, options = {}) {
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = options.exposure ?? 1.05;
    container.append(renderer.domElement);

    const background = new THREE.Color(options.background ?? 0x0b0f18);
    const scene = new THREE.Scene();
    scene.background = background;

    if (options.fog !== false) {
        scene.fog = new THREE.Fog(background, options.fogNear ?? 90, options.fogFar ?? 380);
    }

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
    camera.position.set(32, 18, 46);

    let controls = null;
    if (options.orbit !== false) {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = 6;
        controls.maxDistance = 400;
        controls.maxPolarAngle = Math.PI * 0.495;
        controls.target.set(0, 2, 0);
    }

    const resize = () => {
        const width = Math.max(1, container.clientWidth);
        const height = Math.max(1, container.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    };

    new ResizeObserver(resize).observe(container);
    resize();

    const frames = [];
    const clock = new THREE.Clock();

    renderer.setAnimationLoop(() => {
        const dt = Math.min(clock.getDelta(), 0.05);
        for (const frame of frames) {
            frame(dt, clock.elapsedTime);
        }
        if (controls) {
            controls.update();
        }
        renderer.render(scene, camera);
    });

    return {
        renderer,
        scene,
        camera,
        controls,
        onFrame: frame => frames.push(frame)
    };
}

/** Ставит камеру так, чтобы объект целиком попал в кадр. */
export function frameCamera(camera, controls, object, padding = 1.35) {
    const box = new THREE.Box3().setFromObject(object);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const distance = (sphere.radius * padding) / Math.sin((camera.fov * Math.PI) / 360);

    controls.target.copy(sphere.center);

    const direction = new THREE.Vector3(0.62, 0.42, 0.66).normalize();
    camera.position.copy(sphere.center).addScaledVector(direction, distance);
    camera.near = Math.max(0.1, distance / 200);
    camera.far = distance * 30;
    camera.updateProjectionMatrix();
    controls.update();
}

/** Земля с сеткой — нужна, чтобы объект «стоял» и отбрасывал тень. */
export function addGround(scene, y = 0, options = {}) {
    const size = options.size ?? 400;

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshStandardMaterial({
            color: options.color ?? 0x161b26,
            roughness: 0.96,
            metalness: 0
        })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = y;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(size, 80, 0x26334d, 0x1a2233);
    grid.position.y = y + 0.02;
    grid.material.transparent = true;
    grid.material.opacity = 0.55;
    scene.add(grid);

    return ground;
}

/** Трёхточечная схема: заполняющий свет сверху, основной и контровой. */
export function addStudioLights(scene, options = {}) {
    const extent = options.shadowExtent ?? 25;

    const ambient = new THREE.HemisphereLight(0xa8c4ff, 0x1a1e28, 0.55);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xfff1dc, 3.2);
    key.position.set(45, 70, 40);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -extent;
    key.shadow.camera.right = extent;
    key.shadow.camera.top = extent;
    key.shadow.camera.bottom = -extent;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 220;
    key.shadow.camera.updateProjectionMatrix();
    key.shadow.bias = -0.0002;
    key.shadow.normalBias = 0.06;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x6f9bff, 1.4);
    rim.position.set(-60, 30, -55);
    scene.add(rim);

    return {ambient, key, rim};
}
