
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
import { Badge } from '@/components/ui/badge';

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
    // Only attempt redirection once we are ABSOLUTELY sure about the load state
    if (!isUserLoading && !isProfileLoading) {
      if (!user || !isAdmin) {
        // Not logged in or not authorized -> send back to login
        router.replace('/admin/login');
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

  // While we are checking auth or loading the profile, show a full-page loader
  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold font-headline">Verifying Permissions</h2>
        <p className="text-muted-foreground mt-2 italic">Connecting to NEU Library Secure Portal...</p>
      </div>
    );
  }

  // Final safety check: if we aren't authorized, don't render the dashboard at all
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
          <div className="relative w-10 h-10 overflow-hidden rounded-full p-1 bg-white border border-primary/20">
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
          <h1 className="text-xl font-bold tracking-tight text-primary font-headline">NEU Library</h1>
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
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
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

        <div className="pt-6 border-t space-y-4 border-muted/20">
          <div className="px-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mb-1">Signed in as</p>
            <p className="text-sm font-bold truncate text-primary">{userProfile?.fullName || user.displayName || user.email}</p>
            <Badge variant="outline" className="mt-2 text-[8px] h-4 uppercase border-accent text-accent">
              {role || 'Authorized'}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive font-bold rounded-xl"
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
