import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { checkBrandStatus, checkCampaignStatus } from "../../lib/tcrApi";
import AdminLayout from "../../components/admin/AdminLayout";
import { FileText, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface TCRSubmission {
  id: string;
  user_id: string;
  company_id: string;
  company_name: string;
  user_email: string;
  user_name: string;
  tcr_brand_id: string;
  tcr_campaign_id: string;
  brand_verification_status: string;
  campaign_approval_status: string;
  submission_data: Record<string, unknown>;
  status?: string;
  submitted_at: string;
  processed_at: string;
  created_at: string;
}

export default function AdminTCRStatus() {
  const [submissions, setSubmissions] = useState<TCRSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<TCRSubmission | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadSubmissions();
  }, [filterStatus, loadSubmissions]);

  const loadSubmissions = async () => {
    try {
      let query = supabase
        .from("onboarding_submissions")
        .select(`
          *,
          companies!inner(name, brand_verification_status, tcr_brand_id)
        `)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filterStatus !== "all") {
        if (filterStatus === "pending") {
          query = query.or('status.is.null,status.eq.pending');
        } else if (filterStatus === "approved") {
          query = query.eq('status', 'approved');
        } else if (filterStatus === "rejected") {
          query = query.eq('status', 'rejected');
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get user profiles for the submissions
      const userIds = data?.map(s => s.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);
      
      // Create a map for quick lookup
      const profileMap = new Map();
      profiles?.forEach(p => profileMap.set(p.id, p));
      
      // Transform the data to include flattened fields
      const transformedData = data?.map((submission: any) => {
        const profile = profileMap.get(submission.user_id);
        return {
          ...submission,
          user_email: profile?.email || "Unknown",
          user_name: profile?.full_name || "Unknown",
          company_name: submission.companies?.name,
          brand_verification_status: submission.companies?.brand_verification_status || submission.brand_verification_status,
          tcr_brand_id: submission.companies?.tcr_brand_id || submission.tcr_brand_id,
        };
      }) || [];

      setSubmissions(transformedData);
    } catch (error) {
      console.error("Error loading submissions:", error);
      toast.error("Failed to load TCR submissions");
    } finally {
      setLoading(false);
    }
  };

  const refreshTCRStatus = async (submission: TCRSubmission) => {
    setRefreshing(true);
    try {
      toast.info("Checking TCR status...");
      
      // Check brand status if we have a brand ID
      if (submission.tcr_brand_id) {
        const brandStatus = await checkBrandStatus(submission.tcr_brand_id);
        
        // Update company's brand verification status
        const { error: brandError } = await supabase
          .from("companies")
          .update({
            brand_verification_status: brandStatus.status.toLowerCase(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", submission.company_id);
          
        if (brandError) {
          console.error("Error updating brand status:", brandError);
        }
      }
      
      // Check campaign status if we have a campaign ID
      if (submission.tcr_campaign_id) {
        const campaignStatus = await checkCampaignStatus(submission.tcr_campaign_id);
        
        // Update campaign approval status in campaigns table
        const { error: campaignError } = await supabase
          .from("campaigns")
          .update({
            campaign_approval_status: campaignStatus.status.toLowerCase(),
            updated_at: new Date().toISOString(),
          })
          .eq("tcr_campaign_id", submission.tcr_campaign_id);
          
        if (campaignError) {
          console.error("Error updating campaign status:", campaignError);
        }
      }
      
      // Update the submission status
      const { error: submissionError } = await supabase
        .from("onboarding_submissions")
        .update({
          status: submission.tcr_brand_id && submission.tcr_campaign_id ? "approved" : "submitted",
          processed_at: new Date().toISOString(),
        })
        .eq("id", submission.id);
        
      if (submissionError) {
        console.error("Error updating submission:", submissionError);
      }
      
      toast.success("Status refreshed successfully");
      loadSubmissions();
    } catch (error) {
      console.error("Error refreshing status:", error);
      toast.error("Failed to refresh status");
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "rejected":
      case "unverified":
        return <XCircle className="h-5 w-5 text-red-400" />;
      case "pending":
      case "submitted":
        return <Clock className="h-5 w-5 text-yellow-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "pending";
    const colors: Record<string, string> = {
      approved: "bg-green-900/30 text-green-400",
      verified: "bg-green-900/30 text-green-400",
      rejected: "bg-red-900/30 text-red-400",
      unverified: "bg-red-900/30 text-red-400",
      pending: "bg-yellow-900/30 text-yellow-400",
      submitted: "bg-blue-900/30 text-blue-400",
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[statusLower] || "bg-gray-800 text-gray-400"}`}>
        {status || "Pending"}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d67635] mx-auto mb-4"></div>
            <p>Loading TCR submissions...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">TCR Status Monitor</h1>
            <p className="text-gray-400">Track brand and campaign registrations</p>
          </div>
          <button
            onClick={() => loadSubmissions()}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh All</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">Filter by status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-md text-white focus:outline-none focus:border-[#d67635]"
          >
            <option value="all">All Submissions</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400">Total Submissions</p>
            <p className="text-2xl font-bold">{submissions.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">
              {submissions.filter(s => !s.status || s.status === "pending" || s.status === "submitted").length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400">Approved</p>
            <p className="text-2xl font-bold text-green-400">
              {submissions.filter(s => s.status === "approved" || s.brand_verification_status === "approved" || s.brand_verification_status === "verified").length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400">Rejected</p>
            <p className="text-2xl font-bold text-red-400">
              {submissions.filter(s => s.status === "rejected" || s.brand_verification_status === "rejected").length}
            </p>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr className="text-left text-sm text-gray-400">
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Brand Status</th>
                  <th className="px-6 py-3">Campaign Status</th>
                  <th className="px-6 py-3">TCR IDs</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{submission.company_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>{submission.user_name}</div>
                        <div className="text-gray-400">{submission.user_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(submission.brand_verification_status)}
                        {getStatusBadge(submission.brand_verification_status || "Pending")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(submission.campaign_approval_status)}
                        {getStatusBadge(submission.campaign_approval_status || "Pending")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {submission.tcr_brand_id && (
                          <div className="text-xs">
                            <span className="text-gray-400">Brand:</span> {submission.tcr_brand_id}
                          </div>
                        )}
                        {submission.tcr_campaign_id && (
                          <div className="text-xs">
                            <span className="text-gray-400">Campaign:</span> {submission.tcr_campaign_id}
                          </div>
                        )}
                        {!submission.tcr_brand_id && !submission.tcr_campaign_id && (
                          <span className="text-gray-500">Not submitted</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(submission.submitted_at || submission.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="text-[#d67635] hover:text-[#c96528] text-sm"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => refreshTCRStatus(submission)}
                          disabled={refreshing}
                          className="text-gray-400 hover:text-white text-sm disabled:opacity-50"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">Submission Details</h3>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Company Information</h4>
                    <div className="bg-gray-800 rounded p-3 text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(selectedSubmission.submission_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Status History</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>Submitted: {new Date(selectedSubmission.submitted_at || selectedSubmission.created_at).toLocaleString()}</span>
                      </div>
                      {selectedSubmission.processed_at && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>Processed: {new Date(selectedSubmission.processed_at).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}