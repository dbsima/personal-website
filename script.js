console.log('Script loaded');

const ARCHIVE_PATH = 'public/archive/';
const CONFIG_PATH = 'public/theme-config.json';
let currentCalendarDate = new Date();

// Theme config loaded from shared JSON
let themeConfig = null;

async function loadThemeConfig() {
    try {
        const response = await fetch(CONFIG_PATH);
        if (!response.ok) throw new Error('Failed to load theme config');
        themeConfig = await response.json();
    } catch (error) {
        console.error('Error loading theme config:', error);
        // Fallback minimal config
        themeConfig = {
            palettes: [{ name: "Default", colors: { "--bg-color": "#0f172a", "--text-color": "#e2e8f0", "--accent-color": "#38bdf8", "--card-bg": "rgba(255,255,255,0.05)" } }],
            fontPairings: [{ name: "Default", fonts: { "--heading-font": "'Inter', sans-serif", "--body-font": "'Inter', sans-serif" } }],
            layouts: ["split"]
        };
    }
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomTheme() {
    if (!themeConfig) return null;

    const palette = getRandomItem(themeConfig.palettes);
    const fontPairing = getRandomItem(themeConfig.fontPairings);
    const layout = getRandomItem(themeConfig.layouts);

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
            if (theme) {
                applyTheme(theme);
                updateDateDisplay(theme.date, theme.name);
                // Clear URL param since this is a remix
                window.history.pushState({}, '', window.location.pathname);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Load shared config first
    await loadThemeConfig();

    loadProfile();
    loadRandomQuote();

    // Check URL params
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');

    if (dateParam && dateParam.length === 8) {
        // Convert YYYYMMDD -> YYYY-MM-DD
        const formattedDate = `${dateParam.slice(0, 4)}-${dateParam.slice(4, 6)}-${dateParam.slice(6, 8)}`;
        loadTheme(formattedDate, false);
    } else {
        loadTheme('latest');
    }

    initCalendar();
    initRemix();
    initInteractions();
});

async function loadRandomQuote() {
    try {
        const response = await fetch('public/quotes.json');
        if (!response.ok) throw new Error('Failed to load quotes');
        const data = await response.json();

        const quoteEl = document.getElementById('quote');
        if (quoteEl && data.quotes && data.quotes.length > 0) {
            const randomQuote = data.quotes[Math.floor(Math.random() * data.quotes.length)];
            quoteEl.textContent = `"${randomQuote}"`;
        }
    } catch (error) {
        console.error('Error loading quotes:', error);
    }
}

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
        updateDateDisplay(theme.date, theme.name);

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

function updateDateDisplay(dateString, themeName) {
    const dateEl = document.getElementById('style-date');
    const nameEl = document.getElementById('style-name');
    if (dateEl) {
        dateEl.textContent = dateString;
    }
    if (nameEl && themeName) {
        nameEl.textContent = themeName;
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
