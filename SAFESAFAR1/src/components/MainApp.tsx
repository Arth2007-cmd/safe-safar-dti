import React, { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  MapPin,
  Clock,
  Navigation,
  Star,
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck,
  Zap,
  BellRing,
  Map,
  X,
  Bus,
  TrendingUp,
  Route,
  Home,
  Ticket,
  Gamepad2,
  Brain,
  Shield,
  LineChart,
  UserCircle,
  Share2,
  Copy,
  CheckCircle2,
  Circle,
  Wallet
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { useAuthStore } from '@/store/auth-store';

const MapView = lazy(() => import('./MainView'));
const BusTracker = lazy(() => import('./BusTracker'));

// Loading skeleton with shimmer
const LoadingSkeleton = () => (
  <div className="p-4 space-y-4">
    <div className="shimmer h-32 rounded-xl" />
    <div className="shimmer h-24 rounded-xl" />
    <div className="shimmer h-24 rounded-xl" />
  </div>
);

export const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'map' | 'routes' | 'fares'>('search');
  const [activeSection, setActiveSection] = useState<'dashboard' | 'book' | 'livemaps' | 'gamehub' | 'ai' | 'emergency' | 'impact' | 'profile'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('12A');
  const [favoriteIds, setFavoriteIds] = useState<number[]>([1]);
  const [tripChecklist, setTripChecklist] = useState<Record<string, boolean>>({
    liveLocation: false,
    emergencyContacts: false,
    lowBatteryMode: false,
  });
  const [etaAlertEnabled, setEtaAlertEnabled] = useState(true);
  const [lastEtaAlertRoute, setLastEtaAlertRoute] = useState<string | null>(null);
  const { user, logout } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('safeSafar_tripChecklist');
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Record<string, boolean>;
      setTripChecklist((prev) => ({ ...prev, ...parsed }));
    } catch {
      // Ignore invalid local data and keep defaults.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('safeSafar_tripChecklist', JSON.stringify(tripChecklist));
  }, [tripChecklist]);

  useEffect(() => {
    const stored = localStorage.getItem('safeSafar_etaAlertEnabled');
    if (!stored) return;
    setEtaAlertEnabled(stored === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('safeSafar_etaAlertEnabled', String(etaAlertEnabled));
  }, [etaAlertEnabled]);

  const nearbyStops = [
    { id: 1, name: "City Center Mall", distance: "150m", buses: ["12A", "45B", "78C"] },
    { id: 2, name: "Railway Station", distance: "300m", buses: ["12A", "23D", "67E"] },
    { id: 3, name: "Hospital Junction", distance: "450m", buses: ["45B", "78C", "89F"] },
  ];

  const quickRoutes = [
    { id: 1, from: "Home", to: "Office", duration: "25 min", buses: ["12A", "45B"], nextBus: "3 min", isFavorite: true },
    { id: 2, from: "City Center", to: "University", duration: "18 min", buses: ["78C"], nextBus: "7 min", isFavorite: false },
    { id: 3, from: "Old Town", to: "Airport", duration: "31 min", buses: ["23D", "67E"], nextBus: "5 min", isFavorite: false },
  ];

  const regionFareData: Record<string, { id: number; route: string; from: string; to: string; nonAc: number; ac: number; distance: string; eta: string }[]> = {
    delhi: [
      { id: 1, route: 'DTC 534', from: 'Anand Vihar ISBT', to: 'Connaught Place', nonAc: 15, ac: 30, distance: '14 km', eta: '32 min' },
      { id: 2, route: 'DTC 522', from: 'Dwarka Sector 21', to: 'AIIMS', nonAc: 20, ac: 40, distance: '21 km', eta: '46 min' },
      { id: 3, route: 'Cluster 740', from: 'Rohini Sector 3', to: 'Kashmere Gate', nonAc: 10, ac: 25, distance: '12 km', eta: '30 min' },
      { id: 4, route: 'DTC 85', from: 'Lajpat Nagar', to: 'Karol Bagh', nonAc: 10, ac: 25, distance: '9 km', eta: '24 min' },
    ],
    mumbai: [
      { id: 1, route: 'BEST A-312', from: 'Andheri East', to: 'BKC', nonAc: 20, ac: 45, distance: '13 km', eta: '34 min' },
      { id: 2, route: 'BEST 202', from: 'Borivali', to: 'Dadar', nonAc: 25, ac: 55, distance: '24 km', eta: '52 min' },
      { id: 3, route: 'BEST 340', from: 'Kurla', to: 'CST', nonAc: 15, ac: 35, distance: '11 km', eta: '28 min' },
      { id: 4, route: 'BEST C-72', from: 'Powai', to: 'Sion', nonAc: 15, ac: 40, distance: '10 km', eta: '26 min' },
    ],
    bengaluru: [
      { id: 1, route: 'BMTC 500D', from: 'Hebbal', to: 'Silk Board', nonAc: 25, ac: 50, distance: '23 km', eta: '48 min' },
      { id: 2, route: 'BMTC KIAS-8', from: 'Electronic City', to: 'Airport', nonAc: 90, ac: 110, distance: '52 km', eta: '95 min' },
      { id: 3, route: 'BMTC 365C', from: 'Majestic', to: 'Whitefield', nonAc: 30, ac: 60, distance: '27 km', eta: '58 min' },
      { id: 4, route: 'BMTC G-3', from: 'Banashankari', to: 'KR Market', nonAc: 10, ac: 25, distance: '8 km', eta: '22 min' },
    ],
    jaipur: [
      { id: 1, route: 'JCTSL 1A', from: 'Vaishali Nagar', to: 'Ajmeri Gate', nonAc: 15, ac: 30, distance: '14 km', eta: '33 min' },
      { id: 2, route: 'JCTSL 9A', from: 'Mansarovar', to: 'Sindhi Camp', nonAc: 20, ac: 35, distance: '16 km', eta: '38 min' },
      { id: 3, route: 'JCTSL AC-2', from: 'Jagatpura', to: 'MI Road', nonAc: 20, ac: 40, distance: '18 km', eta: '40 min' },
      { id: 4, route: 'JCTSL 3B', from: 'Tonk Road', to: 'Chandpole', nonAc: 15, ac: 30, distance: '12 km', eta: '29 min' },
    ],
    pune: [
      { id: 1, route: 'PMPML 166', from: 'Kothrud Depot', to: 'Swargate', nonAc: 15, ac: 30, distance: '11 km', eta: '28 min' },
      { id: 2, route: 'PMPML 208', from: 'Hinjewadi Phase 3', to: 'Shivajinagar', nonAc: 30, ac: 60, distance: '24 km', eta: '52 min' },
      { id: 3, route: 'PMPML 111', from: 'Hadapsar', to: 'Pune Station', nonAc: 20, ac: 40, distance: '14 km', eta: '35 min' },
      { id: 4, route: 'PMPML 14', from: 'Aundh', to: 'Deccan Gymkhana', nonAc: 15, ac: 30, distance: '10 km', eta: '25 min' },
    ],
    hyderabad: [
      { id: 1, route: 'TSRTC 218', from: 'Secunderabad', to: 'Koti', nonAc: 15, ac: 35, distance: '9 km', eta: '24 min' },
      { id: 2, route: 'TSRTC 10K', from: 'Miyapur', to: 'Gachibowli', nonAc: 20, ac: 45, distance: '17 km', eta: '39 min' },
      { id: 3, route: 'TSRTC 49M', from: 'LB Nagar', to: 'Mehdipatnam', nonAc: 25, ac: 50, distance: '20 km', eta: '46 min' },
      { id: 4, route: 'TSRTC 5K', from: 'Charminar', to: 'Secunderabad', nonAc: 20, ac: 40, distance: '13 km', eta: '31 min' },
    ],
    chennai: [
      { id: 1, route: 'MTC 21G', from: 'Broadway', to: 'Tambaram', nonAc: 30, ac: 60, distance: '27 km', eta: '59 min' },
      { id: 2, route: 'MTC 570', from: 'CMBT', to: 'Kelambakkam', nonAc: 35, ac: 70, distance: '31 km', eta: '67 min' },
      { id: 3, route: 'MTC 47A', from: 'T Nagar', to: 'Adyar', nonAc: 15, ac: 35, distance: '10 km', eta: '26 min' },
      { id: 4, route: 'MTC 29C', from: 'Perambur', to: 'Thiruvanmiyur', nonAc: 25, ac: 50, distance: '19 km', eta: '44 min' },
    ],
    kolkata: [
      { id: 1, route: 'WBTC S12', from: 'Howrah', to: 'Salt Lake Sector 5', nonAc: 20, ac: 40, distance: '15 km', eta: '38 min' },
      { id: 2, route: 'WBTC AC47', from: 'Esplanade', to: 'Garia', nonAc: 25, ac: 55, distance: '18 km', eta: '42 min' },
      { id: 3, route: 'WBTC 215A', from: 'Shyambazar', to: 'Park Circus', nonAc: 15, ac: 30, distance: '9 km', eta: '24 min' },
      { id: 4, route: 'WBTC VS1', from: 'Dum Dum', to: 'New Town', nonAc: 20, ac: 45, distance: '14 km', eta: '33 min' },
    ],
  };

  const searchText = searchQuery.toLowerCase();
  const regionAliases: Record<string, string[]> = {
    delhi: ['delhi', 'new delhi', 'ncr'],
    mumbai: ['mumbai', 'bombay'],
    bengaluru: ['bengaluru', 'bangalore', 'blr'],
    jaipur: ['jaipur'],
    pune: ['pune'],
    hyderabad: ['hyderabad', 'hyd'],
    chennai: ['chennai', 'madras'],
    kolkata: ['kolkata', 'calcutta'],
  };

  const activeRegion = Object.entries(regionAliases).find(([region, aliases]) =>
    searchText.includes(region) || aliases.some((alias) => searchText.includes(alias))
  )?.[0] ?? 'all';
  const regionalBusFares = activeRegion === 'all'
    ? Object.values(regionFareData).flat().slice(0, 10)
    : regionFareData[activeRegion];

  const notifications = [
    { id: 1, title: 'Route 12A arriving early', description: 'Bus is 2 min ahead of schedule.', type: 'info' },
    { id: 2, title: 'Rain alert near downtown', description: 'Use covered boarding point at City Center.', type: 'warning' },
    { id: 3, title: 'Crowd update on 45B', description: 'Try 78C for faster boarding.', type: 'tip' },
  ];

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    setShowAuthModal(true);
  };

  const handleShareTrip = async () => {
    const shareMessage = `Tracking ${selectedRoute} on SafeSafar. Live updates enabled for my trip.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SafeSafar Live Trip',
          text: shareMessage,
          url: window.location.href,
        });
        toast({ title: 'Trip shared', description: 'Live trip details shared successfully.' });
        return;
      } catch {
        // User may dismiss share sheet; fallback handled below.
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareMessage} ${window.location.href}`);
      toast({ title: 'Link copied', description: 'Trip share link copied to clipboard.' });
    } catch {
      toast({ title: 'Share unavailable', description: 'Could not share this trip on your device.' });
    }
  };

  const filteredQuickRoutes = quickRoutes.filter((route) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return route.from.toLowerCase().includes(q) || route.to.toLowerCase().includes(q) || route.buses.join(' ').toLowerCase().includes(q);
  });
  const regionalQuickRouteFallback = regionalBusFares.slice(0, 4).map((bus, index) => ({
    id: 100 + index,
    from: bus.from,
    to: bus.to,
    duration: bus.eta,
    buses: [bus.route],
    nextBus: bus.eta,
    isFavorite: false,
  }));
  const visibleQuickRoutes = searchQuery.trim() && filteredQuickRoutes.length === 0
    ? regionalQuickRouteFallback
    : filteredQuickRoutes;
  const parseMinutes = (value: string) => {
    const match = value.match(/\d+/);
    return match ? Number(match[0]) : null;
  };
  const selectedQuickRoute = visibleQuickRoutes.find((route) => route.buses.includes(selectedRoute));
  const selectedFareRoute = regionalBusFares.find((bus) => bus.route === selectedRoute);
  const selectedRouteEtaMinutes =
    (selectedQuickRoute && parseMinutes(selectedQuickRoute.nextBus)) ||
    (selectedFareRoute && parseMinutes(selectedFareRoute.eta)) ||
    null;

  const filteredNearbyStops = nearbyStops.filter((stop) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return stop.name.toLowerCase().includes(q) || stop.buses.join(' ').toLowerCase().includes(q);
  });
  const checklistItems = [
    { key: 'liveLocation', label: 'Enable live location sharing' },
    { key: 'emergencyContacts', label: 'Emergency contacts verified' },
    { key: 'lowBatteryMode', label: 'Low battery mode prepared' },
  ] as const;
  const checklistDoneCount = checklistItems.filter((item) => tripChecklist[item.key]).length;
  const fareInsight = regionalBusFares[0];
  const canNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  useEffect(() => {
    if (!etaAlertEnabled || selectedRouteEtaMinutes === null) return;
    if (selectedRouteEtaMinutes <= 5 && lastEtaAlertRoute !== selectedRoute) {
      toast({
        title: `ETA alert: ${selectedRoute}`,
        description: `Your bus is approximately ${selectedRouteEtaMinutes} min away.`,
      });
      setLastEtaAlertRoute(selectedRoute);
    }
    if (selectedRouteEtaMinutes > 5 && lastEtaAlertRoute === selectedRoute) {
      setLastEtaAlertRoute(null);
    }
  }, [etaAlertEnabled, lastEtaAlertRoute, selectedRoute, selectedRouteEtaMinutes, toast]);

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Card className="w-full max-w-md shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Bus className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Welcome to SafeSafar</h2>
                <p className="text-muted-foreground text-sm mb-6">Log in to track buses and plan your commute</p>
                <Button onClick={() => setShowAuthModal(true)} className="w-full h-12 text-base rounded-xl">
                  Log In to Continue
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  const tabs = [
    { key: 'search' as const, label: 'Routes', icon: Route },
    { key: 'map' as const, label: 'Live Map', icon: MapPin },
    { key: 'routes' as const, label: 'Tracking', icon: Navigation },
    { key: 'fares' as const, label: 'Regional Fares', icon: Bus },
  ];

  const topStats = [
    { label: 'Total Users', value: '4.2M+', color: 'text-blue-400' },
    { label: 'CO2 Saved', value: '2.5K tons', color: 'text-green-400' },
    { label: 'Safety Score', value: '98.7%', color: 'text-purple-400' },
    { label: 'Achievements', value: '1250', color: 'text-orange-400' },
  ];

  const sections = [
    { key: 'dashboard' as const, label: 'Dashboard', icon: Home },
    { key: 'book' as const, label: 'Book Bus', icon: Ticket },
    { key: 'livemaps' as const, label: 'Live Maps', icon: MapPin },
    { key: 'gamehub' as const, label: 'GameHub', icon: Gamepad2 },
    { key: 'ai' as const, label: 'AI Features', icon: Brain },
    { key: 'emergency' as const, label: 'Emergency', icon: Shield },
    { key: 'impact' as const, label: 'Impact', icon: LineChart },
    { key: 'profile' as const, label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="app-enter min-h-screen bg-[#060b16] text-white">
      {/* Header */}
      <header className="bg-[#071124] text-white sticky top-0 z-30 border-b border-white/10"
        style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
        <div className="px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10 rounded-xl"
                onClick={() => setShowMenu(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold tracking-tight">SafeSafar</h1>
                <p className="text-xs text-white/60">Plan your safe commute</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10 rounded-xl relative"
                onClick={() => setShowNotifications((prev) => !prev)}
              >
                <Bell className="w-5 h-5" />
                {/* Notification badge */}
                <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full breathing" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfile(true)}
                className="text-white hover:bg-white/10 rounded-xl"
              >
                <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#060b16]">
        {topStats.map((stat) => (
          <Card key={stat.label} className="bg-[#0b162b] border-white/10 shadow-lg">
            <CardContent className="p-3">
              <p className="text-[11px] text-white/60">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="px-4 pb-3 bg-[#060b16]">
        <Card className="bg-[#0b162b] border-white/10">
          <CardContent className="p-2 flex gap-1 overflow-x-auto">
            {sections.map((item) => (
              <Button
                key={item.key}
                variant="ghost"
                size="sm"
                className={`shrink-0 rounded-lg text-xs ${activeSection === item.key ? 'bg-blue-500/20 text-blue-300' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                onClick={() => {
                  setActiveSection(item.key);
                  if (item.key === 'dashboard') setActiveTab('search');
                  if (item.key === 'livemaps') setActiveTab('map');
                  if (item.key === 'emergency') setActiveTab('routes');
                  if (item.key === 'profile') setShowProfile(true);
                }}
              >
                <item.icon className="w-3.5 h-3.5 mr-1" />
                {item.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-[#060b16]">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Where do you want to go?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-[#0b162b] border border-white/15 focus:border-blue-500 rounded-xl shadow-sm text-base text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 border-b bg-background">
              <Card className="border-primary/20 bg-primary/5 overflow-hidden">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-primary" />
                      Live alerts
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  {notifications.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="rounded-lg bg-background p-2.5 border hover:border-primary/20 transition-colors"
                    >
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trending Stats */}
      <div className="px-4 py-3 border-b border-white/10 bg-[#060b16]">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs uppercase tracking-wider text-white/50 font-medium">Trending now</p>
          <Badge variant="outline" className="text-[10px] gap-1">
            <Sparkles className="w-3 h-3 text-blue-300" />
            Smart commute
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Safety score', value: '98%', color: 'text-green-600', icon: ShieldCheck },
            { label: 'Crowd level', value: 'Medium', color: 'text-yellow-600', icon: TrendingUp },
            { label: 'Fastest ETA', value: '12 min', color: 'text-primary', icon: Zap },
          ].map((stat, i) => (
            <motion.div key={stat.label} whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Card className="bg-[#0b162b] border-white/10 hover:border-blue-500/40 transition-all">
                <CardContent className="p-2.5">
                  <div className="flex items-center gap-1 mb-1">
                    <stat.icon className={`w-3 h-3 ${stat.color}`} />
                    <p className="text-[10px] text-white/50">{stat.label}</p>
                  </div>
                  <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[#060b16] border-b border-white/10 sticky top-[60px] z-20">
        <div className="grid grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 relative ${
                activeTab === tab.key
                  ? 'text-blue-300 bg-blue-500/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4 mx-auto mb-1" />
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <AnimatePresence mode="wait">
            {activeTab === 'search' && (
              <motion.div
                key="search-tab"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="p-4 space-y-6"
              >
                <Card className="bg-[#0b162b] border-white/10">
                  <CardContent className="p-4">
                    <p className="text-xl font-bold">Welcome back, Traveler! 👋</p>
                    <p className="text-sm text-white/60 mt-1">12 day streak • 1250 points • Next bus 5 min away</p>
                  </CardContent>
                </Card>

                {activeSection !== 'dashboard' && (
                  <Card className="bg-[#0b162b] border-white/10">
                    <CardContent className="p-4">
                      {activeSection === 'book' && (
                        <>
                          <p className="font-semibold mb-2">Book Bus</p>
                          <p className="text-sm text-white/60">Select source, destination and seats from Regional Fares tab for a fast booking flow.</p>
                        </>
                      )}
                      {activeSection === 'gamehub' && (
                        <>
                          <p className="font-semibold mb-2">GameHub</p>
                          <p className="text-sm text-white/60">Earn reward points by daily commute streaks, safe travel challenges and quiz milestones.</p>
                        </>
                      )}
                      {activeSection === 'ai' && (
                        <>
                          <p className="font-semibold mb-2">AI Features</p>
                          <p className="text-sm text-white/60">AI route optimizer, crowd prediction and safer path recommendations are now active.</p>
                        </>
                      )}
                      {activeSection === 'impact' && (
                        <>
                          <p className="font-semibold mb-2">Impact</p>
                          <p className="text-sm text-white/60">Track your carbon savings and eco-impact with each public transit journey.</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
                {/* Quick Routes */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Quick Routes</h2>
                    <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={() => setSearchQuery('')}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {visibleQuickRoutes.map((route, i) => (
                      <motion.div
                        key={route.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                        whileHover={{ y: -3, scale: 1.005 }}
                      >
                        <Card className="bg-[#0b162b] border-white/10 hover:border-blue-400/40 overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="flex items-center space-x-1.5">
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full breathing" />
                                    <span className="font-medium text-white">{route.from}</span>
                                  </div>
                                  <div className="flex-1 h-[2px] route-line rounded-full mx-1" style={{ maxWidth: '30px' }} />
                                  <div className="flex items-center space-x-1.5">
                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                                    <span className="font-medium text-white">{route.to}</span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      setFavoriteIds((prev) =>
                                        prev.includes(route.id) ? prev.filter((id) => id !== route.id) : [...prev, route.id]
                                      )
                                    }
                                    aria-label="toggle favorite"
                                    className="ml-1 transition-transform active:scale-75"
                                  >
                                    <Star
                                      className={`w-4 h-4 transition-colors duration-300 ${
                                        favoriteIds.includes(route.id) || route.isFavorite
                                          ? 'text-yellow-500 fill-yellow-500'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  </button>
                                </div>
                          <div className="flex items-center space-x-4 text-sm text-white/60">
                                  <span className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{route.duration}</span>
                                  </span>
                                  <span className="text-green-600 font-medium">Next: {route.nextBus}</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                  {route.buses.map((bus) => (
                                <Badge key={bus} variant="outline" className="text-xs border-blue-400/30 text-blue-200">
                                      {bus}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="ml-4 rounded-xl bg-blue-600 hover:bg-blue-500"
                                onClick={() => {
                                  setSelectedRoute(route.buses[0] ?? '12A');
                                  setActiveTab('routes');
                                }}
                              >
                                Track
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                    {searchQuery.trim() && filteredQuickRoutes.length === 0 && (
                      <div className="text-center py-3 text-xs text-blue-300">
                        Showing {activeRegion === 'all' ? 'popular' : activeRegion} routes for your search.
                      </div>
                    )}
                  </div>
                </section>

                {/* Smart Suggestions */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">Smart Suggestions</h2>
                  <div className="grid gap-3">
                    <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400 }}>
                      <Card className="bg-[#0b162b] border-green-500/20">
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Safer route detected</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              Use Route 12A today. It has fewer delay and crowd alerts.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400 }}>
                      <Card className="bg-[#0b162b] border-blue-500/20">
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Zap className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Leave in 8 minutes</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              Best window to avoid heavy crowd on your office route.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </section>

                {/* Smart Trip Tools */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">Smart Trip Tools</h2>
                  <div className="grid gap-3">
                    <Card className="bg-[#0b162b] border-cyan-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-cyan-300" />
                              Fare Compare ({activeRegion === 'all' ? 'Popular' : activeRegion})
                            </p>
                            <p className="text-xs text-white/60 mt-1">
                              {fareInsight
                                ? `${fareInsight.route}: Non-AC ₹${fareInsight.nonAc} vs AC ₹${fareInsight.ac} (save ₹${Math.max(
                                    fareInsight.ac - fareInsight.nonAc,
                                    0
                                  )})`
                                : 'Search a region to view fare insights.'}
                            </p>
                          </div>
                          <Badge variant="outline" className="border-cyan-400/40 text-cyan-200">
                            Useful now
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#0b162b] border-green-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold">Pre-Ride Safety Checklist</p>
                          <Badge variant="outline" className="border-green-400/40 text-green-300">
                            {checklistDoneCount}/3 done
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {checklistItems.map((item) => {
                            const done = tripChecklist[item.key];
                            return (
                              <button
                                key={item.key}
                                className="w-full flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-left hover:border-green-400/40 transition-colors"
                                onClick={() =>
                                  setTripChecklist((prev) => ({
                                    ...prev,
                                    [item.key]: !prev[item.key],
                                  }))
                                }
                              >
                                <span className="text-sm text-white/85">{item.label}</span>
                                {done ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Circle className="w-4 h-4 text-white/50" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#0b162b] border-blue-500/20">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">Share Live Trip</p>
                          <p className="text-xs text-white/60 mt-1">
                            Send your current bus tracking status to family/friends in one tap.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="rounded-xl bg-blue-600 hover:bg-blue-500"
                          onClick={handleShareTrip}
                        >
                          {canNativeShare ? <Share2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                          Share
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#0b162b] border-yellow-500/20">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold flex items-center gap-2">
                            <BellRing className="w-4 h-4 text-yellow-300" />
                            ETA Alert (5 min)
                          </p>
                          <p className="text-xs text-white/60 mt-1">
                            {selectedRouteEtaMinutes === null
                              ? `Enable alerts for ${selectedRoute}; ETA sync starts when route timing is available.`
                              : `${selectedRoute} currently ~${selectedRouteEtaMinutes} min away.`}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={etaAlertEnabled ? 'default' : 'outline'}
                          className={etaAlertEnabled ? 'rounded-xl bg-yellow-500 text-black hover:bg-yellow-400' : 'rounded-xl border-white/20 text-white'}
                          onClick={() => {
                            setEtaAlertEnabled((prev) => !prev);
                            toast({
                              title: !etaAlertEnabled ? 'ETA alerts enabled' : 'ETA alerts disabled',
                              description: !etaAlertEnabled
                                ? 'We will notify when your selected route is within 5 minutes.'
                                : 'You can re-enable alerts anytime from Smart Trip Tools.',
                            });
                          }}
                        >
                          {etaAlertEnabled ? 'Enabled' : 'Disabled'}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Nearby Stops */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">Nearby Stops</h2>
                  <div className="space-y-3">
                    {filteredNearbyStops.map((stop, i) => (
                      <motion.div
                        key={stop.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                      >
                        <Card className="bg-[#0b162b] border-white/10">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                  <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-medium">{stop.name}</h3>
                                  <p className="text-sm text-white/60">
                                    {stop.distance} • {stop.buses.length} buses
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-blue-400/30 text-blue-200 hover:bg-blue-500/10"
                                onClick={() => {
                                  setActiveTab('map');
                                  toast({
                                    title: stop.name,
                                    description: `Routes: ${stop.buses.join(', ')}`,
                                  });
                                }}
                              >
                                Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'map' && (
              <motion.div
                key="map-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <MapView
                  onBusSelect={(bus) => {
                    setSelectedRoute(bus.routeNumber);
                    setActiveTab('routes');
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'routes' && (
              <motion.div
                key="routes-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="p-4"
              >
                <BusTracker routeNumber={selectedRoute} onBack={() => setActiveTab('search')} />
              </motion.div>
            )}

            {activeTab === 'fares' && (
              <motion.div
                key="fares-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="p-4"
              >
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold capitalize">
                      {activeRegion === 'all' ? 'All Regions Buses & Fares' : `${activeRegion} Buses & Fares`}
                    </h2>
                    <Badge variant="outline" className="border-blue-400/30 text-blue-200">DTC / Cluster</Badge>
                  </div>
                  <div className="grid gap-3">
                    {regionalBusFares.map((bus) => (
                      <Card key={bus.id} className="bg-[#0b162b] border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-blue-300">{bus.route}</p>
                              <p className="text-xs text-white/60">{bus.from} → {bus.to}</p>
                            </div>
                            <Button
                              size="sm"
                              className="rounded-xl bg-blue-600 hover:bg-blue-500"
                              onClick={() => {
                                setSelectedRoute(bus.route);
                                setActiveTab('routes');
                              }}
                            >
                              Track
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-lg border border-white/10 p-2 bg-white/[0.03]">
                              <p className="text-white/60">Non-AC Fare</p>
                              <p className="font-semibold text-green-400">₹{bus.nonAc}</p>
                            </div>
                            <div className="rounded-lg border border-white/10 p-2 bg-white/[0.03]">
                              <p className="text-white/60">AC Fare</p>
                              <p className="font-semibold text-cyan-300">₹{bus.ac}</p>
                            </div>
                            <div className="rounded-lg border border-white/10 p-2 bg-white/[0.03]">
                              <p className="text-white/60">Distance</p>
                              <p className="font-semibold">{bus.distance}</p>
                            </div>
                            <div className="rounded-lg border border-white/10 p-2 bg-white/[0.03]">
                              <p className="text-white/60">Avg ETA</p>
                              <p className="font-semibold">{bus.eta}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Profile Drawer */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/45 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              className="fixed left-0 top-0 bottom-0 w-[290px] bg-[#0b162b] border-r border-white/10 z-50 p-4"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="font-semibold text-white">SafeSafar Menu</p>
                  <p className="text-xs text-white/60">Quick navigation</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowMenu(false)} className="text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => {
                    setActiveTab('search');
                    setShowMenu(false);
                  }}
                >
                  <Route className="w-4 h-4 mr-2" />
                  Routes Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => {
                    setActiveTab('map');
                    setShowMenu(false);
                  }}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Live Map
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => {
                    setActiveTab('routes');
                    setShowMenu(false);
                  }}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Bus Tracking
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => {
                    setShowProfile(true);
                    setShowMenu(false);
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </div>
            </motion.div>
          </>
        )}
        {showProfile && user && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setShowProfile(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="fixed z-50 top-16 right-4 w-[320px]"
              initial={{ opacity: 0, y: -18, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <Card className="shadow-2xl border-white/10 overflow-hidden bg-[#0b162b]">
                {/* Profile header gradient */}
                <div className="h-16 bg-gradient-to-r from-primary to-accent" />
                <CardContent className="p-5 space-y-4 -mt-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowProfile(false)} className="rounded-xl">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="font-medium truncate">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl"
                      onClick={() => toast({ title: 'Settings', description: 'Account settings are active.' })}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Account settings
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl"
                      onClick={() =>
                        toast({ title: 'Saved places', description: 'Home, Office and recent places are synced.' })
                      }
                    >
                      <Map className="w-4 h-4 mr-2" />
                      Saved places
                    </Button>
                    <Button variant="destructive" className="w-full justify-start rounded-xl" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
