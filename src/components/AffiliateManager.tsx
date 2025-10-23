import React, { useState } from 'react';
import { Plus, Edit, Trash2, Copy, Check, X } from 'lucide-react';
import { useAffiliates } from '../hooks/useAffiliates';
import { Affiliate } from '../types';

const AffiliateManager: React.FC = () => {
  const { affiliates, loading, error, addAffiliate, updateAffiliate, deleteAffiliate } = useAffiliates();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    referral_code: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAffiliate) {
        await updateAffiliate(editingAffiliate.id, formData);
        setEditingAffiliate(null);
      } else {
        await addAffiliate(formData);
      }
      setFormData({
        name: '',
        email: '',
        phone: '',
        referral_code: '',
        status: 'active',
        notes: ''
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error saving affiliate:', err);
    }
  };

  const handleEdit = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate);
    setFormData({
      name: affiliate.name,
      email: affiliate.email || '',
      phone: affiliate.phone || '',
      referral_code: affiliate.referral_code,
      status: affiliate.status,
      notes: affiliate.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this affiliate?')) {
      try {
        await deleteAffiliate(id);
      } catch (err) {
        console.error('Error deleting affiliate:', err);
      }
    }
  };

  const copyReferralLink = (referralCode: string) => {
    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopiedCode(referralCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateReferralCode = () => {
    const name = formData.name.toLowerCase().replace(/\s+/g, '');
    const randomNum = Math.floor(Math.random() * 1000);
    return `${name}${randomNum}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sweet-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-sweet font-bold text-sweet-dark">Manage Affiliates</h2>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingAffiliate(null);
            setFormData({
              name: '',
              email: '',
              phone: '',
              referral_code: '',
              status: 'active',
              notes: ''
            });
          }}
          className="bg-sweet-green text-white px-4 py-2 rounded-lg hover:bg-sweet-green-dark transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Affiliate</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-sweet-green-light">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-sweet font-bold text-sweet-dark">
              {editingAffiliate ? 'Edit Affiliate' : 'Add New Affiliate'}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingAffiliate(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-sweet-dark mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-sweet-green rounded-lg focus:ring-2 focus:ring-sweet-green focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sweet-dark mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-sweet-green rounded-lg focus:ring-2 focus:ring-sweet-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sweet-dark mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-sweet-green rounded-lg focus:ring-2 focus:ring-sweet-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sweet-dark mb-2">Referral Code *</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.referral_code}
                    onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                    className="flex-1 px-3 py-2 border border-sweet-green rounded-lg focus:ring-2 focus:ring-sweet-green focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, referral_code: generateReferralCode() })}
                    className="px-3 py-2 bg-sweet-green-light text-sweet-dark rounded-lg hover:bg-sweet-green transition-colors duration-200 text-sm"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sweet-dark mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                  className="w-full px-3 py-2 border border-sweet-green rounded-lg focus:ring-2 focus:ring-sweet-green focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-sweet-dark mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-sweet-green rounded-lg focus:ring-2 focus:ring-sweet-green focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-sweet-green text-white px-6 py-2 rounded-lg hover:bg-sweet-green-dark transition-colors duration-200"
              >
                {editingAffiliate ? 'Update Affiliate' : 'Add Affiliate'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAffiliate(null);
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Affiliates List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sweet-green-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-sweet-dark uppercase tracking-wider">
                  Affiliate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-sweet-dark uppercase tracking-wider">
                  Referral Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-sweet-dark uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-sweet-dark uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {affiliates.map((affiliate) => (
                <tr key={affiliate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{affiliate.name}</div>
                      {affiliate.email && (
                        <div className="text-sm text-gray-500">{affiliate.email}</div>
                      )}
                      {affiliate.phone && (
                        <div className="text-sm text-gray-500">{affiliate.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {affiliate.referral_code}
                      </code>
                      <button
                        onClick={() => copyReferralLink(affiliate.referral_code)}
                        className="text-sweet-green hover:text-sweet-green-dark transition-colors duration-200"
                        title="Copy referral link"
                      >
                        {copiedCode === affiliate.referral_code ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      affiliate.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : affiliate.status === 'inactive'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {affiliate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(affiliate)}
                        className="text-sweet-green hover:text-sweet-green-dark transition-colors duration-200"
                        title="Edit affiliate"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(affiliate.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        title="Delete affiliate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {affiliates.length === 0 && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-sweet font-bold text-sweet-dark mb-2">No affiliates yet</h3>
          <p className="text-sweet-text-light">Add your first affiliate to start tracking referrals!</p>
        </div>
      )}
    </div>
  );
};

export default AffiliateManager;
