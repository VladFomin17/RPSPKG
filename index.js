import {createView} from './shared/scene.js';
import {Game} from './shared/game.js';

const view = createView(document.querySelector('#viewport'), {
    orbit: false,
    background: 0x070b14,
    fogNear: 90,
    fogFar: 300,
    exposure: 1.1
});

const overlay = document.querySelector('#overlay');
const overlayTitle = document.querySelector('#overlayTitle');
const overlayText = document.querySelector('#overlayText');
const startButton = document.querySelector('#startButton');
const scoreElement = document.querySelector('#score');
const timeElement = document.querySelector('#time');
const countdownElement = document.querySelector('#countdown');

const enemyInput = document.querySelector('#enemyCount');
const targetInput = document.querySelector('#targetScore');
const enemyOutput = document.querySelector('output[data-for="enemyCount"]');
const targetOutput = document.querySelector('output[data-for="targetScore"]');

const game = new Game(view, {
    onState(state) {
        if (state === 'play') {
            overlay.classList.add('hidden');
            return;
        }

        const won = state === 'win';

        overlayTitle.textContent = won ? 'Победа' : 'Поражение';
        overlayText.textContent = won
            ? `Собраны все ${game.target} кристаллов. Попробуйте быстрее или добавьте противников.`
            : 'Сфера догнала или вышло время. Попробуйте ещё раз.';
        startButton.textContent = 'Ещё раз';

        overlay.classList.remove('hidden');
    },

    onHud({score, target, time, countdown, state}) {
        scoreElement.textContent = `${score} / ${target}`;
        timeElement.textContent = time.toFixed(1);

        const showCountdown = state === 'play' && countdown > 0;
        countdownElement.classList.toggle('hidden', !showCountdown);

        if (showCountdown) {
            countdownElement.textContent = String(Math.ceil(countdown));
        }
    }
});

function applySettings() {
    const enemyCount = Number(enemyInput.value);
    const target = Number(targetInput.value);

    enemyOutput.value = enemyInput.value;
    targetOutput.value = targetInput.value;

    game.configure({enemyCount, target});

    if (game.state === 'menu') {
        overlayTitle.textContent = `Собери ${target} кристаллов`;
    }
}

enemyInput.addEventListener('input', applySettings);
targetInput.addEventListener('input', applySettings);

applySettings();

startButton.addEventListener('click', () => {
    game.start();
});

if (new URLSearchParams(location.search).has('play')) {
    game.start();
}
