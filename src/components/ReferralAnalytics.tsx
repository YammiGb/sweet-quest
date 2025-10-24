import React from 'react';
import { TrendingUp, Users, DollarSign, Star, Calendar, Award } from 'lucide-react';
import { useReferrals } from '../hooks/useReferrals';

const ReferralAnalytics: React.FC = () => {
  const { analytics, stats, orders, loading, error, updateOrderStatus, fetchStats } = useReferrals();

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-sweet font-bold text-sweet-dark">Referral Analytics</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => fetchStats()}
            className="px-4 py-2 bg-sweet-green text-white rounded-lg hover:bg-sweet-green-dark transition-colors duration-200 text-sm"
          >
            Refresh Stats
          </button>
          <div className="text-sm text-sweet-text-light">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Debug Info */}
      {stats && (
        <div className="bg-gray-100 p-4 rounded-lg text-sm">
          <strong>Debug Info:</strong> Total Sales: {stats.total_sales}, Total Referrals: {stats.total_referrals}
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-sweet-green-light">
            <div className="flex items-center">
              <div className="p-2 bg-sweet-green-light rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-sweet-text-light">Total Affiliates</p>
                <p className="text-2xl font-sweet font-bold text-sweet-dark">{stats.total_affiliates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-sweet-green-light">
            <div className="flex items-center">
              <div className="p-2 bg-sweet-green-light rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-sweet-text-light">Total Referrals</p>
                <p className="text-2xl font-sweet font-bold text-sweet-dark">{stats.total_referrals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-sweet-green-light">
            <div className="flex items-center">
              <div className="p-2 bg-sweet-green-light rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-sweet-text-light">Total Sales</p>
                <p className="text-2xl font-sweet font-bold text-sweet-dark">{formatCurrency(stats.total_sales)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-sweet-green-light">
            <div className="flex items-center">
              <div className="p-2 bg-sweet-green-light rounded-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-sweet-text-light">Avg Order Value</p>
                <p className="text-2xl font-sweet font-bold text-sweet-dark">{formatCurrency(stats.avg_order_value)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Affiliate */}
      {stats && stats.top_affiliate_name && (
        <div className="bg-gradient-to-r from-sweet-green-light to-sweet-green rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3">
            <Award className="h-8 w-8" />
            <div>
              <h3 className="text-xl font-sweet font-bold">Top Performing Affiliate</h3>
              <p className="text-lg">{stats.top_affiliate_name}</p>
              <p className="text-sm opacity-90">
                Generated {formatCurrency(stats.top_affiliate_sales)} in sales
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Referrals */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-sweet-green-light">
          <h3 className="text-lg font-sweet font-bold text-sweet-dark">Recent Referrals</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referred By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.slice(0, 10).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.contact_number}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.referred_by || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Code: {order.referral_code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${order.status === 'cancelled' ? 'text-red-500 line-through' : 'text-sweet-green'}`}>
                      {formatCurrency(order.total || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={async (e) => {
                        try {
                          const newStatus = e.target.value as any;
                          await updateOrderStatus(order.id, newStatus);
                          console.log('Order status updated successfully');
                        } catch (error) {
                          console.error('Failed to update order status:', error);
                          alert('Failed to update order status. Please try again.');
                        }
                      }}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${
                        order.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Affiliate Performance */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-sweet-green-light">
          <h3 className="text-lg font-sweet font-bold text-sweet-dark">Affiliate Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Affiliate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referrals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  This Week
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  This Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Referral
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.map((affiliate, index) => (
                <tr key={affiliate.affiliate_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-sweet-green'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{affiliate.affiliate_name}</div>
                        <div className="text-sm text-gray-500">{affiliate.referral_code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{affiliate.total_referrals}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-sweet-green">
                      {formatCurrency(affiliate.total_sales)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{affiliate.referrals_this_week}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{affiliate.referrals_this_month}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {affiliate.last_referral_date ? formatDate(affiliate.last_referral_date) : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {analytics.length === 0 && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-sweet font-bold text-sweet-dark mb-2">No analytics data yet</h3>
          <p className="text-sweet-text-light">Start adding affiliates and referrals to see analytics!</p>
        </div>
      )}
    </div>
  );
};

export default ReferralAnalytics;
