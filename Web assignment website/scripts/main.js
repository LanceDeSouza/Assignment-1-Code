// Navbar
document.getElementById("navbar-placeholder").innerHTML = 
        `
        <nav class="navbar">

        <img src="../images/logo.png" class="logo">

        <p class="ngo-name">SPCA Johannesburg</p>


        <div class="nav-links">
            <a href="home.html">Home</a>
            <a href="donation.html">Donations</a>
            <a href="volunteering.html">Volunteering</a>
            <a href="adoption.html">Adoption</a>
            <a href="report.html">Report</a>
            <a href="contact.html">Contact Us</a>
        </div>

        </nav>
        `;

// Footer
document.getElementById("footer-placeholder").innerHTML = 
        `
        <footer>
            <p>© 2025 SPCA Johannesburg. All rights reserved.</p>
        </footer>
        `;


// Adoption filters
function setupAdoptionFilters() {
    // Filter elements
    const btnToggle = document.getElementById('filter-toggle');
    const dropdown = document.getElementById('filter-dropdown');
    const btnApply = document.getElementById('filter-apply');
    const btnClear = document.getElementById('filter-clear');
    const ageMinInput = document.getElementById('age-min');
    const ageMaxInput = document.getElementById('age-max');
    // Collections of profile nodes
    const dogEls = document.querySelectorAll('.dog-profiles');
    const catEls = document.querySelectorAll('.cat-profiles');
    const allProfiles = Array.from(document.querySelectorAll('.dog-profiles, .cat-profiles'));

    // Toggle dropdown
    if (btnToggle && dropdown) {
        btnToggle.addEventListener('click', () => {
            const expanded = btnToggle.getAttribute('aria-expanded') === 'true';
            btnToggle.setAttribute('aria-expanded', String(!expanded));
            dropdown.style.display = expanded ? 'none' : 'block';
        });
    }

    // Parse age text (years/months)
    function parseAgeYears(profileEl) {
        const ageEl = profileEl.querySelector('.age');
        if (!ageEl) return null;
        const txt = ageEl.textContent || '';
        const yearsMatch = txt.match(/(\d+)\s*years?/i);
        if (yearsMatch) return parseInt(yearsMatch[1], 10);
        const monthsMatch = txt.match(/(\d+)\s*months?/i);
        if (monthsMatch) return Math.floor(parseInt(monthsMatch[1], 10) / 12 * 100) / 100; 
        return null;
    }

    // Apply filters
    function applyFilters(type, minAge, maxAge) {
        allProfiles.forEach(profile => {
            const isDog = profile.classList.contains('dog-profiles');
            const isCat = profile.classList.contains('cat-profiles');

            // filter by species
            if (type === 'dog' && !isDog) { profile.style.display = 'none'; return; }
            if (type === 'cat' && !isCat) { profile.style.display = 'none'; return; }

            // filter by age range (if provided)
            if ((minAge != null) || (maxAge != null)) {
                const age = parseAgeYears(profile);
                if (age == null) { profile.style.display = 'none'; return; }
                if (minAge != null && age < minAge) { profile.style.display = 'none'; return; }
                if (maxAge != null && age > maxAge) { profile.style.display = 'none'; return; }
            }

            // otherwise show the profile
            profile.style.display = 'inline-block';
        });
    }

    // Apply button
    if (btnApply) {
        btnApply.addEventListener('click', () => {
            const form = document.getElementById('filter-form');
            if (!form) return;
            const formType = form.querySelector('input[name="type"]:checked').value;
            const min = ageMinInput && ageMinInput.value !== '' ? Number(ageMinInput.value) : null;
            const max = ageMaxInput && ageMaxInput.value !== '' ? Number(ageMaxInput.value) : null;
            applyFilters(formType, min, max);
            if (dropdown) { dropdown.style.display = 'none'; btnToggle.setAttribute('aria-expanded', 'false'); }
        });
    }

    // Clear button
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (ageMinInput) ageMinInput.value = '';
            if (ageMaxInput) ageMaxInput.value = '';
            const form = document.getElementById('filter-form');
            if (form) form.querySelector('input[name="type"][value="all"]').checked = true;
            applyFilters('all', null, null);
        });
    }
}

// Init adoption filters
if (document.querySelector('.dog-profiles-container')) {
    setupAdoptionFilters();
}

// Profile hover (mouse + touch)
function setupProfileHover() {
    const profiles = Array.from(document.querySelectorAll('.dog-profiles, .cat-profiles'));
    if (!profiles.length) return;

    profiles.forEach(p => {
        p.addEventListener('mouseenter', () => p.classList.add('profile-hover'));
        p.addEventListener('mouseleave', () => p.classList.remove('profile-hover'));

        p.addEventListener('touchstart', (ev) => {
            if (!p.classList.contains('profile-hover')) {
                p.classList.add('profile-hover');
                ev.preventDefault();
            }
        }, {passive: false});
    });
}

// Init profile hover
if (document.querySelector('.dog-profiles-container')) {
    setupProfileHover();
}

// Donation widget
function setupDonationWidget() {
    const form = document.getElementById('donation-form');
    if (!form) return;

    // DOM refs
    const presets = Array.from(document.querySelectorAll('.donation-presets button'));
    const amountInput = document.getElementById('donation-amount');
    const freq = document.getElementById('donation-frequency');
    const nameInput = document.getElementById('donor-name');
    const emailInput = document.getElementById('donor-email');
    const progressBar = document.getElementById('donation-progress-bar');
    const totalEl = document.getElementById('donation-total');
    const goalEl = document.getElementById('donation-goal');
    const modal = document.getElementById('donation-modal');
    const modalText = document.getElementById('donation-modal-text');
    const modalClose = document.getElementById('donation-modal-close');
    const modalDownload = document.getElementById('donation-modal-download');

    // Storage + goal
    const STORAGE_KEY = 'spca_demo_total';
    const goal = Number(goalEl ? goalEl.textContent : 50000);

    // Safe localStorage helpers
    function readTotal() { try { return Number(localStorage.getItem(STORAGE_KEY) || 0); } catch(e) { return 0; } }
    function writeTotal(n) { try { localStorage.setItem(STORAGE_KEY, String(n)); } catch(e){} }
    // Update progress UI
    function updateProgressUI() {
        const total = readTotal();
        const pct = Math.max(0, Math.min(100, Math.round((total / goal) * 100)));
        if (progressBar) progressBar.style.width = pct + '%';
        if (totalEl) totalEl.textContent = total;
    }

    // Init progress UI
    updateProgressUI();
    // Preset buttons
    presets.forEach(btn => btn.addEventListener('click', () => {
        presets.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const v = btn.getAttribute('data-amount');
        if (v === 'other') { amountInput.value = ''; amountInput.focus(); }
        else amountInput.value = 'R' + v;
    }));

    // Format amount input
    amountInput.addEventListener('input', () => {
        const digits = (amountInput.value || '').replace(/[^0-9]/g, '');
        if (digits === '') { amountInput.value = ''; return; }
        const num = Number(digits);
        amountInput.value = 'R' + num;
    });

    // Parse numeric amount
    function parseAmount() {
        if (!amountInput) return 0;
        const digits = (amountInput.value || '').replace(/[^0-9]/g, '');
        return digits === '' ? 0 : Number(digits);
    }

    // Validation
    function isValidDonation() {
        const amt = parseAmount();
        if (amt <= 0) return { ok:false, msg:'Enter a valid donation amount' };
        if (!nameInput.value.trim()) return { ok:false, msg:'Please enter your name' };
        if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) return { ok:false, msg:'Enter a valid email' };
        return { ok:true, amt };
    }

    // Submit handler
    form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const v = isValidDonation();
        if (!v.ok) {
            alert(v.msg); // simple inline error handling can be added later
            return;
        }

        const prev = readTotal();
        const added = v.amt;
        const newTotal = prev + added;
        writeTotal(newTotal);
        updateProgressUI();

        if (modal && modalText) {
            modalText.textContent = `We received R${added} (${freq.value}) from ${nameInput.value}. Total raised R${newTotal}.`;
            modal.setAttribute('aria-hidden', 'false');
        }
    });

    // Modal close
    if (modalClose) modalClose.addEventListener('click', () => modal.setAttribute('aria-hidden', 'true'));
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.setAttribute('aria-hidden', 'true'); });

    // Download receipt
    if (modalDownload) modalDownload.addEventListener('click', () => {
        const total = readTotal();
        const receipt = {
            date: new Date().toISOString(),
            name: nameInput.value,
            email: emailInput.value,
            amount: parseAmount(),
            frequency: freq.value,
            totalRaised: total
        };
        const blob = new Blob([JSON.stringify(receipt, null, 2)], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'receipt.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });
}

// Init donation widget
if (document.querySelector('.donation-page-container')) {
    setupDonationWidget();
}

// Shared validation (volunteering/report)
const form = document.getElementById('form')
const firstname = document.getElementById('firstname')
const lastname = document.getElementById('lastname')
const email = document.getElementById('email')
const pnum = document.getElementById('pnum')

// Prevent submit if invalid
if (form) {
    form.addEventListener('submit', e => {
        const valid = validateInputs();
        if (!valid) {
            e.preventDefault();
        }
    });
}

// Show field error
const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
}

// Clear field error
const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

// Email validator
const isValidEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


// Name validator
const isValidName = name => {
    const re = /^[A-Z][A-Za-z\-\s]*$/;
    return re.test(name);
}

// Strip non-digits
const digitsOnly = s => s.replace(/\D/g, '');

// Phone input enforcement
if (pnum) {
    pnum.addEventListener('input', (e) => {
        const only = digitsOnly(pnum.value).slice(0, 10);
        if (pnum.value !== only) {
            pnum.value = only;
        }
    });
}

// Validate inputs
const validateInputs = () => {
    let isValid = true;
    const firstnameValue = firstname.value.trim();
    const lastnameValue = lastname.value.trim();
    const emailValue = email.value.trim();
    const pnumValue = pnum.value.trim();

    if(firstnameValue === '') {
        setError(firstname, 'First name is required');
        isValid = false;
    } else if (!isValidName(firstnameValue)) {
        setError(firstname, 'First name must start with a capital letter and contain only letters, hyphens or spaces');
        isValid = false;
    } else {
        setSuccess(firstname);
    }

    if(lastnameValue === '') {
        setError(lastname, 'Last name is required');
        isValid = false;
    } else if (!isValidName(lastnameValue)) {
        setError(lastname, 'Last name must start with a capital letter and contain only letters, hyphens or spaces');
        isValid = false;
    } else {
        setSuccess(lastname);
    }

    if(emailValue === '') {
        setError(email, 'Email is required');
        isValid = false;
    } else if (!isValidEmail(emailValue)) {
        setError(email, 'Provide a valid email address');
        isValid = false;
    } else {
        setSuccess(email);
    }

    const pDigits = digitsOnly(pnumValue);
    if(pnumValue === '') {
        setError(pnum, 'Phone number is required');
        isValid = false;
    } else if (pDigits.length !== 10) {
        setError(pnum, 'Phone number must be exactly 10 digits');
        isValid = false;
    } else {
        setSuccess(pnum);
    }

    return isValid;
};