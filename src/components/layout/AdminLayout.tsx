'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  LogOut,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const logo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  // Authorization check
  const role = userProfile?.role;
  const isAdmin = role === 'Admin' || role === 'Librarian';

  useEffect(() => {
    // Wait for everything to be ready before deciding to redirect
    if (!isUserLoading) {
      if (!user) {
        // Definitely not logged in
        router.replace('/admin/login');
      } else if (!isProfileLoading) {
        // Definitely loaded, check if authorized
        if (!isAdmin) {
          router.replace('/admin/login');
        }
      }
    }
  }, [user, isUserLoading, isProfileLoading, isAdmin, router]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Show a clean loader while determining auth/admin state
  if (isUserLoading || (user && isProfileLoading) || (user && !isProfileLoading && !isAdmin)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-bold tracking-tight">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  // Prevent UI flashing if not authorized
  if (!user || !isAdmin) {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Visitor Log', href: '/admin/visitor-log', icon: ClipboardList },
    { name: 'Account Management', href: '/admin/accounts', icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r bg-card flex flex-col p-6 z-40">
        <div className="flex items-center gap-3 mb-10">
          <div className="relative w-10 h-10 overflow-hidden rounded-full p-1 bg-white">
            {logo && (
              <Image 
                src={logo.imageUrl} 
                alt="NEU Logo" 
                fill 
                className="object-contain"
                data-ai-hint="university logo"
              />
            )}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary">NEU Library</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  active 
                    ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "text-primary-foreground" : "text-primary group-hover:scale-110 transition-transform")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t space-y-4">
          <div className="px-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Signed in as</p>
            <p className="text-sm font-bold truncate text-primary">{userProfile?.fullName || user.displayName || user.email}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-black">{role || 'Authorized'}</p>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive font-bold"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}