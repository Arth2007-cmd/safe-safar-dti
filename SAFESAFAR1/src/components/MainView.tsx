import React, { useEffect, useMemo, useState } from 'react';
import { GoogleMap, InfoWindow, Marker, Polyline, TrafficLayer, TransitLayer, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Navigation, Clock, Users, AlertTriangle, KeyRound, Satellite, Map as MapIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BusLocation {
  id: string;
  routeNumber: string;
  latitude: number;
  longitude: number;
  occupancy: 'low' | 'medium' | 'high';
  status: 'on-time' | 'delayed' | 'cancelled';
  eta: number;
}

interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  routes: string[];
}

interface MapViewProps {
  selectedRoute?: string;
  onBusSelect?: (bus: BusLocation) => void;
}

export default function MapView({ selectedRoute, onBusSelect }: MapViewProps) {
  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() ?? '';
  const storedKey = localStorage.getItem('SAFE_SAFAR_GOOGLE_MAPS_KEY') ?? '';
  const [mapsApiKey] = useState(envKey || storedKey);

  const [buses, setBuses] = useState<BusLocation[]>([]);
  const [stops, setStops] = useState<BusStop[]>([]);
  const [routeFilter, setRouteFilter] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeBusId, setActiveBusId] = useState<string | null>(null);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'roadmap' | 'satellite'>('roadmap');
  const [trafficOn, setTrafficOn] = useState(true);
  const [transitOn, setTransitOn] = useState(true);
  const [routeFlowOffset, setRouteFlowOffset] = useState(0);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [loaderTimedOut, setLoaderTimedOut] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'safe-safar-map',
    googleMapsApiKey: mapsApiKey,
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoaderTimedOut(true), 2000);
    if (isLoaded) {
      setLoaderTimedOut(false);
      clearTimeout(timer);
    }
    return () => clearTimeout(timer);
  }, [isLoaded]);

  useEffect(() => {
    setBuses([
      { id: 'bus-1', routeNumber: 'Route 15', latitude: 28.6139, longitude: 77.209, occupancy: 'medium', status: 'on-time', eta: 3 },
      { id: 'bus-2', routeNumber: 'Route 22', latitude: 28.6129, longitude: 77.2295, occupancy: 'high', status: 'delayed', eta: 8 },
      { id: 'bus-3', routeNumber: 'Route 15', latitude: 28.6249, longitude: 77.2167, occupancy: 'low', status: 'on-time', eta: 12 },
    ]);
    setStops([
      { id: 'stop-1', name: 'Central Bus Station', latitude: 28.6139, longitude: 77.209, routes: ['Route 15', 'Route 22'] },
      { id: 'stop-2', name: 'Medical College', latitude: 28.6189, longitude: 77.2145, routes: ['Route 15', 'Route 8'] },
      { id: 'stop-3', name: 'Market Square', latitude: 28.6249, longitude: 77.22, routes: ['Route 22', 'Route 8'] },
    ]);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => setUserLocation({ lat: 28.6139, lng: 77.209 })
      );
    }

    const interval = setInterval(() => {
      setBuses((prev) =>
        prev.map((bus) => ({
          ...bus,
          latitude: bus.latitude + (Math.random() - 0.5) * 0.0009,
          longitude: bus.longitude + (Math.random() - 0.5) * 0.0009,
          eta: Math.max(1, bus.eta + (Math.random() > 0.5 ? -1 : 1)),
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const flowTimer = setInterval(() => {
      setRouteFlowOffset((prev) => (prev + 3) % 100);
    }, 180);
    return () => clearInterval(flowTimer);
  }, []);

  const activeRoute = routeFilter ?? selectedRoute;
  const filteredBuses = activeRoute ? buses.filter((b) => b.routeNumber === activeRoute) : buses;
  const displayBuses = filteredBuses.length > 0 ? filteredBuses : buses;
  const activeBus = displayBuses.find((b) => b.id === activeBusId);
  const activeStop = stops.find((s) => s.id === activeStopId);
  const center = userLocation ?? { lat: 28.6139, lng: 77.209 };

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
      gestureHandling: 'greedy',
      mapTypeId: mapMode,
    }),
    [mapMode]
  );

  const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' =>
    status === 'delayed' ? 'secondary' : status === 'cancelled' ? 'destructive' : 'default';
  const occupancyTone = (occupancy: BusLocation['occupancy']) =>
    occupancy === 'high' ? 'text-red-500' : occupancy === 'medium' ? 'text-yellow-500' : 'text-green-500';
  const routeColor = (route: string) => (route.includes('15') ? '#2563eb' : route.includes('22') ? '#f97316' : '#22c55e');
  const fallbackBusPositions = ['18% 34%', '44% 46%', '71% 55%'];
  const busIconUrl =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
        <rect x="6" y="9" width="32" height="24" rx="8" fill="#0ea5e9" stroke="#ffffff" stroke-width="2"/>
        <rect x="10" y="13" width="24" height="9" rx="2" fill="#e0f2fe"/>
        <rect x="11" y="25" width="8" height="5" rx="1" fill="#ffffff"/>
        <rect x="25" y="25" width="8" height="5" rx="1" fill="#ffffff"/>
        <circle cx="14" cy="35" r="3.3" fill="#111827" stroke="#ffffff" stroke-width="1.4"/>
        <circle cx="30" cy="35" r="3.3" fill="#111827" stroke="#ffffff" stroke-width="1.4"/>
      </svg>`
    );

  if (!mapsApiKey) {
    return (
      <div className="relative w-full bg-muted overflow-hidden rounded-xl" style={{ height: '65vh', minHeight: '420px' }}>
        <iframe
          title="SafeSafar map fallback"
          className="w-full h-full"
          src={`https://maps.google.com/maps?q=${center.lat},${center.lng}&z=13&output=embed&t=${mapMode === 'satellite' ? 'k' : 'm'}`}
        />
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path d="M 90 140 Q 220 120 340 170 Q 430 210 560 190" stroke="#2563eb" strokeWidth="3" fill="none" strokeDasharray="8 8" opacity="0.75" />
          <path d="M 120 250 Q 240 220 360 250 Q 470 280 620 250" stroke="#f97316" strokeWidth="3" fill="none" strokeDasharray="8 8" opacity="0.75" />
          <circle cx={`${(routeFlowOffset + 10) * 6.5}`} cy="170" r="4" fill="#60a5fa" />
          <circle cx={`${(routeFlowOffset + 25) * 6.5}`} cy="248" r="4" fill="#fb923c" />
        </svg>
        {displayBuses.slice(0, 3).map((bus, index) => {
          const [left, top] = (fallbackBusPositions[index] ?? '50% 50%').split(' ');
          return (
            <button
              key={`no-key-fallback-bus-${bus.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left, top }}
              onClick={() => onBusSelect?.(bus)}
            >
              <img src={busIconUrl} alt={`${bus.routeNumber} bus`} className="w-8 h-8 drop-shadow-lg" />
              <span className="absolute -right-2 -top-2 px-1.5 py-0.5 rounded-full bg-black/80 text-white text-[9px] border border-white/20">
                {bus.eta}m
              </span>
            </button>
          );
        })}
        <Card className="absolute top-3 left-3 right-3 bg-white/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-3 space-y-1">
            <p className="text-sm font-semibold">Map is live in fallback mode</p>
            <p className="text-xs text-muted-foreground">
              Live manual buses and animated routes are active.
            </p>
          </CardContent>
        </Card>
        <div className="absolute top-3 right-3">
          <Button size="icon" variant="secondary" className="bg-white/95" onClick={() => setMapMode((m) => (m === 'roadmap' ? 'satellite' : 'roadmap'))}>
            {mapMode === 'satellite' ? <MapIcon className="w-4 h-4" /> : <Satellite className="w-4 h-4" />}
          </Button>
        </div>
        <Card className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm shadow-lg w-56 max-h-[45%] overflow-hidden">
          <CardContent className="p-2.5">
            <p className="font-semibold text-xs mb-2">Live Buses (Manual)</p>
            <div className="space-y-2 overflow-y-auto max-h-44 pr-1">
              {displayBuses.map((bus) => (
                <div key={`no-key-list-${bus.id}`} className="rounded-md border border-slate-200 p-2 text-xs bg-white/70">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{bus.routeNumber}</p>
                    <Badge variant={statusVariant(bus.status)} className="text-[10px]">{bus.eta} min</Badge>
                  </div>
                  <p className="text-slate-500">Status: {bus.status} • Occupancy: {bus.occupancy}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fallbackMapSrc = `https://maps.google.com/maps?q=${center.lat},${center.lng}&z=13&output=embed&t=${mapMode === 'satellite' ? 'k' : 'm'}`;

  return (
    <div className="relative w-full bg-muted overflow-hidden rounded-xl" style={{ height: '65vh', minHeight: '420px' }}>
      {(loadError || (!isLoaded && loaderTimedOut)) ? (
        <div className="h-full w-full relative">
          <iframe
            title="SafeSafar fallback map"
            className="w-full h-full"
            src={fallbackMapSrc}
          />
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path d="M 90 140 Q 220 120 340 170 Q 430 210 560 190" stroke="#2563eb" strokeWidth="3" fill="none" strokeDasharray="8 8" opacity="0.75" />
            <path d="M 120 250 Q 240 220 360 250 Q 470 280 620 250" stroke="#f97316" strokeWidth="3" fill="none" strokeDasharray="8 8" opacity="0.75" />
            <circle cx={`${(routeFlowOffset + 10) * 6.5}`} cy="170" r="4" fill="#60a5fa" />
            <circle cx={`${(routeFlowOffset + 25) * 6.5}`} cy="248" r="4" fill="#fb923c" />
          </svg>
          {displayBuses.slice(0, 3).map((bus, index) => {
            const [left, top] = (fallbackBusPositions[index] ?? '50% 50%').split(' ');
            return (
              <div
                key={`fallback-bus-${bus.id}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-black/80 text-white text-[10px] border border-white/20"
                style={{ left, top }}
              >
                {bus.routeNumber} • {bus.eta}m
              </div>
            );
          })}
          <Card className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm shadow-lg max-w-xs">
            <CardContent className="p-2.5 text-xs space-y-1">
              <p className="font-semibold text-orange-600">Fallback map mode active</p>
              <p className="text-muted-foreground">
                Google Maps JS API is blocked or delayed. You can still use map and satellite view here.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : !isLoaded ? (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Loading live map...</div>
      ) : (
        <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={center} zoom={13} options={mapOptions} onLoad={setMapRef}>
          {trafficOn && <TrafficLayer />}
          {transitOn && <TransitLayer />}

          {userLocation && (
            <Marker
              position={userLocation}
              icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#14b8a6', fillOpacity: 1, strokeWeight: 2, strokeColor: '#fff' }}
            />
          )}

          {stops.map((stop) => (
            <Marker
              key={stop.id}
              position={{ lat: stop.latitude, lng: stop.longitude }}
              onClick={() => setActiveStopId(stop.id)}
              icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: '#1d4ed8', fillOpacity: 1, strokeWeight: 1, strokeColor: '#fff' }}
            />
          ))}

          {displayBuses.map((bus) => (
            <Marker
              key={bus.id}
              position={{ lat: bus.latitude, lng: bus.longitude }}
              onClick={() => {
                setActiveBusId(bus.id);
                onBusSelect?.(bus);
              }}
              icon={{
                url: busIconUrl,
                scaledSize: new window.google.maps.Size(32, 32),
                anchor: new window.google.maps.Point(16, 16),
              }}
            />
          ))}

          {displayBuses.map((bus) => (
            <Polyline
              key={`line-${bus.id}`}
              path={[
                { lat: bus.latitude - 0.004, lng: bus.longitude - 0.006 },
                { lat: bus.latitude - 0.001, lng: bus.longitude - 0.002 },
                { lat: bus.latitude, lng: bus.longitude },
                { lat: bus.latitude + 0.003, lng: bus.longitude + 0.004 },
              ]}
              options={{
                strokeColor: routeColor(bus.routeNumber),
                strokeOpacity: 0.85,
                strokeWeight: 4,
                geodesic: true,
                icons: [
                  {
                    icon: {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 3,
                      fillColor: routeColor(bus.routeNumber),
                      fillOpacity: 1,
                      strokeOpacity: 0.8,
                      strokeColor: '#ffffff',
                      strokeWeight: 1,
                    },
                    offset: `${routeFlowOffset}%`,
                    repeat: '14px',
                  },
                ],
              }}
            />
          ))}

          {activeBus && (
            <InfoWindow position={{ lat: activeBus.latitude, lng: activeBus.longitude }} onCloseClick={() => setActiveBusId(null)}>
              <div className="space-y-1 min-w-[170px]">
                <p className="font-semibold">{activeBus.routeNumber}</p>
                <p className="text-xs">ETA: {activeBus.eta} min</p>
                <Badge variant={statusVariant(activeBus.status)}>{activeBus.status}</Badge>
              </div>
            </InfoWindow>
          )}

          {activeStop && (
            <InfoWindow position={{ lat: activeStop.latitude, lng: activeStop.longitude }} onCloseClick={() => setActiveStopId(null)}>
              <div className="space-y-1 min-w-[180px]">
                <p className="font-semibold">{activeStop.name}</p>
                <p className="text-xs">Routes: {activeStop.routes.join(', ')}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}

      <Card className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm shadow-lg">
        <CardContent className="p-2 flex gap-1">
          <Button size="sm" variant={!activeRoute ? 'default' : 'outline'} onClick={() => setRouteFilter(null)}>All</Button>
          <Button size="sm" variant={activeRoute === 'Route 15' ? 'default' : 'outline'} onClick={() => setRouteFilter('Route 15')}>Rt 15</Button>
          <Button size="sm" variant={activeRoute === 'Route 22' ? 'default' : 'outline'} onClick={() => setRouteFilter('Route 22')}>Rt 22</Button>
        </CardContent>
      </Card>

      <Card className="absolute top-16 left-3 bg-white/95 backdrop-blur-sm shadow-lg w-44">
        <CardContent className="p-2.5 space-y-1 text-xs">
          <p className="font-semibold">Route Legend</p>
          <div className="flex items-center gap-2"><span className="w-3 h-1 rounded bg-blue-600" />Route 15</div>
          <div className="flex items-center gap-2"><span className="w-3 h-1 rounded bg-orange-500" />Route 22</div>
          <div className="flex items-center gap-2"><span className="w-3 h-1 rounded bg-green-500" />Other routes</div>
        </CardContent>
      </Card>

      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <Button size="icon" variant="secondary" className="bg-white/95" onClick={() => setMapMode((m) => (m === 'roadmap' ? 'satellite' : 'roadmap'))}>
          {mapMode === 'satellite' ? <MapIcon className="w-4 h-4" /> : <Satellite className="w-4 h-4" />}
        </Button>
        <Button size="icon" variant="secondary" className={`bg-white/95 ${trafficOn ? 'text-primary' : ''}`} onClick={() => setTrafficOn((v) => !v)}>
          <AlertTriangle className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className={`bg-white/95 ${transitOn ? 'text-primary' : ''}`}
          onClick={() => setTransitOn((v) => !v)}
        >
          <MapPin className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="secondary" className="bg-white/95" onClick={() => { if (mapRef) { mapRef.panTo(center); mapRef.setZoom(14); } }}>
          <Navigation className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="secondary" className="bg-white/95" onClick={() => setRouteFilter(null)}>
          <KeyRound className="w-4 h-4" />
        </Button>
      </div>

      <Card className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm shadow-lg w-56">
        <CardContent className="p-2.5 space-y-1.5 text-xs">
          <p className="font-semibold">Live Satellite Map</p>
          <p className="text-muted-foreground">{displayBuses.length} buses tracked live</p>
          <p className="text-muted-foreground">{stops.length} active stops</p>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Auto-refresh every 5s</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>Tap bus marker to open tracking</span>
          </div>
        </CardContent>
      </Card>

      <Card className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm shadow-lg w-64 max-h-[56%] overflow-hidden">
        <CardContent className="p-2.5">
          <p className="font-semibold text-xs mb-2">Live Buses</p>
          <div className="space-y-2 overflow-y-auto max-h-56 pr-1">
            {displayBuses.map((bus) => (
              <button
                key={`list-${bus.id}`}
                className="w-full text-left rounded-md border border-slate-200 p-2 hover:bg-slate-50 transition-colors"
                onClick={() => {
                  setActiveBusId(bus.id);
                  onBusSelect?.(bus);
                  if (mapRef) {
                    mapRef.panTo({ lat: bus.latitude, lng: bus.longitude });
                    mapRef.setZoom(15);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">{bus.routeNumber}</p>
                  <Badge variant={statusVariant(bus.status)} className="text-[10px]">{bus.eta} min</Badge>
                </div>
                <p className="text-[10px] text-slate-500">
                  Status: {bus.status} • <span className={occupancyTone(bus.occupancy)}>{bus.occupancy}</span>
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}