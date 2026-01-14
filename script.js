console.log('Script loaded');

const ARCHIVE_PATH = 'public/archive/';
let currentCalendarDate = new Date();

// Client-side theme options (mirrored from generate-theme.js)
const PALETTES = [
    { name: "Noir", colors: { "--bg-color": "#0a0a0a", "--text-color": "#ededed", "--accent-color": "#ffffff", "--card-bg": "rgba(255,255,255,0.03)" } },
    { name: "Obsidian", colors: { "--bg-color": "#111111", "--text-color": "#a1a1aa", "--accent-color": "#eab308", "--card-bg": "#18181b" } },
    { name: "Midnight Blue", colors: { "--bg-color": "#020617", "--text-color": "#cbd5e1", "--accent-color": "#38bdf8", "--card-bg": "#0f172a" } },
    { name: "Deep Forest", colors: { "--bg-color": "#052e16", "--text-color": "#dcfce7", "--accent-color": "#4ade80", "--card-bg": "#064e3b" } },
    { name: "Swiss Style", colors: { "--bg-color": "#ffffff", "--text-color": "#171717", "--accent-color": "#dc2626", "--card-bg": "#f5f5f5" } },
    { name: "Slate", colors: { "--bg-color": "#1e293b", "--text-color": "#f1f5f9", "--accent-color": "#94a3b8", "--card-bg": "#334155" } },
    { name: "Sand", colors: { "--bg-color": "#292524", "--text-color": "#e7e5e4", "--accent-color": "#d6d3d1", "--card-bg": "#44403c" } }
];

const FONT_PAIRINGS = [
    { name: "Modern Editorial", fonts: { "--heading-font": "'Playfair Display', serif", "--body-font": "'Inter', sans-serif" } },
    { name: "Tech Brutalist", fonts: { "--heading-font": "'Space Grotesk', sans-serif", "--body-font": "'Space Grotesk', sans-serif" } },
    { name: "Classic Elegant", fonts: { "--heading-font": "'Cinzel', serif", "--body-font": "'Inter', sans-serif" } },
    { name: "Soft Humanist", fonts: { "--heading-font": "'Fraunces', serif", "--body-font": "'Inter', sans-serif" } }
];

const LAYOUTS = ["split", "reversed", "stacked", "hero"];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomTheme() {
    const palette = getRandomItem(PALETTES);
    const fontPairing = getRandomItem(FONT_PAIRINGS);
    const layout = getRandomItem(LAYOUTS);

    return {
        date: "Remixed",
        name: `${palette.name} x ${fontPairing.name}`,
        layout: layout,
        colors: {
            ...palette.colors,
            ...fontPairing.fonts
        },
        font: fontPairing.fonts['--body-font']
    };
}

function initRemix() {
    const remixBtn = document.getElementById('remix-btn');
    if (remixBtn) {
        remixBtn.addEventListener('click', () => {
            const theme = generateRandomTheme();
            applyTheme(theme);
            updateDateDisplay(theme.date);
            // Clear URL param since this is a remix
            window.history.pushState({}, '', window.location.pathname);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();

    // Check URL params
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');

    if (dateParam && dateParam.length === 8) {
        // Convert YYYYMMDD -> YYYY-MM-DD
        const formattedDate = `${dateParam.slice(0, 4)}-${dateParam.slice(4, 6)}-${dateParam.slice(6, 8)}`;
        loadTheme(formattedDate, false); // Don't push state on initial load if we want (or maybe we do is fine)
    } else {
        loadTheme('latest'); // Load today's theme by default
    }

    initCalendar();
    initRemix();
    initInteractions();
});

function initInteractions() {
    // 1. Variable Font Interaction for H1
    const nameHeader = document.getElementById('name');
    if (nameHeader) {
        document.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;

            // Calculate percentage across screen (0 to 1)
            const xPct = clientX / innerWidth;
            const yPct = clientY / innerHeight;

            // Map to weight (e.g., 300 to 700) and optical size or slant if available
            // Fraunces has opsz (9..144) and wght (100..900)
            const weight = 100 + (xPct * 800); // Mapped to 100-900
            const slant = yPct * -15; // Slant -15 to 0 (if supported, Fraunces supports 'SOFT' 0-100 and 'WONK' 0-1)

            // Simple weight + optical size mapping
            // Note: Fraunces syntax might vary, let's stick to standard wght first + opsz
            const opsz = 9 + (yPct * 135);

            nameHeader.style.fontVariationSettings = `'wght' ${weight}, 'opsz' ${opsz}`;
        });
    }

    // 2. Scroll Reveal Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.experience-item, #profile-container, .bento-card').forEach(el => {
        el.classList.add('reveal-on-scroll');
        observer.observe(el);
    });
}

async function loadProfile() {
    try {
        const response = await fetch('public/profile.json');
        if (!response.ok) throw new Error('Failed to load profile');
        const data = await response.json();

        document.getElementById('name').textContent = data.name;
        document.getElementById('description').textContent = data.description;
        document.getElementById('linkedin').href = data.linkedin_url;
        document.getElementById('github').href = data.github_url;

        // Render Experience
        const expList = document.getElementById('experience-list');
        if (data.experience && expList) {
            expList.innerHTML = ''; // Clear loading state
            data.experience.forEach(item => {
                const div = document.createElement('div');
                div.className = 'experience-item';
                div.innerHTML = `
                    <div class="exp-header">
                        <span class="exp-role">${item.role}</span>
                        <span class="exp-company">@ ${item.company}</span>
                    </div>
                    <div class="exp-period">${item.period}</div>
                    <p class="exp-desc">${item.description}</p>
                `;
                expList.appendChild(div);
            });
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadTheme(dateOrIdentifier, updateUrl = true) {
    try {
        const filename = dateOrIdentifier === 'latest' ? 'latest.json' : `${dateOrIdentifier}.json`;
        const response = await fetch(`${ARCHIVE_PATH}${filename}`);
        if (!response.ok) {
            console.warn(`Theme not found for ${dateOrIdentifier}`);
            return;
        }

        const theme = await response.json();
        applyTheme(theme);
        updateDateDisplay(theme.date);

        // Update URL: YYYY-MM-DD -> YYYYMMDD
        if (updateUrl && theme.date) {
            const shortDate = theme.date.replace(/-/g, '');
            const newUrl = `${window.location.pathname}?date=${shortDate}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }

    } catch (error) {
        console.error('Error loading theme:', error);
    }
}

function applyTheme(theme) {
    const root = document.documentElement;
    const app = document.getElementById('app');
    const colors = theme.colors;

    // Apply colors
    for (const [key, value] of Object.entries(colors)) {
        root.style.setProperty(key, value);
    }

    // Apply font
    root.style.setProperty('--font-family', theme.font);

    // Apply Layout
    // Default to 'split' if undefined
    const layout = theme.layout || 'split';
    if (app) {
        app.setAttribute('data-layout', layout);
    }
}

function updateDateDisplay(dateString) {
    const display = document.getElementById('style-date');
    if (display) {
        display.textContent = dateString;
    }
}

function initCalendar() {
    renderCalendar(currentCalendarDate);

    document.getElementById('prev-month').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar(currentCalendarDate);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar(currentCalendarDate);
    });

    // Modal Toggle Logic
    const toggleBtn = document.getElementById('calendar-toggle-btn');
    const overlay = document.getElementById('calendar-overlay');
    const closeBtn = document.getElementById('close-calendar');
    const container = document.getElementById('calendar-container');

    function toggleCalendar() {
        overlay.classList.toggle('hidden');
    }

    function closeCalendar() {
        overlay.classList.add('hidden');
    }

    if (toggleBtn) toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCalendar();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeCalendar);

    // Close on click outside
    document.addEventListener('click', (e) => {
        const isClickInside = container.contains(e.target);
        const isClickOnToggle = toggleBtn.contains(e.target);

        if (!isClickInside && !isClickOnToggle && !overlay.classList.contains('hidden')) {
            closeCalendar();
        }
    });
}

function renderCalendar(date) {
    const grid = document.getElementById('calendar-grid');
    const label = document.getElementById('current-month-label');

    // Clear grid
    grid.innerHTML = '';

    // Set label
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    label.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    // Calendar logic
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const today = new Date();
    const minDay = new Date(2026, 0, 1);

    // Empty slots for days before 1st
    // Day of week: 0 (Sun) - 6 (Sat)
    const startDay = firstDay.getDay();

    for (let i = 0; i < startDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }

    // Days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;

        const currentDayDate = new Date(date.getFullYear(), date.getMonth(), day);
        // Fix: Use local date components instead of toISOString (which uses UTC)
        const year = currentDayDate.getFullYear();
        const month = String(currentDayDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(currentDayDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${dayStr}`;

        // Check if future
        if (currentDayDate > today || currentDayDate < minDay) {
            dayEl.classList.add('empty');
            dayEl.style.opacity = '0.3';
        } else {
            dayEl.addEventListener('click', () => loadTheme(dateString));
        }

        grid.appendChild(dayEl);
    }
}
