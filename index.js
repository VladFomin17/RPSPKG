import * as THREE from 'three';
import {createView, addStudioLights, addGround, frameCamera} from './shared/scene.js';
import {buildCharacter} from './shared/character.js';
import {Walker} from './shared/animation.js';

const view = createView(document.querySelector('#viewport'));
const {scene, camera, controls} = view;

const rig = buildCharacter();
scene.add(rig.root);

const walker = new Walker(rig);

const bounds = new THREE.Box3().setFromObject(rig.root);
addGround(scene, bounds.min.y - 0.2);
frameCamera(camera, controls, rig.root);

addStudioLights(scene);

const pivotHelpers = [];
for (const group of Object.values(rig.groups)) {
    const helper = new THREE.AxesHelper(4);
    helper.material.depthTest = false;
    helper.material.transparent = true;
    helper.visible = false;
    group.add(helper);
    pivotHelpers.push(helper);
}

const modeButtons = [...document.querySelectorAll('[data-mode]')];

function setMode(mode) {
    walker.setMode(mode);
    for (const button of modeButtons) {
        button.classList.toggle('active', button.dataset.mode === mode);
    }
}

document.querySelector('#modeSwitch').addEventListener('click', event => {
    const button = event.target.closest('[data-mode]');
    if (button) {
        setMode(button.dataset.mode);
    }
});

const speedInput = document.querySelector('#speed');
const speedOutput = document.querySelector('output[data-for="speed"]');

speedInput.addEventListener('input', () => {
    speedOutput.value = speedInput.value;
    walker.setSpeed(Number(speedInput.value));
});

document.querySelector('#showPivots').addEventListener('change', event => {
    for (const helper of pivotHelpers) {
        helper.visible = event.target.checked;
    }
});

document.querySelector('#reset').addEventListener('click', () => {
    speedInput.value = speedInput.defaultValue;
    speedOutput.value = speedInput.value;
    walker.setSpeed(Number(speedInput.value));
    walker.time = 0;

    document.querySelector('#showPivots').checked = false;
    for (const helper of pivotHelpers) {
        helper.visible = false;
    }

    setMode('idle');
});

view.onFrame(dt => {
    walker.update(dt);
});

const initialMode = new URLSearchParams(location.search).get('mode');
setMode(['idle', 'walk', 'run'].includes(initialMode) ? initialMode : 'idle');
