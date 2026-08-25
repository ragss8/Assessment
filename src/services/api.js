const DEFAULT_TIMEOUT_MS = 8000;
const env = import.meta.env || {};

const API_URL = env.VITE_API_URL || 'http://localhost:8000/api';

export const apiUrl = (path) => `${API_URL}${path}`;

const getToken = () => localStorage.getItem('kj_token');

const readError = async (response) => {
  try {
    const data = await response.json();
    return data.message || data.detail || data.error || response.statusText;
  } catch {
    return response.statusText || 'Request failed';
  }
};

const request = async (path, options = {}) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const token = getToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const response = await fetch(apiUrl(path), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, error: await readError(response) };
    }

    return { ok: true, data: await response.json() };
  } catch (error) {
    return {
      ok: false,
      error:
        error.name === 'AbortError'
          ? 'The service timed out. Please try again.'
          : 'The service is not reachable right now. Please try again in a moment.',
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const jsonBody = (payload) => ({ body: JSON.stringify(payload), method: 'POST' });
const jsonPatch = (payload) => ({ body: JSON.stringify(payload), method: 'PATCH' });

export const auth = {
  getToken,
  getUser: () => {
    try {
      const raw = localStorage.getItem('kj_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  save: (token, user) => {
    localStorage.setItem('kj_token', token);
    localStorage.setItem('kj_user', JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem('kj_token');
    localStorage.removeItem('kj_user');
  },
  isLoggedIn: () => !!getToken(),
  hasRole: (role) => {
    const user = auth.getUser();
    return user?.role === role;
  },
};

export const api = {
  loginUser: (payload) => request('/auth/login', jsonBody(payload)),
  signupUser: (payload) => request('/auth/register', jsonBody(payload)),
  me: () => request('/auth/me'),

  createRestaurant: (payload) => request('/restaurants', jsonBody(payload)),
  listRestaurants: (query = '') => request(`/restaurants${query}`),
  getRestaurant: (idOrSlug) => request(`/restaurants/${idOrSlug}`),
  claimRestaurant: (id) => request(`/restaurants/${id}/claim`, { method: 'POST' }),
  setOpenStatus: (id, isOpen) => request(`/restaurants/${id}/open-status`, jsonPatch({ isOpen })),
  myRestaurants: () => request('/restaurants/mine'),

  createBooking: (payload) => request('/bookings', jsonBody(payload)),
  restaurantBookings: (restaurantId) => request(`/bookings/restaurant/${restaurantId}`),
  updateBookingStatus: (id, status) => request(`/bookings/${id}/status`, jsonPatch({ status })),

  placeOrder: (payload) => request('/orders', jsonBody(payload)),
  restaurantOrders: (restaurantId) => request(`/orders/restaurant/${restaurantId}`),
  myOrders: () => request('/orders/my'),
  orderStatus: (id) => request(`/orders/${id}/status`),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, jsonPatch({ status })),

  menuItems: (restaurantId) => request(`/menu-items/restaurant/${restaurantId}`),
  createMenuItem: (payload) => request('/menu-items', jsonBody(payload)),
  updateMenuItem: (id, payload) => request(`/menu-items/${id}`, jsonPatch(payload)),
  toggleMenuItemAvailability: (id) => request(`/menu-items/${id}/availability`, { method: 'PATCH' }),
  deleteMenuItem: (id) => request(`/menu-items/${id}`, { method: 'DELETE' }),

  deliveryRegister: (payload) => request('/delivery/auth/register', jsonBody(payload)),
  deliveryLogin: (payload) => request('/delivery/auth/login', jsonBody(payload)),
  deliveryOpenOrders: () => request('/delivery/orders/open'),
  myAssignments: () => request('/delivery/my/assignments'),
  myHistory: () => request('/delivery/my/history'),
  myEarnings: () => request('/delivery/my/earnings'),
  updateMyStatus: (status) => request('/delivery/my/status', jsonPatch({ status })),
  acceptOrder: (orderId) => request(`/delivery/orders/${orderId}/accept`, { method: 'POST' }),

  adminPendingRestaurants: () => request('/admin/restaurants/pending'),
  adminAllRestaurants: () => request('/admin/restaurants'),
  adminApprove: (id) => request(`/admin/restaurants/${id}/approve`, { method: 'PATCH' }),
  adminReject: (id) => request(`/admin/restaurants/${id}/reject`, { method: 'PATCH' }),
  adminUsers: () => request('/admin/users'),
  adminOrders: () => request('/admin/orders'),

  syncRealRestaurants: (payload) => request('/places/sync-restaurants', jsonBody(payload)),
  placePhotoImageUrl: (name, maxWidthPx = 1200) =>
    apiUrl(`/place-photos/image?name=${encodeURIComponent(name)}&maxWidthPx=${maxWidthPx}`),
};
