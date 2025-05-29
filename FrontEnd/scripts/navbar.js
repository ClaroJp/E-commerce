document.addEventListener('DOMContentLoaded', async () => {
  const userSection = document.getElementById('userSection');
  if (!userSection) return;

  try {
    const response = await fetch('/api/loggedin', {
      credentials: 'include' // Important: send cookies with request
    });

    if (!response.ok) {
      // Not logged in or error
      userSection.innerHTML = `
        <a class="nav-link text-light me-3 fs-6" href="/login">Sign In</a>
        <a class="nav-link text-light" href="/login"><i class="bi bi-cart4 fs-5"></i></a>
      `;
      return;
    }

    const data = await response.json();

    if (data.loggedIn) {
      userSection.innerHTML = `
        <div class="dropdown me-3">
          <a href="#" class="nav-link dropdown-toggle text-light" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-person fs-5"></i> ${data.user.name || ''}
          </a>
          <ul class="dropdown-menu dropdown-menu-end bg-dark text-light" aria-labelledby="userDropdown" style="border:none;">
            <li><a class="dropdown-item text-light" href="/profile">My Account</a></li>
            <li><a class="dropdown-item text-light" href="/myPurchases">My Purchase</a></li>
            <li><hr class="dropdown-divider bg-success"></li>
            <button id="logoutBtn" class="btn btn-link dropdown-item text-danger">Log out</button>
          </ul>
        </div>
        <a class="nav-link text-light" href="/cart"><i class="bi bi-cart4 fs-5"></i></a>
      `;

      // Add logout handler
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          try {
            const res = await fetch('/api/logout', {
              method: 'POST',
              credentials: 'include'
            });
            if (res.ok) {
              window.location.reload();
            } else {
              alert('Logout failed.');
            }
          } catch (err) {
            console.error('Logout error:', err);
            alert('Logout error');
          }
        });
      }

    } else {
      userSection.innerHTML = `
        <a class="nav-link text-light me-3 fs-6" href="/login">Sign In</a>
        <a class="nav-link text-light" href="/login"><i class="bi bi-cart4 fs-5"></i></a>
      `;
    }
  } catch (error) {
    console.error('Error checking login status:', error);
    userSection.innerHTML = `
      <a class="nav-link text-light me-3 fs-6" href="/login">Sign In</a>
      <a class="nav-link text-light" href="/login"><i class="bi bi-cart4 fs-5"></i></a>
    `;
  }
});
