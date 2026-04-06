import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Input } from '../../components/ui/input';
import {
  MapPin,
  CalendarDays,
  Users,
  X,
  Search,
  ArrowRight } from
'lucide-react';
const pins = [
{
  id: 1,
  title: 'Sta. Cruz Beach Cleanup',
  date: 'Jan 15, 2025',
  location: 'Great Sta. Cruz Island',
  category: 'Cleanup',
  participants: 45,
  top: '30%',
  left: '25%'
},
{
  id: 2,
  title: 'Mangrove Planting Initiative',
  date: 'Jan 22, 2025',
  location: 'Sinunuc Mangrove Area',
  category: 'Planting',
  participants: 32,
  top: '55%',
  left: '18%'
},
{
  id: 3,
  title: 'Marine Biodiversity Workshop',
  date: 'Feb 3, 2025',
  location: 'Zamboanga City Hall',
  category: 'Workshop',
  participants: 28,
  top: '42%',
  left: '52%'
},
{
  id: 4,
  title: 'Paseo del Mar Awareness Walk',
  date: 'Feb 10, 2025',
  location: 'Paseo del Mar',
  category: 'Awareness',
  participants: 60,
  top: '38%',
  left: '68%'
},
{
  id: 5,
  title: 'Pasonanca Reforestation',
  date: 'Feb 18, 2025',
  location: 'Pasonanca Natural Park',
  category: 'Planting',
  participants: 50,
  top: '25%',
  left: '60%'
},
{
  id: 6,
  title: 'Coastal Water Testing',
  date: 'Mar 1, 2025',
  location: 'Rio Hondo Coastline',
  category: 'Research',
  participants: 15,
  top: '65%',
  left: '45%'
}];

const categoryColors: Record<string, string> = {
  Cleanup: 'bg-blue-500',
  Planting: 'bg-green-500',
  Workshop: 'bg-purple-500',
  Awareness: 'bg-amber-500',
  Research: 'bg-cyan-500'
};
const categoryBadge: Record<string, string> = {
  Cleanup: 'bg-blue-50 text-blue-700',
  Planting: 'bg-green-50 text-green-700',
  Workshop: 'bg-purple-50 text-purple-700',
  Awareness: 'bg-amber-50 text-amber-700',
  Research: 'bg-cyan-50 text-cyan-700'
};
export function MapViewPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const selectedPin = pins.find((p) => p.id === selected);
  const filtered = pins.filter(
    (p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">
          Map View
        </h1>
        <p className="text-muted-foreground mt-1">
          Explore environmental events across Zamboanga.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Sidebar */}
        <Card className="rounded-2xl shadow-sm border lg:w-[340px] flex-shrink-0 flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10" />
              
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {filtered.map((pin) =>
              <button
                key={pin.id}
                onClick={() => setSelected(pin.id)}
                className={`w-full text-left p-3 rounded-xl transition-colors ${selected === pin.id ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted border border-transparent'}`}>
                
                  <div className="flex items-start gap-3">
                    <div
                    className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${categoryColors[pin.category]}`} />
                  
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {pin.title}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {pin.location}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge
                        variant="outline"
                        className={`text-[10px] border-0 ${categoryBadge[pin.category]}`}>
                        
                          {pin.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {pin.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Map */}
        <Card className="rounded-2xl shadow-sm border flex-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4f0] via-[#d4ebe2] to-[#c0dfd0]">
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                'radial-gradient(circle at 1px 1px, #1F7A63 0.5px, transparent 0)',
                backgroundSize: '28px 28px'
              }} />
            
            {/* Water areas */}
            <div className="absolute top-0 left-0 w-[40%] h-[45%] bg-[#b8d8e8]/40 rounded-br-[80px]" />
            <div className="absolute bottom-0 right-0 w-[30%] h-[35%] bg-[#b8d8e8]/30 rounded-tl-[60px]" />

            {/* Pins */}
            {pins.map((pin) =>
            <button
              key={pin.id}
              onClick={() => setSelected(pin.id)}
              className="absolute group z-10"
              style={{
                top: pin.top,
                left: pin.left,
                transform: 'translate(-50%, -50%)'
              }}>
              
                <div
                className={`relative ${selected === pin.id ? 'scale-125' : 'hover:scale-110'} transition-transform`}>
                
                  <div
                  className={`w-5 h-5 rounded-full ${categoryColors[pin.category]} border-2 border-white shadow-lg`} />
                
                  {selected === pin.id &&
                <div className="absolute -inset-2 rounded-full border-2 border-primary/30 animate-ping" />
                }
                </div>
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-white rounded-lg px-2 py-1 shadow-md text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {pin.title}
                </div>
              </button>
            )}

            {/* Selected pin popup */}
            <AnimatePresence>
              {selectedPin &&
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95
                }}
                className="absolute z-20 w-72"
                style={{
                  top: `calc(${selectedPin.top} + 20px)`,
                  left: selectedPin.left,
                  transform: 'translateX(-50%)'
                }}>
                
                  <Card className="rounded-xl shadow-lg border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge
                        variant="outline"
                        className={`text-[10px] border-0 ${categoryBadge[selectedPin.category]}`}>
                        
                          {selectedPin.category}
                        </Badge>
                        <button
                        onClick={() => setSelected(null)}
                        className="text-muted-foreground hover:text-foreground">
                        
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="font-heading font-semibold text-sm text-foreground">
                        {selectedPin.title}
                      </h3>
                      <div className="space-y-1 mt-2 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1.5">
                          <CalendarDays className="w-3 h-3" />
                          {selectedPin.date}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          {selectedPin.location}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Users className="w-3 h-3" />
                          {selectedPin.participants} participants
                        </p>
                      </div>
                      <Button
                      size="sm"
                      className="w-full mt-3 bg-primary hover:bg-primary/90 text-xs"
                      onClick={() =>
                      navigate(`/app/events/${selectedPin.id}`)
                      }>
                      
                        View Details <ArrowRight className="ml-1 w-3 h-3" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              }
            </AnimatePresence>
          </div>

          {/* Map label */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            Zamboanga City, Philippines
          </div>
        </Card>
      </div>
    </div>);

}
