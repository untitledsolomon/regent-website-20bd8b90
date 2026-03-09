-- Allow authenticated users to read newsletter subscribers
CREATE POLICY "Authenticated users can read subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to delete newsletter subscribers
CREATE POLICY "Authenticated users can delete subscribers"
ON public.newsletter_subscribers
FOR DELETE
TO authenticated
USING (true);
