-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles (only admins can manage roles)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create pizzeria_settings table (singleton)
CREATE TABLE public.pizzeria_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL DEFAULT 'Bella Napoli',
    address text NOT NULL DEFAULT 'Rua das Pizzas, 123 - Centro',
    phone text NOT NULL DEFAULT '(11) 99999-9999',
    opening_hours text NOT NULL DEFAULT '18:00 - 23:30',
    delivery_time text NOT NULL DEFAULT '30-45 min',
    minimum_order numeric NOT NULL DEFAULT 30,
    delivery_fee numeric NOT NULL DEFAULT 5.99,
    primary_color text NOT NULL DEFAULT '#E85D04',
    is_open boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on pizzeria_settings
ALTER TABLE public.pizzeria_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read pizzeria settings
CREATE POLICY "Anyone can view pizzeria settings"
ON public.pizzeria_settings
FOR SELECT
USING (true);

-- Only admins can modify pizzeria settings
CREATE POLICY "Admins can update pizzeria settings"
ON public.pizzeria_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert pizzeria settings"
ON public.pizzeria_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create menu_items table
CREATE TABLE public.menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text NOT NULL,
    image_url text,
    category text NOT NULL DEFAULT 'tradicionais',
    price_small numeric NOT NULL DEFAULT 0,
    price_medium numeric NOT NULL DEFAULT 0,
    price_large numeric NOT NULL DEFAULT 0,
    price_family numeric NOT NULL DEFAULT 0,
    is_popular boolean NOT NULL DEFAULT false,
    is_available boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Everyone can read available menu items
CREATE POLICY "Anyone can view menu items"
ON public.menu_items
FOR SELECT
USING (true);

-- Only admins can modify menu items
CREATE POLICY "Admins can insert menu items"
ON public.menu_items
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update menu items"
ON public.menu_items
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete menu items"
ON public.menu_items
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create orders table
CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    delivery_address text NOT NULL,
    items jsonb NOT NULL DEFAULT '[]'::jsonb,
    subtotal numeric NOT NULL DEFAULT 0,
    delivery_fee numeric NOT NULL DEFAULT 0,
    total numeric NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'pending',
    payment_method text NOT NULL DEFAULT 'cash',
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update orders
CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_pizzeria_settings_updated_at
BEFORE UPDATE ON public.pizzeria_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default pizzeria settings
INSERT INTO public.pizzeria_settings (name, address, phone, opening_hours, delivery_time, minimum_order, delivery_fee, primary_color)
VALUES ('Bella Napoli', 'Rua das Pizzas, 123 - Centro', '(11) 99999-9999', '18:00 - 23:30', '30-45 min', 30, 5.99, '#E85D04');