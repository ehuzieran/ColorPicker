document.addEventListener('DOMContentLoaded', function () {
    const colourPicker = document.getElementById('Picker');
    const selectedColorBox = document.getElementById('selectedColor');
    const selectedHex = document.getElementById('selectedHex');
    const selectedRgb = document.getElementById('selectedRgb');
    const selectedHsl = document.getElementById('selectedHsl');
    const selectedHsv = document.getElementById('selectedHsv');
    const complimentColorOne = document.getElementById('complimentColorOne');
    const complimentHexOne = document.getElementById('complimentHexOne');

    // Function to convert hex to RGB
    function hexToRgb(hex) {
        if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            return { r: 0, g: 0, b: 0, rgbString: 'Invalid Hex' }; // Invalid hex
        }
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b, rgbString: `rgb(${r}, ${g}, ${b})` };
    }

    // Function to convert RGB to HSL
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, l: l * 100 }; // Return HSL object
    }

    // Function to convert RGB to HSV
    function rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        const v = max;
        const s = max === 0 ? 0 : d / max;
        let h;

        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return `hsv(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`;
    }

    // Function to get the complementary color by shifting the hue
    function getComplementaryColor(hsl) {
        let { h, s, l } = hsl;
        // Shift hue by 180 degrees to get complementary color
        h = (h + 180) % 360;
        return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    }

    // Update selected color box when color picker changes
    colourPicker.addEventListener('input', (event) => {
        const color = event.target.value;

        // Convert hex to RGB first
        const { r, g, b, rgbString } = hexToRgb(color);

        // Update the selected color box
        selectedColorBox.style.backgroundColor = color;
        selectedHex.textContent = color;
        selectedRgb.textContent = rgbString;

        // Convert RGB to HSL and HSV
        const hsl = rgbToHsl(r, g, b);
        selectedHsl.textContent = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
        selectedHsv.textContent = rgbToHsv(r, g, b);

        // Get complementary color in HSL
        const complementaryColor = getComplementaryColor(hsl);

        // Update the complementary color box
        complimentColorOne.style.backgroundColor = complementaryColor; 
        complimentHexOne.textContent = complementaryColor;
    });
});
