import { useEffect, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Polyline from '@arcgis/core/geometry/Polyline';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import esriConfig from '@arcgis/core/config';
import * as route from '@arcgis/core/rest/route';
import RouteParameters from '@arcgis/core/rest/support/RouteParameters';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import '@arcgis/core/assets/esri/themes/light/main.css';

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

const ARCGIS_API_KEY = 'AAPTxy8BH1VEsoebNVZXo8HurN0C5WyrsnUZ8_3QeymY8MW6knurLK-J5smeH37AhBvMRiCh8noIF6hvqSHJ2-HSESn5Wpa0rU06UoAcqlpiTjbjDAuH_v0xO2pk9rINElt8sOrRsZycDZLTMgZagIXre8jc8HBf0Sr-xLlo0dDhmMVPObLtgHEETJAKYBSbxIuZV0uWybnyE5wFoxBFHPhdoF2QQOJrvvQTqjyXExCwrk4.AT1_mN2TJ5xX';

const ChildminderMap = ({
  userCoords,
  childminders,
  selectedChildminder,
  onSelectChildminder,
  onRefresh
}: ChildminderMapProps) => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const markersLayerRef = useRef<GraphicsLayer | null>(null);
  const routeLayerRef = useRef<GraphicsLayer | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapDiv.current) return;

    esriConfig.apiKey = ARCGIS_API_KEY;

    const map = new Map({
      basemap: 'arcgis/navigation',
    });

    const markersLayer = new GraphicsLayer();
    const routeLayer = new GraphicsLayer();
    map.add(routeLayer);
    map.add(markersLayer);
    markersLayerRef.current = markersLayer;
    routeLayerRef.current = routeLayer;

    const view = new MapView({
      container: mapDiv.current,
      map: map,
      center: userCoords ? [userCoords.lng, userCoords.lat] : [-1.5, 52.5],
      zoom: userCoords ? 12 : 6,
    });

    viewRef.current = view;

    view.when(() => {
      setIsMapReady(true);
    });

    // Handle click on graphics
    view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        const results = response.results.filter(
          (result) => result.type === 'graphic' && (result as any).graphic?.attributes?.childminderId
        );
        if (results.length > 0 && results[0].type === 'graphic') {
          const childminderId = (results[0] as any).graphic.attributes.childminderId;
          onSelectChildminder(selectedChildminder === childminderId ? null : childminderId);
        }
      });
    });

    return () => {
      view.destroy();
      setIsMapReady(false);
    };
  }, []);

  // Update markers when childminders or selection changes
  useEffect(() => {
    if (!markersLayerRef.current || !isMapReady) return;

    markersLayerRef.current.removeAll();

    // Add user location marker
    if (userCoords) {
      const userPoint = new Point({
        longitude: userCoords.lng,
        latitude: userCoords.lat,
      });

      // Pulsing effect circle (background)
      const pulseSymbol = new SimpleMarkerSymbol({
        color: [239, 68, 68, 0.3],
        size: 40,
        outline: {
          color: [239, 68, 68, 0.5],
          width: 1,
        },
      });

      const pulseGraphic = new Graphic({
        geometry: userPoint,
        symbol: pulseSymbol,
      });

      markersLayerRef.current.add(pulseGraphic);

      // Main user marker
      const userSymbol = new SimpleMarkerSymbol({
        color: [239, 68, 68, 1],
        size: 20,
        outline: {
          color: [255, 255, 255],
          width: 4,
        },
      });

      const userGraphic = new Graphic({
        geometry: userPoint,
        symbol: userSymbol,
        attributes: { type: 'user' },
      });

      markersLayerRef.current.add(userGraphic);
    }

    // Add childminder markers
    childminders.forEach((cm) => {
      if (!cm.lat || !cm.lng) return;

      const point = new Point({
        longitude: cm.lng,
        latitude: cm.lat,
      });

      const isSelected = selectedChildminder === cm.id;

      // Background circle
      const markerSymbol = new SimpleMarkerSymbol({
        color: isSelected ? [245, 158, 11, 1] : [27, 154, 170, 1],
        size: isSelected ? 40 : 34,
        outline: {
          color: [255, 255, 255],
          width: 4,
        },
      });

      const markerGraphic = new Graphic({
        geometry: point,
        symbol: markerSymbol,
        attributes: { childminderId: cm.id },
      });

      // Text label
      const textSymbol = new TextSymbol({
        text: cm.first_name[0],
        color: [255, 255, 255],
        font: {
          size: isSelected ? 14 : 12,
          weight: 'bold',
        },
        yoffset: 0,
      });

      const textGraphic = new Graphic({
        geometry: point,
        symbol: textSymbol,
        attributes: { childminderId: cm.id },
      });

      markersLayerRef.current?.add(markerGraphic);
      markersLayerRef.current?.add(textGraphic);
    });
  }, [childminders, selectedChildminder, userCoords, isMapReady]);

  // Draw route when childminder is selected
  useEffect(() => {
    if (!routeLayerRef.current || !isMapReady) return;

    routeLayerRef.current.removeAll();
    setRouteInfo(null);

    if (!userCoords || !selectedChildminder) return;

    const selectedCm = childminders.find(cm => cm.id === selectedChildminder);
    if (!selectedCm?.lat || !selectedCm?.lng) return;

    const routeUrl = 'https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World';

    const userStop = new Graphic({
      geometry: new Point({
        longitude: userCoords.lng,
        latitude: userCoords.lat,
      }),
    });

    const childminderStop = new Graphic({
      geometry: new Point({
        longitude: selectedCm.lng,
        latitude: selectedCm.lat,
      }),
    });

    const routeParams = new RouteParameters({
      stops: new FeatureSet({
        features: [userStop, childminderStop],
      }),
      returnDirections: true,
      directionsLengthUnits: 'miles' as any,
    });

    route.solve(routeUrl, routeParams).then((results) => {
      if (results.routeResults.length > 0) {
        const routeResult = results.routeResults[0].route;
        
        routeResult.symbol = new SimpleLineSymbol({
          color: [27, 154, 170, 0.8],
          width: 5,
        });

        routeLayerRef.current?.add(routeResult);

        // Get route info
        const totalLength = results.routeResults[0].route.attributes.Total_Miles;
        const totalTime = results.routeResults[0].route.attributes.Total_TravelTime;

        setRouteInfo({
          distance: `${totalLength.toFixed(1)} miles`,
          duration: `${Math.round(totalTime)} min`,
        });

        // Zoom to show the route
        if (viewRef.current && routeResult.geometry) {
          viewRef.current.goTo((routeResult.geometry as any).extent?.expand(1.5));
        }
      }
    }).catch((error) => {
      console.error('Route calculation failed:', error);
      // Fallback: draw straight line
      const line = new Polyline({
        paths: [[
          [userCoords.lng, userCoords.lat],
          [selectedCm.lng, selectedCm.lat],
        ]],
      });

      const lineSymbol = new SimpleLineSymbol({
        color: [27, 154, 170, 0.6],
        width: 3,
        style: 'dash',
      });

      const lineGraphic = new Graphic({
        geometry: line,
        symbol: lineSymbol,
      });

      routeLayerRef.current?.add(lineGraphic);
    });
  }, [selectedChildminder, userCoords, childminders, isMapReady]);

  return (
    <>
      <div ref={mapDiv} className="absolute inset-0" />
      
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

      {/* Route info overlay */}
      {routeInfo && selectedChildminder && (() => {
        const cm = childminders.find(c => c.id === selectedChildminder);
        if (!cm) return null;
        return (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 z-10 min-w-[220px] border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--rk-primary))] flex items-center justify-center text-white font-semibold">
                {cm.first_name[0]}
              </div>
              <div>
                <p className="font-semibold text-sm">{cm.first_name} {cm.last_name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {routeInfo.distance}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {routeInfo.duration}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Selected childminder info (when no route yet) */}
      {selectedChildminder && !routeInfo && (() => {
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
          </div>
        );
      })()}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-10">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow"></div>
            <span className="text-gray-600">Your location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--rk-primary))] border-2 border-white shadow"></div>
            <span className="text-gray-600">Childminder</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow"></div>
            <span className="text-gray-600">Selected</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChildminderMap;
