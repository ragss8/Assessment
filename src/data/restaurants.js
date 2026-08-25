import biryaniImage from '../images/biryani.jpeg';
import burgerImage from '../images/burger.png';
import cakeImage from '../images/cake.png';
import dosaImage from '../images/dosa.jpeg';
import icecreamImage from '../images/icecream.png';
import pizzaImage from '../images/pizza.png';
import rollsImage from '../images/rolls.jpeg';
import teaImage from '../images/tea.jpeg';
import atriumImage from '../images/pexels-ella-olsson-1640772.jpg';
import loungeImage from '../images/pexels-sebastian-coman-photography-3655916.jpg';

export const categories = [
  'All',
  'Thai',
  'Coastal',
  'Brewery',
  'Biryani',
  'Burgers',
  'South Indian',
  'Desserts',
  'Bakery',
];

export const viewPreferences = [
  { id: 'WINDOW_VIEW', label: 'Window view' },
  { id: 'PROJECTOR_VIEW', label: 'Projector view' },
  { id: 'TERRACE', label: 'Terrace' },
  { id: 'PRIVATE_DINING', label: 'Private dining' },
  { id: 'QUIET_ZONE', label: 'Quiet zone' },
  { id: 'LIVE_MUSIC_VIEW', label: 'Live music view' },
];

export const restaurants = [
  {
    id: 'rim-naam',
    name: 'Rim Naam',
    cuisine: 'Thai',
    rating: 4.7,
    deliveryTime: '24 min',
    distance: '1.8 km',
    priceForTwo: 1800,
    image: atriumImage,
    badge: '360 table views',
    menu: [
      { id: 'thai-tasting-plate', name: 'Thai tasting plate', price: 720 },
      { id: 'green-curry', name: 'Green Curry', price: 640 },
      { id: 'jasmine-rice', name: 'Jasmine Rice', price: 220 },
    ],
    scenes: [
      {
        id: 'spice-terrace',
        title: 'Terrace skyline preview',
        zone: 'Terrace Deck',
        image: atriumImage,
        viewTags: ['TERRACE', 'WINDOW_VIEW', 'QUIET_ZONE'],
        notes: 'Best for breezy date-night seating and skyline-facing tables.',
      },
      {
        id: 'spice-projector',
        title: 'Projector lounge preview',
        zone: 'Screen Lounge',
        image: loungeImage,
        viewTags: ['PROJECTOR_VIEW', 'LIVE_MUSIC_VIEW', 'FAMILY_FRIENDLY'],
        notes: 'Best for match nights, group dinners, and screen-facing tables.',
      },
    ],
    tables: [
      { id: 'T1', label: 'T1', capacity: 2, zone: 'Terrace Deck', minSpend: 1800, features: ['TERRACE', 'WINDOW_VIEW', 'QUIET_ZONE'], x: 18, y: 24 },
      { id: 'T2', label: 'T2', capacity: 4, zone: 'Terrace Deck', minSpend: 2600, features: ['TERRACE', 'WINDOW_VIEW'], x: 42, y: 28 },
      { id: 'P1', label: 'P1', capacity: 6, zone: 'Screen Lounge', minSpend: 3200, features: ['PROJECTOR_VIEW', 'FAMILY_FRIENDLY'], x: 66, y: 52 },
      { id: 'P2', label: 'P2', capacity: 8, zone: 'Screen Lounge', minSpend: 4200, features: ['PROJECTOR_VIEW', 'LIVE_MUSIC_VIEW'], x: 78, y: 42 },
    ],
  },
  {
    id: 'karavalli',
    name: 'Karavalli',
    cuisine: 'Coastal',
    rating: 4.5,
    deliveryTime: '34 min',
    distance: '3.1 km',
    priceForTwo: 2200,
    image: loungeImage,
    badge: 'Window seats',
    menu: [
      { id: 'mangalorean-ghee-roast', name: 'Mangalorean Ghee Roast', price: 640 },
      { id: 'sol-kadhi-cooler', name: 'Sol Kadhi Cooler', price: 180 },
      { id: 'tender-coconut-payasam', name: 'Tender Coconut Payasam', price: 240 },
    ],
    scenes: [
      {
        id: 'coast-window',
        title: 'Bay window dining preview',
        zone: 'Bay Window',
        image: loungeImage,
        viewTags: ['WINDOW_VIEW', 'QUIET_ZONE', 'PRIVATE_DINING'],
        notes: 'Calm window-facing layout for long conversations and smaller groups.',
      },
    ],
    tables: [
      { id: 'W1', label: 'W1', capacity: 2, zone: 'Bay Window', minSpend: 1600, features: ['WINDOW_VIEW', 'QUIET_ZONE'], x: 30, y: 36 },
      { id: 'W2', label: 'W2', capacity: 4, zone: 'Bay Window', minSpend: 2400, features: ['WINDOW_VIEW', 'PRIVATE_DINING'], x: 54, y: 38 },
    ],
  },
  {
    id: 'toit-indiranagar',
    name: 'Toit',
    cuisine: 'Brewery',
    rating: 4.5,
    deliveryTime: '31 min',
    distance: '2.4 km',
    priceForTwo: 900,
    image: pizzaImage,
    badge: 'Flat 20%',
    menu: [
      { id: 'margherita', name: 'Classic Margherita', price: 199 },
      { id: 'peri-peri-paneer', name: 'Peri Peri Paneer', price: 299 },
      { id: 'garlic-bread', name: 'Garlic Bread', price: 139 },
    ],
    scenes: [],
    tables: [],
  },
  {
    id: 'meghana-foods-indiranagar',
    name: 'Meghana Foods',
    cuisine: 'Biryani',
    rating: 4.7,
    deliveryTime: '24 min',
    distance: '1.8 km',
    priceForTwo: 700,
    image: biryaniImage,
    badge: 'Best seller',
    menu: [
      { id: 'hyderabadi-biryani', name: 'Hyderabadi Biryani', price: 249 },
      { id: 'paneer-tikka', name: 'Paneer Tikka Bowl', price: 219 },
      { id: 'masala-chaas', name: 'Masala Chaas', price: 79 },
    ],
    scenes: [],
    tables: [],
  },
  {
    id: 'truffles-st-marks',
    name: 'Truffles',
    cuisine: 'Burgers',
    rating: 4.4,
    deliveryTime: '19 min',
    distance: '1.1 km',
    priceForTwo: 650,
    image: burgerImage,
    badge: 'Fastest',
    menu: [
      { id: 'double-cheese', name: 'Double Cheese Burger', price: 229 },
      { id: 'loaded-fries', name: 'Loaded Fries', price: 149 },
      { id: 'cold-coffee', name: 'Cold Coffee', price: 129 },
    ],
    scenes: [],
    tables: [],
  },
  {
    id: 'mtr-lalbagh',
    name: 'Mavalli Tiffin Rooms',
    cuisine: 'South Indian',
    rating: 4.6,
    deliveryTime: '27 min',
    distance: '2.0 km',
    priceForTwo: 450,
    image: dosaImage,
    badge: 'Pure veg',
    menu: [
      { id: 'masala-dosa', name: 'Masala Dosa', price: 159 },
      { id: 'idli-vada', name: 'Idli Vada Combo', price: 139 },
      { id: 'filter-coffee', name: 'Filter Coffee', price: 69 },
    ],
    scenes: [],
    tables: [],
  },
  {
    id: 'corner-house',
    name: 'Corner House',
    cuisine: 'Desserts',
    rating: 4.8,
    deliveryTime: '35 min',
    distance: '3.2 km',
    priceForTwo: 500,
    image: cakeImage,
    badge: 'Top rated',
    menu: [
      { id: 'truffle-cake', name: 'Chocolate Truffle Slice', price: 149 },
      { id: 'brownie', name: 'Walnut Brownie', price: 129 },
      { id: 'vanilla-scoop', name: 'Vanilla Bean Scoop', price: 99 },
    ],
    scenes: [],
    tables: [],
  },
  {
    id: 'glens-bakehouse',
    name: "Glen's Bakehouse",
    cuisine: 'Desserts',
    rating: 4.3,
    deliveryTime: '21 min',
    distance: '1.5 km',
    priceForTwo: 400,
    image: icecreamImage,
    badge: 'New',
    menu: [
      { id: 'mango-sundae', name: 'Mango Sundae', price: 159 },
      { id: 'choco-fudge', name: 'Choco Fudge Tub', price: 189 },
      { id: 'waffle-bites', name: 'Waffle Bites', price: 119 },
    ],
    scenes: [],
    tables: [],
  },
];

export const bookingRestaurants = restaurants.filter((restaurant) => restaurant.tables.length);

export const quickPicks = [
  { name: '360 Table views', image: atriumImage },
  { name: 'Rolls', image: rollsImage },
  { name: 'Tea', image: teaImage },
  { name: 'Pizza', image: pizzaImage },
];

export const orders = [
  { id: 'KJ-1042', customer: 'Aarav Mehta', items: 'Biryani x2, Chaas x1', status: 'Preparing', total: 577 },
  { id: 'KJ-1043', customer: 'Nisha Rao', items: 'Masala Dosa x1', status: 'Ready', total: 159 },
  { id: 'KJ-1044', customer: 'Dev Shah', items: 'Margherita x1, Garlic Bread x1', status: 'Picked up', total: 338 },
];

export const bookings = [
  { id: 'BK-2201', customer: 'Priya Menon', table: 'T2', view: 'Terrace Deck', time: '7:30 PM', status: 'Confirmed' },
  { id: 'BK-2202', customer: 'Vikram Rao', table: 'P1', view: 'Projector view', time: '8:00 PM', status: 'Requested' },
  { id: 'BK-2203', customer: 'Aisha Khan', table: 'W1', view: 'Window view', time: '6:45 PM', status: 'Seated' },
];

export const deliveryQueue = [
  { id: 'D-18', route: 'Indiranagar to MG Road', payout: 92, eta: '18 min', status: 'Pickup due' },
  { id: 'D-21', route: 'Koramangala to BTM', payout: 118, eta: '26 min', status: 'On route' },
  { id: 'D-27', route: 'HSR Layout to Bellandur', payout: 104, eta: '22 min', status: 'Assigned' },
];
