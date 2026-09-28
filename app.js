/**
 * FamilyCar - Main Application Logic
 * Handles SPA navigation, modal interactions, multi-step forms, and state simulation.
 */

// Global State
let isLoggedIn = false;
let currentUser = {
    name: "",
    email: "",
    mobile: "",
    address: "",
    aadhaar: "",
    dl: "",
    ownsCar: false,
    ownsBike: false,
    intentBuy: false,
    intentSell: false,
    completion: 0
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Check saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const icons = document.querySelectorAll('.theme-toggle-btn i');
        icons.forEach(icon => icon.className = 'ph ph-sun');
        // Swap to dark logo
        const headerLogo = document.getElementById('header-logo');
        if (headerLogo) headerLogo.src = './logo-dark.png';
        document.querySelectorAll('.auth-logo-img').forEach(img => img.src = './logo-dark.png');
    }

    // Check initial hash for deep linking (e.g., #browse-screen)
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        navigateTo(hash);
    } else {
        // Default to login screen
        navigateTo('login-screen');
    }
    
    updateAuthState();
    initHomeListings();
    initBikeListings();
    initLocationDetection();
});

/**
 * SPA Navigation Controller
 * Hides all screens and shows the requested one with a fade effect.
 */
function navigateTo(screenId) {
    // Require auth for certain screens (including home-screen)
    const authRequiredScreens = ['home-screen', 'messages-screen', 'upload-screen', 'listings-screen', 'profile-screen', 'listing-guidelines-screen', 'bike-upload-screen', 'bike-listing-guidelines-screen'];

    if (authRequiredScreens.includes(screenId) && !isLoggedIn) {
        if (screenId !== 'home-screen') {
            showToast("Please login to access this feature.", "warning");
        }
        navigateTo('login-screen');
        return;
    }

    // Reset guidelines checkbox whenever navigating to a guidelines screen
    if (screenId === 'listing-guidelines-screen') {
        const cb = document.getElementById('guidelines-agree-checkbox');
        const btn = document.getElementById('guidelines-continue-btn');
        if (cb) cb.checked = false;
        if (btn) btn.disabled = true;
    }
    if (screenId === 'bike-listing-guidelines-screen') {
        const cb = document.getElementById('bike-guidelines-agree-checkbox');
        const btn = document.getElementById('bike-guidelines-continue-btn');
        if (cb) cb.checked = false;
        if (btn) btn.disabled = true;
    }

    // Update URL Hash for shareability
    window.location.hash = screenId;

    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    // Add auth-page class to body if navigating to auth screens to hide global header
    if (screenId === 'login-screen' || screenId === 'register-screen') {
        document.body.classList.add('auth-page');
    } else {
        document.body.classList.remove('auth-page');
    }

    // Show target screen
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Log the user out and return to the login screen.
 */
function logout() {
    isLoggedIn = false;
    currentUser = {
        name: "", email: "", mobile: "", address: "", aadhaar: "", dl: "",
        ownsCar: false, ownsBike: false, intentBuy: false, intentSell: false, completion: 0
    };
    updateAuthState();
    showToast("You have been logged out.", "info");
    navigateTo('login-screen');
}

/**
 * Back navigation from a guidelines screen — go to My Listings (single path).
 */
function goBackFromGuidelines() {
    navigateTo('listings-screen');
}

/**
 * Toggle the bike guidelines Continue button based on checkbox state.
 */
function toggleBikeGuidelinesBtn() {
    const cb = document.getElementById('bike-guidelines-agree-checkbox');
    const btn = document.getElementById('bike-guidelines-continue-btn');
    if (cb && btn) {
        btn.disabled = !cb.checked;
    }
}

/**
 * Toggle the guidelines Continue button based on checkbox state
 */
function toggleGuidelinesBtn() {
    const cb = document.getElementById('guidelines-agree-checkbox');
    const btn = document.getElementById('guidelines-continue-btn');
    if (cb && btn) {
        btn.disabled = !cb.checked;
    }
}

/**
 * Authentication and Profile Workflows
 */
function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    if (!email || !password) {
        showToast("Please enter email and password", "warning");
        return;
    }
    
    if (email === "1" && password === "1") {
        currentUser = {
            name: "Manish Kumar",
            email: "1",
            mobile: "9876543210",
            address: "Andheri West, Mumbai, Maharashtra 400053",
            aadhaar: "123456789012",
            dl: "MH-02-20150012345",
            ownsCar: true,
            ownsBike: false,
            intentBuy: true,
            intentSell: false,
            completion: 100
        };
        isLoggedIn = true;
        updateAuthState();
        showToast("Logged in with fully completed mock profile!", "success");
        navigateTo('home-screen');
    } else {
        // Generic normal login
        currentUser = {
            name: email.split('@')[0] || "User",
            email: email,
            mobile: "9876543210",
            address: "",
            aadhaar: "",
            dl: "",
            ownsCar: false,
            ownsBike: false,
            intentBuy: false,
            intentSell: false,
            completion: 40
        };
        isLoggedIn = true;
        updateAuthState();
        showToast("Logged in successfully! Complete your profile.", "success");
        navigateTo('home-screen');
    }
}

function handleRegister() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const mobile = document.getElementById('register-mobile').value.trim();
    const password = document.getElementById('register-password').value.trim();
    
    if (!name || !email || !mobile || !password) {
        showToast("All fields are mandatory!", "warning");
        return;
    }
    
    currentUser = {
        name: name,
        email: email,
        mobile: mobile,
        address: "",
        aadhaar: "",
        dl: "",
        ownsCar: false,
        ownsBike: false,
        intentBuy: false,
        intentSell: false,
        completion: 40 // Starting from 40% basic sign-up info
    };
    
    isLoggedIn = true;
    updateAuthState();
    showToast("Registration successful! Welcome to FamilyCar.", "success");
    navigateTo('home-screen'); // Open Home Screen immediately
}

function simulateLogin() {
    // For general compatibility if triggered by other buttons
    currentUser = {
        name: "Manish Kumar",
        email: "manish@example.com",
        mobile: "9876543210",
        address: "",
        aadhaar: "",
        dl: "",
        ownsCar: false,
        ownsBike: false,
        intentBuy: false,
        intentSell: false,
        completion: 40
    };
    isLoggedIn = true;
    updateAuthState();
    showToast("Successfully logged in!", "success");
    navigateTo('home-screen');
}

function updateAuthState() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;

    const loginBtn = document.getElementById('header-login-btn');
    const userMenu = authButtons.querySelector('.user-menu');

    if (isLoggedIn) {
        if(loginBtn) loginBtn.classList.add('hidden');
        if(userMenu) userMenu.classList.remove('hidden');

        // Update completion badge
        const pctText = document.getElementById('profile-percentage-text');
        if (pctText) pctText.innerText = currentUser.completion + "%";

        const completionBadge = document.getElementById('profile-completion-badge');
        if (completionBadge) {
            if (currentUser.completion === 100) {
                completionBadge.classList.add('completed');
            } else {
                completionBadge.classList.remove('completed');
            }
        }
    } else {
        if(loginBtn) loginBtn.classList.remove('hidden');
        if(userMenu) userMenu.classList.add('hidden');
    }
}

/**
 * Offer Modal Logic
 */
function openOfferModal(id) {
    if (!isLoggedIn) {
        showToast("Please login to contact the seller.", "warning");
        navigateTo('login-screen');
        return;
    }

    // Populate the modal with the clicked listing (falls back to defaults if none)
    const item = id ? listingsRegistry[id] : null;
    if (item) {
        const img = document.getElementById('offer-modal-img');
        const title = document.getElementById('offer-modal-title');
        const listed = document.getElementById('offer-modal-listed-price');
        const offerInput = document.getElementById('offer-modal-price-input');
        if (img) img.src = item.image;
        if (title) title.textContent = item.name;
        if (listed) listed.textContent = item.price;
        if (offerInput) {
            // Default offer ~4% below asking, rounded to nearest 1,000
            const asking = Math.round(item.priceNumeric * 100000);
            offerInput.value = Math.round(asking * 0.96 / 1000) * 1000;
        }
    }

    const modal = document.getElementById('offer-modal');
    if(modal) modal.classList.add('active');
}

/**
 * Open the details screen for a given listing id, populating it dynamically.
 * Routes cars to #details-screen and bikes to #bike-details-screen.
 */
let currentDetailsId = null;
function openDetails(id) {
    const item = listingsRegistry[id];
    if (!item) {
        navigateTo('details-screen');
        return;
    }
    currentDetailsId = id;
    if (item.category === 'bike') {
        populateBikeDetails(item);
        navigateTo('bike-details-screen');
    } else {
        populateCarDetails(item);
        navigateTo('details-screen');
    }
}

function setText(elId, value) {
    const el = document.getElementById(elId);
    if (el) el.textContent = value;
}
function setSrc(elId, value) {
    const el = document.getElementById(elId);
    if (el) el.src = value;
}

function populateCarDetails(item) {
    setSrc('details-main-img', item.image);
    setText('details-title', `${item.name} (${item.year})`);
    setText('details-location-text', item.location + ' • Posted recently');
    setText('details-price', item.price);
    setText('details-year', item.year);
    setText('details-mileage', item.mileage);
    setText('details-fuel', item.fuel);
    setText('details-transmission', item.transmission);
    setText('details-owners', item.owner === 1 ? '1st Owner' : '2nd Owner');
    setText('details-color', item.color || '—');
    setText('details-description',
        `${item.name} in well-maintained condition. Single-family owned, serviced regularly, and available with complete documentation. ${item.isVerified ? 'RC and owner identity verified by FamilyCar.' : 'Verification pending.'} No dealers please.`);
    setText('details-owner-name', item.sellerName);
    setText('details-owner-avatar', (item.sellerName || 'U').trim().charAt(0).toUpperCase());
    setText('details-trust-score', item.trustScore);
}

function populateBikeDetails(item) {
    setSrc('bike-details-main-img', item.image);
    setText('bike-details-title', `${item.name} (${item.year})`);
    setText('bike-details-location-text', item.location + ' • Posted recently');
    setText('bike-details-price', item.price);
    setText('bike-details-year', item.year);
    setText('bike-details-mileage', item.mileage);
    setText('bike-details-cc', item.cc ? item.cc + ' cc' : 'Electric');
    setText('bike-details-kmpl', item.kmpl);
    setText('bike-details-fuel', item.fuel);
    setText('bike-details-owners', item.owner === 1 ? '1st Owner' : '2nd Owner');
    setText('bike-details-abs', item.abs);
    setText('bike-details-biketype', item.bikeType);
    setText('bike-details-color', item.color || '—');
    setText('bike-details-description',
        `${item.name} in excellent riding condition. Regularly serviced, tyres and brakes in good shape. ${item.isVerified ? 'RC and owner identity verified by FamilyCar.' : 'Verification pending.'} Genuine buyers only, no dealers.`);
    setText('bike-details-owner-name', item.sellerName);
    setText('bike-details-owner-avatar', (item.sellerName || 'U').trim().charAt(0).toUpperCase());
    setText('bike-details-trust-score', item.trustScore);
}

function closeOfferModal() {
    const modal = document.getElementById('offer-modal');
    if(modal) modal.classList.remove('active');
}

function sendMessageAndGoToInbox() {
    closeOfferModal();
    showToast("Offer sent successfully! The seller will reply here.", "success");
    setTimeout(() => {
        navigateTo('messages-screen');
    }, 1000);
}

/**
 * Multi-step Upload Form Logic.
 * Scoped to a screen container + id prefix so the car and bike upload flows
 * can coexist without clashing element ids.
 *   prefix: 'step'  → car flow (#upload-screen)
 *   prefix: 'bstep' → bike flow (#bike-upload-screen)
 */
function nextStep(stepNumber, screenId, prefix) {
    screenId = screenId || 'upload-screen';
    prefix = prefix || 'step';
    const scope = document.getElementById(screenId);
    if (!scope) return;

    // Hide all steps
    scope.querySelectorAll('.upload-step').forEach(step => {
        step.style.display = 'none';
        step.classList.remove('active');
    });

    // Reset Stepper classes
    scope.querySelectorAll('.stepper .step').forEach(indicator => {
        indicator.classList.remove('active');
        indicator.classList.remove('completed');
    });
    scope.querySelectorAll('.stepper .step-line').forEach(line => {
        line.classList.remove('active');
    });

    // Mark previous steps as completed
    for(let i=1; i<stepNumber; i++) {
        const ind = document.getElementById(`${prefix}-${i}-indicator`);
        if(ind) ind.classList.add('completed');

        // Update line after this step
        if (i < 4) {
            const line = scope.querySelectorAll('.stepper .step-line')[i-1];
            if(line) line.classList.add('active');
        }
    }

    // Set current step as active
    const currentIndicator = document.getElementById(`${prefix}-${stepNumber}-indicator`);
    if(currentIndicator) currentIndicator.classList.add('active');

    // Show the target step content
    const targetStep = document.getElementById(`${prefix}-${stepNumber}`);
    if (targetStep) {
        targetStep.style.display = 'block';
        targetStep.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function showUploadSuccess(screenId, prefix) {
    screenId = screenId || 'upload-screen';
    prefix = prefix || 'step';
    const scope = document.getElementById(screenId);
    if (!scope) return;

    // Hide stepper
    const stepper = scope.querySelector('.stepper');
    if(stepper) stepper.style.display = 'none';

    // Hide all steps
    scope.querySelectorAll('.upload-step').forEach(step => {
        step.style.display = 'none';
    });

    // Show success
    const successStep = document.getElementById(`${prefix}-success`);
    if(successStep) {
        successStep.style.display = 'block';
        successStep.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Toast Notification System
 */
function showToast(message, type = "success") {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = "ph-info";
    if (type === "success") icon = "ph-check-circle";
    if (type === "warning") icon = "ph-warning";
    if (type === "error") icon = "ph-x-circle";

    toast.innerHTML = `<i class="ph ${icon}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s reverse forwards';
        setTimeout(() => {
            if(container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Attach image preview toggle (for 360 viewer mock)
document.addEventListener('click', (e) => {
    // Thumbnail clicking logic
    if (e.target.matches('.thumbnail-strip img')) {
        const strip = e.target.closest('.thumbnail-strip');
        strip.querySelectorAll('img').forEach(img => img.classList.remove('active'));
        e.target.classList.add('active');
        
        const mainImg = e.target.closest('.gallery').querySelector('.main-image img');
        mainImg.src = e.target.src.replace('w=200', 'w=1200');
    }
});

/**
 * Dashboard Tab Switching Logic
 */
function switchDashboardTab(tabId) {
    // Update active class on buttons
    document.querySelectorAll('.custom-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.custom-tab[onclick*="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Hide all tab content
    document.querySelectorAll('#dashboard-screen .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show the selected tab content
    const activeContent = document.getElementById(`tab-${tabId}`);
    if (activeContent) activeContent.classList.add('active');
}

/**
 * Mobile Login Simulation with custom blurred Modal
 */
function showMobileLoginModal() {
    const modal = document.getElementById('mobile-login-modal');
    if (modal) {
        // Reset states
        document.getElementById('mobile-input-field').value = '';
        document.getElementById('otp-input-field').value = '';
        document.getElementById('otp-step-1').classList.add('active');
        document.getElementById('otp-step-2').classList.remove('active');
        
        modal.classList.add('active');
    }
}

function closeMobileLoginModal() {
    const modal = document.getElementById('mobile-login-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function sendOTPFlow() {
    const mobile = document.getElementById('mobile-input-field').value.trim();
    if (!mobile) {
        showToast("Please enter a valid mobile number", "warning");
        return;
    }
    
    showToast("OTP sent to " + mobile, "success");
    
    // Transition to OTP verification step
    document.getElementById('otp-step-1').classList.remove('active');
    document.getElementById('otp-step-2').classList.add('active');
    
    // Auto-focus OTP field
    setTimeout(() => {
        document.getElementById('otp-input-field').focus();
    }, 100);
}

function verifyOTPFlow() {
    const otp = document.getElementById('otp-input-field').value.trim();
    if (!otp || otp.length < 4) {
        showToast("Please enter the 4-digit OTP", "warning");
        return;
    }
    
    closeMobileLoginModal();
    simulateLogin();
}

/**
 * Global registry of every rendered listing (cars + bikes), keyed by id.
 * Lets details/offer screens populate from the exact listing that was clicked.
 */
let listingsRegistry = {};
let activeCategory = 'cars';

/**
 * Switch categories (Cars vs Bikes).
 * Also toggles the category-specific quick pills and filter field set so that
 * car-only controls never appear over the bikes feed (and vice-versa).
 */
function switchCategory(category) {
    activeCategory = category;
    document.querySelectorAll('.toggle-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.vertical-listings-list').forEach(list => list.classList.remove('active'));

    const isCars = category === 'cars';

    const activeBtn = document.querySelector(`.toggle-tab[onclick*="${isCars ? 'cars' : 'bikes'}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    const activeList = document.getElementById(isCars ? 'cars-vertical-list' : 'bikes-vertical-list');
    if (activeList) activeList.classList.add('active');

    // Toggle the quick-pill rows
    const carPills = document.getElementById('car-type-pills');
    const bikePills = document.getElementById('bike-type-pills');
    if (carPills) carPills.style.display = isCars ? 'flex' : 'none';
    if (bikePills) bikePills.style.display = isCars ? 'none' : 'flex';

    // Toggle the filter field sets + header text
    const carFields = document.getElementById('car-filter-fields');
    const bikeFields = document.getElementById('bike-filter-fields');
    if (carFields) carFields.style.display = isCars ? 'flex' : 'none';
    if (bikeFields) bikeFields.style.display = isCars ? 'none' : 'flex';
    const filterHeading = document.getElementById('filter-dropdown-heading');
    if (filterHeading) filterHeading.textContent = isCars ? 'Filter Cars' : 'Filter Bikes';
}

/**
 * Build the inner HTML for a single listing row card (shared by cars & bikes).
 */
function renderListingCard(item) {
    const verifiedBadge = item.isVerified
        ? '<span class="badge-owner-verified"><i class="ph ph-shield-check"></i> Owner Verified</span>'
        : '';
    const ownerLabel = item.owner === 1 ? '1st Owner' : '2nd Owner';

    let specBadges, dataAttrs;
    if (item.category === 'bike') {
        specBadges = `
            <span class="spec-badge">${item.year}</span>
            <span class="spec-badge">${item.mileage}</span>
            <span class="spec-badge">${item.cc} cc</span>
            <span class="spec-badge">${item.fuel}</span>
            <span class="spec-badge">${ownerLabel}</span>
            <span class="spec-badge bike-type-badge">${item.bikeType}</span>`;
        dataAttrs = `data-id="${item.id}" data-category="bike" data-price="${item.priceNumeric}" data-brand="${item.brand}" data-owner="${item.owner}" data-year="${item.year}" data-cc="${item.cc}" data-biketype="${item.bikeType}"`;
    } else {
        specBadges = `
            <span class="spec-badge">${item.year}</span>
            <span class="spec-badge">${item.mileage}</span>
            <span class="spec-badge">${item.fuel}</span>
            <span class="spec-badge">${item.transmission}</span>
            <span class="spec-badge">${ownerLabel}</span>
            <span class="spec-badge car-type-badge">${item.carType}</span>`;
        dataAttrs = `data-id="${item.id}" data-category="car" data-price="${item.priceNumeric}" data-company="${item.company}" data-owner="${item.owner}" data-year="${item.year}" data-fuel="${item.fuel}" data-transmission="${item.transmission}" data-cartype="${item.carType}"`;
    }

    return `
        <div class="listing-row-card" ${dataAttrs}>
            <div class="listing-row-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="listing-row-details">
                <div class="listing-row-header">
                    <div class="listing-row-title-area">
                        <h3>${item.name} (${item.year})
                            ${verifiedBadge}
                        </h3>
                        <div class="listing-row-location"><i class="ph ph-map-pin"></i> ${item.location}</div>
                    </div>
                    <div class="listing-row-price">${item.price}</div>
                </div>

                <div class="listing-row-specs">${specBadges}</div>

                <div class="listing-row-footer">
                    <span style="font-size: 0.85rem; color: #64748b;" class="footer-listed-by">Listed by <strong class="seller-name-text">${item.sellerName}</strong></span>
                    <div class="listing-row-actions">
                        <button class="btn-secondary" onclick="openDetails('${item.id}')">Quick View</button>
                        <button class="btn-primary" onclick="openOfferModal('${item.id}')">Contact Owner</button>
                    </div>
                </div>
            </div>
        </div>`;
}

const SELLER_NAMES = [
    "amitbharti kanubharti gosai",
    "Abhishek Tiwari",
    "Mrinal Patil",
    "Tanmay anil gorkar",
    "Pravina gorkar",
    "Anil Gorkar"
];

function initHomeListings() {
    const carsListContainer = document.getElementById('cars-vertical-list');
    if (!carsListContainer) return;

    const sellerNames = SELLER_NAMES;

    // First, list the uploaded second hand cars with accurate prices and local images
    const uploadedCars = [
        { name: "Honda Jazz V MT", image: "./Honda Jazz.webp", priceNumeric: 5.10, price: "₹ 5.10 Lakh", year: 2017, fuel: "Petrol", mileage: "48,500 km", transmission: "Manual", location: "Mumbai, Maharashtra", isVerified: true, company: "Honda", owner: 1, carType: "Hatchback", color: "Silver" },
        { name: "Hyundai Creta 1.6 SX", image: "./Hundayi Creta.webp", priceNumeric: 10.20, price: "₹ 10.20 Lakh", year: 2019, fuel: "Petrol", mileage: "36,000 km", transmission: "Manual", location: "Delhi, NCR", isVerified: true, company: "Hyundai", owner: 2, carType: "SUV", color: "White" },
        { name: "Hyundai Creta 1.5 CRDi SX", image: "./Hundayi Creta 2.webp", priceNumeric: 14.80, price: "₹ 14.80 Lakh", year: 2021, fuel: "Diesel", mileage: "24,000 km", transmission: "Automatic", location: "Bangalore, Karnataka", isVerified: true, company: "Hyundai", owner: 1, carType: "SUV", color: "Polar White" },
        { name: "Hyundai Eon Magna+", image: "./Hundayi Eon.webp", priceNumeric: 1.95, price: "₹ 1.95 Lakh", year: 2015, fuel: "Petrol", mileage: "62,000 km", transmission: "Manual", location: "Pune, Maharashtra", isVerified: false, company: "Hyundai", owner: 2, carType: "Hatchback", color: "Grey" },
        { name: "Kia Seltos GTX Plus DCT", image: "./Kia Seltos.webp", priceNumeric: 13.90, price: "₹ 13.90 Lakh", year: 2020, fuel: "Petrol", mileage: "28,000 km", transmission: "Automatic", location: "Hyderabad, Telangana", isVerified: true, company: "Kia", owner: 1, carType: "SUV", color: "Red" },
        { name: "Mahindra Scorpio S11", image: "./Mahindra Scarpio.webp", priceNumeric: 12.50, price: "₹ 12.50 Lakh", year: 2018, fuel: "Diesel", mileage: "54,000 km", transmission: "Manual", location: "Chennai, Tamil Nadu", isVerified: true, company: "Mahindra", owner: 2, carType: "SUV", color: "Black" },
        { name: "Maruti Suzuki Ignis Zeta", image: "./Maruti Ignis.webp", priceNumeric: 4.50, price: "₹ 4.50 Lakh", year: 2019, fuel: "Petrol", mileage: "31,000 km", transmission: "Manual", location: "Ahmedabad, Gujarat", isVerified: true, company: "Maruti Suzuki", owner: 1, carType: "Hatchback", color: "Orange" },
        { name: "Maruti Suzuki Dzire VXI", image: "./Maruti Suzuk Dzire.webp", priceNumeric: 5.40, price: "₹ 5.40 Lakh", year: 2018, fuel: "Petrol", mileage: "42,000 km", transmission: "Manual", location: "Kolkata, West Bengal", isVerified: true, company: "Maruti Suzuki", owner: 2, carType: "Sedan", color: "Silver" },
        { name: "Maruti Suzuki Wagon R VXI", image: "./Maruti Suzuki Wagnor.webp", priceNumeric: 3.20, price: "₹ 3.20 Lakh", year: 2016, fuel: "Petrol/CNG", mileage: "58,000 km", transmission: "Manual", location: "Pune, Maharashtra", isVerified: true, company: "Maruti Suzuki", owner: 1, carType: "Hatchback", color: "Blue" }
    ];

    // Real photos of the actual Indian models (Wikimedia Commons, verified to load) —
    // mirrors the same sourcing approach used for bikes below, so every named model
    // shows its own correct car instead of a reused/generic stock photo.
    const cimgCar = f => 'https://commons.wikimedia.org/wiki/Special:FilePath/' + f + '?width=600';
    const baseModels = [
        { name: "Maruti Suzuki Swift VXI", image: cimgCar('Suzuki_Swift_(2024)_hybrid_DSC_6076.jpg'), basePrice: 5.5, company: "Maruti Suzuki", carType: "Hatchback" },
        { name: "Hyundai i20 Asta", image: cimgCar('Hyundai_i20_(BC3)_IMG_5670.jpg'), basePrice: 7.8, company: "Hyundai", carType: "Hatchback" },
        { name: "Maruti Suzuki Alto K10 LXI", image: cimgCar('Maruti_Suzuki_Alto_K10.jpg'), basePrice: 3.2, company: "Maruti Suzuki", carType: "Hatchback" },
        { name: "Honda City ZX CVT", image: cimgCar('2022_Honda_City_1.5_GN2_(20220317)_01.jpg'), basePrice: 11.5, company: "Honda", carType: "Sedan" },
        { name: "Hyundai Creta SX Opt", image: cimgCar('2022_Hyundai_Creta_1.6_Plus_(Chile)_front_view.jpg'), basePrice: 13.8, company: "Hyundai", carType: "SUV" },
        { name: "Mahindra Thar LX 4WD", image: cimgCar('Mahindra_Thar_ROXX_on_rocks_(cropped).jpg'), basePrice: 14.5, company: "Mahindra", carType: "SUV" },
        { name: "Mahindra Scorpio-N Z8L", image: cimgCar('2024_Mahindra_Scorpio_Z8L_front.jpg'), basePrice: 18.2, company: "Mahindra", carType: "SUV" },
        { name: "Tata Nexon XZA+", image: cimgCar('2023_Tata_Nexon_XZA+_front_view.jpg'), basePrice: 9.8, company: "Tata", carType: "SUV" },
        { name: "Toyota Fortuner Sigma 4", image: cimgCar('2020_Toyota_Fortuner_2.8_Legender_4WD.jpg'), basePrice: 32.5, company: "Toyota", carType: "SUV" },
        { name: "Maruti Suzuki Baleno Alpha", image: cimgCar('2022_Maruti_Suzuki_Baleno_Alpha_(India)_front_view.jpg'), basePrice: 7.2, company: "Maruti Suzuki", carType: "Hatchback" },
        { name: "Kia Seltos GTX Plus", image: cimgCar('Kia_Seltos_SP2_PE_Snow_White_Pearl_(6)_(cropped).jpg'), basePrice: 15.4, company: "Kia", carType: "SUV" },
        { name: "Hyundai Verna SX(O)", image: cimgCar('Hyundai_Verna_SX_Turbo_03.jpg'), basePrice: 12.2, company: "Hyundai", carType: "Sedan" },
        { name: "Tata Punch Creative", image: cimgCar('2021_Tata_Punch_Creative_(India)_front_view_01.png'), basePrice: 7.5, company: "Tata", carType: "Hatchback" },
        { name: "Volkswagen Virtus GT", image: cimgCar('2022_Volkswagen_Virtus_1.5_GT_(India)_front_view_01.png'), basePrice: 16.8, company: "Volkswagen", carType: "Sedan" },
        { name: "Mahindra XUV700 AX7L", image: cimgCar('A_black_Mahindra_XUV700_SUV_in_Ashiana_Brahmananda,_Jamshedpur,_India_(Ank_Kumar,_Infosys_Limited)_02.jpg'), basePrice: 21.0, company: "Mahindra", carType: "SUV" }
    ];

    const locations = ["Delhi, NCR", "Mumbai, Maharashtra", "Bangalore, Karnataka", "Pune, Maharashtra", "Hyderabad, Telangana", "Chennai, Tamil Nadu", "Kolkata, West Bengal", "Ahmedabad, Gujarat"];
    const colors = ["White", "Silver", "Grey", "Black", "Red", "Blue"];

    const carItems = [];

    // 1. Uploaded second-hand cars first
    uploadedCars.forEach((car, index) => {
        carItems.push({
            ...car,
            id: `car-${index + 1}`,
            category: 'car',
            sellerName: sellerNames[index % sellerNames.length],
            trustScore: car.isVerified ? 90 + (index % 9) : 72 + (index % 6),
            interested: 3 + (index % 12)
        });
    });

    // 2. Generate the remaining 41 cars to pad out to 50
    for (let i = 1; i <= 41; i++) {
        const model = baseModels[(i - 1) % baseModels.length];
        const year = 2016 + ((i * 3) % 8); // years 2016 to 2023
        const mileageVal = (15000 + ((i * 7000) % 65000));
        const mileage = mileageVal.toLocaleString('en-IN') + " km";
        const transmission = i % 3 === 0 ? "Automatic" : "Manual";
        const fuel = i % 4 === 0 ? "Diesel" : (i % 5 === 0 ? "CNG" : "Petrol");
        const ageFactor = (year - 2015) / 10;
        const adjustedPrice = (model.basePrice * (0.6 + ageFactor)).toFixed(2);
        const isVerified = i % 5 !== 0; // 80% verified
        const owner = i % 2 === 0 ? 2 : 1;

        carItems.push({
            id: `car-${uploadedCars.length + i}`,
            category: 'car',
            name: model.name,
            image: model.image,
            priceNumeric: parseFloat(adjustedPrice),
            price: "₹ " + adjustedPrice + " Lakh",
            year: year,
            fuel: fuel,
            mileage: mileage,
            transmission: transmission,
            location: locations[i % locations.length],
            isVerified: isVerified,
            company: model.company,
            owner: owner,
            carType: model.carType,
            color: colors[i % colors.length],
            sellerName: sellerNames[(i + 9) % sellerNames.length],
            trustScore: isVerified ? 88 + (i % 12) : 70 + (i % 8),
            interested: 2 + (i % 14)
        });
    }

    let htmlContent = "";
    carItems.forEach(item => {
        listingsRegistry[item.id] = item;
        htmlContent += renderListingCard(item);
    });

    carsListContainer.innerHTML = htmlContent;
}

/**
 * Bike listings — India-focused used two-wheelers.
 * Mirrors the car feed exactly, only the domain attributes differ (cc, bikeType, brand).
 */
function initBikeListings() {
    const bikesListContainer = document.getElementById('bikes-vertical-list');
    if (!bikesListContainer) return;

    // Real photos of the actual Indian models (Wikimedia Commons, verified to load).
    const cimg = f => 'https://commons.wikimedia.org/wiki/Special:FilePath/' + f + '?width=600';
    const bikeModels = [
        // ---- Motorcycles (bikeType: "Bike") ----
        { name: "Royal Enfield Classic 350", image: cimg('Royal_Enfield_Classic_350.jpg'), basePrice: 1.65, brand: "Royal Enfield", bikeType: "Bike", cc: 349, fuel: "Petrol" },
        { name: "Royal Enfield Meteor 350", image: cimg('Royal_Enfield_Meteor_350.jpg'), basePrice: 1.85, brand: "Royal Enfield", bikeType: "Bike", cc: 349, fuel: "Petrol" },
        { name: "Royal Enfield Himalayan", image: cimg('Royal_Enfield_Himalayan.jpg'), basePrice: 2.15, brand: "Royal Enfield", bikeType: "Bike", cc: 411, fuel: "Petrol" },
        { name: "KTM 390 Duke", image: cimg('KTM_390_Duke.jpg'), basePrice: 2.35, brand: "KTM", bikeType: "Bike", cc: 373, fuel: "Petrol" },
        { name: "Bajaj Pulsar RS200", image: cimg('Bajaj_Pulsar_RS200.jpg'), basePrice: 1.15, brand: "Bajaj", bikeType: "Bike", cc: 199, fuel: "Petrol" },
        { name: "TVS Apache RTR 160 4V", image: cimg('TVS_Apache_RTR_160_4V.jpg'), basePrice: 0.92, brand: "TVS", bikeType: "Bike", cc: 159, fuel: "Petrol" },
        { name: "Yamaha YZF-R15", image: cimg('Yamaha_YZF-R15.jpg'), basePrice: 1.25, brand: "Yamaha", bikeType: "Bike", cc: 155, fuel: "Petrol" },
        { name: "Hero Passion Pro", image: cimg('Hero_Honda_Passion.jpg'), basePrice: 0.58, brand: "Hero", bikeType: "Bike", cc: 113, fuel: "Petrol" },
        // ---- Scooters (bikeType: "Scooter") ----
        { name: "Honda Activa 6G", image: cimg('Honda_Activa_6G.jpg'), basePrice: 0.72, brand: "Honda", bikeType: "Scooter", cc: 110, fuel: "Petrol" },
        { name: "Suzuki Access 125", image: cimg('Suzuki_Access_125.jpg'), basePrice: 0.68, brand: "Suzuki", bikeType: "Scooter", cc: 124, fuel: "Petrol" },
        { name: "TVS Jupiter", image: cimg('TVS_Jupiter.jpg'), basePrice: 0.62, brand: "TVS", bikeType: "Scooter", cc: 110, fuel: "Petrol" },
        { name: "Honda Dio", image: cimg('Honda_Dio.jpg'), basePrice: 0.65, brand: "Honda", bikeType: "Scooter", cc: 110, fuel: "Petrol" },
        { name: "Bajaj Chetak Electric", image: cimg('Bajaj_Chetak.jpg'), basePrice: 1.10, brand: "Bajaj", bikeType: "Scooter", cc: 0, fuel: "Electric" },
        { name: "Hero Pleasure Plus", image: cimg('Hero_Pleasure.jpg'), basePrice: 0.55, brand: "Hero", bikeType: "Scooter", cc: 110, fuel: "Petrol" }
    ];

    const locations = ["Delhi, NCR", "Mumbai, Maharashtra", "Bangalore, Karnataka", "Pune, Maharashtra", "Hyderabad, Telangana", "Chennai, Tamil Nadu", "Kolkata, West Bengal", "Ahmedabad, Gujarat"];
    const colors = ["Black", "Red", "Blue", "White", "Grey", "Matte Green"];

    let htmlContent = "";
    bikeModels.forEach((model, i) => {
        const year = 2017 + ((i * 2) % 7); // 2017 - 2023
        const kmpl = model.fuel === 'Electric' ? "85 km/charge" : (40 + ((i * 3) % 35)) + " kmpl";
        const mileageVal = 5000 + ((i * 3500) % 40000);
        const mileage = mileageVal.toLocaleString('en-IN') + " km";
        const ageFactor = (year - 2016) / 10;
        const adjustedPrice = (model.basePrice * (0.65 + ageFactor)).toFixed(2);
        const isVerified = i % 4 !== 0; // 75% verified
        const owner = i % 2 === 0 ? 1 : 2;

        const item = {
            id: `bike-${i + 1}`,
            category: 'bike',
            name: model.name,
            image: model.image,
            priceNumeric: parseFloat(adjustedPrice),
            price: "₹ " + adjustedPrice + " Lakh",
            year: year,
            fuel: model.fuel,
            mileage: mileage,
            kmpl: kmpl,
            cc: model.cc,
            abs: model.cc >= 150 ? "Single-Channel ABS" : "CBS",
            location: locations[i % locations.length],
            isVerified: isVerified,
            brand: model.brand,
            owner: owner,
            bikeType: model.bikeType,
            color: colors[i % colors.length],
            sellerName: SELLER_NAMES[(i + 2) % SELLER_NAMES.length],
            trustScore: isVerified ? 86 + (i % 13) : 68 + (i % 9),
            interested: 2 + (i % 11)
        };
        listingsRegistry[item.id] = item;
        htmlContent += renderListingCard(item);
    });

    bikesListContainer.innerHTML = htmlContent;
}

/**
 * Profile Completion Modal Logic
 */
function openProfileCompletionModal() {
    const modal = document.getElementById('profile-completion-modal');
    if (!modal) return;
    
    // Fill the inputs with currentUser values
    document.getElementById('pc-address').value = currentUser.address || "";
    document.getElementById('pc-aadhaar').value = currentUser.aadhaar || "";
    document.getElementById('pc-dl').value = currentUser.dl || "";
    document.getElementById('pc-own-car').checked = currentUser.ownsCar || false;
    document.getElementById('pc-own-bike').checked = currentUser.ownsBike || false;
    document.getElementById('pc-intent-buy').checked = currentUser.intentBuy || false;
    document.getElementById('pc-intent-sell').checked = currentUser.intentSell || false;
    
    modal.classList.add('active');
}

function closeProfileCompletionModal() {
    const modal = document.getElementById('profile-completion-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function handleProfileCompletionSubmit() {
    const address = document.getElementById('pc-address').value.trim();
    const aadhaar = document.getElementById('pc-aadhaar').value.trim();
    const dl = document.getElementById('pc-dl').value.trim();
    const ownsCar = document.getElementById('pc-own-car').checked;
    const ownsBike = document.getElementById('pc-own-bike').checked;
    const intentBuy = document.getElementById('pc-intent-buy').checked;
    const intentSell = document.getElementById('pc-intent-sell').checked;
    
    if (!address || !aadhaar || !dl) {
        showToast("Address, Aadhaar, and Driving License are required!", "warning");
        return;
    }
    
    if (aadhaar.length !== 12 || isNaN(aadhaar)) {
        showToast("Aadhaar Number must be a valid 12-digit number!", "warning");
        return;
    }
    
    currentUser.address = address;
    currentUser.aadhaar = aadhaar;
    currentUser.dl = dl;
    currentUser.ownsCar = ownsCar;
    currentUser.ownsBike = ownsBike;
    currentUser.intentBuy = intentBuy;
    currentUser.intentSell = intentSell;
    currentUser.completion = 100; // Profile fully complete!
    
    updateAuthState();
    closeProfileCompletionModal();
    showToast("Profile updated successfully! 100% complete.", "success");
}

/**
 * Handle Profile Photo Upload
 */
function handleProfilePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Update the profile page avatar
            const img = document.getElementById('profile-avatar-img');
            if (img) img.src = e.target.result;
            
            // Update the global header avatar
            const headerAvatar = document.querySelector('.user-menu .avatar img');
            if (headerAvatar) headerAvatar.src = e.target.result;
            
            showToast("Profile photo uploaded successfully!", "success");
        }
        reader.readAsDataURL(file);
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch(e) {}
    
    // Update theme icons
    const icons = document.querySelectorAll('.theme-toggle-btn i');
    icons.forEach(icon => {
        if (isDark) {
            icon.className = 'ph ph-sun';
        } else {
            icon.className = 'ph ph-moon';
        }
    });

    // Swap logo between light and dark versions
    const headerLogo = document.getElementById('header-logo');
    if (headerLogo) headerLogo.src = isDark ? './logo-dark.png' : './logo.png';
    document.querySelectorAll('.auth-logo-img').forEach(img => {
        img.src = isDark ? './logo-dark.png' : './logo.png';
    });
}

/**
 * Filter Dropdown Controls
 */
function toggleFilterDropdown() {
    const dropdown = document.getElementById('filter-dropdown');
    if (!dropdown) return;
    const isHidden = dropdown.style.display === 'none' || dropdown.style.display === '';
    if (isHidden) {
        // Anchor the panel so it always stays on-screen: if the Filter button sits
        // in the left half of the viewport, open rightward (left:0); otherwise open
        // leftward (right:0). Prevents the panel being clipped off the left edge
        // when the header wraps and the button moves to the left.
        const btn = document.getElementById('filter-trigger-btn');
        if (btn) {
            const rect = btn.getBoundingClientRect();
            if (rect.left < window.innerWidth / 2) {
                dropdown.style.left = '0';
                dropdown.style.right = 'auto';
            } else {
                dropdown.style.right = '0';
                dropdown.style.left = 'auto';
            }
        }
        dropdown.style.display = 'flex';
    } else {
        dropdown.style.display = 'none';
    }
}

function applyFilters() {
    const companyVal = document.getElementById('filter-company').value;
    const maxPriceVal = document.getElementById('filter-price').value;
    const minYearVal = document.getElementById('filter-min-year').value;
    const maxYearVal = document.getElementById('filter-max-year').value;
    const ownerVal = document.getElementById('filter-owner').value;
    const fuelVal = document.getElementById('filter-fuel').value;
    const transVal = document.getElementById('filter-transmission').value;
    const carTypeEl = document.getElementById('filter-car-type');
    const carTypeVal = carTypeEl ? carTypeEl.value : 'all';
    
    const cards = document.querySelectorAll('#cars-vertical-list .listing-row-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const company = card.getAttribute('data-company');
        const price = parseFloat(card.getAttribute('data-price'));
        const owner = parseInt(card.getAttribute('data-owner'));
        const year = parseInt(card.getAttribute('data-year'));
        const fuel = card.getAttribute('data-fuel');
        const trans = card.getAttribute('data-transmission');
        const carType = card.getAttribute('data-cartype') || '';
        
        const companyMatch = (companyVal === 'all' || company === companyVal);
        const priceMatch = (maxPriceVal === 'all' || price <= parseFloat(maxPriceVal));
        const minYearMatch = (minYearVal === 'all' || year >= parseInt(minYearVal));
        const maxYearMatch = (maxYearVal === 'all' || year <= parseInt(maxYearVal));
        const ownerMatch = (ownerVal === 'all' || owner === parseInt(ownerVal));
        const fuelMatch = (fuelVal === 'all' || fuel.split('/').map(f => f.trim()).includes(fuelVal));
        const transMatch = (transVal === 'all' || trans === transVal);
        const carTypeMatch = (carTypeVal === 'all' || carType === carTypeVal);
        
        if (companyMatch && priceMatch && minYearMatch && maxYearMatch && ownerMatch && fuelMatch && transMatch && carTypeMatch) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // If no cars match, show an empty state, otherwise make sure any custom empty state is hidden/removed
    let emptyMsg = document.getElementById('filter-empty-state');
    if (visibleCount === 0) {
        if (!emptyMsg) {
            emptyMsg = document.createElement('div');
            emptyMsg.id = 'filter-empty-state';
            emptyMsg.className = 'empty-state';
            emptyMsg.style.marginTop = '2rem';
            emptyMsg.innerHTML = `
                <i class="ph ph-magnifying-glass" style="font-size: 3.5rem; color: #94a3b8; margin-bottom: 1rem;"></i>
                <h3>No Matching Cars Found</h3>
                <p class="text-muted">Try adjusting your filters to find more vehicles.</p>
            `;
            document.getElementById('cars-vertical-list').appendChild(emptyMsg);
        }
    } else {
        if (emptyMsg) {
            emptyMsg.remove();
        }
    }
}

function resetFilters() {
    if (activeCategory === 'bikes') {
        ['bfilter-brand','bfilter-price','bfilter-cc','bfilter-min-year','bfilter-max-year','bfilter-owner','bfilter-biketype']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = 'all'; });
        filterByBikeType('all');
        applyBikeFilters();
    } else {
        document.getElementById('filter-company').value = 'all';
        document.getElementById('filter-price').value = 'all';
        document.getElementById('filter-min-year').value = 'all';
        document.getElementById('filter-max-year').value = 'all';
        document.getElementById('filter-owner').value = 'all';
        document.getElementById('filter-fuel').value = 'all';
        document.getElementById('filter-transmission').value = 'all';
        const carTypeEl = document.getElementById('filter-car-type');
        if (carTypeEl) carTypeEl.value = 'all';
        filterByCarType('all');
        applyFilters();
    }

    // Close dropdown
    const dropdown = document.getElementById('filter-dropdown');
    if (dropdown) dropdown.style.display = 'none';
}

/**
 * Filter listings by Car Type (from quick-pill buttons)
 */
function filterByCarType(type) {
    document.querySelectorAll('#car-type-pills .car-type-pill').forEach(p => p.classList.remove('active'));
    const activePill = document.getElementById('type-pill-' + type.toLowerCase());
    if (activePill) activePill.classList.add('active');

    // Also sync the dropdown filter
    const carTypeEl = document.getElementById('filter-car-type');
    if (carTypeEl) carTypeEl.value = type;

    applyFilters();
}

/**
 * Filter bike listings by Bike Type (from quick-pill buttons)
 */
function filterByBikeType(type) {
    document.querySelectorAll('#bike-type-pills .car-type-pill').forEach(p => p.classList.remove('active'));
    const activePill = document.getElementById('bike-pill-' + type.toLowerCase());
    if (activePill) activePill.classList.add('active');

    // Sync the dropdown filter
    const biketypeEl = document.getElementById('bfilter-biketype');
    if (biketypeEl) biketypeEl.value = type;

    applyBikeFilters();
}

/**
 * Apply the bike-specific filters to the bikes feed.
 */
function applyBikeFilters() {
    const brandVal = document.getElementById('bfilter-brand').value;
    const maxPriceVal = document.getElementById('bfilter-price').value;
    const ccVal = document.getElementById('bfilter-cc').value;
    const minYearVal = document.getElementById('bfilter-min-year').value;
    const maxYearVal = document.getElementById('bfilter-max-year').value;
    const ownerVal = document.getElementById('bfilter-owner').value;
    const biketypeVal = document.getElementById('bfilter-biketype').value;

    // CC band upper bounds map to a lower bound too
    const ccBands = { '125': [0, 125], '200': [126, 200], '350': [201, 350], '999': [351, 99999] };

    const cards = document.querySelectorAll('#bikes-vertical-list .listing-row-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const brand = card.getAttribute('data-brand');
        const price = parseFloat(card.getAttribute('data-price'));
        const cc = parseInt(card.getAttribute('data-cc'));
        const year = parseInt(card.getAttribute('data-year'));
        const owner = parseInt(card.getAttribute('data-owner'));
        const biketype = card.getAttribute('data-biketype') || '';

        const brandMatch = (brandVal === 'all' || brand === brandVal);
        const priceMatch = (maxPriceVal === 'all' || price <= parseFloat(maxPriceVal));
        let ccMatch = true;
        if (ccVal !== 'all') {
            const band = ccBands[ccVal];
            ccMatch = band ? (cc >= band[0] && cc <= band[1]) : true;
        }
        const minYearMatch = (minYearVal === 'all' || year >= parseInt(minYearVal));
        const maxYearMatch = (maxYearVal === 'all' || year <= parseInt(maxYearVal));
        const ownerMatch = (ownerVal === 'all' || owner === parseInt(ownerVal));
        const biketypeMatch = (biketypeVal === 'all' || biketype === biketypeVal);

        if (brandMatch && priceMatch && ccMatch && minYearMatch && maxYearMatch && ownerMatch && biketypeMatch) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Empty-state handling for bikes
    let emptyMsg = document.getElementById('bike-filter-empty-state');
    if (visibleCount === 0) {
        if (!emptyMsg) {
            emptyMsg = document.createElement('div');
            emptyMsg.id = 'bike-filter-empty-state';
            emptyMsg.className = 'empty-state';
            emptyMsg.style.marginTop = '2rem';
            emptyMsg.innerHTML = `
                <i class="ph ph-magnifying-glass" style="font-size: 3.5rem; color: #94a3b8; margin-bottom: 1rem;"></i>
                <h3>No Matching Bikes Found</h3>
                <p class="text-muted">Try adjusting your filters to find more two-wheelers.</p>
            `;
            document.getElementById('bikes-vertical-list').appendChild(emptyMsg);
        }
    } else if (emptyMsg) {
        emptyMsg.remove();
    }
}

/* ==========================================================================
   LOCATION PICKER LOGIC
   ========================================================================== */

let detectedCity = null;
let detectedCoords = null;
let locationDropdownOpen = false;

/**
 * Called on page load — starts auto GPS detection immediately.
 */
function initLocationDetection() {
    const displayText = document.getElementById('location-display-text');
    const icon = document.getElementById('location-icon');

    if (!navigator.geolocation) {
        if (displayText) displayText.textContent = 'All India';
        if (icon) icon.className = 'ph ph-globe-hemisphere-west';
        return;
    }

    // Show pulsing detecting state
    if (displayText) {
        displayText.textContent = 'Detecting...';
        displayText.style.animation = 'none';
    }
    if (icon) icon.className = 'ph ph-crosshair';

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            detectedCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            // Reverse geocode using Nominatim (free, no key required)
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${detectedCoords.lat}&lon=${detectedCoords.lon}&format=json&accept-language=en`)
                .then(r => r.json())
                .then(data => {
                    const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Your Area';
                    detectedCity = city;
                    if (displayText) displayText.textContent = city;
                    if (icon) icon.className = 'ph ph-map-pin';

                    // Update detect panel inside dropdown
                    const label = document.getElementById('detected-city-label');
                    const sub = document.getElementById('detected-city-sub');
                    const btn = document.getElementById('location-use-btn');
                    if (label) label.textContent = city;
                    if (sub) sub.textContent = `Near ${data.address.state || 'your state'}`;
                    if (btn) { btn.disabled = false; }
                })
                .catch(() => {
                    // Reverse geocode failed — just use coords label
                    detectedCity = 'Near You';
                    if (displayText) displayText.textContent = 'Near You';
                    if (icon) icon.className = 'ph ph-map-pin';
                    const btn = document.getElementById('location-use-btn');
                    if (btn) btn.disabled = false;
                });
        },
        (err) => {
            // Permission denied or error
            detectedCity = null;
            if (displayText) displayText.textContent = 'All India';
            if (icon) icon.className = 'ph ph-globe-hemisphere-west';

            const label = document.getElementById('detected-city-label');
            const sub = document.getElementById('detected-city-sub');
            if (label) label.textContent = 'Location access denied';
            if (sub) sub.textContent = 'Please choose a city below';
        },
        { timeout: 8000 }
    );
}

function toggleLocationDropdown() {
    const panel = document.getElementById('location-dropdown-panel');
    if (!panel) return;
    if (locationDropdownOpen) {
        closeLocationDropdown();
    } else {
        panel.style.display = 'block';
        locationDropdownOpen = true;
        // Close filter dropdown if open
        const filterDD = document.getElementById('filter-dropdown');
        if (filterDD) filterDD.style.display = 'none';
    }
}

function closeLocationDropdown() {
    const panel = document.getElementById('location-dropdown-panel');
    if (panel) panel.style.display = 'none';
    locationDropdownOpen = false;
}

function selectCity(city) {
    const displayText = document.getElementById('location-display-text');
    const icon = document.getElementById('location-icon');
    if (displayText) displayText.textContent = city === 'All India' ? 'All India' : city;
    if (icon) icon.className = city === 'All India' ? 'ph ph-globe-hemisphere-west' : 'ph ph-map-pin';

    // Highlight active chip
    document.querySelectorAll('.location-city-chip').forEach(c => c.classList.remove('active'));
    const allChips = document.querySelectorAll('.location-city-chip');
    allChips.forEach(c => { if (c.textContent.trim() === city) c.classList.add('active'); });

    closeLocationDropdown();
    showToast(`📍 Showing listings near ${city}`, 'success');
}

function useDetectedLocation() {
    if (detectedCity) {
        selectCity(detectedCity);
    }
}

function confirmCustomLocation() {
    const input = document.getElementById('custom-location-input');
    if (!input) return;
    const val = input.value.trim();
    if (val.length < 2) {
        showToast('Please enter a valid city name.', 'warning');
        return;
    }
    selectCity(val);
    input.value = '';
}

// Close location dropdown on outside click
document.addEventListener('click', (e) => {
    const container = document.getElementById('location-picker-container');
    if (locationDropdownOpen && container && !container.contains(e.target)) {
        closeLocationDropdown();
    }
});

/* ==========================================================================
   MY CAR VIEW & EDIT MODALS LOGIC
   ========================================================================== */

function openMyCarViewModal() {
    const modal = document.getElementById('my-car-view-modal');
    if (modal) modal.classList.add('active');
}

function closeMyCarViewModal() {
    const modal = document.getElementById('my-car-view-modal');
    if (modal) modal.classList.remove('active');
}

function changeMyCarMainImg(el) {
    const mainImg = document.getElementById('my-car-gallery-main');
    if (!mainImg || !el) return;
    
    // Support passing element or src string
    const src = typeof el === 'string' ? el : el.src;
    mainImg.src = src;

    if (typeof el !== 'string') {
        document.querySelectorAll('.my-car-thumb').forEach(t => {
            t.style.borderColor = 'transparent';
            t.style.opacity = '0.85';
            t.classList.remove('active');
        });
        el.style.borderColor = '#1a1a1a';
        el.style.opacity = '1';
        el.classList.add('active');
    }
}

function markMyCarAsSold() {
    const badge = document.getElementById('my-car-status-badge');
    const btn = document.getElementById('mark-sold-btn');
    
    if (badge) {
        badge.className = 'status-pill sold';
        badge.style.background = '#64748b';
        badge.style.color = '#fff';
        badge.innerHTML = '<i class="ph ph-check-circle"></i> SOLD';
    }
    
    if (btn) {
        btn.className = 'btn-v-action secondary';
        btn.innerHTML = '<i class="ph ph-arrow-counter-clockwise"></i> Mark Available';
        btn.setAttribute('onclick', 'unmarkMyCarAsSold()');
    }

    showToast("🎉 Vehicle marked as SOLD!", "success");
}

function unmarkMyCarAsSold() {
    const badge = document.getElementById('my-car-status-badge');
    const btn = document.getElementById('mark-sold-btn');
    
    if (badge) {
        badge.className = 'status-pill live';
        badge.style.background = '';
        badge.style.color = '';
        badge.innerHTML = '<i class="ph ph-shield-check"></i> RC Verified';
    }
    
    if (btn) {
        btn.className = 'btn-v-action success';
        btn.innerHTML = '<i class="ph ph-check-circle"></i> Mark as Sold';
        btn.setAttribute('onclick', 'markMyCarAsSold()');
    }

    showToast("Vehicle relisted as Active!", "info");
}

function openMyCarEditModal() {
    const modal = document.getElementById('my-car-edit-modal');
    if (modal) modal.classList.add('active');
}

function closeMyCarEditModal() {
    const modal = document.getElementById('my-car-edit-modal');
    if (modal) modal.classList.remove('active');
}

function saveMyCarEdit() {
    const priceVal = document.getElementById('edit-car-price').value;
    const kmVal = document.getElementById('edit-car-km').value;
    const locVal = document.getElementById('edit-car-loc').value;
    const descVal = document.getElementById('edit-car-desc').value;

    // Update View Modal & Listing card price
    const formattedPrice = "₹ " + parseInt(priceVal || 1120000).toLocaleString('en-IN');
    const viewPrice = document.getElementById('view-modal-price');
    const viewKm = document.getElementById('view-modal-km');
    const viewLoc = document.getElementById('view-modal-loc');
    const viewDesc = document.getElementById('view-modal-desc');

    if (viewPrice) viewPrice.textContent = formattedPrice;
    if (viewKm) viewKm.textContent = parseInt(kmVal || 28500).toLocaleString('en-IN') + " km";
    if (viewLoc) viewLoc.textContent = locVal;
    if (viewDesc) viewDesc.textContent = descVal;

    // Also update main card price text
    const cardPrice = document.querySelector('#my-honda-city-card .price-main');
    if (cardPrice) cardPrice.textContent = formattedPrice;

    closeMyCarEditModal();
    showToast("Listing details updated successfully! (RC photos remain verified & locked)", "success");
}


