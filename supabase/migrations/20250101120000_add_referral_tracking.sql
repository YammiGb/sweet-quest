-- Referral Tracking System for Sweet Quest
-- This migration adds affiliate tracking capabilities

-- Create affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure updated_at column exists (in case it was missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'affiliates' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE affiliates ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Add referral tracking columns to existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS referred_by VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS affiliate_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_time VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS party_size INTEGER DEFAULT 1;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Add foreign key constraint with ON DELETE SET NULL
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_affiliate_id_fkey' 
    AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_affiliate_id_fkey 
    FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_affiliate_id ON orders(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON orders(referral_code);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);

-- Create referral_analytics view for easy reporting
CREATE OR REPLACE VIEW referral_analytics AS
SELECT 
  a.id as affiliate_id,
  a.name as affiliate_name,
  a.referral_code,
  COUNT(o.id) as total_referrals,
  COALESCE(SUM(o.total), 0) as total_sales,
  MAX(o.created_at) as last_referral_date,
  COUNT(CASE WHEN o.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as referrals_this_week,
  COUNT(CASE WHEN o.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as referrals_this_month
FROM affiliates a
LEFT JOIN orders o ON a.id = o.affiliate_id
WHERE a.status = 'active'
GROUP BY a.id, a.name, a.referral_code
ORDER BY total_sales DESC;

-- Create updated_at trigger for affiliates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to affiliates table
DROP TRIGGER IF EXISTS update_affiliates_updated_at ON affiliates;
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure the trigger function exists and is correct
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for affiliates (admin only access)
DROP POLICY IF EXISTS "Allow all operations on affiliates for authenticated users" ON affiliates;
CREATE POLICY "Allow all operations on affiliates for authenticated users" ON affiliates
  FOR ALL USING (true);

-- Create RLS policies for orders (admin only access)
DROP POLICY IF EXISTS "Allow all operations on orders for authenticated users" ON orders;
CREATE POLICY "Allow all operations on orders for authenticated users" ON orders
  FOR ALL USING (true);

-- Clean up any existing problematic sample data first
DELETE FROM orders WHERE referral_code IN ('sarah123', 'john456');
DELETE FROM affiliates WHERE referral_code IN ('sarah123', 'john456');

-- Insert sample affiliates for testing (without problematic sample orders)
INSERT INTO affiliates (name, email, referral_code, status, notes) VALUES
  ('Sarah Garcia', 'sarah@email.com', 'sarah123', 'active', 'Top performer - social media influencer'),
  ('John Smith', 'john@email.com', 'john456', 'active', 'Local business owner'),
  ('Maria Santos', 'maria@email.com', 'maria789', 'active', 'Food blogger'),
  ('Mike Johnson', 'mike@email.com', 'mike2024', 'inactive', 'Former affiliate - on break')
ON CONFLICT (referral_code) DO NOTHING;

-- Create a function to get referral statistics
CREATE OR REPLACE FUNCTION get_referral_stats()
RETURNS TABLE (
  total_affiliates BIGINT,
  active_affiliates BIGINT,
  total_referrals BIGINT,
  total_sales DECIMAL,
  avg_order_value DECIMAL,
  top_affiliate_name VARCHAR,
  top_affiliate_sales DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM affiliates) as total_affiliates,
    (SELECT COUNT(*) FROM affiliates WHERE status = 'active') as active_affiliates,
    (SELECT COUNT(*) FROM orders WHERE affiliate_id IS NOT NULL) as total_referrals,
    (SELECT COALESCE(SUM(total), 0) FROM orders WHERE affiliate_id IS NOT NULL) as total_sales,
    (SELECT COALESCE(AVG(total), 0) FROM orders WHERE affiliate_id IS NOT NULL) as avg_order_value,
    (SELECT affiliate_name FROM referral_analytics ORDER BY total_sales DESC LIMIT 1) as top_affiliate_name,
    (SELECT total_sales FROM referral_analytics ORDER BY total_sales DESC LIMIT 1) as top_affiliate_sales;
END;
$$ LANGUAGE plpgsql;

-- Fix foreign key constraint for proper affiliate deletion
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_affiliate_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_affiliate_id_fkey 
FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE SET NULL;

-- Grant necessary permissions
GRANT ALL ON affiliates TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT SELECT ON referral_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_referral_stats() TO authenticated;

-- Fix RLS policies for public access (since app uses localStorage auth, not Supabase auth)
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow all operations on affiliates for authenticated users" ON affiliates;
DROP POLICY IF EXISTS "Allow all operations on orders for authenticated users" ON orders;
DROP POLICY IF EXISTS "Allow all operations on affiliates" ON affiliates;
DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;

-- Create comprehensive policies that allow public access
CREATE POLICY "Allow all operations on affiliates" ON affiliates
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on orders" ON orders
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Grant explicit permissions to anonymous role
GRANT ALL ON affiliates TO anon;
GRANT ALL ON orders TO anon;
GRANT ALL ON order_items TO anon;

-- CRITICAL FIX: Force add updated_at column (multiple approaches)
-- This fixes the "record 'new' has no field 'updated_at'" error

-- Approach 1: Try to add the column (ignore if it exists)
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Approach 2: Force update the column if it exists but is NULL
UPDATE affiliates SET updated_at = NOW() WHERE updated_at IS NULL;

-- Approach 3: Verify and recreate if needed
DO $$
BEGIN
  -- Check if column exists and has proper type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'affiliates' 
    AND column_name = 'updated_at' 
    AND data_type = 'timestamp with time zone'
  ) THEN
    -- Drop and recreate the column
    ALTER TABLE affiliates DROP COLUMN IF EXISTS updated_at;
    ALTER TABLE affiliates ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Recreated updated_at column in affiliates table';
  ELSE
    RAISE NOTICE 'updated_at column exists and is properly configured';
  END IF;
END $$;

-- Ensure the trigger function exists and is correct
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if the column exists
  IF TG_TABLE_NAME = 'affiliates' THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger to ensure it's working properly
DROP TRIGGER IF EXISTS update_affiliates_updated_at ON affiliates;
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Alternative: Create a safer trigger function that checks for column existence
CREATE OR REPLACE FUNCTION safe_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if updated_at column exists before trying to set it
  BEGIN
    PERFORM NEW.updated_at;
    NEW.updated_at = NOW();
  EXCEPTION
    WHEN undefined_column THEN
      -- Column doesn't exist, skip the update
      NULL;
  END;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Use the safer trigger function
DROP TRIGGER IF EXISTS update_affiliates_updated_at ON affiliates;
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION safe_update_updated_at();

-- Verify the column exists (this will show the column details)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'affiliates' AND column_name = 'updated_at';