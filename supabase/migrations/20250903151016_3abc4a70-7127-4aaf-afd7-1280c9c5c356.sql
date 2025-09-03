-- Phase 1: Critical Data Privacy Fixes

-- 1. Fix students table SELECT policy to restrict parent contact access
DROP POLICY IF EXISTS "Students can view their own record, teachers their class studen" ON public.students;

CREATE POLICY "Students can view their own record, teachers their class students" 
ON public.students 
FOR SELECT 
USING (
  (user_id = auth.uid()) OR 
  (get_user_role(auth.uid()) = 'admin'::user_role) OR 
  (
    get_user_role(auth.uid()) = 'teacher'::user_role AND 
    class_id IN (
      SELECT classes.id
      FROM classes
      WHERE classes.teacher_id = auth.uid()
    )
  )
);

-- 2. Fix users table SELECT policy to restrict personal data access
DROP POLICY IF EXISTS "Users can view their own profile and admins can view all" ON public.users;

CREATE POLICY "Users can view their own profile and admins can view all" 
ON public.users 
FOR SELECT 
USING (
  (auth.uid() = id) OR 
  (get_user_role(auth.uid()) = 'admin'::user_role)
);

-- Phase 2: Database Security Hardening

-- 3. Fix get_user_role function security settings
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role FROM public.users WHERE id = user_id;
$function$;

-- 4. Fix handle_new_user function security settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    COALESCE((new.raw_user_meta_data ->> 'role')::user_role, 'student')
  );
  
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$function$;