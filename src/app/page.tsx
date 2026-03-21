
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { LogIn, UserCheck } from 'lucide-react';

export default function WelcomePage() {
  const logo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="w-full max-w-2xl px-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="relative w-32 h-32 mx-auto mb-8 bg-card p-2 rounded-2xl shadow-2xl border border-primary/20">
          {logo && (
            <Image 
              src={logo.imageUrl} 
              alt="NEU Logo" 
              width={128} 
              height={128} 
              className="object-contain"
              data-ai-hint="university logo"
            />
          )}
        </div>

        <h1 className="text-5xl font-black mb-4 tracking-tight">
          Welcome to <span className="text-primary italic">NEU</span> Library
        </h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-lg mx-auto">
          Please select your action to continue with your visit log or administrative tasks.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link href="/visit" className="group">
            <div className="h-full p-8 rounded-2xl bg-card border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UserCheck className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Visitor Log</h2>
              <p className="text-muted-foreground text-sm">Register your attendance for library use.</p>
              <Button className="mt-6 w-full group-hover:bg-primary transition-colors">Start Visit</Button>
            </div>
          </Link>

          <Link href="/admin/login" className="group">
            <div className="h-full p-8 rounded-2xl bg-card border hover:border-accent/50 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 flex flex-col items-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LogIn className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Admin Login</h2>
              <p className="text-muted-foreground text-sm">Access the dashboard and management tools.</p>
              <Button variant="outline" className="mt-6 w-full border-accent text-accent hover:bg-accent hover:text-white">Login Now</Button>
            </div>
          </Link>
        </div>

        <footer className="mt-16 pt-8 border-t border-muted/20 text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} New Era University. All Rights Reserved.
        </footer>
      </div>
    </div>
  );
}
