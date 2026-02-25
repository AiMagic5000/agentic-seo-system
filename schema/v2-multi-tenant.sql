-- ============================================================================
-- V2 MULTI-TENANT MIGRATION
-- ============================================================================
-- Adds multi-tenancy support to the Agentic SEO System:
-- - User profiles (linked to Clerk auth)
-- - Owner column on seo_clients for per-user business isolation
-- - Notifications system
-- - Seed data for admin's 6 domains
--
-- Run against Cognabase R740xd:
--   PGPASSWORD='VayyOQHr6ghRh4xnfRosVNkR' psql -h 10.28.28.97 -p 5433 \
--     -U supabase_admin -d postgres -f schema/v2-multi-tenant.sql
-- ============================================================================

-- Ensure UUID extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USER PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  max_businesses INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_id ON user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists, then create
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role full access" ON user_profiles;
  CREATE POLICY "Service role full access" ON user_profiles FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

COMMENT ON TABLE user_profiles IS 'User profiles linked to Clerk authentication';
COMMENT ON COLUMN user_profiles.clerk_user_id IS 'Clerk user ID (unique external identifier)';
COMMENT ON COLUMN user_profiles.role IS 'User role: admin has full access, user has scoped access';
COMMENT ON COLUMN user_profiles.max_businesses IS 'Maximum number of businesses this user can onboard';

-- ============================================================================
-- 2. ADD OWNER COLUMN TO seo_clients
-- ============================================================================
-- NULL owner_clerk_id = admin-owned system record (visible to admin only)

ALTER TABLE seo_clients ADD COLUMN IF NOT EXISTS owner_clerk_id TEXT;
ALTER TABLE seo_clients ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#1a73e8';

CREATE INDEX IF NOT EXISTS idx_seo_clients_owner ON seo_clients(owner_clerk_id);

COMMENT ON COLUMN seo_clients.owner_clerk_id IS 'Clerk user ID of the business owner. NULL = admin-owned system record';
COMMENT ON COLUMN seo_clients.color IS 'UI accent color for the business card/selector';

-- ============================================================================
-- 3. NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_clerk_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'system')),
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_clerk_id, read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role full access" ON notifications;
  CREATE POLICY "Service role full access" ON notifications FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON COLUMN notifications.user_clerk_id IS 'Clerk user ID of the notification recipient';
COMMENT ON COLUMN notifications.type IS 'Notification severity/type for UI rendering';
COMMENT ON COLUMN notifications.action_url IS 'Optional URL to navigate to when notification is clicked';

-- ============================================================================
-- 4. SEED ADMIN'S 6 DOMAINS
-- ============================================================================
-- owner_clerk_id is NULL for admin-owned system records.
-- Uses ON CONFLICT DO NOTHING to be idempotent.

INSERT INTO seo_clients (id, business_name, site_url, domain, niche, platform, gsc_property_url, active, color, data_sources)
VALUES
  (uuid_generate_v4(), 'Asset Recovery Biz', 'https://assetrecoverybusiness.com', 'assetrecoverybusiness.com', 'Asset Recovery', 'custom', 'sc-domain:assetrecoverybusiness.com', true, '#d93025', '["gsc"]'),
  (uuid_generate_v4(), 'USMR', 'https://usmortgagerecovery.com', 'usmortgagerecovery.com', 'Mortgage Recovery', 'custom', 'sc-domain:usmortgagerecovery.com', true, '#e8710a', '["gsc"]'),
  (uuid_generate_v4(), 'Start My Business', 'https://startmybusiness.us', 'startmybusiness.us', 'Business Services', 'wordpress', 'sc-domain:startmybusiness.us', true, '#1a73e8', '["gsc"]'),
  (uuid_generate_v4(), 'USFL', 'https://usforeclosureleads.com', 'usforeclosureleads.com', 'Lead Generation', 'custom', 'sc-domain:usforeclosureleads.com', true, '#d93025', '["gsc"]'),
  (uuid_generate_v4(), 'USFR', 'https://usforeclosurerecovery.com', 'usforeclosurerecovery.com', 'Foreclosure Recovery', 'custom', 'sc-domain:usforeclosurerecovery.com', true, '#9334e6', '["gsc"]'),
  (uuid_generate_v4(), 'Scorewise', 'https://scorewise.app', 'scorewise.app', 'Credit Technology', 'custom', 'sc-domain:scorewise.app', true, '#1e8e3e', '["gsc"]')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Added:
--   1. user_profiles - Clerk-linked user accounts with roles
--   2. owner_clerk_id + color columns on seo_clients
--   3. notifications - In-app notification system
--   4. Seed data for admin's 6 domains
-- ============================================================================
