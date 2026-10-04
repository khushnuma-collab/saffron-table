// =====================================================
// Saffron Table – Main JavaScript
// =====================================================

document.addEventListener('DOMContentLoaded', function () {

    // =================================================
    // 1. MOBILE NAVIGATION TOGGLE
    // =================================================

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {

        // Set initial accessibility state: menu is closed.
        menuToggle.setAttribute('aria-expanded', 'false');

        // Toggle menu on hamburger click
        menuToggle.addEventListener('click', function () {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');

            const isMenuOpen = navLinks.classList.contains('active');

            menuToggle.setAttribute('aria-expanded', isMenuOpen);
        });

        // Close menu when any navigation link is clicked
        const allNavLinks = navLinks.querySelectorAll('a');

        allNavLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }


    // =================================================
    // 2. MENU CATEGORY FILTERING (SECTION-LEVEL)
    // =================================================

    const categoryButtons = document.querySelectorAll('.category-buttons .btn');
    const menuContainer = document.getElementById('menu-items');

    if (categoryButtons.length > 0 && menuContainer) {

        const children = Array.from(menuContainer.children);
        const menuSections = [];
        let currentSection = null;

        children.forEach(function (child) {

            if (child.classList.contains('section-heading')) {

                currentSection = {
                    heading: child,
                    grid: null,
                    category: null
                };

                menuSections.push(currentSection);

            } else if (
                child.classList.contains('dish-grid') &&
                currentSection
            ) {

                currentSection.grid = child;

                const firstCard = child.querySelector('.dish-card');

                if (firstCard) {
                    currentSection.category =
                        firstCard.getAttribute('data-category');
                }

                currentSection = null;
            }
        });


        categoryButtons.forEach(function (button) {

            button.addEventListener('click', function () {

                const selectedCategory =
                    button.getAttribute('data-category');


                // Remove active class from all buttons
                categoryButtons.forEach(function (btn) {
                    btn.classList.remove('active');
                });


                // Add active class to clicked button
                button.classList.add('active');


                // Show/hide menu sections
                menuSections.forEach(function (section) {

                    const shouldShow =
                        selectedCategory === 'all' ||
                        section.category === selectedCategory;


                    if (shouldShow) {

                        if (section.heading) {
                            section.heading.style.display = '';
                        }

                        if (section.grid) {
                            section.grid.style.display = '';
                        }

                    } else {

                        if (section.heading) {
                            section.heading.style.display = 'none';
                        }

                        if (section.grid) {
                            section.grid.style.display = 'none';
                        }
                    }
                });
            });
        });
    }


    // =================================================
    // 3. GALLERY LIGHTBOX
    // =================================================

    const galleryItems = document.querySelectorAll('.gallery-item');

    if (galleryItems.length > 0) {

        // Build the lightbox HTML dynamically
        const lightbox = document.createElement('div');

        lightbox.className = 'lightbox';

        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute(
            'aria-label',
            'Enlarged gallery image'
        );


        // Lightbox image
        const lightboxImage = document.createElement('img');

        lightboxImage.className = 'lightbox-image';
        lightboxImage.alt = '';


        // Close button
        const closeButton = document.createElement('button');

        closeButton.className = 'lightbox-close';
        closeButton.type = 'button';

        closeButton.setAttribute(
            'aria-label',
            'Close gallery image'
        );

        closeButton.innerHTML = '&times;';


        // Add elements to lightbox
        lightbox.appendChild(lightboxImage);
        lightbox.appendChild(closeButton);

        document.body.appendChild(lightbox);


        // Open lightbox
        function openLightbox(src, alt) {

            lightboxImage.src = src;
            lightboxImage.alt = alt || '';

            lightbox.classList.add('active');

            document.body.style.overflow = 'hidden';
        }


        // Close lightbox
        function closeLightbox() {

            lightbox.classList.remove('active');

            lightboxImage.src = '';

            document.body.style.overflow = '';
        }


        // Open lightbox when gallery item is clicked
        galleryItems.forEach(function (item) {

            item.addEventListener('click', function () {

                const img = item.querySelector('img');

                if (!img) return;

                openLightbox(img.src, img.alt);
            });
        });


        // Close using X button
        closeButton.addEventListener('click', function (event) {

            event.stopPropagation();

            closeLightbox();
        });


        // Close by clicking dark overlay
        lightbox.addEventListener('click', function (event) {

            if (event.target === lightbox) {
                closeLightbox();
            }
        });


        // Close using Escape key
        document.addEventListener('keydown', function (event) {

            if (
                event.key === 'Escape' &&
                lightbox.classList.contains('active')
            ) {
                closeLightbox();
            }
        });
    }


    // =================================================
    // 4. RESERVATION FORM VALIDATION
    // =================================================

    // Reservation form fields
    const nameField = document.getElementById('name');
    const phoneField = document.getElementById('phone');
    const emailField = document.getElementById('email');
    const dateField = document.getElementById('date');
    const timeField = document.getElementById('time');
    const guestsField = document.getElementById('guests');

    // Your textarea uses "requests"
    const requestsField = document.getElementById('requests');

    const policyField = document.getElementById('policy');


    // Find reservation form
    const reservationForm =
        nameField ? nameField.closest('form') : null;


    if (reservationForm) {


        // ---------------------------------------------
        // Show error
        // ---------------------------------------------

        function showError(field, message) {

            field.classList.add('error');

            const wrapper = field.closest('div');

            let errorEl =
                wrapper.querySelector('.error-message');


            if (!errorEl) {

                errorEl = document.createElement('span');

                errorEl.className = 'error-message';

                wrapper.appendChild(errorEl);
            }


            errorEl.textContent = message;
        }


        // ---------------------------------------------
        // Clear error
        // ---------------------------------------------

        function clearError(field) {

            field.classList.remove('error');

            const wrapper = field.closest('div');

            const errorEl =
                wrapper.querySelector('.error-message');


            if (errorEl) {
                errorEl.remove();
            }
        }


        // ---------------------------------------------
        // 1. Validate Name
        // ---------------------------------------------

        function validateName() {

            const value = nameField.value.trim();

            if (value.length < 2) {

                showError(
                    nameField,
                    'Please enter your full name (at least 2 characters).'
                );

                return false;
            }

            clearError(nameField);

            return true;
        }


        // ---------------------------------------------
        // 2. Validate Phone
        // ---------------------------------------------

        function validatePhone() {

            let value =
                phoneField.value
                    .trim()
                    .replace(/[\s-]/g, '');


            // Remove +91
            if (value.startsWith('+91')) {

                value = value.slice(3);

            } else if (
                value.startsWith('91') &&
                value.length === 12
            ) {

                value = value.slice(2);
            }


            // Indian mobile number
            const phonePattern = /^[6-9]\d{9}$/;


            if (!phonePattern.test(value)) {

                showError(
                    phoneField,
                    'Please enter a valid 10-digit Indian mobile number.'
                );

                return false;
            }


            clearError(phoneField);

            return true;
        }


        // ---------------------------------------------
        // 3. Validate Email
        // ---------------------------------------------

        function validateEmail() {

            const value = emailField.value.trim();

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(value)) {

                showError(
                    emailField,
                    'Please enter a valid email address.'
                );

                return false;
            }


            clearError(emailField);

            return true;
        }


        // ---------------------------------------------
        // 4. Validate Date
        // ---------------------------------------------

        function validateDate() {

            if (!dateField.value) {

                showError(
                    dateField,
                    'Please choose a date.'
                );

                return false;
            }


            // Today's date
            const today = new Date();

            today.setHours(0, 0, 0, 0);


            // Selected date
            const chosenDate =
                new Date(dateField.value);


            if (chosenDate < today) {

                showError(
                    dateField,
                    'Please choose today or a future date.'
                );

                return false;
            }


            clearError(dateField);

            return true;
        }


        // ---------------------------------------------
        // 5. Validate Time
        // ---------------------------------------------

        function validateTime() {

            if (!timeField.value) {

                showError(
                    timeField,
                    'Please choose a preferred time.'
                );

                return false;
            }


            clearError(timeField);

            return true;
        }


        // ---------------------------------------------
        // 6. Validate Guests
        // ---------------------------------------------

        function validateGuests() {

            const value =
                guestsField.value.trim();


            if (value === '') {

                showError(
                    guestsField,
                    'Please enter the number of guests.'
                );

                return false;
            }


            const num = Number(value);


            if (
                !Number.isInteger(num) ||
                num < 1 ||
                num > 20
            ) {

                showError(
                    guestsField,
                    'Number of guests must be between 1 and 20.'
                );

                return false;
            }


            clearError(guestsField);

            return true;
        }


        // ---------------------------------------------
        // 7. Validate Reservation Policy
        // ---------------------------------------------

        function validatePolicy() {

            if (!policyField.checked) {

                showError(
                    policyField,
                    'Please agree to the reservation policy.'
                );

                return false;
            }


            clearError(policyField);

            return true;
        }


        // Special Requests is optional.
        // No validation required.


        // ---------------------------------------------
        // Set minimum date
        // ---------------------------------------------

        const todayISO =
            new Date()
                .toISOString()
                .split('T')[0];


        dateField.setAttribute(
            'min',
            todayISO
        );


        // ---------------------------------------------
        // Live validation
        // ---------------------------------------------

        const validators = {

            'name': validateName,
            'phone': validatePhone,
            'email': validateEmail,
            'date': validateDate,
            'time': validateTime,
            'guests': validateGuests,
            'policy': validatePolicy
        };


        Object.keys(validators).forEach(function (id) {

            const field =
                document.getElementById(id);


            if (!field) return;


            const validate =
                validators[id];


            // Revalidate when user types
            function revalidateIfError() {

                if (field.classList.contains('error')) {
                    validate();
                }
            }


            field.addEventListener(
                'input',
                revalidateIfError
            );


            field.addEventListener(
                'change',
                revalidateIfError
            );


            // Validate when leaving field
            field.addEventListener(
                'blur',
                validate
            );
        });


        // ---------------------------------------------
        // Form Submit
        // ---------------------------------------------

        reservationForm.addEventListener(
            'submit',
            function (event) {

                // Validate all fields
                const isNameValid =
                    validateName();

                const isPhoneValid =
                    validatePhone();

                const isEmailValid =
                    validateEmail();

                const isDateValid =
                    validateDate();

                const isTimeValid =
                    validateTime();

                const isGuestsValid =
                    validateGuests();

                const isPolicyValid =
                    validatePolicy();


                const allValid =
                    isNameValid &&
                    isPhoneValid &&
                    isEmailValid &&
                    isDateValid &&
                    isTimeValid &&
                    isGuestsValid &&
                    isPolicyValid;


                // ---------------------------------
                // If invalid
                // ---------------------------------

                if (!allValid) {

                    // Stop submission
                    event.preventDefault();


                    // Focus first invalid field
                    const firstError =
                        reservationForm.querySelector('.error');


                    if (firstError) {
                        firstError.focus();
                    }


                    return;
                }


                // ---------------------------------
                // If valid
                // ---------------------------------

                /*
                    IMPORTANT:

                    We DO NOT use:

                    event.preventDefault();

                    here.

                    This allows the form to submit
                    normally to Flask.

                    Flask will:

                    1. Receive the form
                    2. Save the reservation
                       into SQLite
                    3. Redirect to /confirmation
                */

            }
        );
    }

});