import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Share2,
  FileText,
  CheckCircle,
  Phone,
  Mail } from
'lucide-react';
export function EventDetailsPage() {
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  return (
    <div className="space-y-6 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/app/events')}
        className="text-muted-foreground -ml-2">
        
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
      </Button>

      <motion.div
        initial={{
          opacity: 0,
          y: 10
        }}
        animate={{
          opacity: 1,
          y: 0
        }}>
        
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <Badge className="bg-green-50 text-green-700 border-0">Cleanup</Badge>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-0">
            
            Upcoming
          </Badge>
        </div>
        <h1 className="font-heading font-semibold text-2xl sm:text-3xl text-foreground">
          Sta. Cruz Beach Cleanup Drive
        </h1>
        <p className="text-muted-foreground mt-2">
          A community-driven initiative to clean and preserve the pristine
          shores of Great Sta. Cruz Island.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl shadow-sm border">
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                About This Event
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Join us for a meaningful day of environmental action at Great
                Sta. Cruz Island, known for its famous pink sand beach. This
                cleanup drive aims to remove marine debris, plastic waste, and
                other pollutants from the shoreline and surrounding waters.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Volunteers will be provided with cleanup materials,
                refreshments, and transportation to the island. This event is
                open to all ages and skill levels. Together, we can protect one
                of Zamboanga's most treasured natural wonders.
              </p>

              <Separator />

              <div>
                <h3 className="font-heading font-semibold text-sm mb-3">
                  Event Timeline
                </h3>
                <div className="space-y-3">
                  {[
                  {
                    time: '6:00 AM',
                    label: 'Assembly at Port Area'
                  },
                  {
                    time: '6:30 AM',
                    label: 'Boat departure to Sta. Cruz Island'
                  },
                  {
                    time: '7:00 AM',
                    label: 'Orientation & Safety Briefing'
                  },
                  {
                    time: '7:30 AM',
                    label: 'Cleanup Activity Begins'
                  },
                  {
                    time: '10:30 AM',
                    label: 'Break & Refreshments'
                  },
                  {
                    time: '11:00 AM',
                    label: 'Waste Sorting & Documentation'
                  },
                  {
                    time: '12:00 PM',
                    label: 'Closing & Group Photo'
                  }].
                  map((item, i) =>
                  <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5" />
                        {i < 6 && <div className="w-0.5 h-6 bg-border" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-primary">
                          {item.time}
                        </p>
                        <p className="text-sm text-foreground">{item.label}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-heading font-semibold text-sm mb-3">
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {[
                  'Comfortable clothing and footwear',
                  'Sunscreen and hat',
                  'Reusable water bottle',
                  'Valid ID for island entry',
                  'Positive attitude and willingness to help!'].
                  map((r, i) =>
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-muted-foreground">
                    
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      {r}
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border">
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Event Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Event Guidelines PDF
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cleanup protocols and safety guidelines
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl shadow-sm border overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-[#e8f4f0] via-[#d1e8df] to-[#b8dcc8] relative">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                  'radial-gradient(circle at 1px 1px, #1F7A63 0.5px, transparent 0)',
                  backgroundSize: '20px 20px'
                }} />
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-5 h-5 bg-primary rounded-full border-2 border-white shadow-lg animate-pulse" />
              </div>
              <div className="absolute bottom-3 right-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/90 text-xs"
                  onClick={() => navigate('/app/map')}>
                  
                  <MapPin className="w-3 h-3 mr-1" /> Open Map
                </Button>
              </div>
            </div>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-foreground">
                  Great Sta. Cruz Island, Zamboanga City
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span className="text-foreground">January 15, 2025</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-foreground">6:00 AM – 12:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-foreground">45 / 100 participants</span>
              </div>

              <Separator />

              {joined ?
              <div className="bg-primary/5 rounded-xl p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-primary">
                    You're registered!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll send you a reminder before the event.
                  </p>
                </div> :

              <Button
                className="w-full bg-primary hover:bg-primary/90 h-12 text-base"
                onClick={() => setJoined(true)}>
                
                  Join This Event
                </Button>
              }

              <Button variant="outline" className="w-full">
                <Share2 className="w-4 h-4 mr-2" /> Share Event
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border">
            <CardHeader>
              <CardTitle className="font-heading text-sm">Organizer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    ZE
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm text-foreground">
                    Zamboanga Eco Warriors
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Environmental Organization
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" /> ecowarriors@envirolink.ph
                </p>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" /> +63 912 345 6789
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);

}
