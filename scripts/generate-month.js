const fs = require('fs');
const path = require('path');

const ARCHIVE_DIR = path.join(__dirname, '../public/archive');

// DUPLICATED FROM generate-theme.js (Ideally refactor to share code)
const PALETTES = [
    {
        name: "Noir",
        colors: { "--bg-color": "#0a0a0a", "--text-color": "#ededed", "--accent-color": "#ffffff", "--card-bg": "rgba(255,255,255,0.03)" }
    },
    {
        name: "Obsidian",
        colors: { "--bg-color": "#111111", "--text-color": "#a1a1aa", "--accent-color": "#eab308", "--card-bg": "#18181b" }
    },
    {
        name: "Midnight Blue",
        colors: { "--bg-color": "#020617", "--text-color": "#cbd5e1", "--accent-color": "#38bdf8", "--card-bg": "#0f172a" }
    },
    {
        name: "Deep Forest",
        colors: { "--bg-color": "#052e16", "--text-color": "#dcfce7", "--accent-color": "#4ade80", "--card-bg": "#064e3b" }
    },
    {
        name: "Swiss Style",
        colors: { "--bg-color": "#ffffff", "--text-color": "#171717", "--accent-color": "#dc2626", "--card-bg": "#f5f5f5" }
    },
    {
        name: "Slate",
        colors: { "--bg-color": "#1e293b", "--text-color": "#f1f5f9", "--accent-color": "#94a3b8", "--card-bg": "#334155" }
    },
    {
        name: "Sand",
        colors: { "--bg-color": "#292524", "--text-color": "#e7e5e4", "--accent-color": "#d6d3d1", "--card-bg": "#44403c" }
    }
];

const FONT_PAIRINGS = [
    {
        name: "Modern Editorial",
        fonts: {
            "--heading-font": "'Playfair Display', serif",
            "--body-font": "'Inter', sans-serif"
        }
    },
    {
        name: "Tech Brutalist",
        fonts: {
            "--heading-font": "'Space Grotesk', sans-serif",
            "--body-font": "'Space Grotesk', sans-serif"
        }
    },
    {
        name: "Classic Elegant",
        fonts: {
            "--heading-font": "'Cinzel', serif",
            "--body-font": "'Inter', sans-serif"
        }
    },
    {
        name: "Soft Humanist",
        fonts: {
            "--heading-font": "'Fraunces', serif",
            "--body-font": "'Inter', sans-serif"
        }
    }
];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateTheme(dateStr) {
    const palette = getRandomItem(PALETTES);
    const fontPairing = getRandomItem(FONT_PAIRINGS);

    return {
        date: dateStr,
        name: `${palette.name} x ${fontPairing.name}`,
        colors: {
            ...palette.colors,
            ...fontPairing.fonts
        },
        // Fallback for metadata if needed
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
    const month = today.getMonth(); // 0-indexed

    // Number of days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    console.log(`Generating themes for ${year}-${month + 1} (${daysInMonth} days)...`);

    for (let d = 1; d <= daysInMonth; d++) {
        // Format YYYY-MM-DD
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
        const currentDatStr = new Date().toISOString().split('T')[0];
        if (dateStr === currentDatStr) {
            const latestPath = path.join(ARCHIVE_DIR, 'latest.json');
            fs.writeFileSync(latestPath, JSON.stringify(theme, null, 2));
            console.log(`Updated latest.json`);
        }
    }
}

generateMonth();
