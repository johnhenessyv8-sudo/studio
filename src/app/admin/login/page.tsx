'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShieldCheck, Chrome, Mail, Lock, Loader2, AlertCircle, Copy, Check } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    // Only redirect to dashboard if auth is complete, profile is loaded, AND user is admin
    if (!isUserLoading && user && !isProfileLoading) {
      const role = userProfile?.role;
      const isAdmin = role === 'Admin' || role === 'Librarian';
      
      if (isAdmin) {
        router.replace('/admin/dashboard');
      } else if (userProfile) {
        setAuthError(`Access Denied. Your account is active but has no Admin role. Current role: "${role || 'None'}".`);
      } else {
        // Profile might be missing or still syncing
        setAuthError(`Access Denied. No profile found for UID: ${user.uid}. Please add 'role: "Admin"' to your document.`);
      }
    }
  }, [user, isUserLoading, userProfile, isProfileLoading, router]);

  const copyToClipboard = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      toast({ title: "UID Copied", description: "Add this ID to your 'users' collection." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth || !firestore) return;
    
    setIsGoogleLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await setPersistence(auth, browserLocalPersistence);
      // Popup might get stuck in some environments, but useUser() will pick up the state change
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;

      if (loggedUser.email?.toLowerCase().endsWith('@neu.edu.ph')) {
        const userRef = doc(firestore, 'users', loggedUser.uid);
        // Sync basic info, but DON'T overwrite existing role
        await setDoc(userRef, {
          id: loggedUser.uid,
          fullName: loggedUser.displayName,
          institutionalEmail: loggedUser.email,
          updatedAt: serverTimestamp(),
          isActive: true
        }, { merge: true });

        toast({
          title: "Authenticated",
          description: "Syncing your administrative profile..."
        });
      } else {
        await auth.signOut();
        setAuthError("Only @neu.edu.ph institutional accounts are allowed.");
      }
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        console.error("Auth error:", error);
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
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is logged in and we are waiting for profile, show a loading state
  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold">Verifying NEU Credentials</h2>
        <p className="text-muted-foreground mt-2">Checking your administrative permissions...</p>
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
            <p className="text-muted-foreground italic">New Era University Library</p>
          </div>

          {authError && (
            <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/20 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Access Check Failed</AlertTitle>
              <AlertDescription className="text-xs mt-2 space-y-3">
                <p>{authError}</p>
                {user && (
                  <div className="pt-2 border-t border-destructive/20">
                    <p className="font-bold mb-1">Your Document ID (UID):</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-background/50 p-1.5 rounded flex-1 truncate font-mono">{user.uid}</code>
                      <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={copyToClipboard}>
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="mt-3 opacity-80 leading-relaxed">
                      Please ensure your document in the <strong className="underline">users</strong> collection has a field: <code className="bg-background/50 px-1 rounded">role: "Admin"</code>.
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="google">Google Login</TabsTrigger>
              <TabsTrigger value="email">Manual</TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="space-y-4">
              <Button 
                onClick={handleGoogleLogin}
                className="w-full h-14 font-black text-lg shadow-lg shadow-primary/20"
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                ) : (
                  <Chrome className="mr-2 w-6 h-6" />
                )}
                {isGoogleLoading ? "Connecting..." : "Login with NEU Google"}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
                Use your @neu.edu.ph account
              </p>
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
                      className="pl-10 h-12"
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
                      className="pl-10 h-12"
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
              Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}