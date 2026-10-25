import * as THREE from 'three';
import {createView, addStudioLights, addGround, frameCamera} from './shared/scene.js';
import {characterGeometry, characterOutline} from './shared/character.js';
import {checkerTexture, brickTexture, tilesTexture, noiseTexture} from './shared/textures.js';

const view = createView(document.querySelector('#viewport'));
const {scene, camera, controls, renderer} = view;

const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

const sources = {
    checker: checkerTexture(),
    brick: brickTexture(),
    tiles: tilesTexture(),
    noise: noiseTexture()
};

const state = {
    repeat: 0.16,
    nearest: false,
    rotating: false
};

const material = new THREE.MeshStandardMaterial({
    map: sources.checker,
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.DoubleSide
});

const character = new THREE.Mesh(characterGeometry(), material);
character.add(characterOutline(4, {color: 0x05070c, opacity: 1}));
character.castShadow = true;
scene.add(character);

const bounds = new THREE.Box3().setFromObject(character);
addGround(scene, bounds.min.y - 0.2);
frameCamera(camera, controls, character);

const lights = addStudioLights(scene);
lights.key.color.set(0xffffff);
lights.key.intensity = 2.8;
lights.rim.intensity = 0.55;
lights.ambient.intensity = 0.5;

function applyTextureSettings() {
    for (const texture of Object.values(sources)) {
        texture.repeat.set(state.repeat, state.repeat);
        texture.anisotropy = maxAnisotropy;
        texture.magFilter = state.nearest ? THREE.NearestFilter : THREE.LinearFilter;
        texture.needsUpdate = true;
    }
}

function setTexture(name) {
    if (!sources[name]) {
        return;
    }

    material.map = sources[name];
    material.needsUpdate = true;

    for (const button of document.querySelectorAll('[data-texture]')) {
        button.classList.toggle('active', button.dataset.texture === name);
    }

    applyTextureSettings();
}

function bindRange(id, apply) {
    const input = document.querySelector(`#${id}`);
    const output = document.querySelector(`output[data-for="${id}"]`);
    const update = () => {
        output.value = input.value;
        apply(Number(input.value));
    };
    input.addEventListener('input', update);
    update();
    return input;
}

function bindCheckbox(id, apply) {
    const input = document.querySelector(`#${id}`);
    const update = () => apply(input.checked);
    input.addEventListener('change', update);
    update();
    return input;
}

document.querySelector('#textureSwitch').addEventListener('click', event => {
    const button = event.target.closest('[data-texture]');
    if (button) {
        setTexture(button.dataset.texture);
    }
});

bindRange('repeat', value => {
    state.repeat = value;
    applyTextureSettings();
});

bindRange('roughness', value => {
    material.roughness = value;
});

bindCheckbox('nearest', value => {
    state.nearest = value;
    applyTextureSettings();
});

bindCheckbox('autoRotate', value => {
    state.rotating = value;
});

document.querySelector('#textureFile').addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (!file) {
        return;
    }

    const url = URL.createObjectURL(file);

    new THREE.TextureLoader().load(url, texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = maxAnisotropy;
        texture.repeat.set(state.repeat, state.repeat);

        if (sources.custom) {
            sources.custom.dispose();
        }

        sources.custom = texture;
        URL.revokeObjectURL(url);
        setTexture('custom');
    });
});

document.querySelector('#reset').addEventListener('click', () => {
    for (const input of document.querySelectorAll('.panel input')) {
        if (input.type === 'checkbox') {
            input.checked = input.defaultChecked;
            input.dispatchEvent(new Event('change'));
        } else if (input.type !== 'file') {
            input.value = input.defaultValue;
            input.dispatchEvent(new Event('input'));
        }
    }

    document.querySelector('#textureFile').value = '';
    setTexture('checker');
});

applyTextureSettings();
setTexture('checker');

view.onFrame(dt => {
    if (state.rotating) {
        character.rotation.y += dt * 0.5;
    }
});
