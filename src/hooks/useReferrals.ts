import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Order, ReferralAnalytics, ReferralStats } from '../types';

export const useReferrals = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<ReferralAnalytics[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          affiliates!affiliate_id (
            name,
            referral_code
          )
        `)
        .not('affiliate_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_analytics')
        .select('*');

      if (error) throw error;
      setAnalytics(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_referral_stats');

      if (error) {
        console.warn('RPC function failed, using fallback calculation:', error);
        // Fallback: calculate stats manually
        const [affiliatesResult, ordersResult] = await Promise.all([
          supabase.from('affiliates').select('id, status'),
          supabase.from('orders').select('total, affiliate_id').not('affiliate_id', 'is', null)
        ]);

        if (affiliatesResult.error || ordersResult.error) {
          throw new Error('Failed to fetch fallback data');
        }

        const totalAffiliates = affiliatesResult.data?.length || 0;
        const activeAffiliates = affiliatesResult.data?.filter(a => a.status === 'active').length || 0;
        const totalReferrals = ordersResult.data?.length || 0;
        const totalSales = ordersResult.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
        const avgOrderValue = totalReferrals > 0 ? totalSales / totalReferrals : 0;

        setStats({
          total_affiliates: totalAffiliates,
          active_affiliates: activeAffiliates,
          total_referrals: totalReferrals,
          total_sales: totalSales,
          avg_order_value: avgOrderValue,
          top_affiliate_name: undefined,
          top_affiliate_sales: 0
        });
        return;
      }

      setStats(data?.[0] || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select(`
          *,
          affiliates!affiliate_id (
            name,
            referral_code
          )
        `)
        .single();

      if (error) throw error;
      setOrders(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add order');
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          affiliates!affiliate_id (
            name,
            referral_code
          )
        `)
        .single();

      if (error) throw error;
      setOrders(prev => prev.map(order => 
        order.id === id ? data : order
      ));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
      throw err;
    }
  };

  const getRecentReferrals = async (limit: number = 10) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          affiliates!affiliate_id (
            name,
            referral_code
          )
        `)
        .not('affiliate_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent referrals');
      return [];
    }
  };

  const getAffiliatePerformance = async (affiliateId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch affiliate performance');
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchOrders(),
        fetchAnalytics(),
        fetchStats()
      ]);
    };
    loadData();
  }, []);

  return {
    orders,
    analytics,
    stats,
    loading,
    error,
    fetchOrders,
    fetchAnalytics,
    fetchStats,
    addOrder,
    updateOrderStatus,
    getRecentReferrals,
    getAffiliatePerformance
  };
};
