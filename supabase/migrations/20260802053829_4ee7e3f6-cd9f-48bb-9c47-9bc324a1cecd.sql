REVOKE ALL ON public.player_status_events FROM anon;
REVOKE ALL ON public.player_status_events FROM authenticated;
GRANT SELECT, INSERT ON public.player_status_events TO authenticated;
GRANT ALL ON public.player_status_events TO service_role;