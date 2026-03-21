"use client";

import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, ShieldCheck, Loader2, Save } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !auth) return;

    if (passwords.new !== passwords.confirm) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "New passwords do not match."
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Re-authenticate user before password change
      if (user.email) {
        const credential = EmailAuthProvider.credential(user.email, passwords.current);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, passwords.new);
        
        toast({
          title: "Password Updated",
          description: "Your security credentials have been updated."
        });
        
        setPasswords({ current: '', new: '', confirm: '' });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Please check your current password and try again."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Portal Settings</h1>
          <p className="text-muted-foreground italic">Manage your administrative security and preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl">
                    <ShieldCheck className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-black text-primary">Security Level: High</h3>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Multi-factor ready</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-secondary/30 rounded-2xl border space-y-2">
              <p className="text-[10px] uppercase font-black text-muted-foreground">Account Info</p>
              <p className="text-sm font-bold truncate">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground italic">UID: {user?.uid}</p>
            </div>
          </div>

          <Card className="md:col-span-2 shadow-2xl border-muted/20">
            <CardHeader className="border-b bg-secondary/10">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-accent" />
                <div>
                  <CardTitle>Security Credentials</CardTitle>
                  <CardDescription>Update your portal access password.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-pass">Current Password</Label>
                  <Input 
                    id="current-pass" 
                    type="password" 
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-pass">New Password</Label>
                    <Input 
                      id="new-pass" 
                      type="password" 
                      placeholder="••••••••"
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pass">Confirm New Password</Label>
                    <Input 
                      id="confirm-pass" 
                      type="password" 
                      placeholder="••••••••"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-muted/20">
                  <Button 
                    type="submit" 
                    className="w-full h-12 font-black text-lg bg-accent hover:bg-accent/80 text-white"
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />}
                    {isUpdating ? "Updating..." : "Update Security Key"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
