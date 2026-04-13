# SafeSafar - Public Transport Tracking System

## Project Description
SafeSafar is a comprehensive public transport tracking system designed for safe and smart commuting. The app provides real-time bus tracking, route planning, and safety features to make public transportation more predictable and reliable for users in small cities and tier-2 towns.

## Key Features
- App opening experience with animated splash screen and welcome flow
- Beautiful animated login/signup modal with email OTP verification
- Real-time bus tracking with live location updates
- Route selection and journey planning with ETA
- Interactive map view with bus stops and active buses
- Authentication system with email OTP verification
- Safety alerts and emergency contact features
- Occupancy indicators and bus status updates
- Trip sharing and favorites functionality
- Smooth transitions and micro-interactions throughout the app

## Data Storage
Tables: None yet (using mock data for development)
Local: Authentication state persisted via Zustand

## Devv SDK Integration
Built-in: Authentication system (email OTP), ready for database integration
External: None currently

## Special Requirements
Mobile-first responsive design optimized for commuters
High contrast design for outdoor visibility
Offline-capable architecture planned for phase 2
Enhanced animations and transitions for premium user experience

## File Structure

/src
├── components/      # UI components
│   ├── ui/         # Pre-installed shadcn/ui components
│   ├── SplashScreen.tsx    # App opening splash screen with animations
│   ├── WelcomeScreen.tsx   # Welcome screen with app introduction
│   ├── AuthModal.tsx       # Beautiful login/signup modal with slide-up animation
│   ├── MainApp.tsx         # Main application interface
│   ├── MapView.tsx         # Interactive map with bus tracking
│   ├── RouteSelector.tsx   # Route search and selection
│   └── BusTracker.tsx      # Real-time bus tracking interface
│
├── store/          # Zustand state management
│   └── auth-store.ts       # Authentication state with persistence
│
├── pages/          # Page components
│   ├── HomePage.tsx        # App entry point with splash → welcome → main flow
│   └── NotFoundPage.tsx    # 404 error page
│
├── hooks/          # Custom Hooks
│   ├── use-mobile.ts       # Mobile detection Hook
│   └── use-toast.ts        # Toast notification system
│
├── lib/            # Utility functions
│   └── utils.ts            # CN function and utilities
│
├── App.tsx         # Root component with routing
├── main.tsx        # Application entry point
└── index.css       # SafeSafar design system with transit theme and animations

