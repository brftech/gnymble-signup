import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/admin/AdminLayout";
import { Search, Filter, MoreVertical, Shield, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface UserData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  payment_status: string;
  company_name: string;
  company_id: string;
  system_role: string;
  tcr_brand_id: string;
  brand_verification_status: string;
  created_at: string;
  payment_date: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterStatus, filterUsers]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_user_overview")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      if (filterStatus === "paid") {
        filtered = filtered.filter((user) => user.payment_status === "paid");
      } else if (filterStatus === "pending") {
        filtered = filtered.filter((user) => user.payment_status !== "paid");
      } else if (filterStatus === "admin") {
        filtered = filtered.filter((user) => user.system_role === "admin" || user.system_role === "superadmin");
      }
    }

    setFilteredUsers(filtered);
  };

  const handleGrantAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin" });

      if (error) throw error;

      // Log the action
      await supabase.rpc("log_admin_action", {
        _action: "grant_admin",
        _target_type: "user",
        _target_id: userId,
      });

      toast.success("Admin role granted successfully");
      loadUsers();
    } catch (error) {
      console.error("Error granting admin role:", error);
      toast.error("Failed to grant admin role");
    }
  };

  const handleUpdatePaymentStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          payment_status: status,
          payment_date: status === "paid" ? new Date().toISOString() : null
        })
        .eq("id", userId);

      if (error) throw error;

      // Log the action
      await supabase.rpc("log_admin_action", {
        _action: "update_payment_status",
        _target_type: "user",
        _target_id: userId,
        _details: { new_status: status },
      });

      toast.success("Payment status updated");
      loadUsers();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d67635] mx-auto mb-4"></div>
            <p>Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-400">Manage all users and their roles</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-[#d67635]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-md text-white focus:outline-none focus:border-[#d67635]"
            >
              <option value="all">All Users</option>
              <option value="paid">Paid Users</option>
              <option value="pending">Pending Payment</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400">Paid Users</p>
            <p className="text-2xl font-bold text-green-400">
              {users.filter((u) => u.payment_status === "paid").length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400">Companies</p>
            <p className="text-2xl font-bold">
              {new Set(users.map((u) => u.company_id).filter(Boolean)).size}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr className="text-left text-sm text-gray-400">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{user.full_name || "Unknown"}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                        {user.phone && (
                          <div className="text-xs text-gray-500">{user.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm">{user.company_name || "No company"}</div>
                        {user.tcr_brand_id && (
                          <div className="text-xs text-gray-500">TCR: {user.tcr_brand_id}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.payment_status === "paid"
                              ? "bg-green-900/30 text-green-400"
                              : "bg-gray-800 text-gray-400"
                          }`}
                        >
                          <DollarSign className="inline h-3 w-3 mr-1" />
                          {user.payment_status || "pending"}
                        </span>
                        {user.brand_verification_status && (
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              user.brand_verification_status === "approved"
                                ? "bg-blue-900/30 text-blue-400"
                                : "bg-gray-800 text-gray-400"
                            }`}
                          >
                            {user.brand_verification_status}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.system_role === "superadmin" && (
                        <span className="flex items-center text-sm text-[#d67635]">
                          <Shield className="h-4 w-4 mr-1" />
                          Superadmin
                        </span>
                      )}
                      {user.system_role === "admin" && (
                        <span className="text-sm text-blue-400">Admin</span>
                      )}
                      {user.system_role === "customer" && (
                        <span className="text-sm text-green-400">Customer</span>
                      )}
                      {user.system_role === "user" && (
                        <span className="text-sm text-gray-400">User</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        {selectedUser === user.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                            <button
                              onClick={() => {
                                handleGrantAdmin(user.id);
                                setSelectedUser(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            >
                              Grant Admin Role
                            </button>
                            {user.payment_status !== "paid" && (
                              <button
                                onClick={() => {
                                  handleUpdatePaymentStatus(user.id, "paid");
                                  setSelectedUser(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                              >
                                Mark as Paid
                              </button>
                            )}
                            <a
                              href={`mailto:${user.email}`}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            >
                              Send Email
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}