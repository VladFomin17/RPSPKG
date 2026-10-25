import * as THREE from 'three';

const RATES = {idle: 1.6, walk: 6, run: 9};

/**
 * Процедурная анимация: режим задаёт целевые углы, а фактические значения
 * догоняют цели через damp — поэтому переключение режимов происходит плавно.
 */
export class Walker {
    constructor(rig) {
        this.rig = rig;
        this.mode = 'idle';
        this.speed = 1;
        this.time = 0;

        this.pose = {leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0};
        this.bob = 0;
        this.lean = 0;
    }

    setMode(mode) {
        this.mode = mode;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    update(dt) {
        this.time += dt * this.speed;

        const phase = this.time * (RATES[this.mode] ?? RATES.idle);
        const swing = Math.sin(phase);

        const target = {leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0};
        let bobTarget = 0;
        let leanTarget = 0;

        if (this.mode === 'walk') {
            target.leftArm = -swing * 0.55;
            target.rightArm = swing * 0.55;
            target.leftLeg = swing * 0.6;
            target.rightLeg = -swing * 0.6;
            bobTarget = Math.abs(Math.cos(phase)) * 1.2;
            leanTarget = 0.03;
        } else if (this.mode === 'run') {
            target.leftArm = -swing * 0.95;
            target.rightArm = swing * 0.95;
            target.leftLeg = swing * 1.05;
            target.rightLeg = -swing * 1.05;
            bobTarget = Math.abs(Math.cos(phase)) * 2;
            leanTarget = 0.12;
        } else {
            const breath = Math.sin(this.time * 1.5);
            target.leftArm = 0.04 + breath * 0.02;
            target.rightArm = -0.04 - breath * 0.02;
            bobTarget = breath * 0.35;
        }

        for (const key of Object.keys(target)) {
            this.pose[key] = THREE.MathUtils.damp(this.pose[key], target[key], 10, dt);
        }
        this.bob = THREE.MathUtils.damp(this.bob, bobTarget, 10, dt);
        this.lean = THREE.MathUtils.damp(this.lean, leanTarget, 8, dt);

        this.apply();
    }

    apply() {
        const groups = this.rig.groups;

        groups.leftArm.rotation.x = this.pose.leftArm;
        groups.rightArm.rotation.x = this.pose.rightArm;
        groups.leftLeg.rotation.x = this.pose.leftLeg;
        groups.rightLeg.rotation.x = this.pose.rightLeg;

        this.rig.root.position.y = this.bob;
        this.rig.root.rotation.x = this.lean;
    }
}
