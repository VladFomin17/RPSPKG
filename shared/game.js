import * as THREE from 'three';
import {addStudioLights} from './scene.js';
import {buildCharacter} from './character.js';
import {Walker} from './animation.js';

const ARENA_RADIUS = 30;
const PLAYER_SPEED = 16;
const PLAYER_SCALE = 0.45;
const ENEMY_SPEED = 7;
const ENEMY_RADIUS = 1.4;
const SEPARATION = ENEMY_RADIUS * 2.4;
const CRYSTAL_COUNT = 10;
const MAX_ENEMIES = 5;
const DEFAULT_ENEMIES = 3;
const MIN_TARGET = 5;
const MAX_TARGET = 50;
const DEFAULT_TARGET = 10;
const GAME_TIME = 60;
const COUNTDOWN = 3;

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

        this.enemyCount = DEFAULT_ENEMIES;
        this.target = DEFAULT_TARGET;
        this.countdown = 0;

        this.buildArena();
        this.buildPlayer();
        this.buildCrystals();
        this.buildEnemies();
        this.bindInput();

        this.camera.position.set(0, 48, 64);
        this.camera.lookAt(0, 1, 0);

        this.view.onFrame(dt => this.update(dt));
    }

    /** Настройки партии: сколько противников и сколько очков нужно для победы. */
    configure({enemyCount = this.enemyCount, target = this.target} = {}) {
        this.enemyCount = Math.min(MAX_ENEMIES, Math.max(1, Math.round(enemyCount)));
        this.target = Math.min(MAX_TARGET, Math.max(MIN_TARGET, Math.round(target)));

        for (const [index, enemy] of this.enemies.entries()) {
            enemy.visible = index < this.enemyCount;
        }

        return this;
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

        for (let i = 0; i < MAX_ENEMIES; i++) {
            const enemy = new THREE.Mesh(geometry, material);
            enemy.castShadow = true;
            enemy.userData.phase = Math.random() * Math.PI * 2;
            const point = this.randomArenaPoint(18);
            enemy.position.set(point.x, 1.8, point.z);
            enemy.visible = i < this.enemyCount;
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

        // Если окно потеряло фокус, keyup может не прийти — сбрасываем клавиши,
        // иначе персонаж «убегает» сам.
        window.addEventListener('blur', () => {
            this.keys.clear();
        });

        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.keys.clear();
                }
            });
        }

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
        this.countdown = COUNTDOWN;
        this.velocity.set(0, 0, 0);
        // Клавиши, нажатые до старта (в меню или оставшиеся от прошлой партии),
        // не должны двигать персонажа с первого кадра.
        this.keys.clear();

        this.player.position.set(0, 0, 0);
        this.player.rotation.y = 0;

        for (const crystal of this.crystals) {
            crystal.position.copy(this.randomArenaPoint(4));
            crystal.position.y = 1.9;
        }

        for (const [index, enemy] of this.enemies.entries()) {
            enemy.visible = index < this.enemyCount;
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
            const counting = this.countdown > 0;

            if (counting) {
                this.countdown = Math.max(0, this.countdown - dt);

                if (this.countdown < 0.001) {
                    this.countdown = 0;
                }
            } else {
                this.timeLeft -= dt;
            }

            this.updatePlayer(dt);
            this.updateCrystals(dt);

            if (!counting) {
                this.updateEnemies(dt);

                if (this.timeLeft <= 0) {
                    this.finish('lose');
                }
            }
        } else {
            this.yaw += dt * 0.12;
        }

        this.walker.update(dt);
        this.updateCamera(dt);

        this.onHud({
            score: this.score,
            target: this.target,
            time: Math.max(0, this.timeLeft),
            countdown: this.countdown,
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

                if (this.score >= this.target) {
                    this.finish('win');
                    return;
                }
            }
        }
    }

    updateEnemies(dt) {
        for (const enemy of this.enemies) {
            if (!enemy.visible) {
                continue;
            }

            const dx = this.player.position.x - enemy.position.x;
            const dz = this.player.position.z - enemy.position.z;
            const distance = Math.hypot(dx, dz) || 1;

            // Мягкое отталкивание от соседей: враги расходятся ещё до того,
            // как наехали друг на друга, поэтому не выглядят одним пятном.
            let steerX = 0;
            let steerZ = 0;

            for (const other of this.enemies) {
                if (other === enemy || !other.visible) {
                    continue;
                }

                const ox = enemy.position.x - other.position.x;
                const oz = enemy.position.z - other.position.z;
                const otherDistance = Math.hypot(ox, oz);

                if (otherDistance > 1e-4 && otherDistance < SEPARATION * 1.6) {
                    const weight = 1 - otherDistance / (SEPARATION * 1.6);
                    steerX += (ox / otherDistance) * weight;
                    steerZ += (oz / otherDistance) * weight;
                }
            }

            const dirX = dx / distance + steerX * 1.2;
            const dirZ = dz / distance + steerZ * 1.2;
            const length = Math.hypot(dirX, dirZ) || 1;

            enemy.position.x += (dirX / length) * ENEMY_SPEED * dt;
            enemy.position.z += (dirZ / length) * ENEMY_SPEED * dt;
            enemy.position.y = 1.8 + Math.sin(this.elapsed * 3 + enemy.userData.phase) * 0.25;
            enemy.rotation.y += dt * 1.5;
        }

        this.separateEnemies();

        for (const enemy of this.enemies) {
            if (!enemy.visible) {
                continue;
            }

            const distance = Math.hypot(
                this.player.position.x - enemy.position.x,
                this.player.position.z - enemy.position.z
            );

            if (distance < 2.6) {
                this.finish('lose');
                return;
            }
        }
    }

    /** Жёсткая страховка: раздвигает пары, которые всё-таки перекрылись. */
    separateEnemies() {
        const active = this.enemies.filter(enemy => enemy.visible);

        for (let i = 0; i < active.length; i++) {
            for (let j = i + 1; j < active.length; j++) {
                const first = active[i];
                const second = active[j];

                let dx = second.position.x - first.position.x;
                let dz = second.position.z - first.position.z;
                let distance = Math.hypot(dx, dz);

                if (distance >= SEPARATION) {
                    continue;
                }

                // Полное совпадение: направление выбираем случайно, иначе деление на ноль.
                if (distance < 1e-4) {
                    const angle = Math.random() * Math.PI * 2;
                    dx = Math.cos(angle);
                    dz = Math.sin(angle);
                    distance = 1;
                }

                const push = (SEPARATION - distance) / 2;
                const nx = dx / distance;
                const nz = dz / distance;

                first.position.x -= nx * push;
                first.position.z -= nz * push;
                second.position.x += nx * push;
                second.position.z += nz * push;
            }
        }

        // Расталкивание не должно вытолкнуть врага за кольцо арены.
        const limit = ARENA_RADIUS - 2;

        for (const enemy of active) {
            const distance = Math.hypot(enemy.position.x, enemy.position.z);

            if (distance > limit) {
                const scale = limit / distance;
                enemy.position.x *= scale;
                enemy.position.z *= scale;
            }
        }
    }

    updateCamera(dt) {
        // Камера смотрит на центр арены, поэтому поле видно целиком.
        const target = new THREE.Vector3(0, 1, 0);
        const offset = new THREE.Vector3(
            Math.sin(this.yaw) * 64,
            48,
            Math.cos(this.yaw) * 64
        );

        const desired = target.clone().add(offset);
        this.camera.position.lerp(desired, 1 - Math.exp(-6 * dt));
        this.camera.lookAt(target);
    }
}
