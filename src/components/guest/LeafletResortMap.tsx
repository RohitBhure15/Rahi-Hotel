import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPointOfInterest,
  RESORT_GEO_BOUNDS,
  xyToLatLng,
  latLngToXy,
} from '../../data/resortMapData';

interface LeafletResortMapProps {
  points: MapPointOfInterest[];
  selectedPoint: MapPointOfInterest | null;
  onSelectPoint: (point: MapPointOfInterest) => void;
  userLocation: { x: number; y: number; heading: number; nodeId: string };
  onMapClickLocation: (x: number, y: number) => void;
  routePath: { id: string; name: string; x: number; y: number }[];
  isLiveNavigating: boolean;
  mapTileType: 'satellite' | 'street' | 'osm';
}

export const LeafletResortMap: React.FC<LeafletResortMapProps> = ({
  points,
  selectedPoint,
  onSelectPoint,
  userLocation,
  onMapClickLocation,
  routePath,
  isLiveNavigating,
  mapTileType,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    // Guard against React 18/19 strict mode or hot reloads retaining _leaflet_id on the DOM node
    if ((containerRef.current as unknown as { _leaflet_id?: number })._leaflet_id) {
      delete (containerRef.current as unknown as { _leaflet_id?: number })._leaflet_id;
    }

    const resortCenter = L.latLng(RESORT_GEO_BOUNDS.centerLat, RESORT_GEO_BOUNDS.centerLng);
    const map = L.map(containerRef.current, {
      center: resortCenter,
      zoom: 17,
      minZoom: 15,
      maxZoom: 20,
      zoomControl: false,
    });

    mapRef.current = map;

    // Tile Layer based on mapTileType
    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = '&copy; Esri World Imagery';

    if (mapTileType === 'street') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap &copy; CARTO';
    } else if (mapTileType === 'osm') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 20,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Layer group for markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Click handler on map
    map.on('click', (e: L.LeafletMouseEvent) => {
      const xy = latLngToXy(e.latlng.lat, e.latlng.lng);
      onMapClickLocation(xy.x, xy.y);
    });

    // Invalidate size after mount to prevent grey tile artifact
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update tile layer when mapTileType changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = '&copy; Esri World Imagery';

    if (mapTileType === 'street') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap &copy; CARTO';
    } else if (mapTileType === 'osm') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    const newLayer = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 20,
    }).addTo(mapRef.current);
    tileLayerRef.current = newLayer;
  }, [mapTileType]);

  // Update POI Markers
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    points.forEach((point) => {
      const geo = xyToLatLng(point.x, point.y);
      const isSelected = selectedPoint?.id === point.id;

      // Custom Google-Maps teardrop icon
      const customIcon = L.divIcon({
        className: 'custom-resort-marker',
        html: `
          <div style="
            position: relative;
            cursor: pointer;
            transform: translate(-50%, -100%);
            display: flex;
            flex-direction: column;
            align-items: center;
          ">
            <div style="
              background: ${isSelected ? '#D4AF37' : point.pinColor};
              border: 2px solid white;
              color: white;
              width: ${isSelected ? '38px' : '32px'};
              height: ${isSelected ? '38px' : '32px'};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 4px 10px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
            ">
              <span style="
                transform: rotate(45deg);
                font-size: ${isSelected ? '16px' : '13px'};
                line-height: 1;
              ">
                ${point.icon}
              </span>
            </div>
            <div style="
              background: rgba(15, 23, 42, 0.85);
              backdrop-filter: blur(4px);
              color: #f8fafc;
              font-size: 10px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 6px;
              margin-top: 3px;
              white-space: nowrap;
              border: 1px solid rgba(255,255,255,0.2);
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">
              ${point.title.length > 20 ? point.title.substring(0, 18) + '...' : point.title}
            </div>
          </div>
        `,
        iconSize: [32, 48],
        iconAnchor: [16, 48],
      });

      const marker = L.marker([geo.lat, geo.lng], { icon: customIcon });
      marker.on('click', () => {
        onSelectPoint(point);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [points, selectedPoint, onSelectPoint]);

  // Update Route Polyline
  useEffect(() => {
    if (!mapRef.current) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (routePath.length > 1) {
      const latLngs = routePath.map((p) => {
        const geo = xyToLatLng(p.x, p.y);
        return [geo.lat, geo.lng] as [number, number];
      });

      const polyline = L.polyline(latLngs, {
        color: '#1A73E8',
        weight: 6,
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(mapRef.current);

      routePolylineRef.current = polyline;
    }
  }, [routePath]);

  // Update User Location Marker & Tracking
  useEffect(() => {
    if (!mapRef.current) return;

    const userGeo = xyToLatLng(userLocation.x, userLocation.y);

    if (!userMarkerRef.current) {
      const userIcon = L.divIcon({
        className: 'user-live-gps-marker',
        html: `
          <div style="
            position: relative;
            width: 24px;
            height: 24px;
            transform: translate(-50%, -50%);
          ">
            <div style="
              position: absolute;
              inset: -8px;
              background: rgba(26, 115, 232, 0.3);
              border-radius: 50%;
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              position: absolute;
              inset: 0;
              background: #1A73E8;
              border: 3px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 0 10px rgba(26, 115, 232, 0.7);
            "></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([userGeo.lat, userGeo.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(mapRef.current);

      userMarkerRef.current = marker;
    } else {
      userMarkerRef.current.setLatLng([userGeo.lat, userGeo.lng]);
    }

    // Camera following mode during live navigation
    if (isLiveNavigating) {
      mapRef.current.panTo([userGeo.lat, userGeo.lng], {
        animate: true,
        duration: 0.2,
      });
    }
  }, [userLocation, isLiveNavigating]);

  return (
    <div className="relative w-full h-full min-h-[600px] z-0">
      <div ref={containerRef} className="w-full h-full min-h-[600px]" />
    </div>
  );
};
