import React, { useState } from 'react';
import { Search, MapPin, Clock, Users, Navigation2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Route {
  id: string;
  number: string;
  name: string;
  from: string;
  to: string;
  duration: number;
  distance: string;
  frequency: string;
  activeBuses: number;
  nextArrival: number;
  occupancy: 'low' | 'medium' | 'high';
}

interface RouteSelectorProps {
  onRouteSelect: (route: Route) => void;
  selectedRoute?: string;
}

export default function RouteSelector({ onRouteSelect, selectedRoute }: RouteSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoutes, setShowRoutes] = useState(false);

  const routes: Route[] = [
    {
      id: 'route-15',
      number: 'Route 15',
      name: 'City Center - Medical College',
      from: 'Central Bus Station',
      to: 'Medical College',
      duration: 25,
      distance: '8.2 km',
      frequency: 'Every 10 min',
      activeBuses: 3,
      nextArrival: 3,
      occupancy: 'medium'
    },
    {
      id: 'route-22',
      number: 'Route 22',
      name: 'Railway Station - IT Park',
      from: 'Railway Station',
      to: 'IT Park',
      duration: 35,
      distance: '12.5 km',
      frequency: 'Every 15 min',
      activeBuses: 2,
      nextArrival: 8,
      occupancy: 'high'
    },
    {
      id: 'route-8',
      number: 'Route 8',
      name: 'Market Square - University',
      from: 'Market Square',
      to: 'University Campus',
      duration: 20,
      distance: '6.8 km',
      frequency: 'Every 8 min',
      activeBuses: 4,
      nextArrival: 2,
      occupancy: 'low'
    }
  ];

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.to.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOccupancyColor = (occupancy: string) => {
    switch (occupancy) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Where do you want to go?"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowRoutes(true);
          }}
          onFocus={() => setShowRoutes(true)}
          className="transit-input pl-10 text-base"
        />
      </div>

      {/* Quick Access Routes */}
      {!showRoutes && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Popular Routes</h3>
          <div className="grid gap-2">
            {routes.slice(0, 2).map((route) => (
              <Card
                key={route.id}
                className={`transit-card cursor-pointer hover:shadow-md transition-all ${
                  selectedRoute === route.number ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onRouteSelect(route)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-medium">
                          {route.number}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs border ${getOccupancyColor(route.occupancy)}`}
                        >
                          {route.occupancy} occupancy
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{route.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {route.from} → {route.to}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Clock className="w-3 h-3" />
                        <span>{route.nextArrival} min</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {route.frequency}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search Results / All Routes */}
      {showRoutes && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              {searchQuery ? `Results for "${searchQuery}"` : 'All Routes'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowRoutes(false);
                setSearchQuery('');
              }}
              className="text-xs"
            >
              Show Less
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredRoutes.map((route) => (
              <Card
                key={route.id}
                className={`transit-card cursor-pointer hover:shadow-md transition-all ${
                  selectedRoute === route.number ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  onRouteSelect(route);
                  setShowRoutes(false);
                  setSearchQuery('');
                }}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Route Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-medium">
                          {route.number}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs border ${getOccupancyColor(route.occupancy)}`}
                        >
                          <Users className="w-3 h-3 mr-1" />
                          {route.occupancy}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                          <Clock className="w-4 h-4" />
                          <span>{route.nextArrival} min</span>
                        </div>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">{route.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{route.from}</span>
                        <Navigation2 className="w-3 h-3 mx-1" />
                        <span>{route.to}</span>
                      </div>
                    </div>

                    {/* Route Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>{route.distance}</span>
                        <span>{route.duration} min</span>
                        <span>{route.frequency}</span>
                      </div>
                      <span>{route.activeBuses} buses active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}