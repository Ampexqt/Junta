import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarDays, Clock, MapPin, CheckCircle } from 'lucide-react';
const scheduleEvents: Record<
  string,
  Array<{
    title: string;
    time: string;
    location: string;
    category: string;
    color: string;
  }>> =
{
  '2025-01-15': [
  {
    title: 'Sta. Cruz Beach Cleanup',
    time: '6:00 AM – 12:00 PM',
    location: 'Great Sta. Cruz Island',
    category: 'Cleanup',
    color: 'bg-blue-500'
  }],

  '2025-01-22': [
  {
    title: 'Mangrove Planting Initiative',
    time: '7:00 AM – 11:00 AM',
    location: 'Sinunuc Mangrove Area',
    category: 'Planting',
    color: 'bg-green-500'
  }],

  '2025-02-03': [
  {
    title: 'Marine Biodiversity Workshop',
    time: '9:00 AM – 4:00 PM',
    location: 'Zamboanga City Hall',
    category: 'Workshop',
    color: 'bg-purple-500'
  },
  {
    title: 'Eco Film Screening',
    time: '6:00 PM – 8:00 PM',
    location: 'City Library',
    category: 'Awareness',
    color: 'bg-amber-500'
  }],

  '2025-02-10': [
  {
    title: 'Paseo del Mar Awareness Walk',
    time: '5:30 AM – 8:00 AM',
    location: 'Paseo del Mar',
    category: 'Awareness',
    color: 'bg-amber-500'
  }],

  '2025-02-18': [
  {
    title: 'Pasonanca Reforestation',
    time: '6:00 AM – 12:00 PM',
    location: 'Pasonanca Natural Park',
    category: 'Planting',
    color: 'bg-green-500'
  }]

};
export function SchedulePage() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 0, 15));
  const dateKey = date ?
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` :
  '';
  const dayEvents = dateKey ? scheduleEvents[dateKey] || [] : [];
  const eventDates = Object.keys(scheduleEvents).map((d) => new Date(d));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-semibold text-2xl text-foreground">
            Schedule
          </h1>
          <p className="text-muted-foreground mt-1">
            View your event calendar and upcoming activities.
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-0 gap-1.5">
          
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{' '}
          Synced
        </Badge>
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-6">
        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              modifiers={{
                event: eventDates
              }}
              modifiersClassNames={{
                event: 'bg-primary/10 text-primary font-semibold'
              }}
              className="rounded-xl" />
            
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                {date ?
                date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                }) :
                'Select a date'}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {dayEvents.length > 0 ?
            <motion.div
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              className="space-y-3">
              
                {dayEvents.map((e, i) =>
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  x: -10
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                transition={{
                  delay: i * 0.1
                }}
                className="flex items-start gap-3 p-4 rounded-xl border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate('/app/events/1')}>
                
                    <div
                  className={`w-1 h-full min-h-[60px] rounded-full ${e.color}`} />
                
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-semibold text-sm text-foreground">
                          {e.title}
                        </h3>
                        <Badge variant="outline" className="text-[10px]">
                          {e.category}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {e.time}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          {e.location}
                        </p>
                      </div>
                    </div>
                    <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex-shrink-0">
                  
                      View
                    </Button>
                  </motion.div>
              )}
              </motion.div> :

            <div className="text-center py-12">
                <CalendarDays className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No events scheduled for this date.
                </p>
                <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-primary"
                onClick={() => navigate('/app/events')}>
                
                  Browse Events
                </Button>
              </div>
            }
          </CardContent>
        </Card>
      </div>
    </div>);

}
