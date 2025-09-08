"use client";

import { AdminDashboard } from "@/components/admin-dashboard";
import { RoleManagement } from "@/components/role-management";
import { WalletConnect } from "@/components/wallet-connect";
import { useContract } from "@/contexts/contract-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
  const { isConnected } = useContract();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-balance mb-2">
              Admin Panel
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Connect your wallet to access administrative functions
            </p>
          </div>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="roles">Role Management</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="roles">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Role Management</h2>
                <p className="text-muted-foreground">
                  Assign roles to users and manage system permissions
                </p>
              </div>
              <RoleManagement />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
