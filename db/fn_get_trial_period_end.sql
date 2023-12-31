CREATE OR REPLACE FUNCTION get_trial_period_end ()
	RETURNS timestamptz
	AS $$
BEGIN
	RETURN now() + interval '7 days';
END;
$$
LANGUAGE plpgsql;
