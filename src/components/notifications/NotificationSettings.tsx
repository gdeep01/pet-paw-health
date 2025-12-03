import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const NotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);

  useEffect(() => {
    if (open && user) {
      fetchPreferences();
    }
  }, [open, user]);

  const fetchPreferences = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setWhatsappNumber(data.whatsapp_number || '');
        setWhatsappEnabled(data.whatsapp_enabled || false);
        setEmailEnabled(data.email_enabled ?? true);
      }
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const prefData = {
        user_id: user.id,
        whatsapp_number: whatsappNumber || null,
        whatsapp_enabled: whatsappEnabled,
        email_enabled: emailEnabled,
      };

      if (existing) {
        const { error } = await supabase
          .from('notification_preferences')
          .update(prefData)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_preferences')
          .insert(prefData);
        if (error) throw error;
      }

      toast({ title: 'Preferences saved!' });
      setOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const sendTestMessage = async () => {
    if (!whatsappNumber) {
      toast({ title: 'Enter WhatsApp number first', variant: 'destructive' });
      return;
    }
    
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: whatsappNumber,
          message: '🐾 PetCare Test: Your WhatsApp notifications are working! You\'ll receive important updates about your pets here.',
        },
      });

      if (error) throw error;
      
      toast({ 
        title: 'Test message sent!', 
        description: 'Check your WhatsApp for the test notification.' 
      });
    } catch (error: any) {
      console.error('WhatsApp test error:', error);
      toast({ 
        title: 'Failed to send', 
        description: error.message || 'Make sure Twilio is configured correctly.',
        variant: 'destructive' 
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bell className="w-4 h-4 mr-2" />
          Notifications
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-6 pt-4">
            {/* WhatsApp Settings */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  <Label className="font-medium">WhatsApp Notifications</Label>
                </div>
                <Switch
                  checked={whatsappEnabled}
                  onCheckedChange={setWhatsappEnabled}
                />
              </div>
              
              {whatsappEnabled && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      WhatsApp Number (with country code)
                    </Label>
                    <Input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={sendTestMessage}
                    disabled={testing || !whatsappNumber}
                  >
                    {testing ? 'Sending...' : 'Send Test Message'}
                  </Button>
                </div>
              )}
            </div>

            {/* Email Settings */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <Label className="font-medium">Email Notifications</Label>
              <Switch
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Get notified about vaccination reminders, health alerts, and important updates for your pets.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={savePreferences} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettings;
