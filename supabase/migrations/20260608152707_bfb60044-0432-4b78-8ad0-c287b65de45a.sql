CREATE TABLE public.user_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, recipe_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_recipes TO authenticated;
GRANT ALL ON public.user_recipes TO service_role;
ALTER TABLE public.user_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recipes" ON public.user_recipes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER update_user_recipes_updated_at BEFORE UPDATE ON public.user_recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();