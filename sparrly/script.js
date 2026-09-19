document.addEventListener('DOMContentLoaded', () => {

    // Optional: Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Pricing State & UI Logic
    let userPricing = {
        monthly: 7.99,
        yearly: 29.99,
        currency: 'USD'
    };

    const pricingToggle = document.getElementById('pricing-toggle');
    const labelMonthly = document.getElementById('label-monthly');
    const labelAnnual = document.getElementById('label-annual');
    const amountWhole = document.querySelector('.price-display .amount');
    const currencySymbol = document.querySelector('.price-display .currency');
    const billingText = document.querySelector('.billing');

    function formatPrice(price, currencyCode) {
        try {
            const formatter = new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: currencyCode,
            });

            const parts = formatter.formatToParts(price);
            const symbol = parts.find(p => p.type === 'currency').value;
            const integerPart = parts.filter(p => p.type === 'integer' || p.type === 'group').map(p => p.value).join('');
            const fractionPart = parts.find(p => p.type === 'fraction')?.value || '';
            const decimalSeparator = parts.find(p => p.type === 'decimal')?.value || '';

            return {
                symbol,
                integer: integerPart,
                fraction: fractionPart ? `${decimalSeparator}${fractionPart}` : ''
            };
        } catch (e) {
            const priceStr = price.toFixed(2);
            const [int, frac] = priceStr.split('.');
            return { symbol: '$', integer: int, fraction: `.${frac}` };
        }
    }

    function updatePricingUI() {
        if (!amountWhole) return;

        const isAnnual = pricingToggle ? pricingToggle.checked : true;
        const price = isAnnual ? (userPricing.yearly / 12) : userPricing.monthly;
        const formatted = formatPrice(price, userPricing.currency);

        if (currencySymbol) currencySymbol.textContent = formatted.symbol;
        amountWhole.innerHTML = `${formatted.integer}<span class="decimals">${formatted.fraction}</span>`;

        if (isAnnual) {
            if (labelAnnual) labelAnnual.classList.add('active');
            if (labelMonthly) labelMonthly.classList.remove('active');
            if (billingText) billingText.textContent = 'Billed annually';
        } else {
            if (labelMonthly) labelMonthly.classList.add('active');
            if (labelAnnual) labelAnnual.classList.remove('active');
            if (billingText) billingText.textContent = 'Billed monthly';
        }
    }

    async function initPricing() {
        try {
            // 1. Fetch location (ISO country code)
            const geoRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
            const geoData = await geoRes.json();
            const countryCode = geoData.country_code;

            // 2. Use global pricing data loaded from public/pricing.js
            const pricingData = window.LUNA_PRICING;

            if (pricingData && pricingData[countryCode]) {
                userPricing = {
                    monthly: pricingData[countryCode].monthly,
                    yearly: pricingData[countryCode].yearly,
                    currency: pricingData[countryCode].currency
                };
                updatePricingUI();
            }
        } catch (error) {
            console.error('Failed to load localized pricing:', error);
            // Fallback to defaults already set in userPricing
        }
    }


    if (pricingToggle) {
        pricingToggle.addEventListener('change', updatePricingUI);

        if (labelMonthly) {
            labelMonthly.addEventListener('click', () => {
                if (pricingToggle.checked) {
                    pricingToggle.checked = false;
                    updatePricingUI();
                }
            });
        }

        if (labelAnnual) {
            labelAnnual.addEventListener('click', () => {
                if (!pricingToggle.checked) {
                    pricingToggle.checked = true;
                    updatePricingUI();
                }
            });
        }

        // Run localization
        initPricing();
    }

    // Close platform modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePlatformModal();
    });
});

// Platform Modal
function injectPlatformModal() {
    if (document.getElementById('platform-modal')) return;

    // Detect if we are in a subfolder (like /blog) to adjust asset paths
    const isSubfolder = window.location.pathname.includes('/blog/');
    const assetPath = isSubfolder ? '../' : '';

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    let modalContent = '';
    if (isMobile) {
        modalContent = `
        <div class="platform-modal-options">
            <!-- iPhone -->
            <a href="https://apps.apple.com/app/luna-your-coach-for-big-goals/id6758415008" target="_blank"
                rel="noopener noreferrer" onclick="closePlatformModal()">
                <img src="${assetPath}public/assets/badge-download-appstore.svg" alt="Download on the App Store" style="width: 160px; display: block;">
            </a>

            <!-- Android -->
            <a href="https://play.google.com/store/apps/details?id=com.coach.luna"
                target="_blank" rel="noopener noreferrer" onclick="closePlatformModal()">
                <img src="${assetPath}public/assets/badge-download-google-play.svg" alt="Get it on Google Play" style="width: 160px; display: block;">
            </a>
        </div>
        `;
    } else {
        modalContent = `
        <div class="platform-modal-desktop">
            <a href="https://apps.apple.com/app/luna-your-coach-for-big-goals/id6758415008" target="_blank" rel="noopener noreferrer" class="platform-column ios-qr" onclick="closePlatformModal()">
                <img src="${assetPath}public/assets/badge-download-appstore.svg" alt="Download on the App Store" style="width: 160px; display: block; padding-bottom: 20px;">
                <p>or scan to download on iPhone</p>
                <img src="${assetPath}public/assets/qrcode_apps.apple.com.png" alt="QR Code for iPhone App" class="qr-code">
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.coach.luna" target="_blank" rel="noopener noreferrer" class="platform-column android-beta" onclick="closePlatformModal()">
                <img src="${assetPath}public/assets/badge-download-google-play.svg" alt="Get it on Google Play" style="width: 160px; display: block; padding-bottom: 20px;">
                <p>or scan to download on Android</p>
                <img src="${assetPath}public/assets/qrcode_play.google.com.png" alt="QR Code for Android App" class="qr-code">
            </a>
        </div>
        `;
    }

    const modalHtml = `
    <div id="platform-modal" class="platform-modal-overlay" onclick="handleModalOverlayClick(event)">
        <div class="platform-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div class="platform-modal-header">
                <h3 id="modal-title">Choose Platform</h3>
                <button class="platform-modal-close" onclick="closePlatformModal()" aria-label="Close">&times;</button>
            </div>
            ${modalContent}
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function openPlatformModal() {
    injectPlatformModal();
    const modal = document.getElementById('platform-modal');
    if (modal) {
        modal.offsetHeight; // force reflow
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closePlatformModal() {
    const modal = document.getElementById('platform-modal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function handleModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
        closePlatformModal();
    }
}
