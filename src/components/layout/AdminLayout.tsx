
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  LogOut 
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

  const isAdmin = userProfile?.role === 'Admin';
  const isLibrarian = userProfile?.role === 'Librarian';
  const isAuthorized = isAdmin || isLibrarian;

  useEffect(() => {
    if (!isUserLoading && !isProfileLoading) {
      if (!user || !isAuthorized) {
        router.push('/admin/login');
      }
    }
  }, [user, isUserLoading, isProfileLoading, isAuthorized, router]);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-bold">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return null; // Redirect handled by useEffect
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, access: 'all' },
    { name: 'Visitor Log', href: '/admin/visitor-log', icon: ClipboardList, access: 'all' },
    { name: 'Account Management', href: '/admin/accounts', icon: Users, access: 'admin' },
  ].filter(item => item.access === 'all' || (item.access === 'admin' && isAdmin));

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
            <p className="text-sm font-bold truncate text-primary">{user.displayName || userProfile?.fullName || 'Staff'}</p>
            <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-tighter">
              {userProfile?.role || 'User'}
            </p>
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
