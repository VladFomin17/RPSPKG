import * as THREE from 'three';
import {createView, addStudioLights, addGround, frameCamera} from './shared/scene.js';
import {characterGeometry, characterMesh} from './shared/character.js';

const view = createView(document.querySelector('#viewport'));
const {scene, camera, controls} = view;

const flatGeometry = characterGeometry();
const smoothGeometry = characterGeometry(undefined, {smooth: true});

const character = characterMesh({geometry: flatGeometry});
// Тень персонаж отбрасывает, но не принимает: его грани плоские и двусторонние,
// а карта теней на таких поверхностях даёт самозатенение (акан).
character.castShadow = true;
scene.add(character);

const material = character.material;
const bounds = new THREE.Box3().setFromObject(character);

addGround(scene, bounds.min.y - 0.2);
frameCamera(camera, controls, character);

const lights = addStudioLights(scene);

const keyHelper = new THREE.DirectionalLightHelper(lights.key, 9, 0xffd7a3);
const rimHelper = new THREE.DirectionalLightHelper(lights.rim, 9, 0x8fb2ff);
keyHelper.visible = false;
rimHelper.visible = false;
scene.add(keyHelper, rimHelper);

let rotating = false;

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

function bindColor(id, apply) {
    const input = document.querySelector(`#${id}`);
    const update = () => apply(new THREE.Color(input.value));
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

bindRange('keyIntensity', value => {
    lights.key.intensity = value;
});

bindRange('rimIntensity', value => {
    lights.rim.intensity = value;
});

bindRange('ambientIntensity', value => {
    lights.ambient.intensity = value;
});

bindRange('roughness', value => {
    material.roughness = value;
});

bindRange('metalness', value => {
    material.metalness = value;
});

bindColor('keyColor', color => {
    lights.key.color.copy(color);
});

bindColor('rimColor', color => {
    lights.rim.color.copy(color);
});

bindColor('figureColor', color => {
    material.color.copy(color);
});

bindCheckbox('smoothShading', value => {
    character.geometry = value ? smoothGeometry : flatGeometry;
});

bindCheckbox('autoRotate', value => {
    rotating = value;
});

bindCheckbox('wireframe', value => {
    material.wireframe = value;
});

bindCheckbox('showHelpers', value => {
    keyHelper.visible = value;
    rimHelper.visible = value;
});

document.querySelector('#reset').addEventListener('click', () => {
    for (const input of document.querySelectorAll('.panel input')) {
        if (input.type === 'checkbox') {
            input.checked = input.defaultChecked;
            input.dispatchEvent(new Event('change'));
        } else {
            input.value = input.defaultValue;
            input.dispatchEvent(new Event('input'));
        }
    }
});

view.onFrame(dt => {
    if (rotating) {
        character.rotation.y += dt * 0.5;
    }
});
