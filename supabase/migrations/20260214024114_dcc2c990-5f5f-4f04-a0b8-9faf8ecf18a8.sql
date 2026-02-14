
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'manager');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'individual' CHECK (type IN ('individual', 'business')),
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('active', 'inactive', 'lead')),
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  assigned_agent UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create policies table
CREATE TABLE public.policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT '',
  carrier TEXT NOT NULL DEFAULT '',
  premium NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'expired', 'cancelled')),
  start_date DATE,
  renewal_date DATE,
  policy_number TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deals table
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL DEFAULT '',
  policy_type TEXT NOT NULL DEFAULT '',
  value NUMERIC NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'lead',
  assigned_agent UUID REFERENCES auth.users(id),
  priority TEXT NOT NULL DEFAULT 'warm' CHECK (priority IN ('hot', 'warm', 'cold')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  agent UUID REFERENCES auth.users(id),
  notes TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'superadmin')
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies for profiles
CREATE POLICY "Authenticated users can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Superadmin can update any profile" ON public.profiles FOR UPDATE TO authenticated USING (public.is_superadmin());
CREATE POLICY "Superadmin can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.is_superadmin());

-- RLS Policies for user_roles
CREATE POLICY "Superadmin can view roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_superadmin());
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Superadmin can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_superadmin());
CREATE POLICY "Superadmin can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.is_superadmin());
CREATE POLICY "Superadmin can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.is_superadmin());

-- RLS Policies for clients (all authenticated users)
CREATE POLICY "Authenticated users can view clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update clients" ON public.clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete clients" ON public.clients FOR DELETE TO authenticated USING (true);

-- RLS Policies for policies
CREATE POLICY "Authenticated users can view policies" ON public.policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create policies" ON public.policies FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update policies" ON public.policies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete policies" ON public.policies FOR DELETE TO authenticated USING (true);

-- RLS Policies for deals
CREATE POLICY "Authenticated users can view deals" ON public.deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create deals" ON public.deals FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update deals" ON public.deals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete deals" ON public.deals FOR DELETE TO authenticated USING (true);

-- RLS Policies for appointments
CREATE POLICY "Authenticated users can view appointments" ON public.appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update appointments" ON public.appointments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete appointments" ON public.appointments FOR DELETE TO authenticated USING (true);
