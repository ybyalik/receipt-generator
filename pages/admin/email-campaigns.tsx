import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ToastContainer';
import { FiMail, FiUsers, FiSend, FiAlertCircle, FiEdit2, FiTrash2, FiPlus, FiX, FiArrowLeft } from 'react-icons/fi';
import { format } from 'date-fns';

interface SequenceStep {
  id: number;
  stepNumber: number;
  delayMinutes: number;
  subject: string;
  htmlBody: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SendLog {
  id: number;
  emailCaptureId: number;
  email: string;
  stepNumber: number;
  status: string;
  resendMessageId: string | null;
  errorMessage: string | null;
  sentAt: string;
}

interface Lead {
  id: number;
  email: string;
  source: string;
  unsubscribed: boolean;
  createdAt: string;
}

interface Stats {
  totalLeads: number;
  unsubscribed: number;
  purchasers: number;
  totalSent: number;
  totalFailed: number;
}

export default function AdminEmailCampaigns() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [campaignEnabled, setCampaignEnabled] = useState(false);
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const [stats, setStats] = useState<Stats>({ totalLeads: 0, unsubscribed: 0, purchasers: 0, totalSent: 0, totalFailed: 0 });
  const [recentLogs, setRecentLogs] = useState<SendLog[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState<'sequence' | 'leads' | 'logs'>('sequence');
  const [editingStep, setEditingStep] = useState<SequenceStep | null>(null);
  const [showNewStepModal, setShowNewStepModal] = useState(false);
  const [newStep, setNewStep] = useState({ stepNumber: 0, delayMinutes: 60, subject: '', htmlBody: '' });
  const [toggling, setToggling] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.email) return;
    try {
      const params = new URLSearchParams({ userEmail: user.email });
      const response = await fetch(`/api/admin/email-campaigns?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setCampaignEnabled(data.campaignEnabled);
      setSteps(data.steps);
      setStats(data.stats);
      setRecentLogs(data.recentLogs);
      setLeads(data.leads);
    } catch (err: any) {
      showError(err.message || 'Failed to load campaign data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, showError]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin()) {
      router.push('/');
      return;
    }
    fetchData();
  }, [user, authLoading, isAdmin, router, fetchData]);

  const toggleCampaign = async () => {
    if (!user?.email) return;
    setToggling(true);
    try {
      const response = await fetch('/api/admin/email-campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email, action: 'toggle', enabled: !campaignEnabled }),
      });
      if (!response.ok) throw new Error('Failed to toggle');
      setCampaignEnabled(!campaignEnabled);
      showSuccess(`Campaign ${!campaignEnabled ? 'enabled' : 'paused'}`);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setToggling(false);
    }
  };

  const saveStep = async () => {
    if (!user?.email || !editingStep) return;
    try {
      const response = await fetch('/api/admin/email-campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          action: 'updateStep',
          step: {
            id: editingStep.id,
            subject: editingStep.subject,
            htmlBody: editingStep.htmlBody,
            delayMinutes: editingStep.delayMinutes,
            isActive: editingStep.isActive,
            stepNumber: editingStep.stepNumber,
          },
        }),
      });
      if (!response.ok) throw new Error('Failed to update step');
      showSuccess('Step updated');
      setEditingStep(null);
      fetchData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const toggleStepActive = async (step: SequenceStep) => {
    if (!user?.email) return;
    try {
      await fetch('/api/admin/email-campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          action: 'updateStep',
          step: { id: step.id, isActive: !step.isActive },
        }),
      });
      fetchData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const createStep = async () => {
    if (!user?.email || !newStep.subject || !newStep.htmlBody) return;
    try {
      const response = await fetch('/api/admin/email-campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email, action: 'createStep', step: newStep }),
      });
      if (!response.ok) throw new Error('Failed to create step');
      showSuccess('Step created');
      setShowNewStepModal(false);
      setNewStep({ stepNumber: 0, delayMinutes: 60, subject: '', htmlBody: '' });
      fetchData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const deleteStep = async (stepId: number) => {
    if (!user?.email || !confirm('Delete this step?')) return;
    try {
      await fetch('/api/admin/email-campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email, action: 'deleteStep', stepId }),
      });
      showSuccess('Step deleted');
      fetchData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const formatDelay = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      skipped: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading campaign data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Email Campaigns - Admin</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={() => router.push('/admin')}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
            </div>
            <p className="text-gray-600 ml-9">Manage win-back email sequences for captured leads</p>
          </div>
          <button
            onClick={toggleCampaign}
            disabled={toggling}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              campaignEnabled
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${campaignEnabled ? 'bg-green-200' : 'bg-gray-400'}`} />
            {campaignEnabled ? 'Campaign Active' : 'Campaign Paused'}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Leads', value: stats.totalLeads, icon: FiUsers, color: 'text-blue-600' },
            { label: 'Eligible', value: stats.totalLeads - stats.unsubscribed - stats.purchasers, icon: FiMail, color: 'text-teal-600' },
            { label: 'Emails Sent', value: stats.totalSent, icon: FiSend, color: 'text-green-600' },
            { label: 'Failed', value: stats.totalFailed, icon: FiAlertCircle, color: 'text-red-600' },
            { label: 'Unsubscribed', value: stats.unsubscribed, icon: FiX, color: 'text-gray-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {(['sequence', 'leads', 'logs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'sequence' ? 'Sequence' : tab === 'leads' ? 'Leads' : 'Send Log'}
            </button>
          ))}
        </div>

        {/* Sequence Tab */}
        {activeTab === 'sequence' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Email Sequence</h2>
              <button
                onClick={() => {
                  setNewStep({ stepNumber: steps.length + 1, delayMinutes: 60, subject: '', htmlBody: '' });
                  setShowNewStepModal(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
              >
                <FiPlus className="w-4 h-4" /> Add Step
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-gray-900 font-semibold text-sm">Step</th>
                  <th className="text-left py-3 px-6 text-gray-900 font-semibold text-sm">Delay</th>
                  <th className="text-left py-3 px-6 text-gray-900 font-semibold text-sm">Subject</th>
                  <th className="text-left py-3 px-6 text-gray-900 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-6 text-gray-900 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step) => (
                  <tr key={step.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-6 text-gray-900 font-medium">#{step.stepNumber}</td>
                    <td className="py-3 px-6 text-gray-600">{formatDelay(step.delayMinutes)}</td>
                    <td className="py-3 px-6 text-gray-900 max-w-xs truncate">{step.subject}</td>
                    <td className="py-3 px-6">
                      <button
                        onClick={() => toggleStepActive(step)}
                        className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
                          step.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {step.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingStep({ ...step })}
                          className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors cursor-pointer"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteStep(step.id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {steps.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      No sequence steps configured. Add your first step to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Captured Leads</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 text-gray-900 font-semibold text-sm">Email</th>
                    <th className="text-left py-3 px-6 text-gray-900 font-semibold text-sm">Source</th>
                    <th className="text-left py-3 px-6 text-gray-900 font-semibold text-sm">Captured</th>
                    <th className="text-left py-3 px-6 text-gray-900 font-semibold text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-6 text-gray-900">{lead.email}</td>
                      <td className="py-3 px-6">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {lead.source}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-gray-600 text-sm">
                        {format(new Date(lead.createdAt), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="py-3 px-6">
                        {lead.unsubscribed ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Unsubscribed</span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-500">No leads captured yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Send Log Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Send Log</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 text-gray-900 font-semibold text-sm">Email</th>
                    <th className="text-left py-3 px-6 text-gray-900 font-semibold text-sm">Step</th>
                    <th className="text-left py-3 px-6 text-gray-900 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-6 text-gray-900 font-semibold text-sm">Sent At</th>
                    <th className="text-left py-3 px-6 text-gray-900 font-semibold text-sm">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-6 text-gray-900">{log.email}</td>
                      <td className="py-3 px-6 text-gray-600">#{log.stepNumber}</td>
                      <td className="py-3 px-6">{getStatusBadge(log.status)}</td>
                      <td className="py-3 px-6 text-gray-600 text-sm">
                        {format(new Date(log.sentAt), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="py-3 px-6 text-gray-500 text-xs max-w-xs truncate">
                        {log.errorMessage || log.resendMessageId || '—'}
                      </td>
                    </tr>
                  ))}
                  {recentLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">No emails sent yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Step Modal */}
      {editingStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Step #{editingStep.stepNumber}</h3>
              <button onClick={() => setEditingStep(null)} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Step Number</label>
                  <input
                    type="number"
                    value={editingStep.stepNumber}
                    onChange={(e) => setEditingStep({ ...editingStep, stepNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delay (minutes)</label>
                  <input
                    type="number"
                    value={editingStep.delayMinutes}
                    onChange={(e) => setEditingStep({ ...editingStep, delayMinutes: parseInt(e.target.value) || 60 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">60 = 1hr, 1440 = 1 day, 4320 = 3 days</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={editingStep.subject}
                  onChange={(e) => setEditingStep({ ...editingStep, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HTML Body</label>
                <textarea
                  value={editingStep.htmlBody}
                  onChange={(e) => setEditingStep({ ...editingStep, htmlBody: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingStep(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveStep}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Step Modal */}
      {showNewStepModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Step</h3>
              <button onClick={() => setShowNewStepModal(false)} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Step Number</label>
                  <input
                    type="number"
                    value={newStep.stepNumber}
                    onChange={(e) => setNewStep({ ...newStep, stepNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delay (minutes)</label>
                  <input
                    type="number"
                    value={newStep.delayMinutes}
                    onChange={(e) => setNewStep({ ...newStep, delayMinutes: parseInt(e.target.value) || 60 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">60 = 1hr, 1440 = 1 day, 4320 = 3 days</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={newStep.subject}
                  onChange={(e) => setNewStep({ ...newStep, subject: e.target.value })}
                  placeholder="e.g. Your receipt is ready!"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HTML Body</label>
                <textarea
                  value={newStep.htmlBody}
                  onChange={(e) => setNewStep({ ...newStep, htmlBody: e.target.value })}
                  rows={10}
                  placeholder="<p>Hi there,</p><p>Your receipt is waiting...</p>"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewStepModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={createStep}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
              >
                Create Step
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
