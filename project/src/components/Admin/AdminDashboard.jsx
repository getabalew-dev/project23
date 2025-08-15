import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Activity,
  MessageSquare,
  Vote,
  Download,
  Lock,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { hasPermission } from "../../data/adminCredentials";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export function AdminDashboard() {
  const { user, adminCredential } = useAuth();
  const [metrics, setMetrics] = useState({
    complaints: { pending: 23, resolved: 45, total: 68 },
    elections: { active: 3, completed: 5, upcoming: 2 },
    clubs: { approved: 47, pending: 8, total: 55 },
    users: { active: 12547, total: 13200 },
  });
  const [adminLogs, setAdminLogs] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem("admin_logs") || "[]");
    setAdminLogs(logs.slice(-10)); // Show last 10 entries
  }, []);

  const handleEmergencyOverride = (action) => {
    if (
      !adminCredential ||
      !hasPermission(adminCredential, "emergency_override")
    ) {
      toast.error("Permission denied");
      return;
    }

    toast.success(`Emergency action: ${action} executed`);
  };

  const handleBulkApproval = (type) => {
    if (
      !adminCredential ||
      (!hasPermission(adminCredential, "all") &&
        !hasPermission(adminCredential, "club_approval"))
    ) {
      toast.error("Permission denied");
      return;
    }

    toast.success(`Bulk approval: ${type} completed`);
  };

  const canAccess = (permission) => {
    return adminCredential ? hasPermission(adminCredential, permission) : false;
  };

  const renderPresidentDashboard = () => (
    <div className="space-y-6">
      {canAccess("emergency_override") && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">
              Emergency Override Panel
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() =>
                handleEmergencyOverride("Force Approve All Pending")
              }
              className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Force Approve All
            </button>
            <button
              onClick={() => handleEmergencyOverride("System Announcement")}
              className="p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              System Announcement
            </button>
            <button
              onClick={() => handleEmergencyOverride("Lock All Elections")}
              className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Lock Elections
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Live Activity Map
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">
                {metrics.complaints.pending}
              </span>
            </div>
            <p className="text-blue-700 font-medium">Pending Complaints</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Vote className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-900">
                {metrics.elections.active}
              </span>
            </div>
            <p className="text-green-700 font-medium">Active Elections</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-900">
                {metrics.clubs.pending}
              </span>
            </div>
            <p className="text-purple-700 font-medium">Pending Clubs</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Activity className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-orange-900">
                {metrics.users.active}
              </span>
            </div>
            <p className="text-orange-700 font-medium">Active Users</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderStudentDinDashboard = () => (
    <div className="space-y-6">
      {canAccess("mediation") && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">
              Mediation Channel
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Unresolved Complaints
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Academic Issues</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                    5
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dining Services</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                    3
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                University Liaison
              </h4>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Escalate to Administration
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Council Performance Dashboard
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Branch Response Times
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Academic</span>
                <span className="text-sm font-medium text-green-600">2.3h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Clubs</span>
                <span className="text-sm font-medium text-yellow-600">
                  4.1h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Dining</span>
                <span className="text-sm font-medium text-red-600">8.2h</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Student Satisfaction
            </h4>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">87%</div>
              <div className="text-sm text-gray-600">Overall Rating</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Monthly Analytics
            </h4>
            <button className="w-full bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-sm">
              <Download className="w-4 h-4 inline mr-2" />
              Download Report
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderGenericBranchDashboard = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Branch Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Assigned Tasks
            </h4>
            <div className="text-2xl font-bold text-blue-600">12</div>
            <p className="text-sm text-gray-600">3 pending review</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Completed This Month
            </h4>
            <div className="text-2xl font-bold text-green-600">28</div>
            <p className="text-sm text-gray-600">+15% from last month</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderDashboardContent = () => {
    if (!adminCredential) {
      return (
        <div className="text-center py-12">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">Invalid admin credentials</p>
        </div>
      );
    }

    switch (user?.role) {
      case "president":
        return renderPresidentDashboard();
      case "student_din":
        return renderStudentDinDashboard();
      default:
        return renderGenericBranchDashboard();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome, {user?.name}</p>
          {adminCredential && (
            <p className="text-sm text-blue-600 mt-1">
              Role: {adminCredential.name} ({adminCredential.role})
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 inline mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Role-Specific Dashboard Content */}
      {renderDashboardContent()}

      {/* Admin Activity Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Admin Activity Logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">Admin</th>
                <th className="text-left py-2">Action</th>
                <th className="text-left py-2">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {adminLogs.map((log, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2">
                    <div>
                      <div className="font-medium">{log.adminName}</div>
                      <div className="text-xs text-gray-500">
                        {log.adminEmail}
                      </div>
                    </div>
                  </td>
                  <td className="py-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 text-gray-600">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}