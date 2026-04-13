import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { X, Mail, ArrowLeft, Check, Shield, Smartphone, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const isLocalDevHost = () =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sendOTP, verifyOTP } = useAuthStore();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail('');
      setOtp('');
      setDevOtpHint(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const otpResult = await sendOTP(email);
      setStep('otp');
      if (otpResult.mode === 'local' && otpResult.code) {
        setDevOtpHint(otpResult.code);
      } else {
        setDevOtpHint(null);
      }
      toast({
        title: "OTP Sent!",
        description:
          otpResult.mode === 'local'
            ? "Email delivery failed locally. Use the test OTP shown on screen."
            : "Check your email for the verification code.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send OTP. Please try again.";
      toast({
        title: "Error",
        description: isLocalDevHost()
          ? `${message} (DEV fallback OTP generated. Check browser console).`
          : message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast({
        title: "OTP Required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await verifyOTP(email, otp);
      toast({
        title: "Welcome to SafeSafar!",
        description: "You've successfully logged in.",
      });
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please check the code and try again.";
      toast({
        title: "Invalid OTP",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="login-overlay" onClick={onClose} />

      {/* Modal Panel */}
      <div className="login-panel">
        {/* Handle Bar */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          {step === 'otp' ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep('email')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 max-h-[70vh] overflow-y-auto">
          {step === 'email' ? (
            <div key="email" className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Welcome Back</h2>
                <p className="text-muted-foreground">
                  Enter your email to get started with SafeSafar
                </p>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-base"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Continue"}
                </Button>
              </form>

              {/* Features */}
              <div className="space-y-4 pt-4 border-t">
                <p className="text-sm font-medium text-center text-muted-foreground">
                  Why choose SafeSafar?
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm">Real-time bus tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm">Safety alerts & emergency contacts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm">Offline mode for poor connectivity</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div key="otp" className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold">Verify Your Email</h2>
                <p className="text-muted-foreground">
                  We've sent a 6-digit code to
                </p>
                <p className="font-medium text-primary">{email}</p>
              </div>

              {/* OTP Form */}
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium">
                    Verification Code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="h-12 text-base text-center tracking-widest"
                    disabled={isLoading}
                    maxLength={6}
                  />
                </div>
                {devOtpHint && (
                  <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                      <p className="text-muted-foreground">
                        Email OTP provider is currently unavailable on this setup. Use test OTP for local login.
                      </p>
                    </div>
                    <p className="font-medium text-foreground">Local test OTP</p>
                    <p className="text-muted-foreground">
                      Use this code for login on localhost:
                      <span className="ml-2 font-semibold tracking-widest text-primary">{devOtpHint}</span>
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold rounded-xl"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? "Verifying..." : "Verify & Continue"}
                </Button>
              </form>

              {/* Resend */}
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                <Button
                  variant="ghost"
                  onClick={() => handleSendOTP({ preventDefault: () => {} } as React.FormEvent)}
                  disabled={isLoading}
                  className="text-primary hover:text-primary/80"
                >
                  Resend Code
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};