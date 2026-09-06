-- ==============================================================================
-- NEXORA AI - Supabase Database Schema & Setup Script
-- Copy and run this script in your Supabase Project:
-- Dashboard -> SQL Editor -> New query -> Paste & Click "Run"
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. Tables Schema
-- ==============================================================================

-- Profiles / User Metadata (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Image Generations & History (Full generation metadata)
CREATE TABLE IF NOT EXISTS public.image_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  aspect_ratio TEXT DEFAULT '1:1',
  quality TEXT DEFAULT '1K',
  model TEXT NOT NULL,
  style TEXT NOT NULL,
  seed BIGINT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Projects Images (Pinned / Bookmarked images)
CREATE TABLE IF NOT EXISTS public.saved_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  title TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research & Chat Sessions
CREATE TABLE IF NOT EXISTS public.saved_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Research',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Saved Prompts
CREATE TABLE IF NOT EXISTS public.saved_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Curated System Prompt Templates
CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. Performance Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_image_history_user ON public.image_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_images_user ON public.saved_images(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_chats_user ON public.saved_chats(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_prompts_user ON public.saved_prompts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON public.prompt_templates(category);

-- ==============================================================================
-- 4. Automatic Timestamp Update Triggers
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_saved_chats_updated_at ON public.saved_chats;
CREATE TRIGGER set_saved_chats_updated_at
  BEFORE UPDATE ON public.saved_chats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_saved_prompts_updated_at ON public.saved_prompts;
CREATE TRIGGER set_saved_prompts_updated_at
  BEFORE UPDATE ON public.saved_prompts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. Auto-Create Profile on User Signup
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 6. Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read own profile or public profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Image History Policies
CREATE POLICY "Users can manage own image history"
  ON public.image_history FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Saved Images Policies
CREATE POLICY "Users can manage own saved images"
  ON public.saved_images FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Saved Chats Policies
CREATE POLICY "Users can manage own saved chats"
  ON public.saved_chats FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Saved Prompts Policies
CREATE POLICY "Users can manage own saved prompts"
  ON public.saved_prompts FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Prompt Templates Policies (Public Read, Admin Write)
CREATE POLICY "Anyone can view public prompt templates"
  ON public.prompt_templates FOR SELECT
  USING (is_public = true);

-- ==============================================================================
-- 7. Supabase Storage Bucket for Generated & Uploaded Images
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('nexora-images', 'nexora-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Public Read Policy
CREATE POLICY "Public image access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'nexora-images');

-- Storage Upload Policy for Authenticated or App Users
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'nexora-images');

-- ==============================================================================
-- 8. Starter Seed Data (Curated Prompt Templates)
-- ==============================================================================
INSERT INTO public.prompt_templates (title, category, content)
VALUES
  ('Photorealistic Portrait Studio', 'Photography', 'Professional studio portrait of [subject], 85mm lens, f/1.8 aperture, soft cinematic rim lighting, 8k resolution, photorealistic, natural skin texture, sharp eye focus'),
  ('Cinematic Sci-Fi Environment', 'Concept Art', 'Futuristic cyberpunk skyline at dusk, neon reflections on wet asphalt, towering holographic billboards, volumetric fog, wide angle shot, photorealistic, Unreal Engine 5 render style'),
  ('Commercial Product Showcase', 'Product', 'Minimalist luxury product photography of [product] set on smooth matte stone pedestal, soft diffused studio lighting, gentle shadows, elegant neutral color palette, commercial grade, clean composition'),
  ('Vintage 35mm Film Aesthetic', 'Artistic', '35mm vintage film photograph of [scene], authentic film grain, nostalgic golden hour tones, light leak effect, natural colors, analog camera aesthetic')
ON CONFLICT DO NOTHING;
