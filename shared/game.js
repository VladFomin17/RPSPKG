import * as THREE from 'three';
import {addStudioLights} from './scene.js';
import {buildCharacter} from './character.js';
import {Walker} from './animation.js';

const ARENA_RADIUS = 30;
const PLAYER_SPEED = 16;
const PLAYER_SCALE = 0.38;
const ENEMY_SPEED = 10.5;
const CRYSTAL_COUNT = 10;
const CRYSTAL_TARGET = 10;
const GAME_TIME = 60;

const PLAYER_BASE_Y = 9; // локальная высота ступней у фигуры из лабы №4

export class Game {
    constructor(view, handlers = {}) {
        this.view = view;
        this.scene = view.scene;
        this.camera = view.camera;
        this.renderer = view.renderer;

        this.onState = handlers.onState ?? (() => {});
        this.onHud = handlers.onHud ?? (() => {});

        this.state = 'menu';
        this.score = 0;
        this.timeLeft = GAME_TIME;
        this.elapsed = 0;
        this.yaw = 0;
        this.keys = new Set();
        this.velocity = new THREE.Vector3();

        this.buildArena();
        this.buildPlayer();
        this.buildCrystals();
        this.buildEnemies();
        this.bindInput();

        this.camera.position.set(0, 16, 26);
        this.camera.lookAt(0, 4, 0);

        this.view.onFrame(dt => this.update(dt));
    }

    buildArena() {
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(220, 220),
            new THREE.MeshStandardMaterial({color: 0x121a2a, roughness: 0.9, metalness: 0.05})
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        const grid = new THREE.GridHelper(ARENA_RADIUS * 2, 30, 0x2a3b5e, 0x1a2740);
        grid.position.y = 0.02;
        this.scene.add(grid);

        const ring = new THREE.Mesh(
            new THREE.RingGeometry(ARENA_RADIUS - 0.5, ARENA_RADIUS, 128),
            new THREE.MeshBasicMaterial({
                color: 0x4f8cff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.55
            })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.03;
        this.scene.add(ring);

        const lights = addStudioLights(this.scene, {shadowExtent: 40});
        lights.key.color.set(0xcfe0ff);
        lights.key.intensity = 2.6;
        lights.rim.color.set(0xff6fb0);
        lights.rim.intensity = 1.1;
        lights.rim.position.set(-50, 25, -40);
    }

    buildPlayer() {
        const rig = buildCharacter();
        this.rig = rig;
        this.walker = new Walker(rig, {baseY: PLAYER_BASE_Y});

        this.player = new THREE.Group();
        this.player.scale.setScalar(PLAYER_SCALE);
        this.player.add(rig.root);
        this.scene.add(this.player);
    }

    buildCrystals() {
        const geometry = new THREE.IcosahedronGeometry(0.9, 0);
        const material = new THREE.MeshStandardMaterial({
            color: 0x66e6ff,
            emissive: 0x2aa8d0,
            emissiveIntensity: 1.4,
            metalness: 0.4,
            roughness: 0.2
        });

        this.crystals = [];

        for (let i = 0; i < CRYSTAL_COUNT; i++) {
            const crystal = new THREE.Mesh(geometry, material);
            crystal.castShadow = true;
            crystal.userData.phase = Math.random() * Math.PI * 2;
            crystal.position.copy(this.randomArenaPoint(4));
            crystal.position.y = 1.9;
            this.scene.add(crystal);
            this.crystals.push(crystal);
        }
    }

    buildEnemies() {
        const geometry = new THREE.SphereGeometry(1.4, 24, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff5566,
            emissive: 0x661018,
            emissiveIntensity: 0.9,
            roughness: 0.35,
            metalness: 0.2
        });

        this.enemies = [];

        for (let i = 0; i < 3; i++) {
            const enemy = new THREE.Mesh(geometry, material);
            enemy.castShadow = true;
            enemy.userData.phase = Math.random() * Math.PI * 2;
            const point = this.randomArenaPoint(18);
            enemy.position.set(point.x, 1.8, point.z);
            this.scene.add(enemy);
            this.enemies.push(enemy);
        }
    }

    randomArenaPoint(margin = 4) {
        const angle = Math.random() * Math.PI * 2;
        const radius = margin + Math.random() * (ARENA_RADIUS - margin - 3);
        return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    }

    bindInput() {
        window.addEventListener('keydown', event => {
            if (event.code === 'Enter' && this.state !== 'play') {
                this.start();
                return;
            }

            this.keys.add(event.code);

            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
                event.preventDefault();
            }
        });

        window.addEventListener('keyup', event => {
            this.keys.delete(event.code);
        });

        const canvas = this.renderer.domElement;
        let dragging = false;

        canvas.addEventListener('pointerdown', () => {
            dragging = true;
        });

        window.addEventListener('pointerup', () => {
            dragging = false;
        });

        window.addEventListener('pointermove', event => {
            if (dragging) {
                this.yaw -= event.movementX * 0.005;
            }
        });
    }

    start() {
        this.state = 'play';
        this.score = 0;
        this.timeLeft = GAME_TIME;
        this.elapsed = 0;
        this.yaw = 0;
        this.velocity.set(0, 0, 0);

        this.player.position.set(0, 0, 0);
        this.player.rotation.y = 0;

        for (const crystal of this.crystals) {
            crystal.position.copy(this.randomArenaPoint(4));
            crystal.position.y = 1.9;
        }

        for (const enemy of this.enemies) {
            const point = this.randomArenaPoint(18);
            enemy.position.set(point.x, 1.8, point.z);
        }

        this.onState('play');
    }

    finish(state) {
        if (this.state !== 'play') {
            return;
        }

        this.state = state;
        this.velocity.set(0, 0, 0);
        this.walker.setMode('idle');
        this.onState(state);
    }

    update(dt) {
        this.elapsed += dt;

        if (this.state === 'play') {
            this.timeLeft -= dt;

            this.updatePlayer(dt);
            this.updateCrystals(dt);
            this.updateEnemies(dt);

            if (this.timeLeft <= 0) {
                this.finish('lose');
            }
        } else {
            this.yaw += dt * 0.12;
        }

        this.walker.update(dt);
        this.updateCamera(dt);

        this.onHud({
            score: this.score,
            time: Math.max(0, this.timeLeft),
            state: this.state
        });
    }

    updatePlayer(dt) {
        const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
        const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
        const direction = new THREE.Vector3();

        if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) {
            direction.add(forward);
        }
        if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) {
            direction.sub(forward);
        }
        if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) {
            direction.add(right);
        }
        if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) {
            direction.sub(right);
        }

        if (direction.lengthSq() > 0) {
            direction.normalize();
        }

        this.velocity.x = THREE.MathUtils.damp(this.velocity.x, direction.x * PLAYER_SPEED, 8, dt);
        this.velocity.z = THREE.MathUtils.damp(this.velocity.z, direction.z * PLAYER_SPEED, 8, dt);

        this.player.position.x += this.velocity.x * dt;
        this.player.position.z += this.velocity.z * dt;

        const distance = Math.hypot(this.player.position.x, this.player.position.z);
        const limit = ARENA_RADIUS - 2;

        if (distance > limit) {
            const scale = limit / distance;
            this.player.position.x *= scale;
            this.player.position.z *= scale;
        }

        const speed = Math.hypot(this.velocity.x, this.velocity.z);
        if (speed > 0.5) {
            this.player.rotation.y = Math.atan2(this.velocity.x, this.velocity.z);
            this.walker.setMode(speed > PLAYER_SPEED * 0.6 ? 'run' : 'walk');
        } else {
            this.walker.setMode('idle');
        }
    }

    updateCrystals(dt) {
        for (const crystal of this.crystals) {
            crystal.rotation.y += dt * 2;
            crystal.position.y = 1.9 + Math.sin(this.elapsed * 2 + crystal.userData.phase) * 0.22;

            const dx = crystal.position.x - this.player.position.x;
            const dz = crystal.position.z - this.player.position.z;

            if (Math.hypot(dx, dz) < 2.8) {
                this.score += 1;
                crystal.position.copy(this.randomArenaPoint(4));
                crystal.position.y = 1.9;

                if (this.score >= CRYSTAL_TARGET) {
                    this.finish('win');
                    return;
                }
            }
        }
    }

    updateEnemies(dt) {
        for (const enemy of this.enemies) {
            const dx = this.player.position.x - enemy.position.x;
            const dz = this.player.position.z - enemy.position.z;
            const distance = Math.hypot(dx, dz) || 1;

            enemy.position.x += (dx / distance) * ENEMY_SPEED * dt;
            enemy.position.z += (dz / distance) * ENEMY_SPEED * dt;
            enemy.position.y = 1.8 + Math.sin(this.elapsed * 3 + enemy.userData.phase) * 0.25;
            enemy.rotation.y += dt * 1.5;

            if (distance < 2.6) {
                this.finish('lose');
                return;
            }
        }
    }

    updateCamera(dt) {
        const target = new THREE.Vector3(this.player.position.x, 3.4, this.player.position.z);
        const offset = new THREE.Vector3(
            Math.sin(this.yaw) * 20,
            13,
            Math.cos(this.yaw) * 20
        );

        const desired = target.clone().add(offset);
        this.camera.position.lerp(desired, 1 - Math.exp(-6 * dt));
        this.camera.lookAt(target);
    }
}
