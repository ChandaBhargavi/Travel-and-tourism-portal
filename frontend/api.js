/**
 * TravelGo API Helper & Shared Utilities
 */

const API_BASE_URL = '/api';

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param {string} str 
 * @returns {string} Escaped string
 */
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Get JWT token from localStorage
 */
function getToken() {
    return localStorage.getItem('travelgo_token');
}

/**
 * Get stored user profile object
 */
function getUser() {
    const userStr = localStorage.getItem('travelgo_user');
    try {
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Store auth token and user profile
 */
function setAuth(token, user) {
    localStorage.setItem('travelgo_token', token);
    localStorage.setItem('travelgo_user', JSON.stringify(user));
}

/**
 * Log out user and redirect to login page
 */
function logout() {
    localStorage.removeItem('travelgo_token');
    localStorage.removeItem('travelgo_user');
    window.location.href = 'login.html';
}

/**
 * Wishlist Local Storage Management
 */
function getWishlist() {
    const wishlistStr = localStorage.getItem('travelgo_wishlist');
    try {
        return wishlistStr ? JSON.parse(wishlistStr) : [];
    } catch (e) {
        return [];
    }
}

function isWishlisted(packageId) {
    const wishlist = getWishlist();
    return wishlist.some(id => String(id) === String(packageId));
}

function toggleWishlist(packageId) {
    let wishlist = getWishlist();
    const idStr = String(packageId);
    if (wishlist.some(id => String(id) === idStr)) {
        wishlist = wishlist.filter(id => String(id) !== idStr);
    } else {
        wishlist.push(packageId);
    }
    localStorage.setItem('travelgo_wishlist', JSON.stringify(wishlist));
    updateNavbar();
    return wishlist.some(id => String(id) === idStr);
}

/**
 * Core API request wrapper over fetch()
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json().catch(() => ({ success: false, message: 'Invalid JSON response from server' }));

        if (response.status === 401) {
            localStorage.removeItem('travelgo_token');
            localStorage.removeItem('travelgo_user');
            if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('register.html')) {
                window.location.href = 'login.html?session_expired=1';
            }
        }

        return {
            status: response.status,
            ok: response.ok,
            data
        };
    } catch (error) {
        console.error('API network request error:', error);
        return {
            status: 0,
            ok: false,
            data: { success: false, message: 'Network error or server unreachable.' }
        };
    }
}

// Convenience methods
const api = {
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (endpoint, body) => apiRequest(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};

/**
 * Update Navbar state depending on logged-in status & role
 */
function updateNavbar() {
    const navLinksContainer = document.getElementById('nav-links');
    if (!navLinksContainer) return;

    const user = getUser();
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const wishlistCount = getWishlist().length;

    let html = `
        <li><a href="index.html" class="${currentPath === 'index.html' ? 'active' : ''}">Home</a></li>
        <li><a href="destinations.html" class="${currentPath === 'destinations.html' ? 'active' : ''}">Destinations</a></li>
        <li><a href="tour-packages.html" class="${currentPath === 'tour-packages.html' ? 'active' : ''}">Tour Packages</a></li>
        <li><a href="tour-packages.html?wishlist=1" class="${currentPath.includes('wishlist') ? 'active' : ''}">
            <i class="fa-solid fa-heart" style="color: var(--accent-color);"></i> Wishlist <span class="badge badge-pending" style="font-size: 0.75rem; padding: 0.15rem 0.4rem;">${wishlistCount}</span>
        </a></li>
    `;

    if (user) {
        html += `<li><a href="my-bookings.html" class="${currentPath === 'my-bookings.html' ? 'active' : ''}">My Bookings</a></li>`;
        
        if (user.role === 'admin') {
            html += `<li><a href="admin.html" class="${currentPath === 'admin.html' ? 'active' : ''}">Admin Dashboard</a></li>`;
        }

        html += `
            <li><span class="user-badge">Hello, ${escapeHTML(user.name)}</span></li>
            <li><button onclick="logout()" class="btn btn-outline btn-sm">Logout</button></li>
        `;
    } else {
        html += `
            <li><a href="login.html" class="btn btn-outline btn-sm ${currentPath === 'login.html' ? 'active' : ''}">Login</a></li>
            <li><a href="register.html" class="btn btn-accent btn-sm ${currentPath === 'register.html' ? 'active' : ''}">Register</a></li>
        `;
    }

    navLinksContainer.innerHTML = html;
}

// Auto update navbar on page load DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});
