import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  Navigation,
  MapPin,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  X,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Clock,
  ChevronRight,
  Footprints,
  Bike,
  Car,
  RotateCcw,
  CheckCircle2,
  ArrowUpDown,
  Locate,
  Flame,
  Zap,
  Eye,
  SlidersHorizontal,
  Share2,
  Mic,
  Calendar,
  Award,
  AlertCircle,
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useHotel } from '../../context/HotelContext';
import {
  RESORT_MAP_POINTS,
  RESORT_PATH_NODES,
  MapPointOfInterest,
  findResortRoute,
  latLngToXy,
  xyToLatLng,
} from '../../data/resortMapData';
import { LeafletResortMap } from './LeafletResortMap';

// Map view styling modes
type MapStyleMode = 'google_street' | 'google_satellite' | 'night_floodlit' | 'real_gps';
type TravelMode = 'walk' | 'buggy' | 'bike';

export const ResortMapSection: React.FC = () => {
  const { setGuestTab, activeGuestRoom } = useHotel();

  // Primary Map Style Mode: Default is Google Maps Street Cartography of Fake Hotel Grounds
  const [mapStyle, setMapStyle] = useState<MapStyleMode>('google_street');

  // SVG Pan & Zoom State
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // In-app visual notification toast (replaces window.alert)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPoint, setSelectedPoint] = useState<MapPointOfInterest | null>(
    RESORT_MAP_POINTS.find((p) => p.id === 'point-box-cricket') || RESORT_MAP_POINTS[0]
  );

  // Directions / Navigation Drawer State
  const [navPanelOpen, setNavPanelOpen] = useState(false);
  const [originNodeId, setOriginNodeId] = useState<string>('lobby_portico');
  const [destinationPointId, setDestinationPointId] = useState<string>('point-box-cricket');
  const [travelMode, setTravelMode] = useState<TravelMode>('walk');

  // Live Navigation & GPS Tracer State
  const [userLocation, setUserLocation] = useState<{ x: number; y: number; nodeId: string; heading: number }>({
    x: 500,
    y: 185,
    nodeId: 'lobby_portico',
    heading: 180,
  });
  const [isLiveNavigating, setIsLiveNavigating] = useState(false);
  const [navProgressIndex, setNavProgressIndex] = useState(0);
  const [navProgressT, setNavProgressT] = useState(0); // 0 to 1 between nodes
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [cameraFollow, setCameraFollow] = useState(true);
  const [arrivedModalOpen, setArrivedModalOpen] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);

  // Synchronize guest room with starting location
  useEffect(() => {
    if (activeGuestRoom === 'Villa 1') {
      setUserLocation({ x: 360, y: 495, nodeId: 'villa_west', heading: 90 });
      setOriginNodeId('villa_west');
    } else if (activeGuestRoom === '302') {
      setUserLocation({ x: 650, y: 495, nodeId: 'villa_east', heading: 270 });
      setOriginNodeId('villa_east');
    } else if (activeGuestRoom === '204') {
      setUserLocation({ x: 230, y: 205, nodeId: 'garden_wing', heading: 90 });
      setOriginNodeId('garden_wing');
    }
  }, [activeGuestRoom]);

  // Destination point object
  const destinationPoint = useMemo(() => {
    return RESORT_MAP_POINTS.find((p) => p.id === destinationPointId) || RESORT_MAP_POINTS[0];
  }, [destinationPointId]);

  // Calculated route using Dijkstra
  const currentRoute = useMemo(() => {
    return findResortRoute(originNodeId, destinationPoint.nodeId);
  }, [originNodeId, destinationPoint.nodeId]);

  // Filtered Points for search & category pills
  const filteredPoints = useMemo(() => {
    return RESORT_MAP_POINTS.filter((p) => {
      const matchesCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'sports' && (p.category === 'sports' || p.category === 'games')) ||
        (selectedCategory === 'games' && p.category === 'games') ||
        (selectedCategory === 'dining' && p.category === 'dining') ||
        (selectedCategory === 'wellness' && p.category === 'wellness') ||
        (selectedCategory === 'stay' && p.category === 'stay') ||
        (selectedCategory === 'beach' && p.category === 'beach');

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.zone.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Speech synthesis announcement
  const speakInstruction = useCallback(
    (text: string) => {
      if (voiceMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Ignore audio errors gracefully
      }
    },
    [voiceMuted]
  );

  // Live Navigation Animation & GPS Tracer Loop
  useEffect(() => {
    if (!isLiveNavigating || currentRoute.path.length <= 1) return;

    const path = currentRoute.path;
    const intervalMs = 60;
    // Speed multiplier based on travel mode and simulation pace
    const stepIncrement =
      0.022 * simSpeed * (travelMode === 'buggy' ? 2.4 : travelMode === 'bike' ? 1.7 : 1);

    const timer = setInterval(() => {
      setNavProgressT((prevT) => {
        const nextT = prevT + stepIncrement;
        if (nextT >= 1) {
          // Progress to next segment
          setNavProgressIndex((prevIdx) => {
            const nextIdx = prevIdx + 1;
            if (nextIdx >= path.length - 1) {
              // Reached destination!
              setIsLiveNavigating(false);
              setArrivedModalOpen(true);
              speakInstruction(`You have arrived at ${destinationPoint.title}`);
              try {
                confetti({
                  particleCount: 90,
                  spread: 75,
                  origin: { y: 0.6 },
                });
              } catch {
                // confetti fallback
              }
              const finalNode = path[path.length - 1];
              setUserLocation({
                x: finalNode.x,
                y: finalNode.y,
                nodeId: finalNode.id,
                heading: 0,
              });
              return prevIdx;
            } else {
              const nextStep = currentRoute.stepInstructions[nextIdx + 1];
              if (nextStep) speakInstruction(nextStep);
              return nextIdx;
            }
          });
          return 0;
        }

        // Smooth position and heading angle interpolation
        const from = path[navProgressIndex];
        const to = path[Math.min(navProgressIndex + 1, path.length - 1)];
        if (from && to) {
          const curX = from.x + (to.x - from.x) * nextT;
          const curY = from.y + (to.y - from.y) * nextT;
          const angleRad = Math.atan2(to.y - from.y, to.x - from.x);
          const headingDeg = (angleRad * 180) / Math.PI + 90;

          setUserLocation({
            x: Math.round(curX),
            y: Math.round(curY),
            nodeId: from.id,
            heading: Math.round(headingDeg),
          });

          // Camera follow: Keep the user location centered on the canvas
          if (cameraFollow && mapStyle !== 'real_gps') {
            setPanOffset({
              x: (500 - curX) * zoom,
              y: (350 - curY) * zoom,
            });
          }
        }
        return nextT;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [
    isLiveNavigating,
    currentRoute,
    navProgressIndex,
    simSpeed,
    travelMode,
    destinationPoint.title,
    cameraFollow,
    mapStyle,
    zoom,
    speakInstruction,
  ]);

  // Start Live Navigation
  const handleStartLiveNavigation = () => {
    setIsLiveNavigating(true);
    setNavProgressIndex(0);
    setNavProgressT(0);
    setNavPanelOpen(false); // Close drawer to reveal the live map and in-ride HUD
    const firstStep = currentRoute.stepInstructions[1] || currentRoute.stepInstructions[0];
    speakInstruction(`Starting navigation to ${destinationPoint.title}. ${firstStep}`);
    showToast(`Live Navigation started to ${destinationPoint.title}`);
  };

  // Stop Live Navigation
  const handleStopLiveNavigation = () => {
    setIsLiveNavigating(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    showToast('Navigation stopped');
  };

  // Swap Origin and Destination
  const handleSwapRoute = () => {
    const prevOrigin = originNodeId;
    const destNode = destinationPoint.nodeId;
    const matchingPoint = RESORT_MAP_POINTS.find((p) => p.nodeId === prevOrigin);
    setOriginNodeId(destNode);
    if (matchingPoint) {
      setDestinationPointId(matchingPoint.id);
      setSelectedPoint(matchingPoint);
    }
  };

  // Turn maneuver and in-ride metrics calculation
  const activeNavigationDetails = useMemo(() => {
    const stepIdx = isLiveNavigating ? navProgressIndex + 1 : 1;
    const instruction = currentRoute.stepInstructions[stepIdx] || currentRoute.stepInstructions[0];

    // Compute remaining distance
    const remainingSegments = currentRoute.path.length - 1 - navProgressIndex;
    const segmentMeters = Math.max(15, Math.round(remainingSegments * 30 * (1 - navProgressT)));

    // Speed and ETA calculation
    const speedKmh = travelMode === 'walk' ? 4.5 : travelMode === 'buggy' ? 14.0 : 9.5;
    const remainingSeconds = Math.round((segmentMeters / (speedKmh * 1000)) * 3600);
    const now = new Date();
    const etaDate = new Date(now.getTime() + remainingSeconds * 1000);
    const etaFormatted = etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Mathematical maneuver angle detection
    let turnDirection: 'straight' | 'right' | 'slight-right' | 'sharp-right' | 'left' | 'slight-left' | 'sharp-left' | 'arrive' = 'straight';
    let turnEmoji = '⬆️';

    if (isLiveNavigating && navProgressIndex >= currentRoute.path.length - 2 && navProgressT > 0.8) {
      turnDirection = 'arrive';
      turnEmoji = '🏁';
    } else if (currentRoute.path.length >= 3 && navProgressIndex < currentRoute.path.length - 1) {
      const pPrev = currentRoute.path[Math.max(0, navProgressIndex)];
      const pCurr = currentRoute.path[Math.min(currentRoute.path.length - 1, navProgressIndex + 1)];
      const pNext = currentRoute.path[Math.min(currentRoute.path.length - 1, navProgressIndex + 2)];

      if (pPrev && pCurr && pNext && pCurr !== pNext) {
        const a1 = Math.atan2(pCurr.y - pPrev.y, pCurr.x - pPrev.x);
        const a2 = Math.atan2(pNext.y - pCurr.y, pNext.x - pCurr.x);
        let diff = ((a2 - a1) * 180) / Math.PI;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;

        if (diff > 45 && diff < 120) {
          turnDirection = 'right';
          turnEmoji = '➡️';
        } else if (diff >= 120) {
          turnDirection = 'sharp-right';
          turnEmoji = '↘️';
        } else if (diff > 15 && diff <= 45) {
          turnDirection = 'slight-right';
          turnEmoji = '↗️';
        } else if (diff < -45 && diff > -120) {
          turnDirection = 'left';
          turnEmoji = '⬅️';
        } else if (diff <= -120) {
          turnDirection = 'sharp-left';
          turnEmoji = '↙️';
        } else if (diff < -15 && diff >= -45) {
          turnDirection = 'slight-left';
          turnEmoji = '↖️';
        }
      }
    }

    return {
      instruction,
      remainingMeters: segmentMeters,
      speedKmh,
      etaFormatted,
      turnDirection,
      turnEmoji,
      progressPercent: Math.min(
        100,
        Math.round(((navProgressIndex + navProgressT) / Math.max(1, currentRoute.path.length - 1)) * 100)
      ),
    };
  }, [isLiveNavigating, navProgressIndex, navProgressT, currentRoute, travelMode]);

  // Robust Mouse Pan & Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    hasMovedRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    dragStartOffsetRef.current = { ...panOffset };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - dragStartPosRef.current.x;
    const dy = e.clientY - dragStartPosRef.current.y;
    if (Math.hypot(dx, dy) > 5) {
      hasMovedRef.current = true;
    }
    setPanOffset({
      x: dragStartOffsetRef.current.x + dx,
      y: dragStartOffsetRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch Drag & Pan Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      hasMovedRef.current = false;
      dragStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      dragStartOffsetRef.current = { ...panOffset };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartPosRef.current.x;
    const dy = e.touches[0].clientY - dragStartPosRef.current.y;
    if (Math.hypot(dx, dy) > 5) {
      hasMovedRef.current = true;
    }
    setPanOffset({
      x: dragStartOffsetRef.current.x + dx,
      y: dragStartOffsetRef.current.y + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  // Zoom with Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom((z) => Math.max(0.7, Math.min(2.8, Number((z + delta).toFixed(2)))));
  };

  // Set user location at given coordinates and match nearest path node
  const handlePlaceUserAt = (clickX: number, clickY: number) => {
    let closestNode = 'lobby_portico';
    let minD = Infinity;

    Object.values(RESORT_PATH_NODES).forEach((node) => {
      const d = Math.hypot(node.x - clickX, node.y - clickY);
      if (d < minD) {
        minD = d;
        closestNode = node.id;
      }
    });

    setUserLocation({
      x: clickX,
      y: clickY,
      nodeId: closestNode,
      heading: userLocation.heading,
    });
    setOriginNodeId(closestNode);
    showToast(`Starting point set near ${RESORT_PATH_NODES[closestNode]?.name || 'resort grounds'}`);
  };

  // Click handler on SVG map: only triggers when user clicks without dragging
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (hasMovedRef.current || isLiveNavigating) return;
    if (!svgRef.current) return;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;

    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPoint = pt.matrixTransform(ctm.inverse());

    const clickX = Math.round(Math.max(0, Math.min(1000, svgPoint.x)));
    const clickY = Math.round(Math.max(0, Math.min(700, svgPoint.y)));

    handlePlaceUserAt(clickX, clickY);
  };

  // Re-center on user position or Lobby
  const handleRecenter = () => {
    setPanOffset({
      x: (500 - userLocation.x) * zoom,
      y: (350 - userLocation.y) * zoom,
    });
    showToast('Map centered on your current location');
  };

  return (
    <div className="relative w-full bg-[#E5E3DF] overflow-hidden min-h-[720px] lg:min-h-[820px] select-none flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-20 right-4 z-50 bg-[#202124]/90 text-white text-xs px-3.5 py-2 rounded-xl shadow-lg border border-white/20 backdrop-blur-md flex items-center space-x-2 animate-fadeIn pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#1A73E8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Google Maps Header Control Bar */}
      <div className="bg-[#202124] text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between border-b border-[#3C4043] z-30 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 bg-[#303134] px-2.5 py-1 rounded-lg border border-[#5F6368]/40">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34A853] animate-pulse" />
            <span className="font-bold text-white text-xs">Google Maps Live</span>
          </div>
          <span className="text-[#BDC1C6] hidden sm:inline text-xs">
            Hotel Rahi Campus & Outdoor Activities
          </span>
        </div>

        {/* View Mode Switcher: Google Street Map, Google Satellite, Floodlit Night Match, or Real GPS */}
        <div className="flex items-center space-x-1 bg-[#303134] p-1 rounded-xl border border-[#5F6368]/40 text-[11px]">
          <button
            onClick={() => setMapStyle('google_street')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              mapStyle === 'google_street'
                ? 'bg-[#1A73E8] text-white shadow-xs'
                : 'text-[#BDC1C6] hover:text-white'
            }`}
            title="Google Maps style vector cartography of hotel grounds"
          >
            <span>🗺️ Google Maps</span>
          </button>
          <button
            onClick={() => setMapStyle('google_satellite')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              mapStyle === 'google_satellite'
                ? 'bg-[#1A73E8] text-white shadow-xs'
                : 'text-[#BDC1C6] hover:text-white'
            }`}
            title="High-definition textured satellite aerial view"
          >
            <span>🛰️ Satellite</span>
          </button>
          <button
            onClick={() => setMapStyle('night_floodlit')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              mapStyle === 'night_floodlit'
                ? 'bg-[#F9AB00] text-stone-900 shadow-xs'
                : 'text-[#BDC1C6] hover:text-white'
            }`}
            title="Floodlit evening match mode with court lighting"
          >
            <span>🌙 Night Lights</span>
          </button>
          <button
            onClick={() => setMapStyle('real_gps')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              mapStyle === 'real_gps'
                ? 'bg-[#1A73E8] text-white shadow-xs'
                : 'text-[#BDC1C6] hover:text-white'
            }`}
            title="External real world coordinates via Leaflet"
          >
            <span>🌐 Real GPS</span>
          </button>
        </div>

        {/* Quick Shortcut: Navigate to Box Cricket */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const cricket = RESORT_MAP_POINTS.find((p) => p.id === 'point-box-cricket');
              if (cricket) {
                setSelectedPoint(cricket);
                setDestinationPointId(cricket.id);
                setNavPanelOpen(true);
                showToast('Box Cricket Pitch selected. Starting route preview...');
              }
            }}
            className="px-3 py-1 rounded-lg bg-[#EA4335] hover:bg-[#D93025] text-white font-extrabold text-xs flex items-center space-x-1 shadow-sm transition-transform active:scale-95"
          >
            <span>🏏 Navigate to Box Cricket</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative flex-1 w-full h-full min-h-[680px] overflow-hidden">
        {/* Floating Google Maps Search Box (Top-Left) */}
        <div className="absolute top-4 left-4 z-20 w-full max-w-sm sm:max-w-md pointer-events-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-[#DADCE0] p-1.5 flex items-center space-x-2 text-sm">
            <div className="pl-2.5 text-[#5F6368]">
              <Search className="w-4 h-4 text-[#1A73E8]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search activities, Box Cricket, TT, pool, dining..."
              className="flex-1 bg-transparent border-none text-[#202124] text-xs sm:text-sm focus:outline-none placeholder-[#70757A]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-[#F1F3F4] rounded-full text-[#5F6368]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="h-5 w-px bg-[#DADCE0]" />
            {/* Google Maps Directions Toggle Button */}
            <button
              id="gmap-directions-icon-btn"
              onClick={() => setNavPanelOpen(!navPanelOpen)}
              className={`p-2 rounded-xl transition-colors flex items-center justify-center ${
                navPanelOpen
                  ? 'bg-[#1A73E8] text-white shadow-xs'
                  : 'bg-[#E8F0FE] text-[#1A73E8] hover:bg-[#D2E3FC]'
              }`}
              title="Open directions & turn-by-turn navigation"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>

          {/* Autocomplete Search Dropdown */}
          {searchQuery && isSearchFocused && (
            <div className="mt-1 bg-white rounded-2xl shadow-2xl border border-[#DADCE0] max-h-64 overflow-y-auto p-2 space-y-1 z-30">
              {filteredPoints.length === 0 ? (
                <div className="p-3 text-xs text-[#70757A] text-center">No resort spots found matching "{searchQuery}"</div>
              ) : (
                filteredPoints.slice(0, 5).map((pt) => (
                  <div
                    key={pt.id}
                    onClick={() => {
                      setSelectedPoint(pt);
                      setDestinationPointId(pt.id);
                      setIsSearchFocused(false);
                      setSearchQuery('');
                      setNavPanelOpen(true);
                    }}
                    className="p-2 hover:bg-[#F1F3F4] rounded-xl flex items-center justify-between cursor-pointer text-xs"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-base shrink-0">{pt.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-[#202124] truncate">{pt.title}</div>
                        <div className="text-[10px] text-[#70757A] truncate">{pt.subtitle}</div>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 rounded-lg bg-[#E8F0FE] text-[#1A73E8] text-[11px] font-bold shrink-0 ml-2">
                      Directions
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Category Filter Chips */}
          <div className="flex items-center space-x-1.5 mt-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Locations' },
              { id: 'sports', label: '🏏 Box Cricket & Sports' },
              { id: 'games', label: '🏓 Game Lounge' },
              { id: 'wellness', label: '🏊 Pool & Spa' },
              { id: 'dining', label: '🍽️ Dining' },
              { id: 'stay', label: '👑 Luxury Villas' },
              { id: 'beach', label: '🏖️ Shoreline' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-xs border transition-all flex items-center space-x-1 ${
                  selectedCategory === cat.id
                    ? 'bg-[#1A73E8] text-white border-[#1A73E8]'
                    : 'bg-white text-[#3C4043] border-[#DADCE0] hover:bg-[#F8F9FA]'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Top Google Maps In-Ride Turn-by-Turn Navigation HUD */}
        {isLiveNavigating && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-xl pointer-events-auto animate-fadeIn">
            <div className="bg-[#0F5132] text-white rounded-3xl shadow-2xl p-4 border border-[#198754]/80 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 text-2xl font-bold">
                    {activeNavigationDetails.turnEmoji}
                  </div>
                  <div className="min-w-0">
                    <div className="text-emerald-200 text-[11px] uppercase tracking-wider font-bold flex items-center space-x-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>
                        In {activeNavigationDetails.remainingMeters} m • {activeNavigationDetails.speedKmh} km/h
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base text-white truncate leading-tight mt-0.5">
                      {activeNavigationDetails.instruction}
                    </h3>
                    <p className="text-xs text-emerald-100/90 truncate mt-0.5">
                      Navigating to: <strong className="text-white">{destinationPoint.title}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 ml-2 shrink-0">
                  <button
                    onClick={() => setVoiceMuted(!voiceMuted)}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title={voiceMuted ? 'Unmute voice navigation' : 'Mute voice navigation'}
                  >
                    {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleStopLiveNavigation}
                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Exit
                  </button>
                </div>
              </div>

              {/* Progress Bar & Travel Metrics */}
              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] text-emerald-100">
                <div className="flex items-center space-x-3">
                  <span>
                    ETA: <strong className="text-white">{activeNavigationDetails.etaFormatted}</strong>
                  </span>
                  <span>
                    Mode: <strong className="text-white capitalize">{travelMode}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 4 : 1)}
                    className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold"
                    title="Change live simulation speed"
                  >
                    {simSpeed}x Pace
                  </button>
                  <button
                    onClick={() => setCameraFollow(!cameraFollow)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cameraFollow ? 'bg-emerald-400 text-stone-900' : 'bg-white/20 text-white'
                    }`}
                  >
                    Follow Pin
                  </button>
                </div>
              </div>
              <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${activeNavigationDetails.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Google Maps Directions Drawer (Left Sidebar) */}
        {navPanelOpen && (
          <div className="absolute top-20 left-4 bottom-16 z-20 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#DADCE0] flex flex-col overflow-hidden animate-slideInLeft pointer-events-auto">
            {/* Header */}
            <div className="bg-[#F8F9FA] p-4 border-b border-[#DADCE0] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Navigation className="w-5 h-5 text-[#1A73E8]" />
                <h3 className="font-bold text-sm text-[#202124]">Google Maps Directions</h3>
              </div>
              <button
                onClick={() => setNavPanelOpen(false)}
                className="p-1.5 hover:bg-[#E8EAED] rounded-full text-[#5F6368]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Travel Mode Selector */}
            <div className="px-4 pt-3 pb-2 border-b border-[#F1F3F4] flex items-center justify-around bg-white">
              {[
                {
                  key: 'walk' as TravelMode,
                  label: 'Walk',
                  icon: <Footprints className="w-4 h-4" />,
                  time: `${currentRoute.walkTimeMinutes} min`,
                  sub: 'Paved Walkway',
                },
                {
                  key: 'buggy' as TravelMode,
                  label: 'Buggy',
                  icon: <Car className="w-4 h-4" />,
                  time: `${currentRoute.buggyTimeMinutes} min`,
                  sub: 'Electric Cart',
                },
                {
                  key: 'bike' as TravelMode,
                  label: 'Bicycle',
                  icon: <Bike className="w-4 h-4" />,
                  time: `${currentRoute.bikeTimeMinutes} min`,
                  sub: 'Resort Cruiser',
                },
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setTravelMode(mode.key)}
                  className={`flex-1 py-2 px-1 text-center rounded-2xl transition-all flex flex-col items-center justify-center ${
                    travelMode === mode.key
                      ? 'bg-[#E8F0FE] text-[#1A73E8] font-bold border border-[#1A73E8]/40 shadow-xs'
                      : 'text-[#5F6368] hover:bg-[#F8F9FA]'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    {mode.icon}
                    <span className="text-xs font-semibold">{mode.label}</span>
                  </div>
                  <span className="text-[10px] text-[#1A73E8] font-bold mt-0.5">{mode.time}</span>
                  <span className="text-[9px] text-[#70757A]">{mode.sub}</span>
                </button>
              ))}
            </div>

            {/* Origin & Destination Inputs with Swap */}
            <div className="p-4 space-y-3 border-b border-[#F1F3F4] bg-white relative">
              <div className="flex items-start space-x-3">
                <div className="flex flex-col items-center pt-2">
                  <div className="w-3 h-3 rounded-full border-2 border-[#1A73E8] bg-white" />
                  <div className="w-0.5 h-10 bg-[#DADCE0] my-1 border-dashed" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#EA4335] flex items-center justify-center text-[8px] text-white font-bold">
                    📍
                  </div>
                </div>

                <div className="flex-1 space-y-2.5">
                  {/* Origin Input */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold text-[#70757A]">Starting Point</label>
                      <button
                        onClick={() => handlePlaceUserAt(500, 185)}
                        className="text-[10px] text-[#1A73E8] hover:underline font-semibold"
                      >
                        Reset to Lobby
                      </button>
                    </div>
                    <select
                      value={originNodeId}
                      onChange={(e) => {
                        setOriginNodeId(e.target.value);
                        const n = RESORT_PATH_NODES[e.target.value];
                        if (n) setUserLocation({ x: n.x, y: n.y, nodeId: n.id, heading: userLocation.heading });
                      }}
                      className="w-full text-xs font-semibold text-[#202124] bg-[#F1F3F4] rounded-xl p-2 border-none focus:ring-2 focus:ring-[#1A73E8]"
                    >
                      {Object.values(RESORT_PATH_NODES).map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination Input */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#70757A]">Destination</label>
                    <select
                      value={destinationPointId}
                      onChange={(e) => {
                        setDestinationPointId(e.target.value);
                        const pt = RESORT_MAP_POINTS.find((p) => p.id === e.target.value);
                        if (pt) setSelectedPoint(pt);
                      }}
                      className="w-full text-xs font-semibold text-[#202124] bg-[#F1F3F4] rounded-xl p-2 border-none focus:ring-2 focus:ring-[#1A73E8]"
                    >
                      {RESORT_MAP_POINTS.map((pt) => (
                        <option key={pt.id} value={pt.id}>
                          {pt.icon} {pt.title} ({pt.categoryLabel})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Swap Button */}
                <button
                  onClick={handleSwapRoute}
                  className="p-2 rounded-xl hover:bg-[#F1F3F4] text-[#5F6368] self-center transition-colors"
                  title="Swap Origin & Destination"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              {/* Route Summary Pill */}
              <div className="bg-[#E8F0FE] p-3 rounded-2xl border border-[#D2E3FC] flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-[#1A73E8] text-sm">
                    {travelMode === 'walk'
                      ? `${currentRoute.walkTimeMinutes} min`
                      : travelMode === 'buggy'
                      ? `${currentRoute.buggyTimeMinutes} min`
                      : `${currentRoute.bikeTimeMinutes} min`}
                  </span>
                  <span className="text-[#5F6368] ml-2 font-medium">({currentRoute.totalDistance} meters)</span>
                  <p className="text-[10px] text-[#70757A] mt-0.5">Smooth, illuminated resort campus pathways</p>
                </div>
                {!isLiveNavigating ? (
                  <button
                    onClick={handleStartLiveNavigation}
                    className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-transform hover:scale-105 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Nav</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopLiveNavigation}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop</span>
                  </button>
                )}
              </div>
            </div>

            {/* Turn-by-Turn Instruction Steps */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#FAFAFA]">
              <p className="text-[10px] font-extrabold text-[#70757A] uppercase tracking-wider">
                Turn-by-turn maneuvers ({currentRoute.stepInstructions.length} steps)
              </p>
              {currentRoute.stepInstructions.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedStepIndex(idx)}
                  className={`flex items-start space-x-2.5 p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    isLiveNavigating && navProgressIndex === idx
                      ? 'bg-[#E8F0FE] text-[#1A73E8] font-bold border border-[#1A73E8]/30 shadow-xs'
                      : selectedStepIndex === idx
                      ? 'bg-stone-200 text-stone-900 font-medium'
                      : 'text-[#3C4043] hover:bg-white'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-stone-200 text-[#5F6368] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 leading-relaxed">{step}</div>
                </div>
              ))}
            </div>

            {/* Bottom Destination Card */}
            <div className="p-3 bg-white border-t border-[#DADCE0] flex items-center space-x-3">
              <img
                src={destinationPoint.image}
                alt={destinationPoint.title}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#DADCE0]"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-[#202124] truncate">{destinationPoint.title}</h4>
                <p className="text-[11px] text-[#5F6368] truncate">{destinationPoint.subtitle}</p>
                <span className="text-[10px] font-semibold text-[#188038]">{destinationPoint.priceLabel}</span>
              </div>
            </div>
          </div>
        )}

        {/* Selected Place Card (Bottom-Left) */}
        {selectedPoint && !navPanelOpen && (
          <div className="absolute bottom-6 left-4 z-20 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#DADCE0] overflow-hidden animate-fadeIn pointer-events-auto">
            <div className="relative h-36 w-full bg-stone-100">
              <img
                src={selectedPoint.image}
                alt={selectedPoint.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <button
                onClick={() => setSelectedPoint(null)}
                className="absolute top-2.5 right-2.5 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2.5 left-3 text-white">
                <span className="px-2 py-0.5 rounded-md bg-[#1A73E8] text-[10px] font-bold uppercase tracking-wider">
                  {selectedPoint.categoryLabel}
                </span>
                <h3 className="font-serif text-base font-bold text-white mt-1 drop-shadow-xs">
                  {selectedPoint.title}
                </h3>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 text-amber-500 font-bold">
                  <span>★ {selectedPoint.rating}</span>
                  <span className="text-[#70757A] font-normal">({selectedPoint.reviewsCount} reviews)</span>
                </div>
                <span className="font-bold text-[#188038]">{selectedPoint.priceLabel}</span>
              </div>

              <p className="text-xs text-[#5F6368] line-clamp-2 leading-relaxed">
                {selectedPoint.description}
              </p>

              {selectedPoint.equipmentProvided && selectedPoint.equipmentProvided.length > 0 && (
                <div className="bg-[#F8F9FA] p-2.5 rounded-2xl border border-[#E8EAED]">
                  <p className="text-[10px] font-bold text-[#70757A] uppercase tracking-wider mb-1">
                    Equipment Provided On-Site
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPoint.equipmentProvided.map((eq, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white border border-[#DADCE0] text-[10px] text-[#3C4043] font-medium"
                      >
                        ✓ {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => {
                    setDestinationPointId(selectedPoint.id);
                    setNavPanelOpen(true);
                  }}
                  className="flex-1 py-2.5 px-3 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions & Nav</span>
                </button>

                {selectedPoint.activityId ? (
                  <button
                    onClick={() => setGuestTab('activities')}
                    className="py-2.5 px-3 bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1A73E8] rounded-xl text-xs font-bold transition-colors"
                  >
                    Book Slot
                  </button>
                ) : selectedPoint.category === 'dining' ? (
                  <button
                    onClick={() => setGuestTab('dining')}
                    className="py-2.5 px-3 bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1A73E8] rounded-xl text-xs font-bold transition-colors"
                  >
                    View Menu
                  </button>
                ) : (
                  <button
                    onClick={() => setGuestTab('rooms')}
                    className="py-2.5 px-3 bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1A73E8] rounded-xl text-xs font-bold transition-colors"
                  >
                    View Room
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Google Maps Action Controls (Bottom-Right) */}
        <div className="absolute bottom-8 right-4 z-20 flex flex-col space-y-2 pointer-events-auto">
          {/* Layer View Switcher */}
          <button
            onClick={() => {
              setMapStyle(
                mapStyle === 'google_street'
                  ? 'google_satellite'
                  : mapStyle === 'google_satellite'
                  ? 'night_floodlit'
                  : 'google_street'
              );
            }}
            className="w-10 h-10 bg-white rounded-xl shadow-md border border-[#DADCE0] flex items-center justify-center text-[#5F6368] hover:text-[#202124] hover:bg-[#F8F9FA] transition-colors"
            title={`Switch Layer (Current: ${mapStyle})`}
          >
            <Layers className="w-5 h-5" />
          </button>

          {/* Compass / Orientation Reset */}
          <button
            onClick={() => {
              setPanOffset({ x: 0, y: 0 });
              setZoom(1);
              showToast('Map reset to overview');
            }}
            className="w-10 h-10 bg-white rounded-xl shadow-md border border-[#DADCE0] flex items-center justify-center text-[#5F6368] hover:text-[#202124] hover:bg-[#F8F9FA] transition-colors"
            title="Reset Map Orientation & Zoom"
          >
            <Compass className="w-5 h-5" />
          </button>

          {/* GPS Re-center Button */}
          <button
            onClick={handleRecenter}
            className="w-10 h-10 bg-white rounded-xl shadow-md border border-[#DADCE0] flex items-center justify-center text-[#1A73E8] hover:bg-[#E8F0FE] transition-colors"
            title="Center Map on Your Location"
          >
            <Locate className="w-5 h-5" />
          </button>

          {/* Zoom Buttons Group */}
          <div className="bg-white rounded-xl shadow-md border border-[#DADCE0] overflow-hidden flex flex-col">
            <button
              onClick={() => setZoom((z) => Math.min(2.8, Number((z + 0.25).toFixed(2))))}
              className="w-10 h-10 flex items-center justify-center text-[#5F6368] hover:bg-[#F8F9FA] hover:text-[#202124] border-b border-[#DADCE0] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.25).toFixed(2))))}
              className="w-10 h-10 flex items-center justify-center text-[#5F6368] hover:bg-[#F8F9FA] hover:text-[#202124] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAP CANVAS DISPLAY */}
        {mapStyle === 'real_gps' ? (
          /* Leaflet Real Coordinates View (Candolim/Goa Base) */
          <LeafletResortMap
            points={filteredPoints}
            selectedPoint={selectedPoint}
            onSelectPoint={(p) => {
              setSelectedPoint(p);
              setDestinationPointId(p.id);
            }}
            userLocation={userLocation}
            onMapClickLocation={handlePlaceUserAt}
            routePath={currentRoute.path}
            isLiveNavigating={isLiveNavigating}
            mapTileType="satellite"
          />
        ) : (
          /* Primary Fake Map of Hotel Outside Area Styled Like Google Maps */
          <div
            className={`w-full h-full cursor-grab active:cursor-grabbing overflow-hidden transition-colors duration-500 ${
              mapStyle === 'night_floodlit'
                ? 'bg-[#111927]'
                : mapStyle === 'google_satellite'
                ? 'bg-[#1C2833]'
                : 'bg-[#F4F3F0]'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 1000 700"
              className="w-full h-full object-contain"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.2s ease-out',
              }}
              onClick={handleSvgClick}
            >
              <defs>
                {/* Google Maps Ocean Gradient */}
                <linearGradient id="gmapOceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#AADAFF" />
                  <stop offset="100%" stopColor="#1E88E5" />
                </linearGradient>

                {/* Satellite Ocean Gradient */}
                <linearGradient id="satOceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0B486B" />
                  <stop offset="100%" stopColor="#03254C" />
                </linearGradient>

                {/* Pool Turquoise Gradient */}
                <linearGradient id="poolWaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>

                {/* Box Cricket Artificial Turf Green */}
                <linearGradient id="cricketTurfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#388E3C" />
                  <stop offset="100%" stopColor="#1B5E20" />
                </linearGradient>

                {/* Turf Stripes Pattern */}
                <pattern id="cricketTurfStripes" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect width="10" height="20" fill="rgba(255,255,255,0.09)" />
                  <rect x="10" width="10" height="20" fill="rgba(0,0,0,0.05)" />
                </pattern>

                {/* Lawn Grass Texture Pattern */}
                <pattern id="lawnStripePattern" width="30" height="30" patternUnits="userSpaceOnUse">
                  <rect width="15" height="30" fill="rgba(255,255,255,0.04)" />
                  <rect x="15" width="15" height="30" fill="rgba(0,0,0,0.03)" />
                </pattern>

                {/* Sand texture */}
                <pattern id="sandTexture" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="0.8" fill="rgba(0,0,0,0.06)" />
                  <circle cx="15" cy="15" r="1" fill="rgba(255,255,255,0.2)" />
                </pattern>

                {/* Google Maps 3D Building Drop Shadow */}
                <filter id="gmapBuildingShadow" x="-10%" y="-10%" width="125%" height="125%">
                  <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.18" />
                </filter>

                {/* Night Mode Floodlight Glow */}
                <radialGradient id="floodlightBeam" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* 1. TERRAIN / BASE GROUND */}
              <rect
                x="0"
                y="0"
                width="1000"
                height="700"
                fill={
                  mapStyle === 'night_floodlit'
                    ? '#0F172A'
                    : mapStyle === 'google_satellite'
                    ? '#1E293B'
                    : '#F4F3F0'
                }
              />

              {/* 2. ARABIAN SEA / SHORELINE (South Area) */}
              <path
                d="M 0 580 Q 250 565, 500 580 T 1000 575 L 1000 700 L 0 700 Z"
                fill={
                  mapStyle === 'night_floodlit'
                    ? '#091A2E'
                    : mapStyle === 'google_satellite'
                    ? 'url(#satOceanGrad)'
                    : 'url(#gmapOceanGrad)'
                }
              />
              {/* White ocean wave surf line */}
              <path
                d="M 0 580 Q 250 565, 500 580 T 1000 575"
                fill="none"
                stroke={mapStyle === 'night_floodlit' ? 'rgba(255,255,255,0.25)' : '#FFFFFF'}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeOpacity="0.75"
              />

              {/* 3. GOLDEN BEACH SAND DUNES */}
              <path
                d="M 0 525 Q 250 510, 500 525 T 1000 520 L 1000 580 Q 750 575, 500 580 T 0 580 Z"
                fill={
                  mapStyle === 'night_floodlit'
                    ? '#2C2B27'
                    : mapStyle === 'google_satellite'
                    ? '#D7C797'
                    : '#F9E8C8'
                }
              />
              <path
                d="M 0 525 Q 250 510, 500 525 T 1000 520 L 1000 580 Q 750 575, 500 580 T 0 580 Z"
                fill="url(#sandTexture)"
              />

              {/* 4. MANICURED RESORT GARDENS & LAWNS (Google Maps Green #CBE6D0) */}
              {/* West Wing Garden Lawn */}
              <rect
                x="60"
                y="310"
                width="150"
                height="130"
                rx="20"
                fill={
                  mapStyle === 'night_floodlit'
                    ? '#142C1E'
                    : mapStyle === 'google_satellite'
                    ? '#22543D'
                    : '#CBE6D0'
                }
                stroke={mapStyle === 'night_floodlit' ? '#1E4620' : '#B2D8B9'}
                strokeWidth="2"
              />
              <rect x="60" y="310" width="150" height="130" rx="20" fill="url(#lawnStripePattern)" />

              {/* East Sports Pavilion Lawn */}
              <rect
                x="690"
                y="110"
                width="250"
                height="210"
                rx="24"
                fill={
                  mapStyle === 'night_floodlit'
                    ? '#142C1E'
                    : mapStyle === 'google_satellite'
                    ? '#1C4532'
                    : '#CBE6D0'
                }
                stroke={mapStyle === 'night_floodlit' ? '#1E4620' : '#B2D8B9'}
                strokeWidth="2"
              />
              <rect x="690" y="110" width="250" height="210" rx="24" fill="url(#lawnStripePattern)" />

              {/* Southeast Oceanfront Palm Lawn */}
              <rect
                x="690"
                y="435"
                width="230"
                height="80"
                rx="20"
                fill={
                  mapStyle === 'night_floodlit'
                    ? '#142C1E'
                    : mapStyle === 'google_satellite'
                    ? '#22543D'
                    : '#CBE6D0'
                }
                stroke={mapStyle === 'night_floodlit' ? '#1E4620' : '#B2D8B9'}
                strokeWidth="2"
              />

              {/* 5. ROAD & PATHWAY NETWORK (Google Maps Street Styling) */}
              {/* Outer Road Borders */}
              {Object.values(RESORT_PATH_NODES).map((node) =>
                node.neighbors.map((n) => {
                  const target = RESORT_PATH_NODES[n.id];
                  if (!target || node.id > target.id) return null;
                  return (
                    <line
                      key={`border-${node.id}-${target.id}`}
                      x1={node.x}
                      y1={node.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={mapStyle === 'night_floodlit' ? '#334155' : '#D1D5DB'}
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                  );
                })
              )}
              {/* Inner White Road Surface (Iconic Google Maps Street) */}
              {Object.values(RESORT_PATH_NODES).map((node) =>
                node.neighbors.map((n) => {
                  const target = RESORT_PATH_NODES[n.id];
                  if (!target || node.id > target.id) return null;
                  return (
                    <line
                      key={`road-${node.id}-${target.id}`}
                      x1={node.x}
                      y1={node.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={mapStyle === 'night_floodlit' ? '#1E293B' : '#FFFFFF'}
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                  );
                })
              )}

              {/* Pedestrian Crosswalks / Zebra Markings at Key Junctions */}
              <g stroke="#9CA3AF" strokeWidth="2" strokeDasharray="3 3">
                <line x1="490" y1="125" x2="510" y2="125" />
                <line x1="490" y1="260" x2="510" y2="260" />
                <line x1="490" y1="420" x2="510" y2="420" />
                <line x1="640" y1="195" x2="660" y2="195" />
              </g>

              {/* Google Maps Street Name Labels */}
              <g
                fontSize="9"
                fontWeight="700"
                fill={mapStyle === 'night_floodlit' ? '#94A3B8' : '#5F6368'}
                textAnchor="middle"
                style={{
                  textShadow:
                    mapStyle === 'night_floodlit'
                      ? '0 0 4px #0F172A'
                      : '0 0 3px #FFFFFF, 0 0 3px #FFFFFF',
                }}
              >
                <text x="500" y="105">Royal Palm Boulevard</text>
                <text x="750" y="125">East Sports Avenue</text>
                <text x="240" y="188">West Garden Walk</text>
                <text x="500" y="275">Central Palm Promenade</text>
                <text x="500" y="565">Resort Beach Boardwalk</text>
                <text x="310" y="228">Clubhouse Way</text>
              </g>

              {/* 6. BUILDINGS & RESORT FACILITIES */}

              {/* Grand Reception & Portico */}
              <g filter="url(#gmapBuildingShadow)">
                <rect
                  x="410"
                  y="135"
                  width="180"
                  height="75"
                  rx="8"
                  fill={mapStyle === 'night_floodlit' ? '#1E293B' : '#EDEAE1'}
                  stroke={mapStyle === 'night_floodlit' ? '#475569' : '#D5D1C8'}
                  strokeWidth="1.5"
                />
                {/* Portico turnaround driveway */}
                <rect
                  x="450"
                  y="178"
                  width="100"
                  height="22"
                  rx="4"
                  fill={mapStyle === 'night_floodlit' ? '#0F172A' : '#E2DCD2'}
                />
                <circle cx="500" cy="189" r="6" fill="#38BDF8" />
                <text
                  x="500"
                  y="163"
                  textAnchor="middle"
                  fill={mapStyle === 'night_floodlit' ? '#F8FAFC' : '#202124'}
                  fontSize="11"
                  fontWeight="800"
                >
                  GRAND LOBBY & RECEPTION
                </text>
              </g>

              {/* West Wing Deluxe Suites */}
              <g filter="url(#gmapBuildingShadow)">
                <rect
                  x="160"
                  y="165"
                  width="140"
                  height="65"
                  rx="6"
                  fill={mapStyle === 'night_floodlit' ? '#1E293B' : '#FFFFFF'}
                  stroke={mapStyle === 'night_floodlit' ? '#334155' : '#D1D5DB'}
                  strokeWidth="1.5"
                />
                <text
                  x="230"
                  y="202"
                  textAnchor="middle"
                  fill={mapStyle === 'night_floodlit' ? '#E2E8F0' : '#374151'}
                  fontSize="10"
                  fontWeight="700"
                >
                  GARDEN WING (ROOMS 101-206)
                </text>
              </g>

              {/* Indoor Game Lounge & Table Tennis Clubhouse */}
              <g filter="url(#gmapBuildingShadow)">
                <rect
                  x="240"
                  y="235"
                  width="135"
                  height="60"
                  rx="8"
                  fill={mapStyle === 'night_floodlit' ? '#2A2617' : '#FEF3C7'}
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                />
                <text
                  x="307"
                  y="268"
                  textAnchor="middle"
                  fill={mapStyle === 'night_floodlit' ? '#FDE68A' : '#92400E'}
                  fontSize="10"
                  fontWeight="800"
                >
                  🎮 INDOOR GAME LOUNGE & TT
                </text>
              </g>

              {/* 🏏 BOX CRICKET PITCH & SPORTS TURF (Detailed Tournament Arena) */}
              <g filter="url(#gmapBuildingShadow)">
                {/* Outer Arena Boundary */}
                <rect
                  x="705"
                  y="135"
                  width="160"
                  height="90"
                  rx="12"
                  fill="url(#cricketTurfGrad)"
                  stroke="#14532D"
                  strokeWidth="3.5"
                />
                {/* Grass stripe pattern */}
                <rect x="705" y="135" width="160" height="90" rx="12" fill="url(#cricketTurfStripes)" />

                {/* 22-yard Cricket Pitch Strip */}
                <rect
                  x="745"
                  y="174"
                  width="80"
                  height="14"
                  rx="2"
                  fill="#D7CCC8"
                  stroke="#8D6E63"
                  strokeWidth="1"
                />
                {/* Bowling crease lines */}
                <line x1="755" y1="172" x2="755" y2="190" stroke="#FFFFFF" strokeWidth="1.5" />
                <line x1="815" y1="172" x2="815" y2="190" stroke="#FFFFFF" strokeWidth="1.5" />
                {/* Wickets */}
                <circle cx="754" cy="181" r="2" fill="#FFFFFF" />
                <circle cx="816" cy="181" r="2" fill="#FFFFFF" />

                {/* Floodlight Poles at 4 corners */}
                <circle cx="712" cy="142" r="3.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
                <circle cx="858" cy="142" r="3.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
                <circle cx="712" cy="218" r="3.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
                <circle cx="858" cy="218" r="3.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />

                {/* Night Mode Floodlight Cones */}
                {mapStyle === 'night_floodlit' && (
                  <circle cx="785" cy="180" r="75" fill="url(#floodlightBeam)" />
                )}

                <text x="785" y="158" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900">
                  🏏 BOX CRICKET ARENA
                </text>
              </g>

              {/* Outdoor Badminton Court */}
              <g filter="url(#gmapBuildingShadow)">
                <rect
                  x="715"
                  y="235"
                  width="115"
                  height="60"
                  rx="6"
                  fill={mapStyle === 'night_floodlit' ? '#1E3A8A' : '#2563EB'}
                  stroke="#1D4ED8"
                  strokeWidth="2"
                />
                <rect x="720" y="240" width="105" height="50" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
                <line x1="772" y1="240" x2="772" y2="290" stroke="#FFFFFF" strokeWidth="2.5" />
                <text x="772" y="268" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">
                  🏸 BADMINTON
                </text>
              </g>

              {/* Courtyard Basketball Arena */}
              <g filter="url(#gmapBuildingShadow)">
                <rect
                  x="840"
                  y="235"
                  width="80"
                  height="55"
                  rx="6"
                  fill={mapStyle === 'night_floodlit' ? '#7C2D12' : '#EA580C'}
                  stroke="#C2410C"
                  strokeWidth="2"
                />
                <circle cx="880" cy="262" r="14" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
                <rect x="840" y="252" width="22" height="20" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
                <circle cx="848" cy="262" r="3" fill="#FFFFFF" />
                <text x="880" y="266" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="800">
                  🏀 BASKET
                </text>
              </g>

              {/* Azure Infinity Pool & Heated Jacuzzi */}
              <g filter="url(#gmapBuildingShadow)">
                <rect
                  x="410"
                  y="315"
                  width="180"
                  height="90"
                  rx="28"
                  fill="url(#poolWaterGrad)"
                  stroke="#0284C7"
                  strokeWidth="3.5"
                />
                {/* Sun Deck Surroundings */}
                <rect x="420" y="325" width="160" height="70" rx="20" fill="rgba(255,255,255,0.12)" />
                {/* Jacuzzi Spa Circle */}
                <circle cx="560" cy="360" r="15" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="2" />
                <text x="500" y="365" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="900">
                  AZURE INFINITY POOL
                </text>
              </g>

              {/* Spice Garden Alfresco Dining */}
              <g filter="url(#gmapBuildingShadow)">
                <rect
                  x="630"
                  y="340"
                  width="135"
                  height="60"
                  rx="8"
                  fill={mapStyle === 'night_floodlit' ? '#292524' : '#FFF7ED'}
                  stroke="#F97316"
                  strokeWidth="1.5"
                />
                <text
                  x="697"
                  y="374"
                  textAnchor="middle"
                  fill={mapStyle === 'night_floodlit' ? '#FFEDD5' : '#C2410C'}
                  fontSize="10"
                  fontWeight="800"
                >
                  🍽️ SPICE GARDEN DINING
                </text>
              </g>

              {/* The Palms Ayurvedic Spa */}
              <g filter="url(#gmapBuildingShadow)">
                <rect
                  x="195"
                  y="340"
                  width="130"
                  height="65"
                  rx="8"
                  fill={mapStyle === 'night_floodlit' ? '#14271A' : '#ECFDF5'}
                  stroke="#10B981"
                  strokeWidth="1.5"
                />
                <text
                  x="260"
                  y="376"
                  textAnchor="middle"
                  fill={mapStyle === 'night_floodlit' ? '#A7F3D0' : '#065F46'}
                  fontSize="10"
                  fontWeight="800"
                >
                  🌿 NIRVANA SPA
                </text>
              </g>

              {/* Private Plunge Pool Villa 1 */}
              <g filter="url(#gmapBuildingShadow)">
                <rect
                  x="305"
                  y="470"
                  width="110"
                  height="50"
                  rx="6"
                  fill={mapStyle === 'night_floodlit' ? '#2E1065' : '#FAF5FF'}
                  stroke="#A855F7"
                  strokeWidth="1.5"
                />
                <rect x="312" y="475" width="22" height="15" rx="3" fill="#38BDF8" />
                <text
                  x="360"
                  y="498"
                  textAnchor="middle"
                  fill={mapStyle === 'night_floodlit' ? '#E9D5FF' : '#6B21A8'}
                  fontSize="9"
                  fontWeight="800"
                >
                  VILLA 1 (PLUNGE POOL)
                </text>
              </g>

              {/* Presidential Ocean Villa 302 */}
              <g filter="url(#gmapBuildingShadow)">
                <rect
                  x="590"
                  y="470"
                  width="130"
                  height="50"
                  rx="6"
                  fill={mapStyle === 'night_floodlit' ? '#2E1065' : '#FAF5FF'}
                  stroke="#A855F7"
                  strokeWidth="1.5"
                />
                <rect x="688" y="475" width="26" height="15" rx="3" fill="#38BDF8" />
                <text
                  x="655"
                  y="498"
                  textAnchor="middle"
                  fill={mapStyle === 'night_floodlit' ? '#E9D5FF' : '#6B21A8'}
                  fontSize="9"
                  fontWeight="800"
                >
                  PRESIDENTIAL VILLA 302
                </text>
              </g>

              {/* 7. ACTIVE NAVIGATION ROUTE OVERLAY (Google Maps Blue Polyline) */}
              {currentRoute.path.length > 1 && (
                <>
                  {/* Outer White Glow */}
                  <polyline
                    points={currentRoute.path.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Iconic Google Maps Deep Blue Polyline */}
                  <polyline
                    points={currentRoute.path.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#1A73E8"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Directional Waypoint Markers along route */}
                  {currentRoute.path.map((p, idx) => {
                    if (idx === 0 || idx === currentRoute.path.length - 1) return null;
                    return (
                      <circle
                        key={`route-dot-${idx}`}
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill="#FFFFFF"
                        stroke="#1A73E8"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </>
              )}

              {/* 8. GOOGLE MAPS STYLE POI TEARDROP PINS */}
              {filteredPoints.map((point) => {
                const isSelected = selectedPoint?.id === point.id;
                return (
                  <g
                    key={point.id}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPoint(point);
                      setDestinationPointId(point.id);
                    }}
                  >
                    {/* Google Maps Teardrop Shape */}
                    <path
                      d={`M ${point.x} ${point.y} C ${point.x - 12} ${point.y - 12} ${point.x - 14} ${point.y - 28} ${point.x} ${point.y - 28} C ${point.x + 14} ${point.y - 28} ${point.x + 12} ${point.y - 12} ${point.x} ${point.y} Z`}
                      fill={isSelected ? '#D4AF37' : point.pinColor}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      filter="url(#gmapBuildingShadow)"
                    />
                    {/* Center Emoji / Category Icon */}
                    <text x={point.x} y={point.y - 14} textAnchor="middle" fontSize="12">
                      {point.icon}
                    </text>

                    {/* Google Maps Clean Pill Label */}
                    <rect
                      x={point.x - 48}
                      y={point.y + 4}
                      width="96"
                      height="16"
                      rx="4"
                      fill={mapStyle === 'night_floodlit' ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)'}
                      stroke={mapStyle === 'night_floodlit' ? 'rgba(255,255,255,0.2)' : '#DADCE0'}
                      strokeWidth="0.8"
                    />
                    <text
                      x={point.x}
                      y={point.y + 15}
                      textAnchor="middle"
                      fill={mapStyle === 'night_floodlit' ? '#FFFFFF' : '#202124'}
                      fontSize="9"
                      fontWeight="700"
                    >
                      {point.title.length > 15 ? point.title.substring(0, 13) + '..' : point.title}
                    </text>
                  </g>
                );
              })}

              {/* 9. GOOGLE MAPS LIVE USER GPS LOCATION MARKER (Blue Pulsating Dot) */}
              <g transform={`translate(${userLocation.x}, ${userLocation.y})`}>
                {/* Radar Pulsating Ring */}
                <circle cx="0" cy="0" r="18" fill="rgba(26, 115, 232, 0.25)" className="animate-ping" />
                {/* Directional Heading Cone Pointer */}
                <polygon
                  points="0,-16 -6,-7 6,-7"
                  fill="#1A73E8"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  transform={`rotate(${userLocation.heading})`}
                />
                {/* Core Live Blue Dot */}
                <circle cx="0" cy="0" r="8" fill="#1A73E8" stroke="#FFFFFF" strokeWidth="2.5" />
              </g>
            </svg>
          </div>
        )}

        {/* Arrival Celebration Modal */}
        {arrivedModalOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                🏁
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#188038] uppercase tracking-wider">
                  Destination Reached
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#202124] mt-1">
                  {destinationPoint.title}
                </h3>
                <p className="text-xs text-[#5F6368] mt-1">{destinationPoint.subtitle}</p>
              </div>

              <img
                src={destinationPoint.image}
                alt={destinationPoint.title}
                referrerPolicy="no-referrer"
                className="w-full h-36 rounded-2xl object-cover border border-[#DADCE0]"
              />

              <div className="bg-[#F8F9FA] p-3 rounded-2xl text-xs text-left space-y-1">
                <div className="flex justify-between font-semibold text-[#202124]">
                  <span>Timing:</span>
                  <span>{destinationPoint.timing}</span>
                </div>
                <div className="flex justify-between text-[#188038] font-bold">
                  <span>Price:</span>
                  <span>{destinationPoint.priceLabel}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                {destinationPoint.activityId ? (
                  <button
                    onClick={() => {
                      setArrivedModalOpen(false);
                      setGuestTab('activities');
                    }}
                    className="flex-1 py-3 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-2xl text-xs font-bold transition-colors"
                  >
                    Book Slot Now
                  </button>
                ) : (
                  <button
                    onClick={() => setArrivedModalOpen(false)}
                    className="flex-1 py-3 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-2xl text-xs font-bold transition-colors"
                  >
                    Explore Area
                  </button>
                )}
                <button
                  onClick={() => setArrivedModalOpen(false)}
                  className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
