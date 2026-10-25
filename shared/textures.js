import * as THREE from 'three';

/** Текстура из canvas: повтор по обеим осям, sRGB, анизотропия. */
function fromCanvas(size, draw) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    draw(canvas.getContext('2d'), size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
}

export function checkerTexture() {
    return fromCanvas(512, (ctx, size) => {
        const cells = 8;
        const cell = size / cells;

        for (let y = 0; y < cells; y++) {
            for (let x = 0; x < cells; x++) {
                ctx.fillStyle = (x + y) % 2 === 0 ? '#f3f5f9' : '#2b3245';
                ctx.fillRect(x * cell, y * cell, cell, cell);
            }
        }
    });
}

export function brickTexture() {
    return fromCanvas(512, (ctx, size) => {
        ctx.fillStyle = '#cfc7ba';
        ctx.fillRect(0, 0, size, size);

        const rows = 8;
        const rowHeight = size / rows;
        const brickWidth = size / 4;

        for (let row = 0; row < rows; row++) {
            const offset = row % 2 === 0 ? 0 : brickWidth / 2;

            for (let x = -brickWidth; x < size + brickWidth; x += brickWidth) {
                const left = x + offset;
                const tone = 150 + ((row * 7 + x) % 5) * 9;

                ctx.fillStyle = `rgb(${tone}, ${Math.round(tone * 0.52)}, ${Math.round(tone * 0.4)})`;
                ctx.fillRect(left + 4, row * rowHeight + 4, brickWidth - 8, rowHeight - 8);
            }
        }
    });
}

export function tilesTexture() {
    return fromCanvas(512, (ctx, size) => {
        ctx.fillStyle = '#0d1220';
        ctx.fillRect(0, 0, size, size);

        const cells = 4;
        const step = size / cells;

        for (let y = 0; y < cells; y++) {
            for (let x = 0; x < cells; x++) {
                const shade = 42 + ((x * 3 + y * 5) % 4) * 10;
                ctx.fillStyle = `rgb(${shade + 18}, ${shade + 42}, ${shade + 74})`;
                ctx.fillRect(x * step + 4, y * step + 4, step - 8, step - 8);
            }
        }
    });
}

export function noiseTexture() {
    return fromCanvas(256, (ctx, size) => {
        const image = ctx.createImageData(size, size);

        for (let i = 0; i < size * size; i++) {
            const value = 110 + Math.random() * 60;
            image.data[i * 4] = value;
            image.data[i * 4 + 1] = value * 0.92;
            image.data[i * 4 + 2] = value * 0.82;
            image.data[i * 4 + 3] = 255;
        }

        ctx.putImageData(image, 0, 0);
    });
}
