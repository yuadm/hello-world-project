import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Key } from 'lucide-react';

interface Childminder {
  id: string;
  first_name: string;
  last_name: string;
  lat?: number;
  lng?: number;
  distance?: number;
  distanceLabel?: string;
}

interface ChildminderMapProps {
  userCoords: { lat: number; lng: number } | null;
  childminders: Childminder[];
  selectedChildminder: string | null;
  onSelectChildminder: (id: string | null) => void;
  onRefresh: () => void;
}

const ChildminderMap = ({
  userCoords,
  childminders,
  selectedChildminder,
  onSelectChildminder,
  onRefresh
}: ChildminderMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const routeLayerId = 'route';
  
  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem('mapbox_token') || '';
  });
  const [tokenInput, setTokenInput] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);

  const saveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem('mapbox_token', tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setTokenInput('');
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: userCoords ? [userCoords.lng, userCoords.lat] : [-1.5, 53.5], // UK center
        zoom: userCoords ? 12 : 6,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      map.current.on('load', () => {
        setIsMapReady(true);
      });

      return () => {
        map.current?.remove();
        setIsMapReady(false);
      };
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapboxToken('');
      localStorage.removeItem('mapbox_token');
    }
  }, [mapboxToken]);

  // Update user marker
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userCoords) {
      // Create user marker element
      const el = document.createElement('div');
      el.className = 'user-marker';
      el.innerHTML = `
        <div style="position: relative;">
          <div style="width: 32px; height: 32px; background: #ef4444; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>
          <div style="position: absolute; width: 48px; height: 48px; background: rgba(239, 68, 68, 0.3); border-radius: 50%; top: -8px; left: -8px; animation: pulse 2s infinite;"></div>
          <div style="position: absolute; top: 40px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: #ef4444; color: white; font-size: 12px; padding: 4px 8px; border-radius: 12px; font-weight: 500;">Your location</div>
        </div>
      `;

      userMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([userCoords.lng, userCoords.lat])
        .addTo(map.current);

      map.current.flyTo({
        center: [userCoords.lng, userCoords.lat],
        zoom: 12,
        duration: 1000
      });
    }
  }, [userCoords, isMapReady]);

  // Update childminder markers
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    childminders.forEach((cm) => {
      if (!cm.lat || !cm.lng) return;

      const isSelected = selectedChildminder === cm.id;
      
      const el = document.createElement('div');
      el.className = 'childminder-marker';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="
          width: ${isSelected ? '48px' : '40px'}; 
          height: ${isSelected ? '48px' : '40px'}; 
          background: ${isSelected ? '#f59e0b' : '#1B9AAA'}; 
          border-radius: 50%; 
          border: 4px solid white; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.3); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${isSelected ? '16px' : '14px'};
          transition: all 0.2s;
        ">
          ${cm.first_name[0]}
        </div>
      `;

      el.addEventListener('click', () => {
        onSelectChildminder(selectedChildminder === cm.id ? null : cm.id);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([cm.lng, cm.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [childminders, selectedChildminder, isMapReady, onSelectChildminder]);

  // Draw route when childminder is selected
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    // Remove existing route
    if (map.current.getLayer(routeLayerId)) {
      map.current.removeLayer(routeLayerId);
    }
    if (map.current.getSource(routeLayerId)) {
      map.current.removeSource(routeLayerId);
    }

    if (!userCoords || !selectedChildminder) return;

    const selectedCm = childminders.find(cm => cm.id === selectedChildminder);
    if (!selectedCm?.lat || !selectedCm?.lng) return;

    // Fetch route from Mapbox Directions API
    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${userCoords.lng},${userCoords.lat};${selectedCm.lng},${selectedCm.lat}?geometries=geojson&access_token=${mapboxToken}`
        );
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          const route = data.routes[0].geometry;

          map.current!.addSource(routeLayerId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route
            }
          });

          map.current!.addLayer({
            id: routeLayerId,
            type: 'line',
            source: routeLayerId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#1B9AAA',
              'line-width': 5,
              'line-opacity': 0.8
            }
          });

          // Fit bounds to show both points
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([userCoords.lng, userCoords.lat]);
          bounds.extend([selectedCm.lng, selectedCm.lat]);
          
          map.current!.fitBounds(bounds, {
            padding: 80,
            duration: 1000
          });
        }
      } catch (error) {
        console.error('Failed to fetch route:', error);
      }
    };

    fetchRoute();
  }, [userCoords, selectedChildminder, childminders, isMapReady, mapboxToken]);

  if (!mapboxToken) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
        <div className="bg-card p-6 rounded-xl shadow-xl max-w-md mx-4 border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--rk-primary-light))] flex items-center justify-center">
              <Key className="w-6 h-6 text-[hsl(var(--rk-primary))]" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Mapbox Token Required</h3>
              <p className="text-sm text-muted-foreground">Enter your public token to view the map</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Get your free token at{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[hsl(var(--rk-primary))] hover:underline"
            >
              mapbox.com
            </a>
            {' '}→ Tokens section
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="pk.eyJ1Ijoi..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={saveToken} className="bg-[hsl(var(--rk-primary))]">
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Refresh Button */}
      <Button 
        variant="outline" 
        size="sm" 
        className="absolute top-4 right-4 bg-white shadow-md border-border z-10"
        onClick={onRefresh}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>

      {/* Selected childminder info popup */}
      {selectedChildminder && userCoords && (() => {
        const cm = childminders.find(c => c.id === selectedChildminder);
        if (!cm) return null;
        return (
          <div className="absolute top-4 left-4 bg-white rounded-xl shadow-xl p-4 z-10 min-w-[220px] border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--rk-primary))] flex items-center justify-center text-white font-semibold">
                {cm.first_name[0]}
              </div>
              <div>
                <p className="font-semibold text-sm">{cm.first_name} {cm.last_name}</p>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Available
                  {cm.distance !== undefined && (
                    <span className="text-muted-foreground ml-1">· {cm.distance.toFixed(1)} mi</span>
                  )}
                </p>
              </div>
            </div>
            {cm.distance !== undefined && (
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Distance</span>
                <span className="font-semibold text-[hsl(var(--rk-primary))]">{cm.distance.toFixed(1)} miles</span>
              </div>
            )}
          </div>
        );
      })()}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default ChildminderMap;
