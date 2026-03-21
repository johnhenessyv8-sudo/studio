
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShieldCheck, Chrome, Mail, Lock } from 'lucide-react';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function AdminLogin() {
  const { auth, firestore } = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adminRoleRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);

  const librarianRoleRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_librarian', user.uid);
  }, [firestore, user]);

  const { data: adminRole } = useDoc(adminRoleRef);
  const { data: librarianRole } = useDoc(librarianRoleRef);

  useEffect(() => {
    if (!isUserLoading && user && (adminRole || librarianRole)) {
      router.push('/admin/dashboard');
    }
  }, [user, isUserLoading, adminRole, librarianRole, router]);

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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <p className="text-muted-foreground">Authorized NEU staff only.</p>
          </div>

          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="space-y-4">
              <Button 
                onClick={handleGoogleLogin}
                className="w-full h-12 font-bold text-lg"
                disabled={isUserLoading}
              >
                <Chrome className="mr-2 w-5 h-5" /> Login with Google
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
                  disabled={isSubmitting || isUserLoading}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {user && !adminRole && !librarianRole && !isUserLoading && (
            <p className="mt-4 text-sm text-destructive text-center font-bold animate-in fade-in slide-in-from-top-2">
              Access Denied: You do not have administrator or librarian privileges.
            </p>
          )}

          <div className="mt-8 pt-6 border-t border-muted/20 text-center">
            <p className="text-sm text-muted-foreground italic">
              Need access? Contact NEU IT Department.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
