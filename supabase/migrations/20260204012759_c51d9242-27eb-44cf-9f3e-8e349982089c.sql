-- Create order_ratings table
CREATE TABLE public.order_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent multiple ratings per order
CREATE UNIQUE INDEX order_ratings_order_id_unique ON public.order_ratings(order_id);

-- Enable RLS
ALTER TABLE public.order_ratings ENABLE ROW LEVEL SECURITY;

-- Users can view their own ratings
CREATE POLICY "Users can view their own ratings"
ON public.order_ratings FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own ratings
CREATE POLICY "Users can insert their own ratings"
ON public.order_ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all ratings
CREATE POLICY "Admins can view all ratings"
ON public.order_ratings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));