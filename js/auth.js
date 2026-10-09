/**
 * Lumière Gallery - Authentication System
 * Handles Login and SignUp interactive validation and localStorage session.
 */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initLoginForm();
  initSignupForm();
  initQuickDemoLogin();
});

// Password Toggle Visibility
function initPasswordToggles() {
  const toggleBtns = document.querySelectorAll('.toggle-password');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Hide';
      } else {
        input.type = 'password';
        btn.textContent = 'Show';
      }
    });
  });
}

// Login Form Handling
function initLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('login-remember')?.checked;

    if (!email || !password) {
      showToast('Please enter both email and password.');
      return;
    }

    // Check if user exists in saved accounts or allow test user
    const savedUsers = JSON.parse(localStorage.getItem('lumiere_registered_users') || '[]');
    const foundUser = savedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser && foundUser.password !== password) {
      showToast('Incorrect password. Please try again.');
      return;
    }

    // Create session
    const currentUser = {
      email: email,
      name: foundUser ? foundUser.name : email.split('@')[0],
      role: foundUser ? foundUser.role : 'Art Enthusiast',
      token: 'art_session_' + Date.now()
    };

    localStorage.setItem('lumiere_user', JSON.stringify(currentUser));
    showToast(`Welcome back, ${currentUser.name}! Redirecting...`);

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
  });
}

// SignUp Form Handling
function initSignupForm() {
  const signupForm = document.getElementById('signup-form');
  if (!signupForm) return;

  const passwordInput = document.getElementById('signup-password');
  const strengthBars = document.querySelectorAll('.strength-bar');

  // Real-time password strength meter
  if (passwordInput && strengthBars.length > 0) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      strengthBars.forEach((bar, idx) => {
        if (idx < score) {
          bar.style.backgroundColor = score <= 1 ? '#e74c3c' : score <= 2 ? '#f39c12' : '#2ecc71';
        } else {
          bar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }
      });
    });
  }

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const role = document.getElementById('signup-role')?.value || 'Collector';
    const terms = document.getElementById('signup-terms')?.checked;

    if (!name || !email || !password) {
      showToast('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.');
      return;
    }

    if (!terms) {
      showToast('Please agree to the Gallery Terms of Membership.');
      return;
    }

    // Save to registered list
    const savedUsers = JSON.parse(localStorage.getItem('lumiere_registered_users') || '[]');
    const exists = savedUsers.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      showToast('An account with this email already exists. Please login.');
      return;
    }

    const newUser = { name, email, password, role, registeredAt: new Date().toISOString() };
    savedUsers.push(newUser);
    localStorage.setItem('lumiere_registered_users', JSON.stringify(savedUsers));

    // Also auto log them in
    localStorage.setItem('lumiere_user', JSON.stringify({
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    }));

    showToast(`Account created successfully! Welcome to Lumière, ${name}.`);

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1400);
  });
}

// Quick Demo One-Click Login helper for easy assessment
function initQuickDemoLogin() {
  const demoBtn = document.getElementById('quick-demo-btn');
  if (!demoBtn) return;

  demoBtn.addEventListener('click', () => {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    if (emailInput && passInput) {
      emailInput.value = 'curator@lumiere.art';
      passInput.value = 'Masterpiece2026!';
      showToast('Demo credentials autofilled. Click "Sign In" or press Enter.');
    }
  });
}
