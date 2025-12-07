// === ADMIN LOGIN SYSTEM ===
const adminPasswordInput = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const loginMsg = document.getElementById('loginMsg');
const adminContent = document.getElementById('adminContent');
const loginCard = document.getElementById('loginCard');

// Change this to whatever password you want
const ADMIN_PASSWORD = "goldaccess123"; 

if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    const entered = adminPasswordInput.value.trim();
    if (entered === ADMIN_PASSWORD) {
      loginCard.style.display = 'none';
      adminContent.style.display = 'block';

      // Show welcome message with glow
      const welcome = document.getElementById('welcomeMsg');
      if (welcome) {
        welcome.innerHTML = "✨ Welcome back, Admin!";
        welcome.style.opacity = "1";
        welcome.style.transition = "opacity 1s";
        setTimeout(() => {
          welcome.style.opacity = "0";
        }, 2000);
      }

    } else {
      loginMsg.innerHTML = `<div class="toast error">Wrong password</div>`;
      setTimeout(() => (loginMsg.innerHTML = ''), 3000);
    }
  });
}

