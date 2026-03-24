import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { doc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Settings,
  Shield,
  UserPlus,
  Search,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const { allUsers, fetchAllUsers } = useData();
  const [adminEmail, setAdminEmail] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const adminUsers = allUsers.filter(u => u.isAdmin);
  const filteredNonAdmins = allUsers
    .filter(u => !u.isAdmin)
    .filter(u =>
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handlePromoteToAdmin = async () => {
    if (!adminEmail.trim()) {
      toast.error('Enter an email address');
      return;
    }
    setIsPromoting(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'users'), where('email', '==', adminEmail.trim())));
      if (snapshot.empty) {
        toast.error('User not found with that email');
        return;
      }
      const userDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), { isAdmin: true });
      toast.success(`${adminEmail} is now an admin`);
      setAdminEmail('');
      fetchAllUsers();
    } catch (error) {
      toast.error('Failed to promote user');
    } finally {
      setIsPromoting(false);
    }
  };

  const handleDemoteAdmin = async (userId: string, name: string) => {
    if (userId === user?.id) {
      toast.error("You can't demote yourself");
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), { isAdmin: false });
      toast.success(`${name} removed from admin`);
      fetchAllUsers();
    } catch {
      toast.error('Failed to demote user');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">Platform configuration & admin management</p>
      </div>

      {/* Current Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Admin Users ({adminUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adminUsers.map(admin => (
              <div key={admin.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {admin.displayName}
                    {admin.id === user?.id && <Badge variant="outline" className="text-xs">You</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">{admin.email}</div>
                </div>
                {admin.id !== user?.id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/30">
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Admin</AlertDialogTitle>
                        <AlertDialogDescription>
                          Remove {admin.displayName} from admin role? They will lose access to the admin panel.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground"
                          onClick={() => handleDemoteAdmin(admin.id, admin.displayName)}
                        >
                          Remove Admin
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-success" />
            Promote to Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter user email..."
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handlePromoteToAdmin} disabled={isPromoting}>
              {isPromoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Promote
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search non-admin users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {searchQuery && (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredNonAdmins.slice(0, 10).map(u => (
                <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/50">
                  <div>
                    <div className="text-sm font-medium">{u.displayName}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setAdminEmail(u.email); }}
                  >
                    Select
                  </Button>
                </div>
              ))}
              {filteredNonAdmins.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">No users found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Platform Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="text-muted-foreground">Platform</div>
              <div className="font-medium">BattleArena Esports</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="text-muted-foreground">Database</div>
              <div className="font-medium">Firebase Firestore</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="text-muted-foreground">Payment Gateway</div>
              <div className="font-medium">Razorpay</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="text-muted-foreground">Games Supported</div>
              <div className="font-medium">BGMI, Free Fire, COD Mobile</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
