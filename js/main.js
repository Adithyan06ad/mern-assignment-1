/**
 * Lumière Gallery - Core JavaScript
 * Handles navigation, auth state display, lightbox, and notifications.
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  checkAuthState();
  initLightbox();
});

// Sticky header styling on scroll
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Mobile drawer navigation toggle
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (!toggleBtn || !mainNav) return;

  toggleBtn.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    const isExpanded = mainNav.classList.contains('active');
    toggleBtn.setAttribute('aria-expanded', isExpanded);
  });

  // Close mobile nav when clicking a link
  const links = mainNav.querySelectorAll('.nav-link, .btn');
  links.forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('active');
    });
  });
}

// Check logged in user state from localStorage
function checkAuthState() {
  const userJson = localStorage.getItem('lumiere_user');
  const userBadge = document.getElementById('user-badge');
  const userNameEl = document.getElementById('user-name');
  const userAvatarEl = document.getElementById('user-avatar');
  const authButtons = document.getElementById('auth-buttons');
  const logoutBtn = document.getElementById('logout-btn');

  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (userBadge && userNameEl) {
        userBadge.style.display = 'flex';
        userNameEl.textContent = user.name || user.email.split('@')[0];
        if (userAvatarEl) {
          const initials = (user.name || user.email)
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
          userAvatarEl.textContent = initials || 'U';
        }
      }
      if (authButtons) {
        authButtons.style.display = 'none';
      }
    } catch (e) {
      console.error('Error parsing user session', e);
    }
  } else {
    if (userBadge) userBadge.style.display = 'none';
    if (authButtons) authButtons.style.display = 'flex';
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('lumiere_user');
      showToast('You have been logged out successfully.');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    });
  }
}

// Lightbox Modal for Artworks
function initLightbox() {
  let modal = document.querySelector('.lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'lightbox-modal';
    modal.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Close">&times;</button>
        <img src="" alt="Enlarged Artwork" id="lightbox-img">
        <div class="lightbox-caption" id="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const lightboxImg = modal.querySelector('#lightbox-img');
  const lightboxCaption = modal.querySelector('#lightbox-caption');
  const closeBtn = modal.querySelector('.lightbox-close');

  const closeLightbox = () => {
    modal.classList.remove('active');
  };

  closeBtn.addEventListener('click', closeLightbox);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Attach to images with data-lightbox or framed images
  document.querySelectorAll('[data-lightbox], .art-frame-container img').forEach(el => {
    el.addEventListener('click', () => {
      const src = el.getAttribute('data-full-src') || el.src;
      const title = el.getAttribute('data-caption') || el.alt || 'Lumière Artwork';
      lightboxImg.src = src;
      lightboxCaption.textContent = title;
      modal.classList.add('active');
    });
  });
}

// Toast notification helper
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">✦</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 20);

  // Auto remove after 3.5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// Fallback image helper
function handleImageError(img) {
  img.onerror = null;
  // If a thumb URL failed, try the unscaled direct upload URL
  if (img.src && img.src.includes('/thumb/')) {
    const directUrl = img.src.replace(/\/thumb\//, '/').replace(/\/[^\/]+$/, '');
    img.src = directUrl;
    return;
  }
}
