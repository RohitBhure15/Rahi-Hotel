import { BOX_CRICKET_IMAGE, spaImg, diningImg, heroImg, presidentialImg, simpleRoomImg } from './mockData';

export const RESORT_GEO_BOUNDS = {
  minLat: 15.5155,
  maxLat: 15.5215,
  minLng: 73.7595,
  maxLng: 73.7665,
  centerLat: 15.5186,
  centerLng: 73.7630,
};

export function xyToLatLng(x: number, y: number): { lat: number; lng: number } {
  const lat = RESORT_GEO_BOUNDS.maxLat - (y / 700) * (RESORT_GEO_BOUNDS.maxLat - RESORT_GEO_BOUNDS.minLat);
  const lng = RESORT_GEO_BOUNDS.minLng + (x / 1000) * (RESORT_GEO_BOUNDS.maxLng - RESORT_GEO_BOUNDS.minLng);
  return { lat, lng };
}

export function latLngToXy(lat: number, lng: number): { x: number; y: number } {
  const y = ((RESORT_GEO_BOUNDS.maxLat - lat) / (RESORT_GEO_BOUNDS.maxLat - RESORT_GEO_BOUNDS.minLat)) * 700;
  const x = ((lng - RESORT_GEO_BOUNDS.minLng) / (RESORT_GEO_BOUNDS.maxLng - RESORT_GEO_BOUNDS.minLng)) * 1000;
  return {
    x: Math.max(0, Math.min(1000, Math.round(x))),
    y: Math.max(0, Math.min(700, Math.round(y))),
  };
}

export interface MapPointOfInterest {
  id: string;
  title: string;
  subtitle: string;
  category: 'sports' | 'games' | 'wellness' | 'dining' | 'stay' | 'services' | 'beach';
  categoryLabel: string;
  x: number; // 0 to 1000 coordinate space
  y: number; // 0 to 700 coordinate space
  lat?: number;
  lng?: number;
  nodeId: string;
  icon: string;
  pinColor: string; // Hex color for Google Maps pin teardrop
  badge: string;
  image: string;
  rating: number;
  reviewsCount: number;
  timing: string;
  priceLabel: string;
  isComplimentary: boolean;
  description: string;
  activityId?: string;
  zone: string;
  equipmentProvided?: string[];
  tags: string[];
}

export interface PathNode {
  id: string;
  name: string;
  x: number;
  y: number;
  lat?: number;
  lng?: number;
  neighbors: { id: string; dist: number; instruction?: string }[];
}

export const RESORT_PATH_NODES: Record<string, PathNode> = {
  gate: {
    id: 'gate',
    name: 'Resort Main Entrance & Gate',
    x: 500,
    y: 70,
    neighbors: [
      { id: 'cycle_hub', dist: 20, instruction: 'Head east to the Bicycle Rental Station' },
      { id: 'driveway_north', dist: 45, instruction: 'Proceed south along Royal Palm Boulevard' },
    ],
  },
  cycle_hub: {
    id: 'cycle_hub',
    name: 'Coastal Trail Cycling & Bike Rental Hub',
    x: 580,
    y: 75,
    neighbors: [
      { id: 'gate', dist: 20, instruction: 'Head west back to the Main Gate' },
      { id: 'driveway_north', dist: 50, instruction: 'Cross south towards the Royal Palm Boulevard' },
    ],
  },
  driveway_north: {
    id: 'driveway_north',
    name: 'Royal Palm Boulevard Walkway',
    x: 500,
    y: 125,
    neighbors: [
      { id: 'gate', dist: 45, instruction: 'Head north toward Resort Main Gate' },
      { id: 'lobby_portico', dist: 40, instruction: 'Continue south to Grand Lobby Portico' },
      { id: 'west_parking', dist: 60, instruction: 'Turn right toward West Parking & EV Chargers' },
    ],
  },
  west_parking: {
    id: 'west_parking',
    name: 'West Garden Parking & Buggy Bay',
    x: 380,
    y: 125,
    neighbors: [
      { id: 'driveway_north', dist: 60, instruction: 'Walk east back to Royal Palm Boulevard' },
      { id: 'lobby_west', dist: 50, instruction: 'Walk south to West Wing Veranda' },
    ],
  },
  lobby_portico: {
    id: 'lobby_portico',
    name: 'Grand Reception & Lobby Portico',
    x: 500,
    y: 185,
    neighbors: [
      { id: 'driveway_north', dist: 40, instruction: 'Head north onto Royal Palm Boulevard' },
      { id: 'lobby_west', dist: 70, instruction: 'Turn right towards the Garden Wing corridor' },
      { id: 'lobby_east', dist: 70, instruction: 'Turn left towards the Sports Turf Grounds' },
      { id: 'central_walk_north', dist: 45, instruction: 'Walk through lobby south towards the Infinity Pool' },
    ],
  },
  lobby_west: {
    id: 'lobby_west',
    name: 'West Wing Corridor & Arcade Veranda',
    x: 350,
    y: 195,
    neighbors: [
      { id: 'lobby_portico', dist: 70, instruction: 'Head east back to Grand Lobby Reception' },
      { id: 'garden_wing', dist: 60, instruction: 'Walk west towards Garden Deluxe Suites' },
      { id: 'game_lounge', dist: 40, instruction: 'Enter the Clubhouse Game Lounge' },
      { id: 'chess_pavilion', dist: 55, instruction: 'Walk south-east toward Chess Pavilion' },
    ],
  },
  garden_wing: {
    id: 'garden_wing',
    name: 'Garden Wing Deluxe Suites (Rooms 101-206)',
    x: 230,
    y: 205,
    neighbors: [
      { id: 'lobby_west', dist: 60, instruction: 'Head east along the covered veranda corridor' },
      { id: 'spa_walkway', dist: 80, instruction: 'Walk south along the frangipani pathway to Spa' },
    ],
  },
  game_lounge: {
    id: 'game_lounge',
    name: 'Clubhouse Indoor Game Lounge',
    x: 310,
    y: 245,
    neighbors: [
      { id: 'lobby_west', dist: 40, instruction: 'Exit north towards the West Wing Corridor' },
      { id: 'chess_pavilion', dist: 45, instruction: 'Walk south-east to Grandmaster Chess Pavilion' },
      { id: 'table_tennis', dist: 25, instruction: 'Step into Championship Table Tennis Arena' },
    ],
  },
  table_tennis: {
    id: 'table_tennis',
    name: 'Table Tennis Arena & Darts Zone',
    x: 270,
    y: 255,
    neighbors: [
      { id: 'game_lounge', dist: 25, instruction: 'Step into the main Game Lounge' },
      { id: 'garden_wing', dist: 45, instruction: 'Exit west to Garden Wing Suites' },
    ],
  },
  chess_pavilion: {
    id: 'chess_pavilion',
    name: 'Grandmaster Chess Garden Pavilion',
    x: 380,
    y: 270,
    neighbors: [
      { id: 'game_lounge', dist: 45, instruction: 'Walk north-west to the Game Lounge' },
      { id: 'central_walk_north', dist: 60, instruction: 'Walk east towards Central Palm Walkway' },
      { id: 'pool_west', dist: 50, instruction: 'Walk south to Infinity Pool West Deck' },
    ],
  },
  lobby_east: {
    id: 'lobby_east',
    name: 'East Sports Promenade Junction',
    x: 650,
    y: 195,
    neighbors: [
      { id: 'lobby_portico', dist: 70, instruction: 'Head west to Grand Lobby Reception' },
      { id: 'cricket_pitch', dist: 55, instruction: 'Step directly onto Box Cricket Pitch & Kit' },
      { id: 'badminton_court', dist: 65, instruction: 'Walk south-east to Outdoor Badminton Court' },
      { id: 'sports_hub', dist: 50, instruction: 'Walk east to Courtyard Basketball Arena' },
      { id: 'central_walk_north', dist: 75, instruction: 'Walk south-west to Central Palm Promenade' },
    ],
  },
  cricket_pitch: {
    id: 'cricket_pitch',
    name: 'Box Cricket Pitch & Kit (Sports Turf Ground)',
    x: 760,
    y: 190,
    neighbors: [
      { id: 'lobby_east', dist: 55, instruction: 'Head west back to East Promenade Junction' },
      { id: 'badminton_court', dist: 45, instruction: 'Walk south to the adjoining Outdoor Badminton Court' },
      { id: 'sports_hub', dist: 40, instruction: 'Walk east to Mini Basketball Shootout' },
    ],
  },
  badminton_court: {
    id: 'badminton_court',
    name: 'Outdoor Badminton Court',
    x: 760,
    y: 260,
    neighbors: [
      { id: 'cricket_pitch', dist: 45, instruction: 'Walk north to Box Cricket Pitch' },
      { id: 'lobby_east', dist: 65, instruction: 'Walk north-west to East Promenade Junction' },
      { id: 'dining_terrace', dist: 65, instruction: 'Walk south to Spice Garden Restaurant Terrace' },
    ],
  },
  sports_hub: {
    id: 'sports_hub',
    name: 'Courtyard Mini Basketball Arena',
    x: 840,
    y: 215,
    neighbors: [
      { id: 'cricket_pitch', dist: 40, instruction: 'Walk west to Box Cricket Pitch' },
      { id: 'badminton_court', dist: 50, instruction: 'Walk south-west to Badminton Court' },
    ],
  },
  central_walk_north: {
    id: 'central_walk_north',
    name: 'Central Palm Promenade North',
    x: 500,
    y: 260,
    neighbors: [
      { id: 'lobby_portico', dist: 45, instruction: 'Head north to Grand Lobby' },
      { id: 'chess_pavilion', dist: 60, instruction: 'Turn right to Grandmaster Chess Pavilion' },
      { id: 'lobby_east', dist: 75, instruction: 'Turn left to Sports Turf Promenade' },
      { id: 'pool_north', dist: 35, instruction: 'Walk straight south to Infinity Pool North Deck' },
    ],
  },
  pool_north: {
    id: 'pool_north',
    name: 'Azure Infinity Pool & Jacuzzi North Deck',
    x: 500,
    y: 310,
    neighbors: [
      { id: 'central_walk_north', dist: 35, instruction: 'Head north along Central Palm Promenade' },
      { id: 'pool_west', dist: 50, instruction: 'Walk around pool to West Cabana Deck' },
      { id: 'pool_east', dist: 50, instruction: 'Walk around pool to East Poolside Bar' },
    ],
  },
  pool_west: {
    id: 'pool_west',
    name: 'Poolside Cabanas & Sun Loungers West',
    x: 410,
    y: 365,
    neighbors: [
      { id: 'pool_north', dist: 50, instruction: 'Walk along pool edge to North Deck' },
      { id: 'chess_pavilion', dist: 50, instruction: 'Walk north-west to Chess Pavilion' },
      { id: 'spa_walkway', dist: 70, instruction: 'Walk west toward Nirvana Ayurvedic Spa' },
      { id: 'pool_south', dist: 50, instruction: 'Walk south to Oceanview Infinity Pool Deck' },
    ],
  },
  pool_east: {
    id: 'pool_east',
    name: 'Poolside Terrace & Refreshment Bar',
    x: 590,
    y: 365,
    neighbors: [
      { id: 'pool_north', dist: 50, instruction: 'Walk along pool edge to North Deck' },
      { id: 'dining_terrace', dist: 45, instruction: 'Walk east into Spice Garden Restaurant' },
      { id: 'pool_south', dist: 50, instruction: 'Walk south to Oceanview Pool Deck' },
    ],
  },
  pool_south: {
    id: 'pool_south',
    name: 'Azure Infinity Pool Oceanview Edge',
    x: 500,
    y: 420,
    neighbors: [
      { id: 'pool_west', dist: 50, instruction: 'Walk north-west along poolside cabanas' },
      { id: 'pool_east', dist: 50, instruction: 'Walk north-east along poolside bar' },
      { id: 'villa_junction', dist: 45, instruction: 'Walk south towards Beachfront Luxury Villas' },
    ],
  },
  dining_terrace: {
    id: 'dining_terrace',
    name: 'Spice Garden Fine Dining & Alfresco Terrace',
    x: 680,
    y: 370,
    neighbors: [
      { id: 'pool_east', dist: 45, instruction: 'Walk west to Azure Poolside Bar' },
      { id: 'badminton_court', dist: 65, instruction: 'Walk north to Badminton Court and Cricket Turf' },
      { id: 'villa_east', dist: 60, instruction: 'Walk south to Presidential Villa Promenade' },
    ],
  },
  spa_walkway: {
    id: 'spa_walkway',
    name: 'The Palms Ayurvedic Spa & Wellness Sanctuary',
    x: 260,
    y: 370,
    neighbors: [
      { id: 'pool_west', dist: 70, instruction: 'Walk east towards Central Infinity Pool' },
      { id: 'garden_wing', dist: 80, instruction: 'Walk north to Garden Deluxe Suites' },
      { id: 'botanical_trail', dist: 60, instruction: 'Follow nature trail west to Botanical Nursery' },
      { id: 'yoga_lawn', dist: 50, instruction: 'Walk south to Morning Yoga & Meditation Lawn' },
    ],
  },
  botanical_trail: {
    id: 'botanical_trail',
    name: 'Botanical Nursery & Butterfly Sanctuary',
    x: 140,
    y: 370,
    neighbors: [
      { id: 'spa_walkway', dist: 60, instruction: 'Walk east back to Spa Sanctuary' },
      { id: 'yoga_lawn', dist: 65, instruction: 'Walk south-east to Yoga Lawn' },
    ],
  },
  yoga_lawn: {
    id: 'yoga_lawn',
    name: 'Ocean Breeze Yoga & Meditation Lawn',
    x: 260,
    y: 460,
    neighbors: [
      { id: 'spa_walkway', dist: 50, instruction: 'Walk north to Spa Wellness Pavilion' },
      { id: 'botanical_trail', dist: 65, instruction: 'Walk north-west to Botanical Nursery' },
      { id: 'villa_west', dist: 55, instruction: 'Walk east to Plunge Pool Villa 1' },
      { id: 'beach_west', dist: 60, instruction: 'Head south down to the Beachfront Dunes' },
    ],
  },
  villa_junction: {
    id: 'villa_junction',
    name: 'Beachfront Villa Central Walkway',
    x: 500,
    y: 480,
    neighbors: [
      { id: 'pool_south', dist: 45, instruction: 'Head north to Central Infinity Pool Deck' },
      { id: 'villa_west', dist: 70, instruction: 'Turn right towards Villa 1 & Sunset Suites' },
      { id: 'villa_east', dist: 70, instruction: 'Turn left towards Presidential Suite & Villa 2' },
      { id: 'beach_boardwalk', dist: 50, instruction: 'Walk straight south towards Beachfront Boardwalk' },
    ],
  },
  villa_west: {
    id: 'villa_west',
    name: 'Private Plunge Pool Villas (Villa 1 & 3)',
    x: 360,
    y: 495,
    neighbors: [
      { id: 'villa_junction', dist: 70, instruction: 'Walk east to Villa Central Walkway' },
      { id: 'yoga_lawn', dist: 55, instruction: 'Walk west to Ocean Breeze Yoga Lawn' },
      { id: 'beach_west', dist: 50, instruction: 'Walk south towards the Shoreline Beach Shacks' },
    ],
  },
  villa_east: {
    id: 'villa_east',
    name: 'Presidential Ocean Villa & Suite 302',
    x: 650,
    y: 495,
    neighbors: [
      { id: 'villa_junction', dist: 70, instruction: 'Walk west to Villa Central Walkway' },
      { id: 'dining_terrace', dist: 60, instruction: 'Walk north to Spice Garden Restaurant' },
      { id: 'beach_east', dist: 50, instruction: 'Walk south to Sunrise Point Boardwalk' },
    ],
  },
  beach_boardwalk: {
    id: 'beach_boardwalk',
    name: 'Resort Beach Promenade & Sand Boardwalk',
    x: 500,
    y: 550,
    neighbors: [
      { id: 'villa_junction', dist: 50, instruction: 'Walk north into resort villa grounds' },
      { id: 'beach_west', dist: 75, instruction: 'Walk west along dunes to Sunset Point' },
      { id: 'beach_east', dist: 75, instruction: 'Walk east along beach to Water Sports Shack' },
      { id: 'beach_bonfire', dist: 50, instruction: 'Walk south directly onto the sand for Sunset Bonfire' },
    ],
  },
  beach_west: {
    id: 'beach_west',
    name: 'Sunset Lookout Point & Sand Dunes',
    x: 320,
    y: 570,
    neighbors: [
      { id: 'beach_boardwalk', dist: 75, instruction: 'Walk east along the promenade' },
      { id: 'villa_west', dist: 50, instruction: 'Walk north into Private Villa grounds' },
      { id: 'beach_bonfire', dist: 65, instruction: 'Walk south-east to Sunset Beach Bonfire' },
    ],
  },
  beach_east: {
    id: 'beach_east',
    name: 'Ocean Watersports & Kayak Pier',
    x: 680,
    y: 570,
    neighbors: [
      { id: 'beach_boardwalk', dist: 75, instruction: 'Walk west along the promenade' },
      { id: 'villa_east', dist: 50, instruction: 'Walk north to Presidential Ocean Villa' },
      { id: 'beach_bonfire', dist: 65, instruction: 'Walk south-west to Sunset Beach Bonfire' },
    ],
  },
  beach_bonfire: {
    id: 'beach_bonfire',
    name: 'Sunset Beach Bonfire & Ocean Shoreline',
    x: 500,
    y: 630,
    neighbors: [
      { id: 'beach_boardwalk', dist: 50, instruction: 'Head north back onto resort boardwalk' },
      { id: 'beach_west', dist: 65, instruction: 'Walk north-west to Sunset Point' },
      { id: 'beach_east', dist: 65, instruction: 'Walk north-east to Kayak Pier' },
    ],
  },
};

export const RESORT_MAP_POINTS: MapPointOfInterest[] = [
  {
    id: 'point-box-cricket',
    title: 'Box Cricket Pitch & Kit',
    subtitle: 'Floodlit artificial turf cricket arena with kit',
    category: 'sports',
    categoryLabel: 'Sports & Games',
    x: 760,
    y: 190,
    nodeId: 'cricket_pitch',
    icon: '🏏',
    pinColor: '#EA4335', // Google Maps red
    badge: 'Popular Activity',
    image: BOX_CRICKET_IMAGE,
    rating: 4.9,
    reviewsCount: 142,
    timing: '06:30 - 21:00 Daily',
    priceLabel: '₹450 / person / hr',
    isComplimentary: false,
    description:
      'Championship-grade floodlit artificial grass turf box cricket arena complete with SS Kashmir willow bats, tennis balls, pads, and match stumps. Night lighting available!',
    activityId: 'act-cricket',
    zone: 'Sports Turf Ground',
    equipmentProvided: [
      'SS Kashmir Willow Bats',
      'Heavy Tennis Balls',
      'Protective Leg Guards & Gloves',
      'Electronic Over Counter',
    ],
    tags: ['Cricket', 'Sports', 'Outdoor', 'Evening Lights', 'Team Game'],
  },
  {
    id: 'point-badminton',
    title: 'Outdoor Badminton Court',
    subtitle: 'Non-slip synthetic floodlit badminton arena',
    category: 'sports',
    categoryLabel: 'Sports & Games',
    x: 760,
    y: 260,
    nodeId: 'badminton_court',
    icon: '🏸',
    pinColor: '#EA4335',
    badge: 'Open Now',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    reviewsCount: 96,
    timing: '06:00 - 21:00 Daily',
    priceLabel: '₹250 / person / hr',
    isComplimentary: false,
    description:
      'Non-slip synthetic outdoor badminton court with Yonex carbon racquets, feather/nylon shuttles, and anti-glare evening illumination.',
    activityId: 'act-badminton',
    zone: 'Palm Courtyard Courts',
    equipmentProvided: ['Yonex Carbon Racquets', 'Yonex Mavis 350 Shuttles', 'Netting & Boundary Markers'],
    tags: ['Badminton', 'Sports', 'Racket Game', 'Floodlit'],
  },
  {
    id: 'point-basketball',
    title: 'Mini Basketball Shootout',
    subtitle: 'Spring breakaway hoop & shootout counter',
    category: 'sports',
    categoryLabel: 'Sports & Games',
    x: 840,
    y: 215,
    nodeId: 'sports_hub',
    icon: '🏀',
    pinColor: '#EA4335',
    badge: 'Arcade Sports',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    rating: 4.7,
    reviewsCount: 78,
    timing: '08:00 - 20:00 Daily',
    priceLabel: '₹200 / hr',
    isComplimentary: false,
    description:
      'Mini basketball half-court with spring-action breakaway rim, rubberized grip flooring, and automated shot clock challenge.',
    activityId: 'act-mini-basket',
    zone: 'Courtyard Arena',
    equipmentProvided: ['Wilson Composite Basketballs', 'Shot Clock', 'Mini Ball Set for Kids'],
    tags: ['Basketball', 'Shootout', 'Sports', 'Courtyard'],
  },
  {
    id: 'point-table-tennis',
    title: 'Table Tennis Championship Arena',
    subtitle: 'Stiga tournament tables in AC Clubhouse',
    category: 'games',
    categoryLabel: 'Indoor Games',
    x: 270,
    y: 255,
    nodeId: 'table_tennis',
    icon: '🏓',
    pinColor: '#FBBC04', // Google Maps gold/amber
    badge: 'Indoor AC',
    image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    reviewsCount: 110,
    timing: '08:00 - 22:00 Daily',
    priceLabel: '₹150 / hr',
    isComplimentary: false,
    description:
      'Championship-grade indoor table tennis with Stiga tournament paddles, competition 3-star balls, and non-glare overhead lighting.',
    activityId: 'act-table-tennis',
    zone: 'Clubhouse Level 1',
    equipmentProvided: ['Stiga Pro Carbon Bats', 'ITTF Approved Balls', 'Scoreboard'],
    tags: ['Table Tennis', 'Ping Pong', 'Indoor Games', 'Clubhouse'],
  },
  {
    id: 'point-carrom-darts',
    title: 'Club Carrom & Precision Darts Zone',
    subtitle: 'Tournament carrom boards & sisal dartboards',
    category: 'games',
    categoryLabel: 'Indoor Games',
    x: 310,
    y: 245,
    nodeId: 'game_lounge',
    icon: '🎯',
    pinColor: '#FBBC04',
    badge: 'Lounge Fun',
    image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    reviewsCount: 88,
    timing: '08:00 - 22:00 Daily',
    priceLabel: '₹120 / hr',
    isComplimentary: false,
    description:
      'English birch plywood tournament carrom boards with precision acrylic strikers, plus professional steel-tip sisal dartboards.',
    activityId: 'act-carrom',
    zone: 'Game Lounge',
    equipmentProvided: ['Acrylic Strikers & Boric Powder', 'Steel-tip Darts', 'Chalkboards'],
    tags: ['Carrom', 'Darts', 'Lounge', 'Games'],
  },
  {
    id: 'point-chess',
    title: 'Grandmaster Chess Pavilion',
    subtitle: 'Hand-carved wooden boards in open-air veranda',
    category: 'games',
    categoryLabel: 'Indoor Games',
    x: 380,
    y: 270,
    nodeId: 'chess_pavilion',
    icon: '♟️',
    pinColor: '#FBBC04',
    badge: 'Mind Games',
    image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    reviewsCount: 65,
    timing: '08:00 - 22:00 Daily',
    priceLabel: '₹100 / hr',
    isComplimentary: false,
    description:
      'Hand-carved Staunton wooden tournament chess boards and digital blitz chess timers placed in a serene, shaded garden veranda.',
    activityId: 'act-chess',
    zone: 'Garden Pavilion',
    equipmentProvided: ['Staunton Weighted Pieces', 'DGT Digital Clocks', 'Garden Veranda Seating'],
    tags: ['Chess', 'Mind Sports', 'Relaxation', 'Garden'],
  },
  {
    id: 'point-pool',
    title: 'Azure Infinity Pool & Heated Jacuzzi',
    subtitle: 'Two-tiered crystal horizon pool overlooking sea',
    category: 'wellness',
    categoryLabel: 'Pool & Water',
    x: 500,
    y: 360,
    nodeId: 'pool_north',
    icon: '🏊',
    pinColor: '#1A73E8', // Google Maps blue
    badge: 'Complimentary for Stay Guests',
    image: heroImg,
    rating: 4.9,
    reviewsCount: 380,
    timing: '06:00 - 21:00 Daily',
    priceLabel: 'Free for Resident Guests',
    isComplimentary: true,
    description:
      'Two-tiered crystal horizon infinity swimming pool with heated underwater jacuzzi jets, poolside sunbeds, cabanas, and towel service.',
    activityId: 'act-swimming-pool',
    zone: 'Central Ocean Deck',
    equipmentProvided: ['Fresh Pool Towels', 'Sun Loungers & Umbrellas', 'Floaters for Kids'],
    tags: ['Swimming Pool', 'Jacuzzi', 'Water', 'Sun Loungers', 'Free Access'],
  },
  {
    id: 'point-spa',
    title: 'The Palms Ayurvedic Spa & Wellness',
    subtitle: 'Authentic Kerala herbal therapies & steam sauna',
    category: 'wellness',
    categoryLabel: 'Wellness & Spa',
    x: 260,
    y: 370,
    nodeId: 'spa_walkway',
    icon: '🌿',
    pinColor: '#0F9D58', // Google Maps green
    badge: 'Holistic Sanctuary',
    image: spaImg,
    rating: 4.9,
    reviewsCount: 220,
    timing: '08:00 - 20:00 (Hourly bookings)',
    priceLabel: '₹2,500 / 60 mins',
    isComplimentary: false,
    description:
      'Holistic rejuvenation with warm herbal medicated oils, private rain shower suites, aromatherapy, and certified therapists.',
    activityId: 'act-spa',
    zone: 'Wellness Pavilion',
    equipmentProvided: ['Herbal Oils', 'Steam Sauna', 'Warm Towels & Organic Green Tea'],
    tags: ['Spa', 'Ayurveda', 'Massage', 'Wellness', 'Relaxation'],
  },
  {
    id: 'point-yoga',
    title: 'Ocean Breeze Yoga & Meditation Lawn',
    subtitle: 'Sunrise vinyasa & Tibetan sound bowl sessions',
    category: 'wellness',
    categoryLabel: 'Wellness & Spa',
    x: 260,
    y: 460,
    nodeId: 'yoga_lawn',
    icon: '🧘',
    pinColor: '#0F9D58',
    badge: 'Morning Session Free',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    reviewsCount: 175,
    timing: '06:30 - 08:00 & 17:30 - 19:00',
    priceLabel: 'Free Morning Guided Session',
    isComplimentary: true,
    description:
      'Lush green beachfront lawn overlooking breaking waves, offering morning pranayama, yoga mats, and sunset mindfulness meditation.',
    zone: 'Lawn Area South-West',
    equipmentProvided: ['Manduka Eco Yoga Mats', 'Cork Yoga Blocks', 'Meditation Cushions'],
    tags: ['Yoga', 'Meditation', 'Sunrise', 'Wellness', 'Free'],
  },
  {
    id: 'point-dining',
    title: 'Spice Garden Multi-Cuisine Restaurant',
    subtitle: 'Fine dining, Goan seafood & wood-fired pizza',
    category: 'dining',
    categoryLabel: 'Food & Dining',
    x: 680,
    y: 370,
    nodeId: 'dining_terrace',
    icon: '🍽️',
    pinColor: '#FF6D00', // Google Maps orange
    badge: 'Signature Dining',
    image: diningImg,
    rating: 4.8,
    reviewsCount: 450,
    timing: '07:00 - 23:30 Daily',
    priceLabel: 'A La Carte & Buffet',
    isComplimentary: false,
    description:
      'Award-winning open-air resort dining serving authentic Goan coastal delicacies, North Indian curries, wood-fired artisanal pizzas, and handcrafted cocktails.',
    zone: 'Dining Terrace East',
    tags: ['Restaurant', 'Dining', 'Bar', 'Seafood', 'Cocktails'],
  },
  {
    id: 'point-reception',
    title: 'Grand Lobby & Reception Desk',
    subtitle: '24/7 Check-in, concierge, baggage & valet',
    category: 'services',
    categoryLabel: 'Resort Services',
    x: 500,
    y: 185,
    nodeId: 'lobby_portico',
    icon: '🏨',
    pinColor: '#1A73E8',
    badge: '24/7 Open',
    image: heroImg,
    rating: 4.9,
    reviewsCount: 520,
    timing: 'Open 24 Hours',
    priceLabel: 'Guest Services',
    isComplimentary: true,
    description:
      'Grand open-air lobby featuring teakwood architecture, front desk check-in, keycards, guest folio, money exchange, and travel concierge.',
    zone: 'Central Complex',
    tags: ['Reception', 'Lobby', 'Concierge', 'Check-in', 'Valet'],
  },
  {
    id: 'point-cycling',
    title: 'Coastal Trail Cycling & Bike Rental',
    subtitle: 'Hybrid geared mountain bikes & coastal GPS maps',
    category: 'sports',
    categoryLabel: 'Sports & Games',
    x: 580,
    y: 75,
    nodeId: 'cycle_hub',
    icon: '🚲',
    pinColor: '#EA4335',
    badge: 'Trail Adventure',
    image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    reviewsCount: 89,
    timing: '06:30 - 18:30 Daily',
    priceLabel: '₹200 / 2 hrs',
    isComplimentary: false,
    description:
      'Premium 21-speed hybrid bicycles with safety helmets, digital route map, and handlebar phone mounts for touring Goan coastal paths.',
    activityId: 'act-cycling',
    zone: 'Resort Main Gate',
    equipmentProvided: ['Hybrid Bicycles', 'Safety Helmets', 'Air Pump & Mobile Mount'],
    tags: ['Cycling', 'Bicycle', 'Sports', 'Tour', 'Gate'],
  },
  {
    id: 'point-bonfire',
    title: 'Sunset Beach Bonfire & Live Music',
    subtitle: 'Marshmallows, beach guitars & ocean waves',
    category: 'beach',
    categoryLabel: 'Beach & Shore',
    x: 500,
    y: 630,
    nodeId: 'beach_bonfire',
    icon: '🔥',
    pinColor: '#E91E63', // Rose/Magenta
    badge: 'Every Evening 7:30 PM',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    reviewsCount: 310,
    timing: '19:30 - 21:30 Every Evening',
    priceLabel: 'Complimentary for All Guests',
    isComplimentary: true,
    description:
      'Gather around the beach fire pit on the sand with complimentary marshmallows, acoustic guitarists, and sunset ocean views.',
    activityId: 'act-bonfire',
    zone: 'Private Shoreline',
    tags: ['Bonfire', 'Beach', 'Sunset', 'Live Music', 'Complimentary'],
  },
  {
    id: 'point-villas',
    title: 'Presidential Oceanfront Villa',
    subtitle: 'Ultra-luxury 3,200 sq.ft villa with private plunge pool',
    category: 'stay',
    categoryLabel: 'Villas & Rooms',
    x: 650,
    y: 495,
    nodeId: 'villa_east',
    icon: '👑',
    pinColor: '#9C27B0', // Purple
    badge: 'Top Luxury Stay',
    image: presidentialImg,
    rating: 5.0,
    reviewsCount: 64,
    timing: 'Check-in 14:00 • Check-out 11:00',
    priceLabel: '₹25,000 / night',
    isComplimentary: false,
    description:
      'Direct oceanfront master villa with private lap pool, sundeck, butler service, jacuzzi, and panoramic Arabian Sea views.',
    zone: 'Oceanfront Villa Enclave',
    tags: ['Presidential Villa', 'Luxury', 'Plunge Pool', 'Oceanfront'],
  },
  {
    id: 'point-deluxe-wing',
    title: 'Garden Wing Deluxe Suites (Rooms 101-206)',
    subtitle: 'Private garden balconies & teak furnishings',
    category: 'stay',
    categoryLabel: 'Villas & Rooms',
    x: 230,
    y: 205,
    nodeId: 'garden_wing',
    icon: '🛏️',
    pinColor: '#9C27B0',
    badge: 'Popular Guest Stay',
    image: simpleRoomImg,
    rating: 4.8,
    reviewsCount: 290,
    timing: 'Check-in 14:00 • Check-out 11:00',
    priceLabel: 'From ₹4,500 / night',
    isComplimentary: false,
    description:
      'Spacious 420 sq.ft rooms with king-size four-poster beds, garden view balconies, rain showers, and direct access to the game lounge.',
    zone: 'West Garden Wing',
    tags: ['Deluxe Room', 'Suites', 'Garden View', 'Balcony'],
  },
];

// Dijkstra shortest path calculation on the resort walkway network
export function findResortRoute(
  startNodeId: string,
  targetNodeId: string
): {
  path: { id: string; name: string; x: number; y: number; instruction?: string }[];
  totalDistance: number; // in meters
  walkTimeMinutes: number;
  buggyTimeMinutes: number;
  bikeTimeMinutes: number;
  stepInstructions: string[];
} {
  const nodes = RESORT_PATH_NODES;
  if (!nodes[startNodeId] || !nodes[targetNodeId]) {
    // Fallback if missing
    const fallbackStart = nodes[startNodeId] || nodes['lobby_portico'];
    const fallbackTarget = nodes[targetNodeId] || nodes['cricket_pitch'];
    return {
      path: [fallbackStart, fallbackTarget],
      totalDistance: 120,
      walkTimeMinutes: 2,
      buggyTimeMinutes: 1,
      bikeTimeMinutes: 1,
      stepInstructions: [
        `Start from ${fallbackStart.name}`,
        `Follow the central stone walkway for 120m`,
        `Arrive at ${fallbackTarget.name}`,
      ],
    };
  }

  if (startNodeId === targetNodeId) {
    const node = nodes[startNodeId];
    return {
      path: [node],
      totalDistance: 0,
      walkTimeMinutes: 0,
      buggyTimeMinutes: 0,
      bikeTimeMinutes: 0,
      stepInstructions: [`You are already at ${node.name}`],
    };
  }

  // Priority queue / distances map
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const edgeInstruction: Record<string, string> = {};
  const unvisited = new Set<string>();

  for (const id in nodes) {
    distances[id] = Infinity;
    previous[id] = null;
    unvisited.add(id);
  }

  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    // Pick unvisited node with smallest distance
    let currentId: string | null = null;
    let shortest = Infinity;
    for (const id of unvisited) {
      if (distances[id] < shortest) {
        shortest = distances[id];
        currentId = id;
      }
    }

    if (!currentId || distances[currentId] === Infinity) break;
    if (currentId === targetNodeId) break;

    unvisited.delete(currentId);

    const currentNode = nodes[currentId];
    for (const neighbor of currentNode.neighbors) {
      if (!unvisited.has(neighbor.id)) continue;
      const alt = distances[currentId] + neighbor.dist;
      if (alt < distances[neighbor.id]) {
        distances[neighbor.id] = alt;
        previous[neighbor.id] = currentId;
        edgeInstruction[neighbor.id] = neighbor.instruction || `Head towards ${nodes[neighbor.id]?.name || neighbor.id}`;
      }
    }
  }

  // Reconstruct path
  const pathIds: string[] = [];
  let curr: string | null = targetNodeId;
  while (curr) {
    pathIds.unshift(curr);
    curr = previous[curr];
  }

  const path = pathIds.map((id) => ({
    id,
    name: nodes[id].name,
    x: nodes[id].x,
    y: nodes[id].y,
    instruction: edgeInstruction[id],
  }));

  const totalDistMeters = Math.round(distances[targetNodeId] === Infinity ? 100 : distances[targetNodeId]);
  const walkMinutes = Math.max(1, Math.round(totalDistMeters / 60)); // ~1m/s = 60m/min
  const buggyMinutes = Math.max(1, Math.round(totalDistMeters / 250)); // ~15km/h
  const bikeMinutes = Math.max(1, Math.round(totalDistMeters / 200)); // ~12km/h

  const stepInstructions: string[] = [];
  stepInstructions.push(`Start from ${nodes[startNodeId].name}`);

  for (let i = 1; i < path.length; i++) {
    const node = path[i];
    const prev = path[i - 1];
    const edge = nodes[prev.id]?.neighbors.find((n) => n.id === node.id);
    const dist = edge ? edge.dist : 30;
    const desc = edge?.instruction || `Continue along the paved walkway towards ${node.name}`;
    stepInstructions.push(`${desc} (${dist} m)`);
  }
  stepInstructions.push(`Arrive at ${nodes[targetNodeId].name}`);

  return {
    path,
    totalDistance: totalDistMeters,
    walkTimeMinutes: walkMinutes,
    buggyTimeMinutes: buggyMinutes,
    bikeTimeMinutes: bikeMinutes,
    stepInstructions,
  };
}
