-- Allow authenticated users to SELECT consultation_requests
CREATE POLICY "Authenticated users can read consultation requests"
ON public.consultation_requests
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to DELETE consultation_requests
CREATE POLICY "Authenticated users can delete consultation requests"
ON public.consultation_requests
FOR DELETE
TO authenticated
USING (true);