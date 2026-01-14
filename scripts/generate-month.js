const fs = require('fs');
const path = require('path');

const ARCHIVE_DIR = path.join(__dirname, '../public/archive');
const config = require('../public/theme-config.json');

const { palettes: PALETTES, fontPairings: FONT_PAIRINGS, layouts: LAYOUTS } = config;

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateTheme(dateStr) {
    const palette = getRandomItem(PALETTES);
    const fontPairing = getRandomItem(FONT_PAIRINGS);
    const layout = getRandomItem(LAYOUTS);

    return {
        date: dateStr,
        name: `${palette.name} x ${fontPairing.name}`,
        layout: layout,
        colors: {
            ...palette.colors,
            ...fontPairing.fonts
        },
        paletteName: palette.name,
        fontName: fontPairing.name
    };
}

function generateMonth() {
    if (!fs.existsSync(ARCHIVE_DIR)) {
        fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    console.log(`Generating themes for ${year}-${month + 1} (${daysInMonth} days)...`);

    for (let d = 1; d <= daysInMonth; d++) {
        const dateDate = new Date(year, month, d);
        const yyyy = dateDate.getFullYear();
        const mm = String(dateDate.getMonth() + 1).padStart(2, '0');
        const dd = String(dateDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const theme = generateTheme(dateStr);
        const filepath = path.join(ARCHIVE_DIR, `${dateStr}.json`);

        fs.writeFileSync(filepath, JSON.stringify(theme, null, 2));
        console.log(`Saved ${dateStr}.json`);

        // If it's today, also update latest.json
        const currentDateStr = new Date().toISOString().split('T')[0];
        if (dateStr === currentDateStr) {
            const latestPath = path.join(ARCHIVE_DIR, 'latest.json');
            fs.writeFileSync(latestPath, JSON.stringify(theme, null, 2));
            console.log(`Updated latest.json`);
        }
    }
}

generateMonth();
