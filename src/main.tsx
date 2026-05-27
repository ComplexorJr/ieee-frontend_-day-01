import './index.css';

interface WaitlistEntry {
  name: string;
  email: string;
  teamSize: string;
  role: string;
  queueNum: number;
}

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------
  // DOM Elements Selection
  // ---------------------------------------------------------
  const header = document.getElementById('main-header');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const menuIconOpen = document.getElementById('menu-icon-open');
  const menuIconClose = document.getElementById('menu-icon-close');
  
  const heroQuickForm = document.getElementById('hero-quick-form') as HTMLFormElement | null;
  const heroEmailInput = document.getElementById('hero-email-input') as HTMLInputElement | null;
  
  const waitlistForm = document.getElementById('waitlist-form') as HTMLFormElement | null;
  const wlName = document.getElementById('wl-name') as HTMLInputElement | null;
  const wlEmail = document.getElementById('wl-email') as HTMLInputElement | null;
  const wlSize = document.getElementById('wl-size') as HTMLSelectElement | null;
  const wlRole = document.getElementById('wl-role') as HTMLSelectElement | null;
  
  const submitBtn = document.getElementById('wl-submit-btn') as HTMLButtonElement | null;
  const submitText = document.getElementById('wl-submit-text') as HTMLSpanElement | null;
  const loadingSpinner = document.getElementById('wl-loading-spinner') as HTMLSpanElement | null;
  
  const successModal = document.getElementById('success-modal') as HTMLDivElement | null;
  const modalCloseBtn = document.getElementById('modal-close-btn') as HTMLButtonElement | null;
  const modalUserName = document.getElementById('modal-user-name') as HTMLElement | null;
  const modalUserEmail = document.getElementById('modal-user-email') as HTMLElement | null;
  const modalQueuePos = document.getElementById('modal-queue-pos') as HTMLElement | null;
  const modalBackdrop = document.getElementById('modal-backdrop') as HTMLDivElement | null;

  const waitlistSuccessBanner = document.getElementById('waitlist-success-banner') as HTMLDivElement | null;
  const waitlistQueueBox = document.getElementById('waitlist-queue-box') as HTMLDivElement | null;
  const queuePositionDisplay = document.getElementById('queue-position-display') as HTMLElement | null;
  const queueUserDisplay = document.getElementById('queue-user-display') as HTMLElement | null;
  const queueDetailsDisplay = document.getElementById('queue-details-display') as HTMLElement | null;
  const wlClearBtn = document.getElementById('wl-clear-btn') as HTMLButtonElement | null;
  
  const progressBarSlider = document.getElementById('progress-bar-slider') as HTMLDivElement | null;

  // ---------------------------------------------------------
  // LocalStorage Keys
  // ---------------------------------------------------------
  const STORAGE_KEY = 'taskr_waitlist_registration';
  const BASE_QUEUE_OFFSET = 242; // Starts from 242

  // ---------------------------------------------------------
  // Smooth Scroll & Header Shadow on scroll
  // ---------------------------------------------------------
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 10) {
        header.classList.add('shadow-md');
        header.classList.remove('border-emerald-100/50');
        header.classList.add('border-emerald-100');
      } else {
        header.classList.remove('shadow-md');
        header.classList.remove('border-emerald-100');
        header.classList.add('border-emerald-100/50');
      }
    }
  });

  // ---------------------------------------------------------
  // Responsive Navigation Drawer
  // ---------------------------------------------------------
  if (mobileToggle && mobileDrawer && menuIconOpen && menuIconClose) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = mobileDrawer.classList.contains('hidden');
      if (isHidden) {
        mobileDrawer.classList.remove('hidden');
        menuIconOpen.classList.add('hidden');
        menuIconClose.classList.remove('hidden');
      } else {
        mobileDrawer.classList.add('hidden');
        menuIconOpen.classList.remove('hidden');
        menuIconClose.classList.add('hidden');
      }
    });

    // Close mobile drawer when clicking links
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.add('hidden');
        menuIconOpen.classList.remove('hidden');
        menuIconClose.classList.add('hidden');
      });
    });

    // Close mobile drawer on clicking backdrop/body
    document.addEventListener('click', (e) => {
      if (!mobileDrawer.classList.contains('hidden') && !mobileToggle.contains(e.target as Node)) {
        mobileDrawer.classList.add('hidden');
        menuIconOpen.classList.remove('hidden');
        menuIconClose.classList.add('hidden');
      }
    });
  }

  // ---------------------------------------------------------
  // Form State Helper Functions
  // ---------------------------------------------------------
  const getRegistration = (): WaitlistEntry | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const saveRegistration = (entry: WaitlistEntry): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  };

  const clearRegistration = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    updateUIWithRegistration();
  };

  const updateUIWithRegistration = (): void => {
    const registration = getRegistration();
    
    if (registration) {
      // User is already signed up!
      if (waitlistForm) {
        waitlistForm.style.opacity = '0.5';
        waitlistForm.style.pointerEvents = 'none';
      }
      
      if (waitlistSuccessBanner) waitlistSuccessBanner.classList.remove('hidden');
      if (waitlistQueueBox) waitlistQueueBox.classList.remove('hidden');

      if (queuePositionDisplay) queuePositionDisplay.textContent = `#${registration.queueNum}`;
      if (queueUserDisplay) queueUserDisplay.textContent = registration.name;
      
      let friendlyRole = registration.role;
      if (registration.role === 'founder') friendlyRole = 'Founder / Executive';
      else if (registration.role === 'pm') friendlyRole = 'Product / Team Manager';
      else if (registration.role === 'engineer') friendlyRole = 'Developer / Designer';
      else if (registration.role === 'creator') friendlyRole = 'Creator / Freelancer';
      else if (registration.role === 'other') friendlyRole = 'Collaborating Member';

      if (queueDetailsDisplay) {
        queueDetailsDisplay.textContent = `${friendlyRole} • Team of ${registration.teamSize} • SMS Notification Pending`;
      }
    } else {
      // Normal signup state
      if (waitlistForm) {
        waitlistForm.style.opacity = '1';
        waitlistForm.style.pointerEvents = 'auto';
        waitlistForm.reset();
      }
      
      if (waitlistSuccessBanner) waitlistSuccessBanner.classList.add('hidden');
      if (waitlistQueueBox) waitlistQueueBox.classList.add('hidden');
    }
  };

  // ---------------------------------------------------------
  // Modal Actions
  // ---------------------------------------------------------
  const showModal = (entry: WaitlistEntry): void => {
    if (successModal && modalUserName && modalUserEmail && modalQueuePos) {
      modalUserName.textContent = entry.name.split(' ')[0]; // Show first name
      modalUserEmail.textContent = entry.email;
      modalQueuePos.textContent = `#${entry.queueNum}`;
      
      successModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; // Stop background scrolling
    }
  };

  const closeModal = (): void => {
    if (successModal) {
      successModal.classList.add('hidden');
      document.body.style.overflow = 'auto'; // Restore scroll
    }
  };

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // ---------------------------------------------------------
  // Hero pre-input router to main Waitlist
  // ---------------------------------------------------------
  if (heroQuickForm && heroEmailInput) {
    heroQuickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailValue = heroEmailInput.value.trim();
      if (!emailValue) return;

      // Navigate to waitlist section
      const targetSec = document.getElementById('waitlist-section');
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
        
        // Populate the email field of the main form
        if (wlEmail) {
          wlEmail.value = emailValue;
          // Focus the name field so they fill that out next
          if (wlName) wlName.focus();
        }
      }
    });
  }

  // ---------------------------------------------------------
  // Main Waitlist Form Submission
  // ---------------------------------------------------------
  if (waitlistForm) {
    waitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!wlName || !wlEmail || !wlSize || !wlRole) return;

      const name = wlName.value.trim();
      const email = wlEmail.value.trim();
      const teamSize = wlSize.value;
      const role = wlRole.value;

      if (!name || !email || !teamSize || !role) {
        alert('Please fill in all requested fields to secure your queue slot.');
        return;
      }

      // Show loader state
      if (submitBtn && submitText && loadingSpinner) {
        submitBtn.disabled = true;
        submitText.classList.add('opacity-50');
        loadingSpinner.classList.remove('hidden');
      }

      // Simulate network request to Lagos server
      setTimeout(() => {
        // Calculate a random or serial spot
        const randomAdder = Math.floor(Math.random() * 3) + 1;
        const totalQueue = BASE_QUEUE_OFFSET + randomAdder;

        const newEntry: WaitlistEntry = {
          name,
          email,
          teamSize,
          role,
          queueNum: totalQueue
        };

        saveRegistration(newEntry);
        updateUIWithRegistration();
        showModal(newEntry);

        // Reset submit button state
        if (submitBtn && submitText && loadingSpinner) {
          submitBtn.disabled = false;
          submitText.classList.remove('opacity-50');
          loadingSpinner.classList.add('hidden');
        }
      }, 1500);
    });
  }

  // ---------------------------------------------------------
  // Reset Button
  // ---------------------------------------------------------
  if (wlClearBtn) {
    wlClearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset your waitlist spot? This clears your queue serial placement.')) {
        clearRegistration();
      }
    });
  }

  // ---------------------------------------------------------
  // Onboarding Active Progress Bar Slider Animation
  // ---------------------------------------------------------
  if (progressBarSlider) {
    // Start bar at 0 and transition to 78% once in view
    progressBarSlider.style.width = '0%';
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            progressBarSlider.style.width = '78%';
          }, 300);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(progressBarSlider);
  }

  // ---------------------------------------------------------
  // Initialize UI on mount
  // ---------------------------------------------------------
  updateUIWithRegistration();
});
