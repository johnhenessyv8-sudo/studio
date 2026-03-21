
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle2, ArrowLeft, Send, Chrome, Lock, Mail, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const PURPOSES = [
  "Assignment",
  "Use of Computer",
  "Researching",
  "Reading",
  "Other"
];

export default function VisitorCheckIn() {
  const { auth, firestore } = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [purpose, setPurpose] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isNEUEmail = user?.email?.endsWith('@neu.edu.ph');

  const handleGoogleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message
      });
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    if (!email.endsWith('@neu.edu.ph')) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please use your @neu.edu.ph institutional email."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegistering) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        // Create user profile on registration
        if (firestore) {
          const userRef = doc(firestore, 'users', userCred.user.uid);
          await setDoc(userRef, {
            id: userCred.user.uid,
            fullName: fullName,
            institutionalEmail: email,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose || !user || !isNEUEmail || !firestore) return;
    
    setSubmitted(true);
    
    const visitRef = collection(firestore, 'visits');
    addDocumentNonBlocking(visitRef, {
      visitorId: user.uid,
      purpose: purpose,
      entryTime: serverTimestamp(),
    });

    // Ensure user profile exists (especially for Google logins who might be first-timers)
    const userRef = doc(firestore, 'users', user.uid);
    setDoc(userRef, {
      id: user.uid,
      fullName: user.displayName || user.email?.split('@')[0],
      institutionalEmail: user.email,
      isActive: true,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-xl bg-card border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Progress Background */}
        <div className="absolute top-0 left-0 h-1 bg-primary/20 w-full" />
        {submitted && <div className="absolute top-0 left-0 h-1 bg-primary w-full transition-all duration-[3000ms]" />}

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black mb-2 tracking-tight">Library Visit Entry</h1>
          <p className="text-muted-foreground">Log your visit with your NEU institutional account.</p>
        </div>

        {!user ? (
          <div className="space-y-6">
            <Tabs defaultValue="google" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="google">Google Login</TabsTrigger>
                <TabsTrigger value="manual">Manual Login</TabsTrigger>
              </TabsList>

              <TabsContent value="google" className="text-center">
                <div className="p-8 bg-secondary/20 rounded-2xl border border-dashed border-muted flex flex-col items-center">
                  <Chrome className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Fastest Way</h3>
                  <p className="text-sm text-muted-foreground mb-6">Use your NEU Google Workspace account.</p>
                  <Button onClick={handleGoogleLogin} className="w-full h-14 text-lg font-bold" disabled={isUserLoading}>
                    <Chrome className="mr-2 w-5 h-5" /> Login with Google
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="manual">
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {isRegistering && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Institutional Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@neu.edu.ph" 
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 font-bold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : (isRegistering ? "Register Account" : "Login")}
                  </Button>
                  <div className="text-center">
                    <button 
                      type="button" 
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
                    </button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        ) : !isNEUEmail ? (
          <div className="space-y-6 text-center">
            <div className="p-8 bg-destructive/10 rounded-2xl border border-destructive/20 flex flex-col items-center">
              <Lock className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-xl font-bold mb-2 text-destructive">Unauthorized Account</h3>
              <p className="text-sm text-muted-foreground mb-6">Access is restricted to verified <strong>@neu.edu.ph</strong> email addresses.</p>
              <Button variant="outline" className="w-full" onClick={() => auth?.signOut()}>
                Sign Out and Try Another Account
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Signed in as</p>
                <p className="font-bold">{user.displayName || user.email?.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-bold uppercase tracking-wider mb-4 block">Select Purpose of Visit</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PURPOSES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPurpose(item)}
                    className={cn(
                      "px-6 py-4 rounded-xl border text-sm font-semibold transition-all duration-200 text-left",
                      purpose === item 
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {submitted && (
                <div className="flex items-center justify-center gap-3 py-4 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <span className="text-xl font-bold text-green-500">Visit Logged Successfully!</span>
                </div>
              )}

              {!submitted && (
                <div className="flex flex-col gap-3">
                  <Button 
                    disabled={!purpose}
                    className="w-full h-14 text-lg font-bold transition-all hover:scale-[1.01]"
                  >
                    <Send className="mr-2 w-5 h-5" /> Submit Log
                  </Button>
                  <Button variant="ghost" onClick={() => auth?.signOut()}>Sign Out</Button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
