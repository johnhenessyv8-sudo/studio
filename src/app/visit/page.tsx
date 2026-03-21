
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const PURPOSES = [
  "Assignment",
  "Use of Computer",
  "Researching",
  "Reading",
  "Other"
];

export default function VisitorCheckIn() {
  const [purpose, setPurpose] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose || !email.includes('@')) return;
    
    setSubmitted(true);
    // Simulation
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
        {submitted && <div className="absolute top-0 left-0 h-1 bg-primary w-full transition-all duration-3000" />}

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black mb-2 tracking-tight">Library Visit Entry</h1>
          <p className="text-muted-foreground">Please select your purpose of visit and enter your institutional email.</p>
        </div>

        <div className="space-y-8">
          <div>
            <Label className="text-sm font-bold uppercase tracking-wider mb-4 block">1. Select Purpose</Label>
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
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider block">2. Institutional Email</Label>
              <Input 
                id="email"
                type="email"
                required
                placeholder="name@neu.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-secondary/30 border-muted focus-visible:ring-primary text-lg"
              />
            </div>

            {submitted && (
              <div className="flex items-center justify-center gap-3 py-4 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <span className="text-xl font-bold text-green-500">Thank you for your visit!</span>
              </div>
            )}

            {!submitted && (
              <Button 
                disabled={!purpose || !email.includes('@')}
                className="w-full h-14 text-lg font-bold transition-all hover:scale-[1.01]"
              >
                <Send className="mr-2 w-5 h-5" /> Submit Log
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
