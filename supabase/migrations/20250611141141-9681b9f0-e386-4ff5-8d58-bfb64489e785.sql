
-- Create emergency_alerts table for logging emergency situations
CREATE TABLE public.emergency_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium',
  description TEXT,
  location VARCHAR(100),
  created_by VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing emergency alerts (readable by all authenticated users)
CREATE POLICY "Emergency alerts are viewable by all" 
  ON public.emergency_alerts 
  FOR SELECT 
  USING (true);

-- Create policy for creating emergency alerts (can be created by anyone)
CREATE POLICY "Anyone can create emergency alerts" 
  ON public.emergency_alerts 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for updating emergency alerts (can be updated by anyone)
CREATE POLICY "Anyone can update emergency alerts" 
  ON public.emergency_alerts 
  FOR UPDATE 
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER trigger_set_timestamp_emergency_alerts
  BEFORE UPDATE ON public.emergency_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

-- Enable realtime for emergency alerts
ALTER TABLE public.emergency_alerts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_alerts;
