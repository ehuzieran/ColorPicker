document.addEventListener('DOMContentLoaded', () => {
    const picker = document.getElementById('Picker');
    const selectedHex = document.getElementById('selectedHex');

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            const notification = document.createElement('div');
            notification.className = 'copy-notification';
            notification.textContent = 'Copied!';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 1000);
        });
    };

    const hexToRgb = hex => ({
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16)
    });

    const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');

    const rgbToHsl = (r, g, b) => {
        [r, g, b] = [r, g, b].map(x => x / 255);
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const l = (max + min) / 2;
        if (max === min) return { h: 0, s: 0, l: l * 100 };
        const d = max - min;
        const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
        return { h: (h / 6) * 360, s: s * 100, l: l * 100 };
    };

    const hslToRgb = (h, s, l) => {
        h /= 360; s /= 100; l /= 100;
        if (s === 0) return { r: l * 255, g: l * 255, b: l * 255 };
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            return t < 1/6 ? p + (q - p) * 6 * t : t < 1/2 ? q : t < 2/3 ? p + (q - p) * (2/3 - t) * 6 : p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        return {
            r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
            g: Math.round(hue2rgb(p, q, h) * 255),
            b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
        };
    };

    const rgbToHsv = (r, g, b) => {
        [r, g, b] = [r, g, b].map(x => x / 255);
        const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
        const s = max === 0 ? 0 : d / max;
        let h = max === min ? 0 : max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
        return { h: Math.round((h / 6) * 360), s: Math.round(s * 100), v: Math.round(max * 100) };
    };

    const getColorInfo = hexCode => {
        const rgb = hexToRgb(hexCode);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        return `RGB(${rgb.r}, ${rgb.g}, ${rgb.b}), ${hexCode}, HSL(${Math.round(hsl.h)}°, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%), HSV(${hsv.h}°, ${hsv.s}%, ${hsv.v}%)`;
    };

    const createColorBoxes = () => ['complementary', 'analogous', 'monochromatic'].forEach(className => {
        const container = document.querySelector(`.${className}`);
        container.innerHTML = Array(5).fill('').map(() => '<div class="color-box"><span class="hex-code"></span></div>').join('');
    });

    const generateColors = {
        complementary: hsl => [
            { h: (hsl.h + 180) % 360, s: Math.max(hsl.s - 20, 0), l: Math.max(hsl.l - 15, 0) },
            { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l },
            { h: hsl.h, s: Math.max(hsl.s - 15, 0), l: Math.min(hsl.l + 30, 100) },
            { h: hsl.h, s: Math.max(hsl.s - 10, 0), l: Math.min(hsl.l + 10, 100) },
            { h: hsl.h, s: hsl.s, l: hsl.l }
        ],
        analogous: hsl => [-30, -15, 0, 15, 30].map(offset => ({
            h: (hsl.h + offset + 360) % 360,
            s: hsl.s,
            l: hsl.l
        })),
        monochromatic: hsl => [25, 12, 0, -12, -25].map(offset => ({
            h: hsl.h,
            s: hsl.s,
            l: Math.max(Math.min(hsl.l + offset, 100), 0)
        }))
    };

    const updateColorBoxes = (colors, containerClass) => {
        document.querySelectorAll(`.${containerClass} .color-box`).forEach((box, i) => {
            const rgb = hslToRgb(colors[i].h, colors[i].s, colors[i].l);
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            box.style.backgroundColor = hex;
            box.querySelector('.hex-code').textContent = hex;
            box.onclick = () => copyToClipboard(hex);
        });
    };

    const updateAllColors = hex => {
        selectedHex.textContent = hex;
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        Object.entries(generateColors).forEach(([key, generator]) => 
            updateColorBoxes(generator(hsl), key));
    };

    createColorBoxes();
    updateAllColors(picker.value);
    picker.addEventListener('input', e => updateAllColors(e.target.value));

    document.querySelector('.export-button').addEventListener('click', () => {
        const getColors = className => Array.from(document.querySelectorAll(`.${className} .color-box .hex-code`))
            .map(span => span.textContent);

        const exportText = `Selected colour: ${getColorInfo(picker.value)}\n\n` +
            ['Complementary', 'Analogous', 'Monochromatic'].map(type => 
                `${type}:\n${getColors(type.toLowerCase())
                    .map((color, i) => `Box ${i + 1}: ${getColorInfo(color)}`)
                    .join('\n')}`
            ).join('\n\n');

        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ExportedColours.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
});