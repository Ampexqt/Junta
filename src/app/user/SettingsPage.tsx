import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from
  '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Camera,
  Upload,
  CheckCircle,
  Shield,
  Bell,
  Newspaper,
  Megaphone,
  Lock,
  UserPlus,
  Trash2,
  Mail
} from
  'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export function SettingsPage() {
  const [firstName, setFirstName] = useState('Eco');
  const [lastName, setLastName] = useState('Hero');
  const [suffix, setSuffix] = useState(' ');
  const [email] = useState('eco.hero@envirolink.com');
  const [prefs, setPrefs] = useState({
    eventReminders: true,
    systemUpdates: true,
    newsletter: false,
    organizerNotifs: true
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, verification, and preferences.
        </p>
      </div>

      {/* Profile */}
      <motion.div
        initial={{
          opacity: 0,
          y: 10
        }}
        animate={{
          opacity: 1,
          y: 0
        }}>

        <Card className="rounded-2xl shadow-sm border">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal details and profile photo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    JD
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full border-2 border-white shadow-sm hover:bg-primary/90"
                  aria-label="Change profile photo"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </Button>
              </div>
              <div>
                <p className="font-medium text-foreground">{firstName} {lastName} {suffix && suffix !== 'none' ? suffix : ''}</p>
                <p className="text-sm text-muted-foreground">
                  {email}
                </p>
                <Badge
                  variant="outline"
                  className="mt-1 text-xs bg-primary/10 text-primary border-0">

                  Participant
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-4">
                <div className="sm:col-span-3 space-y-2">
                  <Label htmlFor="settings-firstname">First Name</Label>
                  <Input
                    id="settings-firstname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="sm:col-span-3 space-y-2">
                  <Label htmlFor="settings-lastname">Last Name</Label>
                  <Input
                    id="settings-lastname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="sm:col-span-1 space-y-2">
                  <Label htmlFor="settings-suffix">Suffix</Label>
                  <Select value={suffix} onValueChange={setSuffix}>
                    <SelectTrigger id="settings-suffix">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="Jr.">Jr.</SelectItem>
                      <SelectItem value="Sr.">Sr.</SelectItem>
                      <SelectItem value="II">II</SelectItem>
                      <SelectItem value="III">III</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-email" className="text-muted-foreground opacity-70">Email Address (Read Only)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                  <Input
                    id="settings-email"
                    type="email"
                    value={email}
                    disabled
                    className="pl-10 bg-muted/30 border-dashed border-muted-foreground/20 cursor-not-allowed opacity-60" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground opacity-30" />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/60 italic">
                  Email addresses cannot be changed for security reasons.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="bg-primary hover:bg-primary/90">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Verification */}
      <motion.div
        initial={{
          opacity: 0,
          y: 10
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          delay: 0.1
        }}>

        <Card className="rounded-2xl shadow-sm border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-lg">
                  Verification Status
                </CardTitle>
                <CardDescription>
                  Your identity verification details.
                </CardDescription>
              </div>
              <Badge className="bg-green-50 text-green-700 border-0 gap-1.5">
                <CheckCircle className="w-3 h-3" /> Verified
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">
                  Upload Valid ID
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Replace current ID document
                </p>
                <Badge
                  variant="outline"
                  className="mt-2 text-[10px] bg-green-50 text-green-700 border-0">

                  Verified
                </Badge>
              </div>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors cursor-pointer">
                <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">
                  Upload Selfie
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Replace current selfie
                </p>
                <Badge
                  variant="outline"
                  className="mt-2 text-[10px] bg-green-50 text-green-700 border-0">

                  Verified
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Email Preferences */}
      <motion.div
        initial={{
          opacity: 0,
          y: 10
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          delay: 0.2
        }}>

        <Card className="rounded-2xl shadow-sm border">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Email Preferences
            </CardTitle>
            <CardDescription>
              Choose which notifications you'd like to receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: 'eventReminders' as const,
                icon: Bell,
                label: 'Event Reminders',
                desc: "Get notified before events you've joined"
              },
              {
                key: 'systemUpdates' as const,
                icon: Shield,
                label: 'System Updates',
                desc: 'Important platform announcements and updates',
                disabled: true
              },
              {
                key: 'newsletter' as const,
                icon: Newspaper,
                label: 'Newsletter',
                desc: 'Weekly digest of environmental news and events',
                disabled: true
              },
              {
                key: 'organizerNotifs' as const,
                icon: Megaphone,
                label: 'Organizer Notifications',
                desc: 'Updates from event organizers you follow',
                disabled: true
              }].
              map((item) =>
                <div
                  key={item.key}
                  className={`flex items-center justify-between py-2 ${item.disabled ? 'opacity-50' : ''}`}>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                        {item.disabled &&
                          <span className="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider font-bold text-muted-foreground">
                            Coming Soon
                          </span>
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs[item.key]}
                    disabled={item.disabled}
                    onCheckedChange={(checked) =>
                      setPrefs((prev) => ({
                        ...prev,
                        [item.key]: checked
                      }))
                    } />

                </div>
              )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Account */}
      <motion.div
        initial={{
          opacity: 0,
          y: 10
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          delay: 0.3
        }}>

        <Card className="rounded-2xl shadow-sm border">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Account</CardTitle>
            <CardDescription>
              Manage your account security and data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-12"
              onClick={() => {
                // Future implementation for organizer request
              }}>
              <UserPlus className="w-4 h-4 mr-3 text-primary" /> Request to become an Organizer
            </Button>
            <Button variant="outline" className="w-full justify-start h-12">
              <Lock className="w-4 h-4 mr-3" /> Change Password
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              <Trash2 className="w-4 h-4 mr-3" /> Delete Account
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>);

}
