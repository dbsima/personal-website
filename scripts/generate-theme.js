const fs = require('fs');
const path = require('path');

const ARCHIVE_DIR = path.join(__dirname, '../public/archive');
const config = require('../public/theme-config.json');

const { palettes: PALETTES, fontPairings: FONT_PAIRINGS, layouts: LAYOUTS } = config;

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateTheme() {
    const palette = getRandomItem(PALETTES);
    const fontPairing = getRandomItem(FONT_PAIRINGS);
    const layout = getRandomItem(LAYOUTS);

    const theme = {
        date: new Date().toISOString().split('T')[0],
        name: `${palette.name} x ${fontPairing.name}`,
        layout: layout,
        colors: {
            ...palette.colors,
            ...fontPairing.fonts
        },
        paletteName: palette.name,
        fontName: fontPairing.name,
        font: fontPairing.fonts['--body-font']
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
