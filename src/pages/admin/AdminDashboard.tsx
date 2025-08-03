import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/admin/AdminLayout";
import { Users, Building2, FileText, DollarSign, TrendingUp, Clock } from "lucide-react";

interface SystemMetrics {
  total_users: number;
  paid_users: number;
  total_companies: number;
  verified_companies: number;
  total_submissions: number;
  approved_submissions: number;
  new_users_7d: number;
  new_users_30d: number;
  new_payments_7d: number;
  new_payments_30d: number;
}

interface RecentUser {
  id: string;
  email: string;
  full_name: string;
  payment_status: string;
  company_name: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load system metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from("admin_system_metrics")
        .select("*")
        .single();

      if (metricsError) throw metricsError;
      setMetrics(metricsData);

      // Load recent users
      const { data: usersData, error: usersError } = await supabase
        .from("admin_user_overview")
        .select("id, email, full_name, payment_status, company_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (usersError) throw usersError;
      setRecentUsers(usersData || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d67635] mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
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
          <h1 className="text-2xl font-bold">Admin Overview</h1>
          <p className="text-gray-400">System-wide metrics and recent activity</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Users"
            value={metrics?.total_users || 0}
            change={metrics?.new_users_7d || 0}
            changeLabel="Last 7 days"
            icon={Users}
          />
          <MetricCard
            title="Paid Users"
            value={metrics?.paid_users || 0}
            change={metrics?.new_payments_7d || 0}
            changeLabel="Last 7 days"
            icon={DollarSign}
            highlight
          />
          <MetricCard
            title="Companies"
            value={metrics?.total_companies || 0}
            change={metrics?.verified_companies || 0}
            changeLabel="Verified"
            icon={Building2}
          />
          <MetricCard
            title="Submissions"
            value={metrics?.total_submissions || 0}
            change={metrics?.approved_submissions || 0}
            changeLabel="Approved"
            icon={FileText}
          />
        </div>

        {/* Growth Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
              User Growth
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last 7 days</span>
                <span className="text-xl font-semibold">{metrics?.new_users_7d || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last 30 days</span>
                <span className="text-xl font-semibold">{metrics?.new_users_30d || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-[#d67635]" />
              Payment Activity
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last 7 days</span>
                <span className="text-xl font-semibold">{metrics?.new_payments_7d || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last 30 days</span>
                <span className="text-xl font-semibold">{metrics?.new_payments_30d || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-400" />
            Recent Users
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Company</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Joined</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800">
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{user.full_name || "Unknown"}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 text-gray-300">
                      {user.company_name || "No company"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.payment_status === "paid"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {user.payment_status || "pending"}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
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

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  highlight?: boolean;
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, highlight }: MetricCardProps) {
  return (
    <div className={`bg-gray-900 border ${highlight ? 'border-[#d67635]' : 'border-gray-800'} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className={`h-8 w-8 ${highlight ? 'text-[#d67635]' : 'text-gray-400'}`} />
        <span className="text-sm text-gray-400">{changeLabel}</span>
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold">{value.toLocaleString()}</h3>
        <p className="text-sm text-gray-400">{title}</p>
      </div>
      {change > 0 && (
        <div className="mt-2 text-sm text-green-400">
          +{change} {changeLabel.toLowerCase()}
        </div>
      )}
    </div>
  );
}