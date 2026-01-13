const fs = require('fs');
const path = require('path');

const ARCHIVE_DIR = path.join(__dirname, '../public/archive');

// 1. Define Palettes (Bg, Text, Accent, CardBg)
const PALETTES = [
    { name: "Ocean", colors: { "--bg-color": "#0f172a", "--text-color": "#e2e8f0", "--accent-color": "#38bdf8", "--card-bg": "#1e293b" } },
    { name: "Forest", colors: { "--bg-color": "#1a2e05", "--text-color": "#ecfccb", "--accent-color": "#a3e635", "--card-bg": "#365314" } },
    { name: "Sunset", colors: { "--bg-color": "#4a044e", "--text-color": "#fdf4ff", "--accent-color": "#f0abfc", "--card-bg": "#701a75" } },
    { name: "Coffee", colors: { "--bg-color": "#271c19", "--text-color": "#f5e6d3", "--accent-color": "#d4a373", "--card-bg": "#432818" } },
    { name: "Minimal Light", colors: { "--bg-color": "#ffffff", "--text-color": "#18181b", "--accent-color": "#2563eb", "--card-bg": "#f4f4f5" } },
    { name: "Cyberpunk", colors: { "--bg-color": "#000000", "--text-color": "#00ff41", "--accent-color": "#ff00ff", "--card-bg": "#111111" } },
];

// 2. Define Fonts
const FONTS = [
    "'Inter', sans-serif",
    "'Roboto Mono', monospace",
    "'Merriweather', serif",
    "'Space Grotesk', sans-serif"
];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateTheme() {
    const palette = getRandomItem(PALETTES);
    const font = getRandomItem(FONTS);

    const theme = {
        date: new Date().toISOString().split('T')[0],
        name: palette.name,
        colors: palette.colors,
        font: font
    };

    return theme;
}

function saveTheme(theme) {
    if (!fs.existsSync(ARCHIVE_DIR)) {
        fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    }

    // Save as YYYY-MM-DD.json
    const filename = `${theme.date}.json`;
    const filepath = path.join(ARCHIVE_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(theme, null, 2));
    console.log(`Saved theme to ${filepath}`);

    // Save as latest.json
    const latestPath = path.join(ARCHIVE_DIR, 'latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(theme, null, 2));
    console.log(`Saved theme to ${latestPath}`);
}

const theme = generateTheme();
saveTheme(theme);
