import React, { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/SplashScreen';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { MainApp } from '@/components/MainApp';
import { AuthModal } from '@/components/AuthModal';
import { useAuthStore } from '@/store/auth-store';

export default function HomePage() {
  const [appState, setAppState] = useState<'splash' | 'welcome' | 'main'>('splash');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, checkAuthStatus } = useAuthStore();

  // Check auth status on app load
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Handle app state transitions
  useEffect(() => {
    if (user && appState === 'welcome') {
      setAppState('main');
      setShowAuthModal(false);
    }
  }, [user, appState]);

  const handleSplashComplete = () => {
    if (user) {
      setAppState('main');
    } else {
      setAppState('welcome');
    }
  };

  const handleLoginClick = () => {
    setShowAuthModal(true);
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
    // If user logged in successfully, state will transition to 'main' via useEffect
  };

  // Show splash screen first
  if (appState === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show welcome screen if no user
  if (appState === 'welcome' && !user) {
    return (
      <>
        <WelcomeScreen onLoginClick={handleLoginClick} />
        <AuthModal isOpen={showAuthModal} onClose={handleAuthClose} />
      </>
    );
  }

  // Show main app if user is logged in
  return <MainApp />;
}