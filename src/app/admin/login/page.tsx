
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, Chrome } from 'lucide-react';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc } from 'firebase/firestore';

export default function AdminLogin() {
  const { auth, firestore } = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

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
    } catch (error) {
      console.error("Login failed", error);
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

          <div className="space-y-4">
            <Button 
              onClick={handleGoogleLogin}
              className="w-full h-12 font-bold text-lg"
              disabled={isUserLoading}
            >
              <Chrome className="mr-2 w-5 h-5" /> Login with Google
            </Button>
            
            {user && !adminRole && !librarianRole && !isUserLoading && (
              <p className="text-sm text-destructive text-center font-bold animate-in fade-in slide-in-from-top-2">
                Access Denied: You do not have administrator or librarian privileges.
              </p>
            )}
          </div>

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
