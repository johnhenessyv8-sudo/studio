'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShieldCheck, Chrome, Loader2, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/alert';

export default function AdminLogin() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentOrigin, setCurrentOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    async function checkAccess() {
      if (!user || !firestore) return;
      
      setIsVerifying(true);
      try {
        // Attempt 1: Fetch by UID directly
        const userDocRef = doc(firestore, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        
        let profile = userSnap.exists() ? userSnap.data() : null;

        // Attempt 2: Fallback to email search (Crucial for linking newly added admins/librarians)
        if (!profile && user.email) {
          const q = query(
            collection(firestore, 'users'), 
            where('institutionalEmail', '==', user.email.toLowerCase())
          );
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            const foundDoc = querySnap.docs[0];
            profile = foundDoc.data();
            // Automatically link UID to this pre-registered record
            await updateDoc(foundDoc.ref, {
              id: user.uid,
              updatedAt: serverTimestamp()
            });
          }
        }

        if (profile) {
          const isAdmin = profile.role === 'Admin' || profile.role === 'Librarian';
          if (isAdmin) {
            router.replace('/admin/dashboard');
          } else {
            setAuthError(`Access Denied: Your profile role is "${profile.role}". Administrative privileges required.`);
          }
        } else {
          setAuthError(`No library profile found for ${user.email}. Please ensure your account is registered in the database.`);
        }
      } catch (err: any) {
        setAuthError(err.message);
      } finally {
        setIsVerifying(false);
      }
    }

    if (!isUserLoading && user) {
      checkAccess();
    }
  }, [user, isUserLoading, firestore, router]);

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setIsGoogleLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ 
      prompt: 'select_account',
      hd: 'neu.edu.ph'
    });

    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError(error.message);
      }
      setIsGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setAuthError("Authentication Failed: The email or password provided is incorrect.");
      } else {
        setAuthError(error.message);
      }
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || isVerifying) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold font-headline">Verifying Portal Access...</h2>
        <p className="text-muted-foreground mt-2 italic">Checking credentials</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-card border rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center rotate-3 border border-primary/20">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight mb-2 font-headline">Admin Portal</h1>
            <p className="text-muted-foreground italic text-sm">New Era University Library</p>
          </div>

          {authError && (
            <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/20 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Access Error</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                {authError}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="email">Manual</TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="space-y-4">
              <Button 
                onClick={handleGoogleLogin}
                className="w-full h-14 font-black text-lg shadow-lg hover:scale-[1.01] transition-transform"
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                ) : (
                  <Chrome className="mr-2 w-6 h-6" />
                )}
                {isGoogleLoading ? "Connecting..." : "Google Login"}
              </Button>
            </TabsContent>

            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@neu.edu.ph" 
                    className="h-12 bg-secondary/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 bg-secondary/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 font-bold text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="mt-8 p-6 bg-secondary/50 border rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Info className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Environment Diagnostic</h3>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase font-black">Current Domain Origin:</p>
            <code className="block p-2 bg-background rounded text-[10px] break-all font-mono text-primary border border-primary/20">
              {currentOrigin}
            </code>
            <p className="text-[9px] text-muted-foreground leading-relaxed italic">
              Verify this domain is in your <strong>Authorized Domains</strong> in the Firebase Console (Authentication &gt; Settings).
            </p>
          </div>
          <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold h-7 gap-2" asChild>
            <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">
              Open Firebase Console <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
