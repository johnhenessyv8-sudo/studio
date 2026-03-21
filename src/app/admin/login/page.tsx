
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShieldCheck, Chrome, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminLogin() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Use the useDoc hook to reactively check the user's role in Firestore
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  // Handle redirects based on both Auth state AND Firestore role
  useEffect(() => {
    if (!isUserLoading && user && !isProfileLoading) {
      if (userProfile && (userProfile.role === 'Admin' || userProfile.role === 'Librarian')) {
        router.replace('/admin/dashboard');
      } else if (userProfile && userProfile.role !== 'Admin' && userProfile.role !== 'Librarian') {
        setAuthError(`Access Denied. Your account is not authorized as an Admin or Librarian. (UID: ${user.uid})`);
      }
    }
  }, [user, isUserLoading, userProfile, isProfileLoading, router]);

  const handleGoogleLogin = async () => {
    if (!auth || !firestore) return;
    
    setIsGoogleLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;

      if (loggedUser.email?.toLowerCase().endsWith('@neu.edu.ph')) {
        // Sync user profile but don't overwrite role if it already exists
        const userRef = doc(firestore, 'users', loggedUser.uid);
        await setDoc(userRef, {
          id: loggedUser.uid,
          fullName: loggedUser.displayName,
          institutionalEmail: loggedUser.email,
          updatedAt: serverTimestamp(),
        }, { merge: true });

        toast({
          title: "Signed in successfully",
          description: "Checking permissions..."
        });
      } else {
        await auth.signOut();
        setAuthError("Only @neu.edu.ph institutional accounts are allowed.");
      }
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError(error.message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Signed in",
        description: "Checking permissions..."
      });
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground font-bold tracking-tight">Authenticating...</p>
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
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center rotate-3">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight mb-2">Admin Portal</h1>
            <p className="text-muted-foreground">Authorized access only.</p>
          </div>

          {authError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Permission Denied</AlertTitle>
              <AlertDescription className="text-xs break-all">
                {authError}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="space-y-4">
              <Button 
                onClick={handleGoogleLogin}
                className="w-full h-12 font-bold text-lg"
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                ) : (
                  <Chrome className="mr-2 w-5 h-5" />
                )}
                {isGoogleLoading ? "Connecting..." : "Login with Google"}
              </Button>
            </TabsContent>

            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
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
                  className="w-full h-12 font-bold text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8 pt-6 border-t border-muted/20 text-center">
            <p className="text-sm text-muted-foreground italic">
              Institutional accounts with valid roles only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
