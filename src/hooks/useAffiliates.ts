import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Affiliate } from '../types';

export const useAffiliates = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAffiliates(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch affiliates');
    } finally {
      setLoading(false);
    }
  };

  const addAffiliate = async (affiliate: Omit<Affiliate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .insert([affiliate])
        .select()
        .single();

      if (error) throw error;
      setAffiliates(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add affiliate');
      throw err;
    }
  };

  const updateAffiliate = async (id: string, updates: Partial<Affiliate>) => {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setAffiliates(prev => prev.map(affiliate => 
        affiliate.id === id ? data : affiliate
      ));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update affiliate');
      throw err;
    }
  };

  const deleteAffiliate = async (id: string) => {
    try {
      console.log('=== AFFILIATE DELETION DEBUG ===');
      console.log('Attempting to delete affiliate with ID:', id);
      console.log('Current user role:', await supabase.auth.getUser());
      
      // First, let's check if the affiliate exists
      const { data: existingAffiliate, error: fetchError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('id', id)
        .single();
        
      console.log('Existing affiliate:', existingAffiliate);
      console.log('Fetch error:', fetchError);
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch affiliate: ${fetchError.message}`);
      }
      
      if (!existingAffiliate) {
        throw new Error('Affiliate not found');
      }
      
      // Try to delete the affiliate directly
      const { error, data } = await supabase
        .from('affiliates')
        .delete()
        .eq('id', id)
        .select();

      console.log('Delete response:', { error, data });

      if (error) {
        console.error('Delete affiliate error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
      }
      
      console.log('Affiliate deleted successfully');
      setAffiliates(prev => prev.filter(affiliate => affiliate.id !== id));
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Delete affiliate error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete affiliate';
      setError(errorMessage);
      throw err;
    }
  };

  const getAffiliateByCode = async (referralCode: string) => {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('referral_code', referralCode)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch affiliate');
      return null;
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  return {
    affiliates,
    loading,
    error,
    fetchAffiliates,
    addAffiliate,
    updateAffiliate,
    deleteAffiliate,
    getAffiliateByCode
  };
};
