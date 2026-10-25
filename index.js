import {createView} from './shared/scene.js';
import {Game} from './shared/game.js';

const view = createView(document.querySelector('#viewport'), {
    orbit: false,
    background: 0x070b14,
    fogNear: 60,
    fogFar: 220,
    exposure: 1.1
});

const overlay = document.querySelector('#overlay');
const overlayTitle = document.querySelector('#overlayTitle');
const overlayText = document.querySelector('#overlayText');
const startButton = document.querySelector('#startButton');
const scoreElement = document.querySelector('#score');
const timeElement = document.querySelector('#time');

const game = new Game(view, {
    onState(state) {
        if (state === 'play') {
            overlay.classList.add('hidden');
            return;
        }

        const won = state === 'win';

        overlayTitle.textContent = won ? 'Победа' : 'Поражение';
        overlayText.textContent = won
            ? 'Все кристаллы собраны. Попробуйте собрать быстрее.'
            : 'Сфера догнала или вышло время. Попробуйте ещё раз.';
        startButton.textContent = 'Ещё раз';

        overlay.classList.remove('hidden');
    },

    onHud({score, time}) {
        scoreElement.textContent = `${score} / 10`;
        timeElement.textContent = time.toFixed(1);
    }
});

startButton.addEventListener('click', () => {
    game.start();
});

if (new URLSearchParams(location.search).has('play')) {
    game.start();
}
