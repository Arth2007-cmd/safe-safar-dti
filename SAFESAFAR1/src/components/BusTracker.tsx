import React, { useState, useEffect } from 'react';
import { Clock, Users, MapPin, AlertCircle, Phone, Share2, Star, ShieldAlert, ArrowLeft, Bus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface BusData {
  id: string;
  routeNumber: string;
  currentLocation: string;
  nextStop: string;
  eta: number;
  occupancy: 'low' | 'medium' | 'high';
  status: 'on-time' | 'delayed' | 'cancelled';
  totalStops: number;
  completedStops: number;
  driverName: string;
  busNumber: string;
}

interface BusTrackerProps {
  routeNumber: string;
  onBack: () => void;
}

export default function BusTracker({ routeNumber, onBack }: BusTrackerProps) {
  const [busData, setBusData] = useState<BusData | null>(null);
  const [isTracking, setIsTracking] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching bus data
    const mockBusData: BusData = {
      id: 'bus-tracker-1',
      routeNumber,
      currentLocation: 'Near Central Market',
      nextStop: 'Medical College Gate',
      eta: 3,
      occupancy: 'medium',
      status: 'on-time',
      totalStops: 12,
      completedStops: 8,
      driverName: 'Raj Kumar',
      busNumber: 'UP-14-AB-1234'
    };

    setBusData(mockBusData);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setBusData(prev => {
        if (!prev) return prev;

        const newEta = Math.max(0, prev.eta - 0.5);
        const progress = Math.min(prev.completedStops + 0.1, prev.totalStops);

        return {
          ...prev,
          eta: newEta,
          completedStops: progress,
          currentLocation: newEta <= 1 ? 'Approaching your stop' : prev.currentLocation
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [routeNumber]);

  const getOccupancyInfo = (occupancy: string) => {
    switch (occupancy) {
      case 'low': return { color: 'text-green-600 bg-green-50 border-green-200', label: 'Plenty of seats', percentage: 30 };
      case 'medium': return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Moderate crowd', percentage: 65 };
      case 'high': return { color: 'text-red-600 bg-red-50 border-red-200', label: 'Crowded', percentage: 90 };
      default: return { color: 'text-gray-600 bg-gray-50 border-gray-200', label: 'Unknown', percentage: 50 };
    }
  };

  const handleShareTrip = () => {
    const message = `I'm tracking ${routeNumber} - arriving in ${busData?.eta} minutes at ${busData?.nextStop}. Track with SafeSafar!`;

    if (navigator.share) {
      navigator.share({
        title: 'SafeSafar Trip',
        text: message,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(message);
      toast({
        title: 'Trip details copied!',
        description: 'Share the link with your family',
      });
    }
  };

  const handleEmergencyContact = () => {
    toast({
      title: 'Emergency contacts',
      description: 'Police: 100 | Ambulance: 108 | Bus Helpline: 1950',
    });
  };

  const callNumber = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  if (!busData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Connecting to bus...</p>
        </div>
      </div>
    );
  }

  const occupancyInfo = getOccupancyInfo(busData.occupancy);
  const progressPercentage = (busData.completedStops / busData.totalStops) * 100;

  // Route stops for visual timeline
  const routeStops = [
    { name: 'Start Point', time: '8:00', completed: true },
    { name: 'City Center', time: '8:12', completed: true },
    { name: 'Railway Station', time: '8:18', completed: true },
    { name: 'Central Market', time: '8:24', completed: true, current: true },
    { name: 'Medical College', time: '8:30', completed: false, isNext: true },
    { name: 'University', time: '8:38', completed: false },
  ];

  return (
    <div className="space-y-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{busData.routeNumber}</h2>
              <Badge variant={busData.status === 'on-time' ? 'default' : 'secondary'}
                className={`text-[10px] ${busData.status === 'on-time' ? 'status-live' : 'status-delayed'}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${busData.status === 'on-time' ? 'bg-green-500 breathing' : 'bg-orange-500'}`} />
                {busData.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Live Tracking</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShareTrip} className="rounded-xl h-9">
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsTracking(!isTracking)} className="rounded-xl h-9">
            <Star className={`w-4 h-4 mr-1 ${isTracking ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            {isTracking ? 'Tracking' : 'Track'}
          </Button>
        </div>
      </div>

      {/* Main ETA Card */}
      <Card className="bg-[#0b162b] border-white/10 overflow-hidden">
        <div className="h-1 route-line" />
        <CardContent className="p-5 space-y-4">
          {/* ETA Display */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/5 rounded-full">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Estimated arrival</span>
            </div>
            <div className="text-5xl font-bold text-primary tracking-tight">
              {Math.round(busData.eta * 10) / 10}
              <span className="text-xl text-muted-foreground ml-1 font-normal">min</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{busData.nextStop}</p>
              <p className="text-xs text-muted-foreground">{busData.currentLocation}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Route Progress</span>
              <span className="font-medium">{Math.round(busData.completedStops)}/{busData.totalStops} stops</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Route Timeline */}
      <Card className="bg-[#0b162b] border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Route Timeline</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-0">
            {routeStops.map((stop, i) => (
              <div key={i} className="flex items-start gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                    stop.current
                      ? 'border-primary bg-primary breathing'
                      : stop.completed
                        ? 'border-green-500 bg-green-500'
                        : stop.isNext
                          ? 'border-primary bg-white'
                          : 'border-gray-300 bg-white'
                  }`} />
                  {i < routeStops.length - 1 && (
                    <div className={`w-0.5 h-6 ${
                      stop.completed && !stop.current ? 'bg-green-400' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                {/* Stop info */}
                <div className={`pb-2 -mt-0.5 ${stop.current ? 'font-semibold text-primary' : stop.completed ? '' : 'text-muted-foreground'}`}>
                  <p className="text-xs">{stop.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {stop.current ? '📍 Bus is here' : stop.isNext ? `⏱️ ETA ${busData.eta} min` : stop.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bus Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Occupancy Card */}
        <Card className="bg-[#0b162b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Occupancy</span>
            </div>
            <div className="space-y-2">
              <div className={`text-xs px-2 py-1 rounded-full border inline-block ${occupancyInfo.color}`}>
                {occupancyInfo.label}
              </div>
              <Progress value={occupancyInfo.percentage} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Bus Info Card */}
        <Card className="bg-[#0b162b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bus className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Bus Details</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Number: <span className="font-medium text-foreground">{busData.busNumber}</span></p>
              <p>Driver: <span className="font-medium text-foreground">{busData.driverName}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="transit-button"
          onClick={handleEmergencyContact}
        >
          <Phone className="w-4 h-4 mr-2" />
          Emergency
        </Button>
        <Button
          variant="outline"
          className="transit-button"
          onClick={onBack}
        >
          <MapPin className="w-4 h-4 mr-2" />
          View on Map
        </Button>
      </div>

      {/* Emergency Quick Dial */}
      <Card className="bg-[#190c12] border-red-500/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <p className="text-sm font-semibold text-red-700">Emergency Quick Dial</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button size="sm" variant="outline" onClick={() => callNumber('100')}
              className="rounded-xl text-xs border-red-200 hover:bg-red-50">
              🚔 Police
            </Button>
            <Button size="sm" variant="outline" onClick={() => callNumber('108')}
              className="rounded-xl text-xs border-red-200 hover:bg-red-50">
              🚑 Ambulance
            </Button>
            <Button size="sm" variant="outline" onClick={() => callNumber('1950')}
              className="rounded-xl text-xs border-red-200 hover:bg-red-50">
              📞 Helpline
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Safety Notice */}
      <Card className="bg-[#19150b] border-amber-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-amber-900">Safety Reminder</h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                Please arrive at the bus stop 2-3 minutes before the estimated time.
                Keep your travel documents ready and stay alert.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}