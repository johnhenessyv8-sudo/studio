
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle2, ArrowLeft, Send, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore } from '@/firebase';
import { collection, serverTimestamp, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const PURPOSES = [
  "Assignment",
  "Use of Computer",
  "Researching",
  "Reading",
  "Other"
];

export default function VisitorCheckIn() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose || !email || !firestore) return;
    
    if (!email.toLowerCase().endsWith('@neu.edu.ph')) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid @neu.edu.ph institutional email."
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const visitRef = collection(firestore, 'visits');
      await addDoc(visitRef, {
        visitorEmail: email.toLowerCase(),
        purpose: purpose,
        entryTime: serverTimestamp(),
      });

      setSubmitted(true);
      
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log visit. Please try again."
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

      <div className="w-full max-w-xl bg-card border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Progress Background */}
        <div className="absolute top-0 left-0 h-1 bg-primary/20 w-full" />
        {submitted && <div className="absolute top-0 left-0 h-1 bg-primary w-full transition-all duration-[3000ms]" />}

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black mb-2 tracking-tight">Library Visit Entry</h1>
          <p className="text-muted-foreground">State your NEU institutional account to log your visit.</p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center gap-6 py-10 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-green-500 mb-2">Ready to go!</h2>
              <p className="text-muted-foreground font-medium">Your visit has been logged. Enjoy the library!</p>
            </div>
            <p className="text-xs text-muted-foreground italic mt-4 animate-pulse">Redirecting to home...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Institutional Email (@neu.edu.ph)
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="student.name@neu.edu.ph" 
                    className="pl-10 h-12 bg-secondary/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block">
                  Select Purpose of Visit
                </Label>
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
            </div>

            <Button 
              type="submit"
              disabled={!purpose || !email || isSubmitting}
              className="w-full h-14 text-lg font-bold transition-all hover:scale-[1.01]"
            >
              {isSubmitting ? "Logging Visit..." : <><Send className="mr-2 w-5 h-5" /> Submit Log</>}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
