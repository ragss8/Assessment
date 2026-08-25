import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Bike,
  CalendarCheck,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Eye,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Minus,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Timer,
  Trash2,
  Truck,
  Utensils,
  UserRound,
} from 'lucide-react';
import { api, auth } from '../services/api';
import {
  bookingRestaurants as fallbackBookingRestaurants,
  bookings,
  categories as fallbackCategories,
  deliveryQueue,
  orders,
  quickPicks,
  restaurants as fallbackRestaurants,
  viewPreferences,
} from '../data/restaurants';
import heroImage from '../images/pexels-ella-olsson-1640772.jpg';
import serviceImage from '../images/pexels-sebastian-coman-photography-3655916.jpg';
import './App.css';

const navItems = [
  { to: '/customer', label: 'Customer', icon: ShoppingBag },
  { to: '/bookings', label: 'Tables', icon: CalendarCheck },
  { to: '/restaurant', label: 'Restaurant', icon: Store },
  { to: '/delivery', label: 'Delivery', icon: Bike },
  { to: '/menu', label: 'Menu', icon: Utensils },
];

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function normalizeRestaurant(restaurant) {
  const image =
    restaurant.heroImageUrl ||
    (restaurant.primaryPhotoName ? api.placePhotoImageUrl(restaurant.primaryPhotoName) : undefined) ||
    '';
  const scenes = (restaurant.viewScenes || []).map((scene) => ({
    id: scene.id,
    title: scene.title,
    zone: scene.zone?.name || 'Customer Photos',
    image:
      scene.imageUrl ||
      (scene.sourcePhotoName ? api.placePhotoImageUrl(scene.sourcePhotoName) : undefined) ||
      image,
    viewTags: scene.zone?.features || [],
    notes: scene.zone?.description || 'Real customer-uploaded venue preview from the place photo source.',
    attributions: scene.photoAttributions || [],
  }));
  const tables = (restaurant.tables || restaurant.seatingZones?.flatMap((zone) => zone.tables || []) || []).map((table) => ({
    id: table.id,
    label: table.label,
    capacity: table.capacity,
    zone: table.zone?.name || restaurant.seatingZones?.find((zone) => zone.id === table.zoneId)?.name || 'Main floor',
    minSpend: table.minSpend,
    features: table.features || [],
    x: table.x || 30,
    y: table.y || 40,
  }));

  return {
    id: restaurant.id,
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    rating: Number(restaurant.averageRating || restaurant.rating || 0),
    deliveryTime: `${restaurant.deliveryTimeMin || 30} min`,
    distance: restaurant.neighborhood || restaurant.city || 'Nearby',
    priceForTwo: restaurant.priceForTwo || 1200,
    image,
    isOpen: restaurant.isOpen ?? true,
    badge: restaurant.source === 'GOOGLE_PLACES' ? 'Real place photos' : restaurant.badge || 'Table views',
    menu: (restaurant.menuItems || restaurant.menu || []).map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      restaurantId: restaurant.id,
    })),
    scenes,
    tables,
    photoAttributions: restaurant.primaryPhotoAttributions || [],
    googleMapsUri: restaurant.googleMapsUri,
  };
}

function App() {
  const [cart, setCart] = useState({});
  const [catalog, setCatalog] = useState(fallbackRestaurants);
  const [isCatalogLive, setIsCatalogLive] = useState(false);
  const [currentUser, setCurrentUser] = useState(auth.getUser());
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    api.listRestaurants('?city=Bengaluru').then((result) => {
      if (!isMounted || !result.ok || !Array.isArray(result.data) || result.data.length === 0) return;
      setCatalog(result.data.map(normalizeRestaurant));
      setIsCatalogLive(true);
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!auth.getToken()) return;
    let isMounted = true;
    api.me().then((result) => {
      if (!isMounted) return;
      if (result.ok) {
        auth.save(auth.getToken(), result.data);
        setCurrentUser(result.data);
      } else {
        auth.clear();
        setCurrentUser(null);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const cartItems = useMemo(
    () =>
      catalog
        .flatMap((restaurant) =>
          restaurant.menu.map((item) => ({ ...item, restaurantName: restaurant.name }))
        )
        .filter((item) => cart[item.id])
        .map((item) => ({ ...item, quantity: cart[item.id] })),
    [cart, catalog]
  );

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const addItem = (itemId) => {
    const item = catalog.flatMap((restaurant) => restaurant.menu).find((candidate) => candidate.id === itemId);
    const existingRestaurantId = cartItems[0]?.restaurantId;
    if (existingRestaurantId && item?.restaurantId !== existingRestaurantId) {
      setCartMessage('Your cart can contain items from only one restaurant at a time.');
      return;
    }
    setCartMessage('');
    setCart((current) => ({ ...current, [itemId]: (current[itemId] || 0) + 1 }));
  };

  const removeItem = (itemId) => {
    setCart((current) => {
      const nextQuantity = (current[itemId] || 0) - 1;
      if (nextQuantity <= 0) {
        const { [itemId]: removed, ...rest } = current;
        return rest;
      }
      return { ...current, [itemId]: nextQuantity };
    });
  };

  const handleLogin = (user, token) => {
    auth.save(token, user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    auth.clear();
    setCurrentUser(null);
  };

  const handleOrderPlaced = (orderId) => {
    setPlacedOrderId(orderId);
    setCart({});
  };

  return (
    <div className="app-shell">
      <AppHeader cartCount={cartItems.length} currentUser={currentUser} onLogout={handleLogout} />
      <main>
        <Routes>
          <Route path="/" element={<Navigate replace to="/customer" />} />
          <Route path="/main" element={<Navigate replace to="/customer" />} />
          <Route
            path="/customer"
            element={
              <CustomerDashboard
                addItem={addItem}
                cartItems={cartItems}
                cartTotal={cartTotal}
                isCatalogLive={isCatalogLive}
                restaurants={catalog}
                removeItem={removeItem}
                placedOrderId={placedOrderId}
                onOrderPlaced={handleOrderPlaced}
                currentUser={currentUser}
                cartMessage={cartMessage}
              />
            }
          />
          <Route path="/bookings" element={<BookingExperience restaurants={catalog} currentUser={currentUser} />} />
          <Route path="/restaurant" element={<RestaurantWorkspace currentUser={currentUser} />} />
          <Route path="/delivery" element={<DeliveryWorkspace currentUser={currentUser} onLogin={handleLogin} />} />
          <Route path="/menu" element={<MenuBoard addItem={addItem} cart={cart} restaurants={catalog} removeItem={removeItem} />} />
          <Route path="/login" element={<AccessPanel onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate replace to="/customer" />} />
        </Routes>
      </main>
    </div>
  );
}

function AppHeader({ cartCount, currentUser, onLogout }) {
  const location = useLocation();
  const isHome = location.pathname === '/customer' || location.pathname === '/main' || location.pathname === '/';

  return (
    <header className={`app-header ${isHome ? 'app-header--overlay' : ''}`}>
      <Link className="brand-mark" to="/customer" aria-label="KhateJao home">
        <span className="brand-mark__icon"><ChefHat size={21} /></span>
        <span>KhateJao</span>
      </Link>
      <nav className="top-nav" aria-label="Primary navigation">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink className={({ isActive }) => (isActive ? 'active' : undefined)} key={to} to={to}>
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {currentUser ? (
          <>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{currentUser.name} ({currentUser.role})</span>
            <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} title="Logout">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <LogIn size={17} />
            <span>Login</span>
          </Link>
        )}
        <Link className="cart-link" to="/menu" aria-label={`${cartCount} cart items`}>
          <ShoppingBag size={18} />
          <span>{cartCount}</span>
        </Link>
      </div>
    </header>
  );
}

function CustomerDashboard({ addItem, cartItems, cartTotal, isCatalogLive, restaurants, removeItem, placedOrderId, onOrderPlaced, currentUser, cartMessage }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [maxDeliveryTime, setMaxDeliveryTime] = useState(35);
  const [maxPriceForTwo, setMaxPriceForTwo] = useState(2500);
  const [selectedViewFilter, setSelectedViewFilter] = useState('All');

  const categoryOptions = useMemo(
    () => ['All', ...Array.from(new Set([...fallbackCategories.slice(1), ...restaurants.map((item) => item.cuisine)]))],
    [restaurants]
  );

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const deliveryMinutes = Number.parseInt(restaurant.deliveryTime, 10);
    const matchesCategory = activeCategory === 'All' || restaurant.cuisine === activeCategory;
    const matchesSearch = [restaurant.name, restaurant.cuisine, restaurant.badge]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesPrice = (restaurant.priceForTwo || 0) <= maxPriceForTwo;
    const matchesView =
      selectedViewFilter === 'All' ||
      restaurant.tables.some((table) => table.features.includes(selectedViewFilter));
    return matchesCategory && matchesSearch && deliveryMinutes <= maxDeliveryTime && matchesPrice && matchesView;
  });

  return (
    <>
      <section className="hero-band" style={{ '--hero-image': `url(${heroImage})` }}>
        <div className="hero-band__content">
          <div className="hero-copy">
            <span className="eyebrow">{isCatalogLive ? 'Live restaurant catalog' : 'Demo catalog fallback'}</span>
            <h1>Book the exact table experience before you arrive.</h1>
            <p>
              Discover restaurants, inspect 360-style views, choose window, projector, terrace,
              or quiet-zone seating, then keep ordering and delivery workflows in one platform.
            </p>
            <div className="hero-actions">
              <Link className="primary-action" to="/bookings">
                Book a table
                <ArrowRight size={18} />
              </Link>
              <Link className="secondary-action" to="/menu">
                Browse menu
              </Link>
            </div>
          </div>
          <OrderSnapshot cartItems={cartItems} cartTotal={cartTotal} />
        </div>
      </section>

      <section className="workspace-grid">
        <div className="control-panel">
          <div className="search-box">
            <Search size={18} />
            <input
              aria-label="Search restaurants"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search restaurant, cuisine, offer"
              type="search"
              value={search}
            />
          </div>
          <div className="segmented-control" aria-label="Cuisine filter">
            {categoryOptions.map((category) => (
              <button
                className={category === activeCategory ? 'selected' : ''}
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
          <label className="range-control">
            <span>Delivery under {maxDeliveryTime} min</span>
            <input max="45" min="15" onChange={(event) => setMaxDeliveryTime(Number(event.target.value))} step="5" type="range" value={maxDeliveryTime} />
          </label>
        </div>
        <div className="filter-panel">
          <label className="range-control">
            <span>Price for two under {currency.format(maxPriceForTwo)}</span>
            <input max="5000" min="300" onChange={(event) => setMaxPriceForTwo(Number(event.target.value))} step="100" type="range" value={maxPriceForTwo} />
          </label>
          <div className="segmented-control segmented-control--wrap" aria-label="Table view filter">
            <button className={selectedViewFilter === 'All' ? 'selected' : ''} onClick={() => setSelectedViewFilter('All')} type="button">
              All views
            </button>
            {viewPreferences.slice(0, 5).map((preference) => (
              <button
                className={selectedViewFilter === preference.id ? 'selected' : ''}
                key={preference.id}
                onClick={() => setSelectedViewFilter(preference.id)}
                type="button"
              >
                {preference.label}
              </button>
            ))}
          </div>
        </div>

        <section className="quick-picks" aria-label="Quick food picks">
          {quickPicks.map((pick) => (
            <button key={pick.name} type="button">
              <img alt="" src={pick.image} />
              <span>{pick.name}</span>
            </button>
          ))}
        </section>

        <section className="restaurant-grid" aria-label="Restaurant results">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard addItem={addItem} key={restaurant.id} restaurant={restaurant} />
          ))}
        </section>

        <CartSummary
          cartItems={cartItems}
          cartTotal={cartTotal}
          removeItem={removeItem}
          onOrderPlaced={onOrderPlaced}
          placedOrderId={placedOrderId}
          currentUser={currentUser}
          cartMessage={cartMessage}
        />
      </section>
    </>
  );
}

function RestaurantCard({ addItem, restaurant }) {
  const featuredItem = restaurant.menu[0];

  return (
    <article className="restaurant-card">
      <div className="restaurant-card__media">
        {restaurant.image ? (
          <img
            alt={`${restaurant.name} ${restaurant.cuisine}`}
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
            src={restaurant.image}
          />
        ) : (
          <div className="restaurant-card__placeholder">{restaurant.name}</div>
        )}
        <span>{restaurant.badge}</span>
        {!restaurant.isOpen && <span style={{ background: '#ef4444', marginLeft: '0.25rem' }}>Closed</span>}
      </div>
      <div className="restaurant-card__body">
        <div>
          <h2>{restaurant.name}</h2>
          <p>{restaurant.cuisine}</p>
        </div>
        <div className="metric-row">
          <span><Star size={16} fill="currentColor" />{restaurant.rating}</span>
          <span><Timer size={16} />{restaurant.deliveryTime}</span>
          <span><MapPin size={16} />{restaurant.distance}</span>
        </div>
        <PhotoAttribution attributions={restaurant.photoAttributions} />
        {featuredItem && (
          <button className="item-add" onClick={() => addItem(featuredItem.id)} type="button">
            <Plus size={17} />
            Add {featuredItem.name}
          </button>
        )}
        {restaurant.tables.length > 0 && (
          <Link className="item-add item-add--booking" to="/bookings">
            <Eye size={17} />
            View tables
          </Link>
        )}
      </div>
    </article>
  );
}

function OrderSnapshot({ cartItems, cartTotal }) {
  return (
    <aside className="order-snapshot" aria-label="Current order summary">
      <div className="snapshot-icon"><PackageCheck size={26} /></div>
      <p>Active basket</p>
      <strong>{cartItems.length || 0} items</strong>
      <span>{currency.format(cartTotal)}</span>
    </aside>
  );
}

function CartSummary({ cartItems, cartTotal, removeItem, onOrderPlaced, placedOrderId, currentUser, cartMessage }) {
  const [orderStatus, setOrderStatus] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const pollRef = useRef(null);

  useEffect(() => {
    if (!placedOrderId) return;
    const poll = async () => {
      const result = await api.orderStatus(placedOrderId);
      if (result.ok) setOrderStatus(result.data);
    };
    poll();
    pollRef.current = setInterval(poll, 5000);
    return () => clearInterval(pollRef.current);
  }, [placedOrderId]);

  const placeOrder = async () => {
    if (!cartItems.length) return;
    if (currentUser?.role !== 'CUSTOMER') {
      setError('Log in with a customer account before placing an order.');
      return;
    }
    if (!formData.name || !formData.phone || !formData.address) {
      setError('Please fill in your name, phone, and delivery address.');
      return;
    }
    setPlacing(true);
    setError('');

    const restaurantId = cartItems[0]?.restaurantId;
    const items = cartItems.map((item) => ({ menuItemId: item.id, quantity: item.quantity }));

    const result = await api.placeOrder({
      restaurantId,
      customerName: formData.name,
      phone: formData.phone,
      address: formData.address,
      items,
    });

    setPlacing(false);
    if (result.ok) {
      onOrderPlaced(result.data.id);
      setOrderStatus({ status: 'PLACED' });
    } else {
      setError(result.error || 'Could not place order. Try again.');
    }
  };

  const statusLabel = {
    PLACED: 'Order placed — kitchen notified',
    PREPARING: 'Kitchen is preparing your order',
    READY: 'Ready for pickup',
    PICKED_UP: 'Out for delivery',
    DELIVERED: 'Delivered!',
    CANCELLED: 'Order cancelled',
  };

  return (
    <aside className="cart-summary">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Checkout</span>
          <h2>Your order</h2>
        </div>
        <ShoppingBag size={24} />
      </div>

      {placedOrderId && orderStatus ? (
        <div>
          <p className="form-status" style={{ color: '#16a34a', fontWeight: 600 }}>
            {statusLabel[orderStatus.status] || orderStatus.status}
          </p>
          <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Order ID: {placedOrderId.slice(0, 8)}…</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Updates every 5 seconds.</p>
        </div>
      ) : cartItems.length === 0 ? (
        <p className="empty-state">Add an item to see the checkout summary.</p>
      ) : (
        <>
          <div className="cart-list">
            {cartItems.map((item) => (
              <div className="cart-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.quantity} x {currency.format(item.price)}</span>
                </div>
                <button aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.id)} type="button">
                  <Minus size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="total-row">
            <span>Total</span>
            <strong>{currency.format(cartTotal)}</strong>
          </div>
          {cartMessage && <p className="form-status" style={{ color: '#ef4444' }}>{cartMessage}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}
            />
            <input
              placeholder="+91 phone number"
              value={formData.phone}
              onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
              style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}
            />
            <input
              placeholder="Delivery address"
              value={formData.address}
              onChange={(e) => setFormData((f) => ({ ...f, address: e.target.value }))}
              style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}
            />
          </div>
          {error && <p className="form-status" style={{ color: '#ef4444' }}>{error}</p>}
          <button
            className="primary-action primary-action--wide"
            disabled={!cartItems.length || placing || currentUser?.role !== 'CUSTOMER'}
            onClick={placeOrder}
            type="button"
          >
            {placing ? 'Placing…' : currentUser?.role === 'CUSTOMER' ? 'Place order' : 'Customer login required'}
            <CheckCircle2 size={18} />
          </button>
        </>
      )}
    </aside>
  );
}

function RestaurantWorkspace({ currentUser }) {
  const [liveOrders, setLiveOrders] = useState(null);
  const [liveBookings, setLiveBookings] = useState(null);
  const [myRestaurant, setMyRestaurant] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [status, setStatus] = useState('');

  const isOwner = currentUser?.role === 'RESTAURANT_OWNER';

  useEffect(() => {
    if (!isOwner) return;
    api.myRestaurants().then((r) => {
      if (r.ok && r.data.length > 0) {
        const restaurant = r.data[0];
        setMyRestaurant(restaurant);
        setIsOpen(restaurant.isOpen);
        api.restaurantOrders(restaurant.id).then((res) => { if (res.ok) setLiveOrders(res.data); });
        api.restaurantBookings(restaurant.id).then((res) => { if (res.ok) setLiveBookings(res.data); });
      }
    });
  }, [isOwner]);

  if (!isOwner) {
    return (
      <PageFrame kicker="Restaurant console" title="Restaurant-owner access is required." visual={serviceImage}>
        <div className="surface empty-state">
          <p>Log in or register as a restaurant owner to manage a restaurant.</p>
          <Link className="primary-action" to="/login">Owner login</Link>
        </div>
      </PageFrame>
    );
  }

  const toggleOpenStatus = async () => {
    if (!myRestaurant) return;
    const next = !isOpen;
    const result = await api.setOpenStatus(myRestaurant.id, next);
    if (result.ok) {
      setIsOpen(next);
      setStatus(next ? 'Restaurant is now open.' : 'Restaurant is now closed.');
    } else {
      setStatus(result.error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const result = await api.updateOrderStatus(orderId, newStatus);
    if (result.ok) {
      setLiveOrders((current) =>
        (current || []).map((o) => (o.id === orderId ? result.data : o))
      );
    } else {
      setStatus(result.error);
    }
  };

  const displayOrders = liveOrders ?? orders;
  const displayBookings = liveBookings ?? bookings;

  return (
    <PageFrame kicker="Restaurant console" title="Manage orders, bookings, table inventory, and view-led dining." visual={serviceImage}>
      <section className="stats-strip" aria-label="Restaurant stats">
        <Stat icon={ClipboardList} label="Open orders" value={displayOrders.filter ? displayOrders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length : 18} />
        <Stat icon={CalendarCheck} label="Bookings" value={displayBookings.length ?? 14} />
        <Stat icon={Star} label="Rating" value={myRestaurant ? Number(myRestaurant.averageRating).toFixed(1) : '4.7'} />
        <Stat icon={Eye} label="Status" value={isOpen ? 'Open' : 'Closed'} />
      </section>

      {isOwner && (
        <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>{myRestaurant ? myRestaurant.name : 'Your restaurant'}</span>
          <button
            className="primary-action"
            onClick={toggleOpenStatus}
            type="button"
            style={{ padding: '0.4rem 1rem', background: isOpen ? '#ef4444' : '#16a34a' }}
          >
            {isOpen ? 'Close restaurant' : 'Open restaurant'}
          </button>
          {status && <span className="form-status">{status}</span>}
        </div>
      )}

      <section className="split-layout">
        <div className="surface">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Live queue</span>
              <h2>Orders</h2>
            </div>
            <ClipboardList size={24} />
          </div>
          <div className="order-table">
            {(Array.isArray(displayOrders) ? displayOrders : orders).slice(0, 15).map((order) => (
              <div className="order-line" key={order.id}>
                <strong>#{order.id?.slice(0, 6) ?? order.id}</strong>
                <span>{order.customerName ?? order.customer}</span>
                <span>{order.items?.length ? `${order.items.length} items` : order.items}</span>
                <mark>{order.status}</mark>
                <b>{order.total != null ? currency.format(order.total) : ''}</b>
                {liveOrders && order.status === 'PLACED' && (
                  <button onClick={() => updateOrderStatus(order.id, 'PREPARING')} type="button" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>
                    Start preparing
                  </button>
                )}
                {liveOrders && order.status === 'PREPARING' && (
                  <button onClick={() => updateOrderStatus(order.id, 'READY')} type="button" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>
                    Mark ready
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="section-heading" style={{ marginTop: '1.5rem' }}>
            <div>
              <span className="eyebrow">Upcoming</span>
              <h2>Bookings</h2>
            </div>
            <CalendarCheck size={24} />
          </div>
          <div className="booking-list">
            {(Array.isArray(displayBookings) ? displayBookings : bookings).slice(0, 10).map((booking) => (
              <div className="booking-line" key={booking.id}>
                <strong>#{booking.id?.slice(0, 6) ?? booking.id}</strong>
                <span>{booking.customerName ?? booking.customer}</span>
                <span>{booking.partySize ? `${booking.partySize} guests` : booking.table}</span>
                <span>{booking.bookingTime ? new Date(booking.bookingTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : booking.view}</span>
                <mark>{booking.status}</mark>
              </div>
            ))}
          </div>
        </div>
        <RestaurantForm myRestaurant={myRestaurant} isOwner={isOwner} />
      </section>
    </PageFrame>
  );
}

function RestaurantForm({ myRestaurant, isOwner }) {
  const [status, setStatus] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', isVeg: true });

  useEffect(() => {
    if (!myRestaurant) return;
    api.menuItems(myRestaurant.id).then((r) => { if (r.ok) setMenuItems(r.data); });
  }, [myRestaurant]);

  const submitRestaurant = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await api.createRestaurant({
      name: formData.get('restaurantName'),
      description: 'Partner restaurant created from the KhateJao operations console.',
      cuisine: formData.get('cuisine'),
      address: formData.get('address'),
      neighborhood: formData.get('neighborhood'),
      city: formData.get('city'),
      averageRating: 0,
      priceForTwo: Number(formData.get('priceForTwo')),
      deliveryTimeMin: Number(formData.get('deliveryTimeMin')),
    });
    setStatus(result.ok ? 'Application submitted — pending admin approval.' : result.error);
  };

  const addMenuItem = async () => {
    if (!myRestaurant || !newItem.name || !newItem.description || !newItem.price) return;
    const result = await api.createMenuItem({
      restaurantId: myRestaurant.id,
      name: newItem.name,
      description: newItem.description,
      price: Number(newItem.price),
      isVeg: newItem.isVeg,
    });
    if (result.ok) {
      setMenuItems((prev) => [...prev, result.data]);
      setNewItem({ name: '', description: '', price: '', isVeg: true });
    }
  };

  const toggleItem = async (id) => {
    const result = await api.toggleMenuItemAvailability(id);
    if (result.ok) {
      setMenuItems((prev) => prev.map((item) => (item.id === id ? result.data : item)));
    }
  };

  const deleteItem = async (id) => {
    const result = await api.deleteMenuItem(id);
    if (result.ok) setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <form className="surface compact-form" onSubmit={submitRestaurant}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Access</span>
            <h2>Restaurant signup</h2>
          </div>
          <Store size={24} />
        </div>
        <label>Restaurant name<input name="restaurantName" placeholder="Spice Route Kitchen" required /></label>
        <label>Cuisine<input name="cuisine" placeholder="Modern Indian" required /></label>
        <label>Address<input name="address" placeholder="12 Indiranagar Main Road" required /></label>
        <label>Neighborhood<input name="neighborhood" placeholder="Indiranagar" required /></label>
        <label>City<input name="city" placeholder="Bengaluru" required /></label>
        <label>Price for two<input min="0" name="priceForTwo" placeholder="1800" required type="number" /></label>
        <label>Delivery minutes<input min="1" name="deliveryTimeMin" placeholder="28" required type="number" /></label>
        <button className="primary-action primary-action--wide" type="submit">
          Submit <ArrowRight size={18} />
        </button>
        {status && <p className="form-status">{status}</p>}
      </form>

      {isOwner && myRestaurant && (
        <div className="surface compact-form">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Menu</span>
              <h2>Menu items</h2>
            </div>
            <Utensils size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <input placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem((n) => ({ ...n, name: e.target.value }))} />
            <input placeholder="Description" value={newItem.description} onChange={(e) => setNewItem((n) => ({ ...n, description: e.target.value }))} />
            <input placeholder="Price (₹)" type="number" value={newItem.price} onChange={(e) => setNewItem((n) => ({ ...n, price: e.target.value }))} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={newItem.isVeg} onChange={(e) => setNewItem((n) => ({ ...n, isVeg: e.target.checked }))} />
              Vegetarian
            </label>
            <button className="primary-action" onClick={addMenuItem} type="button">
              <Plus size={16} /> Add item
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {menuItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ flex: 1, fontSize: '0.85rem' }}>{item.name} — {currency.format(item.price)}</span>
                <span style={{ fontSize: '0.75rem', color: item.isAvailable ? '#16a34a' : '#ef4444' }}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </span>
                <button onClick={() => toggleItem(item.id)} type="button" title="Toggle availability">
                  <Pencil size={14} />
                </button>
                <button onClick={() => deleteItem(item.id)} type="button" title="Delete" style={{ color: '#ef4444' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BookingExperience({ restaurants, currentUser }) {
  const bookingRestaurants = restaurants.filter((restaurant) => restaurant.tables.length);
  const fallbackBooking = fallbackBookingRestaurants[0];
  const firstBookingRestaurant = bookingRestaurants[0] || fallbackBooking;
  const [restaurantId, setRestaurantId] = useState(firstBookingRestaurant?.id ?? '');
  const [partySize, setPartySize] = useState(2);
  const [selectedViews, setSelectedViews] = useState(['WINDOW_VIEW']);
  const [selectedSceneId, setSelectedSceneId] = useState(firstBookingRestaurant?.scenes[0]?.id ?? '');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [status, setStatus] = useState('');

  if (currentUser?.role !== 'CUSTOMER') {
    return (
      <PageFrame kicker="Table booking" title="Customer login is required to reserve a table." visual={serviceImage}>
        <div className="surface empty-state">
          <Link className="primary-action" to="/login">Customer login</Link>
        </div>
      </PageFrame>
    );
  }

  const restaurant = bookingRestaurants.find((item) => item.id === restaurantId) ?? firstBookingRestaurant;
  const selectedScene =
    restaurant.scenes.find((scene) => scene.id === selectedSceneId) ??
    restaurant.scenes[0] ?? {
      id: 'no-photo',
      image: restaurant.image,
      notes: 'Photo previews will appear after syncing real customer-uploaded place photos.',
      title: 'Photo preview pending',
      zone: restaurant.name,
    };
  const rankedTables = restaurant.tables
    .map((table) => ({
      ...table,
      matchScore: selectedViews.filter((view) => table.features.includes(view)).length,
    }))
    .filter((table) => table.capacity >= partySize)
    .sort((a, b) => b.matchScore - a.matchScore || a.capacity - b.capacity);
  const selectedTable = rankedTables.find((table) => table.id === selectedTableId) ?? rankedTables[0];

  const toggleView = (viewId) => {
    setSelectedViews((current) =>
      current.includes(viewId) ? current.filter((item) => item !== viewId) : [...current, viewId]
    );
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const bookingTime = new Date();
    const [hours, minutes] = String(formData.get('time')).split(':').map(Number);
    bookingTime.setDate(bookingTime.getDate() + 1);
    bookingTime.setHours(hours, minutes, 0, 0);
    const result = await api.createBooking({
      restaurantId,
      tableId: selectedTable?.id,
      customerName: formData.get('name'),
      customerPhone: formData.get('phone'),
      partySize,
      bookingTime: bookingTime.toISOString(),
      preferredViews: selectedViews,
      specialRequests: formData.get('specialRequests'),
    });
    setStatus(result.ok ? `Booking request submitted for table ${selectedTable?.label}.` : `${result.error}`);
  };

  return (
    <PageFrame kicker="Table booking" title="Inspect the restaurant before choosing where to sit." visual={serviceImage}>
      <section className="booking-shell">
        <div className="surface booking-controls">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Preference engine</span>
              <h2>Find your table</h2>
            </div>
            <LayoutDashboard size={24} />
          </div>
          <label>
            Restaurant
            <select
              onChange={(event) => {
                const nextRestaurant = bookingRestaurants.find((item) => item.id === event.target.value);
                setRestaurantId(event.target.value);
                setSelectedSceneId(nextRestaurant?.scenes[0]?.id ?? '');
                setSelectedTableId('');
              }}
              value={restaurant.id}
            >
              {bookingRestaurants.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label className="range-control">
            <span>Party size: {partySize}</span>
            <input max="10" min="1" onChange={(event) => setPartySize(Number(event.target.value))} type="range" value={partySize} />
          </label>
          <div className="preference-grid" aria-label="View preferences">
            {viewPreferences.map((preference) => (
              <button
                className={selectedViews.includes(preference.id) ? 'selected' : ''}
                key={preference.id}
                onClick={() => toggleView(preference.id)}
                type="button"
              >
                {preference.label}
              </button>
            ))}
          </div>
          <form className="booking-form" onSubmit={submitBooking}>
            <input name="name" placeholder="Guest name" required defaultValue={currentUser?.name} />
            <input name="phone" placeholder="+91 phone number" required />
            <input defaultValue="19:30" name="time" required type="time" />
            <input name="specialRequests" placeholder="Birthday, accessibility, screen angle..." />
            <button className="primary-action primary-action--wide" type="submit">
              Request booking
              <CalendarCheck size={18} />
            </button>
            {status && <p className="form-status">{status}</p>}
          </form>
        </div>

        <div className="surface view-explorer">
          <div className="section-heading">
            <div>
              <span className="eyebrow">360 preview</span>
              <h2>{selectedScene.title}</h2>
            </div>
            <Eye size={24} />
          </div>
          <div className="panorama-card" style={{ '--scene-image': `url(${selectedScene.image})` }}>
            <span>{selectedScene.zone}</span>
            <strong>{selectedScene.notes}</strong>
          </div>
          <PhotoAttribution attributions={selectedScene.attributions} />
          <div className="scene-tabs">
            {restaurant.scenes.map((scene) => (
              <button
                className={scene.id === selectedScene.id ? 'selected' : ''}
                key={scene.id}
                onClick={() => setSelectedSceneId(scene.id)}
                type="button"
              >
                {scene.zone}
              </button>
            ))}
          </div>
          <div className="floor-map" aria-label={`${restaurant.name} table map`}>
            {restaurant.tables.map((table) => (
              <button
                className={`${selectedTable?.id === table.id ? 'selected' : ''} ${table.capacity < partySize ? 'disabled' : ''}`}
                key={table.id}
                onClick={() => setSelectedTableId(table.id)}
                style={{ left: `${table.x}%`, top: `${table.y}%` }}
                type="button"
              >
                {table.label}
              </button>
            ))}
          </div>
        </div>

        <aside className="surface recommendation-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Best matches</span>
              <h2>Recommended tables</h2>
            </div>
            <ShieldCheck size={24} />
          </div>
          {rankedTables.map((table) => (
            <button
              className={selectedTable?.id === table.id ? 'recommendation selected' : 'recommendation'}
              key={table.id}
              onClick={() => setSelectedTableId(table.id)}
              type="button"
            >
              <strong>{table.label}</strong>
              <span>{table.zone}</span>
              <span>{table.capacity} guests</span>
              <b>{table.matchScore}/{selectedViews.length || 1} match</b>
            </button>
          ))}
        </aside>
      </section>
    </PageFrame>
  );
}

function DeliveryWorkspace({ currentUser, onLogin }) {
  const isPartner = currentUser?.role === 'DELIVERY_PARTNER';
  const [openOrders, setOpenOrders] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [history, setHistory] = useState([]);
  const [acceptStatus, setAcceptStatus] = useState({});
  const [loginForm, setLoginForm] = useState({ email: '', password: '', name: '', phone: '', vehicleType: '', mode: 'login' });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (!isPartner) return;
    api.deliveryOpenOrders().then((r) => { if (r.ok) setOpenOrders(r.data); });
  }, [isPartner]);

  useEffect(() => {
    if (!isPartner) return;
    api.myEarnings().then((r) => { if (r.ok) setEarnings(r.data); });
    api.myHistory().then((r) => { if (r.ok) setHistory(r.data); });
  }, [isPartner]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoginError('');
    const fn = loginForm.mode === 'login' ? api.deliveryLogin : api.deliveryRegister;
    const payload = loginForm.mode === 'login'
      ? { email: loginForm.email, password: loginForm.password }
      : { email: loginForm.email, password: loginForm.password, name: loginForm.name, phone: loginForm.phone, vehicleType: loginForm.vehicleType };
    const result = await fn(payload);
    if (result.ok) {
      onLogin(result.data.partner, result.data.token);
    } else {
      setLoginError(result.error);
    }
  };

  const acceptOrder = async (orderId) => {
    setAcceptStatus((s) => ({ ...s, [orderId]: 'accepting' }));
    const result = await api.acceptOrder(orderId);
    if (result.ok) {
      setOpenOrders((prev) => prev.filter((o) => o.id !== orderId));
      setAcceptStatus((s) => ({ ...s, [orderId]: 'accepted' }));
      api.myEarnings().then((r) => { if (r.ok) setEarnings(r.data); });
    } else {
      setAcceptStatus((s) => ({ ...s, [orderId]: result.error }));
    }
  };

  return (
    <PageFrame kicker="Delivery partner" title="Assignments, payouts, and route timing without clutter." visual={heroImage}>
      <section className="stats-strip" aria-label="Delivery stats">
        <Stat icon={Truck} label="Open orders" value={openOrders.length} />
        <Stat icon={PackageCheck} label="Completed" value={earnings?.deliveryCount ?? 0} />
        <Stat icon={ShieldCheck} label="Total earned" value={earnings ? currency.format(earnings.totalEarnings) : '—'} />
        <Stat icon={Timer} label="Status" value={isPartner ? 'Active' : 'Not logged in'} />
      </section>

      <section className="split-layout">
        <div className="surface">
          <div className="section-heading">
            <div><span className="eyebrow">Available now</span><h2>Open orders</h2></div>
            <Truck size={24} />
          </div>
          {openOrders.length === 0 ? (
            <p className="empty-state">No orders ready for pickup right now.</p>
          ) : (
            <div className="delivery-list">
              {openOrders.map((order) => (
                <article className="delivery-card" key={order.id}>
                  <div>
                    <span className="eyebrow">#{order.id.slice(0, 6)}</span>
                    <h2>{order.restaurant?.name}</h2>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                      {order.items?.length} items — {order.address}
                    </p>
                  </div>
                  <strong>{currency.format(order.total)}</strong>
                  <mark>{order.status}</mark>
                  {isPartner && (
                    <button
                      className="primary-action"
                      onClick={() => acceptOrder(order.id)}
                      disabled={acceptStatus[order.id] === 'accepting'}
                      type="button"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      {acceptStatus[order.id] === 'accepting' ? 'Accepting…' : 'Accept'}
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}

          {isPartner && history.length > 0 && (
            <>
              <div className="section-heading" style={{ marginTop: '1.5rem' }}>
                <div><span className="eyebrow">Past</span><h2>Delivery history</h2></div>
                <PackageCheck size={24} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {history.slice(0, 10).map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span>Order #{a.orderId?.slice(0, 6)}</span>
                    <span>{a.dropAddress}</span>
                    <b>{currency.format(a.payout)}</b>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {!isPartner && (
          <form className="surface compact-form" onSubmit={handleAuth}>
            <div className="section-heading">
              <div><span className="eyebrow">Partner</span><h2>{loginForm.mode === 'login' ? 'Partner login' : 'Partner signup'}</h2></div>
              <Bike size={24} />
            </div>
            {loginForm.mode === 'register' && (
              <>
                <label>Name<input required value={loginForm.name} onChange={(e) => setLoginForm((f) => ({ ...f, name: e.target.value }))} /></label>
                <label>Phone<input required value={loginForm.phone} onChange={(e) => setLoginForm((f) => ({ ...f, phone: e.target.value }))} /></label>
                <label>Vehicle type<input required placeholder="Bike / Scooter / Car" value={loginForm.vehicleType} onChange={(e) => setLoginForm((f) => ({ ...f, vehicleType: e.target.value }))} /></label>
              </>
            )}
            <label>Email<input type="email" required value={loginForm.email} onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))} /></label>
            <label>Password<input type="password" required value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} /></label>
            {loginError && <p className="form-status" style={{ color: '#ef4444' }}>{loginError}</p>}
            <button className="primary-action primary-action--wide" type="submit">
              {loginForm.mode === 'login' ? 'Login' : 'Register'}
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => setLoginForm((f) => ({ ...f, mode: f.mode === 'login' ? 'register' : 'login' }))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', marginTop: '0.25rem' }}
            >
              {loginForm.mode === 'login' ? 'New partner? Register here' : 'Already registered? Login'}
            </button>
          </form>
        )}
      </section>
    </PageFrame>
  );
}

function MenuBoard({ addItem, cart, restaurants, removeItem }) {
  return (
    <PageFrame kicker="Menu board" title="A clean, scannable catalog with cart controls." visual={serviceImage}>
      <section className="menu-board">
        {restaurants.map((restaurant) => (
          <article className="menu-section" key={restaurant.id}>
            <div className="menu-section__heading">
              {restaurant.image ? (
                <img alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} src={restaurant.image} />
              ) : (
                <span className="menu-image-placeholder">{restaurant.name.slice(0, 1)}</span>
              )}
              <div>
                <h2>{restaurant.name}</h2>
                <span>{restaurant.cuisine}</span>
                {!restaurant.isOpen && <span style={{ marginLeft: '0.5rem', color: '#ef4444', fontSize: '0.75rem' }}>Closed</span>}
              </div>
            </div>
            <div className="menu-items">
              {restaurant.menu.map((item) => (
                <div className="menu-item" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{currency.format(item.price)}</span>
                  </div>
                  <div className="stepper" aria-label={`${item.name} quantity`}>
                    <button onClick={() => removeItem(item.id)} type="button"><Minus size={16} /></button>
                    <span>{cart[item.id] || 0}</span>
                    <button onClick={() => addItem(item.id)} type="button"><Plus size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </PageFrame>
  );
}

function AccessPanel({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', role: 'CUSTOMER', mode: 'login' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const fn = form.mode === 'login' ? api.loginUser : api.signupUser;
    const payload = form.mode === 'login'
      ? { email: form.email, password: form.password }
      : { email: form.email, password: form.password, name: form.name, phone: form.phone, role: form.role };
    const result = await fn(payload);
    if (result.ok) {
      onLogin(result.data.user, result.data.token);
      setSuccess(`Logged in as ${result.data.user.name} (${result.data.user.role})`);
    } else {
      setError(result.error);
    }
  };

  return (
    <PageFrame kicker="Access" title="Choose the workspace that matches your role." visual={heroImage}>
      <section className="role-grid">
        {navItems.slice(0, 3).map(({ to, label, icon: Icon }) => (
          <Link className="role-card" key={to} to={to}>
            <Icon size={28} />
            <strong>{label}</strong>
            <span>Open workspace</span>
          </Link>
        ))}
      </section>
      <form className="surface compact-form" onSubmit={handleSubmit} style={{ maxWidth: '360px', margin: '1.5rem auto 0' }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Auth</span>
            <h2>{form.mode === 'login' ? 'Login' : 'Register'}</h2>
          </div>
          <UserRound size={24} />
        </div>
        {form.mode === 'register' && (
          <>
            <label>Name<input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></label>
            <label>Phone<input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></label>
            <label>
              Role
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                <option value="CUSTOMER">Customer</option>
                <option value="RESTAURANT_OWNER">Restaurant Owner</option>
              </select>
            </label>
          </>
        )}
        <label>Email<input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></label>
        <label>Password<input type="password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></label>
        {error && <p className="form-status" style={{ color: '#ef4444' }}>{error}</p>}
        {success && <p className="form-status" style={{ color: '#16a34a' }}>{success}</p>}
        <button className="primary-action primary-action--wide" type="submit">
          {form.mode === 'login' ? 'Login' : 'Register'}
          <ArrowRight size={18} />
        </button>
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, mode: f.mode === 'login' ? 'register' : 'login' }))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', marginTop: '0.25rem' }}
        >
          {form.mode === 'login' ? 'No account? Register' : 'Have an account? Login'}
        </button>
      </form>
    </PageFrame>
  );
}

function PhotoAttribution({ attributions }) {
  if (!Array.isArray(attributions) || attributions.length === 0) return null;
  return (
    <p className="photo-attribution">
      Photo: {attributions.map((item) => item.displayName).filter(Boolean).join(', ')}
    </p>
  );
}

function PageFrame({ children, kicker, title, visual }) {
  return (
    <>
      <section className="page-hero">
        <div>
          <span className="eyebrow">{kicker}</span>
          <h1>{title}</h1>
        </div>
        <img alt="" src={visual} />
      </section>
      <div className="page-content">{children}</div>
    </>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <article className="stat-card">
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default App;
