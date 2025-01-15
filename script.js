document.addEventListener('DOMContentLoaded', () => {
    const pickerButton = document.getElementById('PickerButton');
    const manualColorPicker = document.getElementById('manualColorPicker');
    const colorInfo = document.getElementById('colorInfo');
    const colorPreview = document.getElementById('colorPreview');

    const updateColorPreview = (hexCode) => {
        colorPreview.style.backgroundColor = hexCode;
        colorInfo.textContent = hexCode;
    };

    // Handle manual color picker if present
    if (manualColorPicker) {
        manualColorPicker.addEventListener('input', (e) => {
            const hex = e.target.value;
            updateAllColors(hex);  // Updates all color schemes based on the selected color
            colorPreview.style.backgroundColor = hex;  // Updates the preview box
        });
    }

    const copyToClipboard = (text, hexCodeElement) => {
        navigator.clipboard.writeText(text).then(() => {
            const notification = document.createElement('div');
            notification.className = 'copy-notification';
            notification.textContent = 'Copied!';

            // Position notification relative to the hex code element
            notification.style.position = 'absolute';
            notification.style.bottom = '0';
            notification.style.left = '0';
            notification.style.right = '0';
            notification.style.textAlign = 'center';
            notification.style.background = 'rgba(0, 0, 0, 0.8)';
            notification.style.color = 'white';
            notification.style.fontSize = '12px';
            notification.style.padding = '2px';
            notification.style.borderRadius = '4px';

            hexCodeElement.appendChild(notification);

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
            return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        return {
            r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
            g: Math.round(hue2rgb(p, q, h) * 255),
            b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
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

            const hexCodeElement = box.querySelector('.hex-code');
            hexCodeElement.textContent = hex;

            box.onclick = () => copyToClipboard(hex, hexCodeElement);
        });
    };

    const updateAllColors = hex => {
        // Update the hex value in the color info box
        const colorPreview = document.getElementById('colorPreview');
        colorPreview.style.backgroundColor = hex;

        // Convert hex to RGB, HSL, and HSV
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

        // Update the pre-existing spans with color values
        document.getElementById('hexValue').textContent = `${hex}`;
        document.getElementById('rgbValue').textContent = `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        document.getElementById('hslValue').textContent = `HSL(${Math.round(hsl.h)}°, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
        document.getElementById('hsvValue').textContent = `HSV(${Math.round(hsv.h)}°, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`;

        // Add copy functionality to each color value
        document.querySelectorAll('.color-info span').forEach(element => {
            element.addEventListener('click', () => copyToClipboard(element.textContent, element));
        });

        // Now, generate the complementary, analogous, and monochromatic colors
        Object.entries(generateColors).forEach(([key, generator]) =>
            updateColorBoxes(generator(hsl), key));
    };

    pickerButton.addEventListener('click', async () => {
        if (!window.EyeDropper) {
            alert('EyeDropper API is not supported in this browser.');
            return;
        }

        const eyeDropper = new EyeDropper();
        try {
            const result = await eyeDropper.open();
            updateAllColors(result.sRGBHex);
            if (manualColorPicker) manualColorPicker.value = result.sRGBHex;  // Updates the manual color picker if it exists
            colorPreview.style.backgroundColor = result.sRGBHex;  // Updates the preview box
        } catch (err) {
            console.error('EyeDropper canceled or failed:', err);
        }
    });

    createColorBoxes();
    updateAllColors('#019337');
    if (manualColorPicker) manualColorPicker.value = '#019337';  // Initialize manual color picker if present
    colorPreview.style.backgroundColor = '#019337';
});
