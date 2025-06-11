
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Shield, Heart, Flame, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmergencyAlertDialogProps {
  children: React.ReactNode;
}

const EmergencyAlertDialog = ({ children }: EmergencyAlertDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const alertTypes = [
    { value: 'security', label: 'Security Breach', icon: Shield, color: 'text-red-600' },
    { value: 'medical', label: 'Medical Emergency', icon: Heart, color: 'text-pink-600' },
    { value: 'fire', label: 'Fire Emergency', icon: Flame, color: 'text-orange-600' },
    { value: 'evacuation', label: 'Evacuation Required', icon: AlertTriangle, color: 'text-yellow-600' },
    { value: 'suspicious', label: 'Suspicious Activity', icon: AlertCircle, color: 'text-purple-600' },
    { value: 'other', label: 'Other Emergency', icon: AlertTriangle, color: 'text-gray-600' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'medium', label: 'Medium', color: 'bg-orange-100 text-orange-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-200 text-red-900 font-bold' }
  ];

  const handleSubmit = async () => {
    if (!alertType || !description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select alert type and provide description",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .insert({
          alert_type: alertType,
          severity,
          description: description.trim(),
          location: location.trim() || null,
          created_by: 'gate.admin' // This would come from auth context in real app
        });

      if (error) throw error;

      toast({
        title: "Emergency Alert Sent",
        description: `${alertType.toUpperCase()} alert has been broadcast to all stations`,
        variant: "default",
      });

      // Reset form
      setAlertType('');
      setDescription('');
      setLocation('');
      setSeverity('medium');
      setIsOpen(false);

    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast({
        title: "Error",
        description: "Failed to send emergency alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAlertType = alertTypes.find(type => type.value === alertType);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Emergency Alert System
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Alert Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Emergency Type *</label>
            <Select value={alertType} onValueChange={setAlertType}>
              <SelectTrigger>
                <SelectValue placeholder="Select emergency type" />
              </SelectTrigger>
              <SelectContent>
                {alertTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Severity Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Severity Level</label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {severityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <span className={`px-2 py-1 rounded text-xs ${level.color}`}>
                      {level.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Main Gate, Building A, Parking Lot"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed description of the emergency..."
              rows={3}
            />
          </div>

          {/* Preview */}
          {selectedAlertType && (
            <div className="p-3 border rounded-lg bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <selectedAlertType.icon className={`w-4 h-4 ${selectedAlertType.color}`} />
                <span className="text-sm font-medium text-red-800">
                  Alert Preview
                </span>
              </div>
              <p className="text-sm text-red-700">
                <strong>{selectedAlertType.label}</strong> - {severity.toUpperCase()}
                {location && ` at ${location}`}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={isSubmitting || !alertType || !description.trim()}
            >
              {isSubmitting ? 'Sending...' : 'Send Alert'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyAlertDialog;
