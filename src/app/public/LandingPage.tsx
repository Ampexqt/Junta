import { useState, useRef, useEffect } from 'react';
import MapImage from '@/assets/zamboanga_city_forest_20260413_010218.webp';
import Map, { NavigationControl, Marker, Popup } from 'react-map-gl/mapbox';
import { useMapboxToken } from '@/hooks/useMapboxToken';

import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Leaf,
  Search,
  Users,
  Megaphone,
  Bell,
  MapPin,
  Calendar,
  ArrowRight,
  CheckCircle,
  TreePine,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Menu
} from
  'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut'
    }
  })
};
const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = ['Map', 'Features', 'How It Works', 'Events', 'Contact'];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/50 backdrop-blur-xl border-b border-primary/5 shadow-[0_10px_40px_rgba(31,122,99,0.06)] transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-950 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-['Lora'] font-bold text-[22px] text-foreground tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-500">
            Junta
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s/g, '-')}`}
              className="text-sm font-semibold text-foreground/60 hover:text-primary transition-all relative group py-2 px-1"
            >
              {link}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full opacity-0 group-hover:opacity-100" />
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="font-bold text-sm hover:bg-primary/5 px-4 h-10 rounded-xl transition-all"
          >
            Log In
          </Button>
          <Button
            onClick={() => navigate('/register')}
            className="bg-primary hover:bg-primary-hover text-white font-bold text-sm px-6 h-10 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            Get Started
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-white/70 backdrop-blur-xl border-l border-white/20">
            <div className="flex flex-col gap-4 mt-8">
              {links.map((link) =>
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace(/\s/g, '-')}`}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-foreground/80 hover:text-primary transition-colors py-2 flex items-center justify-between"
                >
                  {link}
                </a>
              )}
              <div className="border-t pt-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    navigate('/login');
                  }}>

                  Log In
                </Button>
                <Button
                  onClick={() => {
                    setOpen(false);
                    navigate('/register');
                  }}
                  className="bg-primary hover:bg-primary/90">

                  Get Started
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>);

}

function HeroSection() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background pt-28 md:pt-36 lg:pt-40 pb-20">
      {/* Background Soft Glow */}
      <div className="absolute top-0 left-1/4 -z-0 h-[400px] w-[600px] rounded-full bg-white/40 blur-[120px] pointer-events-none" />

      <div className="container relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start text-left"
          >
            {/* Badge */}
            <motion.div 
              variants={itemVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-[10px] font-bold tracking-[0.15em] text-primary shadow-sm uppercase"
            >
              <Leaf className="h-3.5 w-3.5" />
              <span>Zamboanga City's Environmental Platform</span>
            </motion.div>

            {/* Heading */}
            <motion.h1 
              variants={itemVariants}
              className="mb-6 max-w-2xl font-heading text-4xl font-bold leading-[1.08] tracking-tight text-[#1A1A1A] md:text-5xl lg:text-6xl xl:text-7xl"
            >
              Join Environmental <br />
              Activities in <span className="relative inline-block">
                Your Community
                {/* SVG Underline Curve */}
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/20" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                  <path d="M4 9C40 3 150 1.5 296 9" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={itemVariants}
              className="mb-10 max-w-lg text-base font-medium leading-relaxed text-[#4A5A52] md:text-lg"
            >
              Discover, join, and organize local initiatives to protect and preserve Zamboanga City's natural beauty. Together, we can make a difference.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col gap-4 sm:flex-row sm:gap-6"
            >
              <Button
                size="lg"
                onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-14 min-w-[180px] rounded-full bg-primary px-10 text-base font-bold text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary-hover hover:-translate-y-0.5"
              >
                Browse Events
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/register')}
                className="h-14 min-w-[180px] rounded-full border-2 border-primary/20 bg-white px-10 text-base font-bold text-primary transition-all hover:border-primary/40"
              >
                Create an Event
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Column - Map Image Frame */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Decorative Background Shapes */}
            <div className="absolute -bottom-6 -left-6 -z-10 h-24 w-24 rounded-2xl bg-primary/5" />
            <div className="absolute -top-4 -right-4 -z-10 h-16 w-16 rounded-full bg-primary/5" />

            <div className="relative aspect-[4/3] lg:aspect-[3/4] xl:aspect-square overflow-hidden rounded-[2rem] border border-white/50 bg-white p-2 md:p-3 shadow-2xl shadow-primary/10">
              <div className="h-full w-full overflow-hidden rounded-2xl bg-background-alt relative">
                {/* Gradient Overlays */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 pointer-events-none z-10" />
                <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white/20 pointer-events-none z-10" />
                
                <img 
                  src={MapImage} 
                  alt="Zamboanga Map" 
                  className="h-full w-full object-cover object-center transition-transform duration-[2000ms] hover:scale-105"
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
function FeaturesSection() {
  const features = [
    {
      icon: Search,
      title: 'Discover Environmental Events',
      desc: 'Browse and find cleanup drives, tree planting activities, and environmental workshops happening near you in Zamboanga.'
    },
    {
      icon: Users,
      title: 'Join Community Activities',
      desc: "Connect with like-minded individuals and organizations dedicated to preserving Zamboanga's natural beauty."
    },
    {
      icon: Megaphone,
      title: 'Organize and Lead Events',
      desc: 'Create and manage your own environmental events. Rally your community and lead the change you want to see.'
    },
    {
      icon: Bell,
      title: 'Real-Time Notifications',
      desc: 'Stay updated with event reminders, community announcements, and environmental alerts in your area.'
    }];

  return (
    <section
      id="features"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          margin: '-100px'
        }}
        variants={stagger}
        className="text-center mb-16">

        <motion.p
          variants={fadeUp}
          custom={0}
          className="text-sm font-medium text-primary mb-2">

          Features
        </motion.p>
        <motion.h2
          variants={fadeUp}
          custom={1}
          className="font-heading font-semibold text-3xl sm:text-4xl text-foreground">

          Everything You Need to Make an Impact
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={2}
          className="mt-4 text-muted-foreground max-w-2xl mx-auto">

          Our platform provides all the tools you need to discover, join, and
          organize environmental events in Zamboanga.
        </motion.p>
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          margin: '-50px'
        }}
        variants={stagger}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {features.map((f, i) =>
          <motion.div key={f.title} variants={fadeUp} custom={i}>
            <Card className="rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border-primary/5 hover:border-primary/20 hover:shadow-[0_20px_50px_-20px_rgba(31,122,99,0.1)] transition-all duration-500 h-full group bg-white/50 backdrop-blur-sm">
              <CardContent className="pt-8 px-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-[18px] text-foreground mb-3 leading-tight">
                  {f.title}
                </h3>
                <p className="text-[15px] text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </section>);

}
function HowItWorksSection() {
  const steps = [
    {
      num: 1,
      icon: CheckCircle,
      title: 'Register & Verify',
      desc: 'Create your account and verify your identity to join the community.'
    },
    {
      num: 2,
      icon: Calendar,
      title: 'Join or Create Events',
      desc: 'Browse upcoming events or organize your own environmental activities.'
    },
    {
      num: 3,
      icon: TreePine,
      title: 'Participate & Make Impact',
      desc: 'Show up, contribute, and track your environmental impact over time.'
    }];

  return (
    <section
      id="how-it-works"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-primary/[0.02] to-background">

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            margin: '-100px'
          }}
          variants={stagger}
          className="text-center mb-16">

          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-sm font-medium text-primary mb-2">

            How It Works
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="font-heading font-semibold text-3xl sm:text-4xl text-foreground">

            Get Started in 3 Simple Steps
          </motion.h2>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            margin: '-50px'
          }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-8 relative">

          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-border" />
          {steps.map((s, i) =>
            <motion.div
              key={s.num}
              variants={fadeUp}
              custom={i}
              className="text-center relative">

              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center mx-auto text-lg font-semibold relative z-10">
                {s.num}
              </div>
              <h3 className="font-heading font-semibold text-foreground mt-6 mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {s.desc}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>);

}
function FeaturedEventsSection() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Array<{
    id: string; title: string; date: string; location: string;
    category: string; coverImage?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categoryColors: Record<string, string> = {
    cleanup: 'bg-red-50 text-red-600 border-red-100',
    planting: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    workshop: 'bg-amber-50 text-amber-600 border-amber-100',
    seminar: 'bg-blue-50 text-blue-600 border-blue-100',
    research: 'bg-purple-50 text-purple-600 border-purple-100',
    awareness: 'bg-teal-50 text-teal-600 border-teal-100',
  };
  const categoryIcons: Record<string, string> = {
    cleanup: '🧹', planting: '🌱', workshop: '🎓',
    seminar: '🏛️', research: '🧬', awareness: '📣', other: '📍',
  };

  useEffect(() => {
    import('@/lib/firebase').then(({ db }) => {
      import('firebase/firestore').then(({ collection, query, where, orderBy, limit, onSnapshot }) => {
        import('date-fns').then(({ format }) => {
          const q = query(
            collection(db, 'events'),
            where('visibility', '==', 'public'),
            where('status', '==', 'published'),
            orderBy('createdAt', 'desc'),
            limit(4)
          );
          const unsub = onSnapshot(q, (snap) => {
            setEvents(snap.docs.map(doc => {
              const d = doc.data();
              let formattedDate = 'TBD';
              try { if (d.date) formattedDate = format(new Date(d.date), 'MMM d, yyyy'); } catch (_) { /* noop */ }
              return {
                id: doc.id,
                title: d.title || 'Untitled Event',
                date: formattedDate,
                location: d.locationName || 'Zamboanga City',
                category: (d.category || 'other').toLowerCase(),
                coverImage: d.coverImageUrl || d.coverImage || null,
              };
            }));
            setIsLoading(false);
          }, () => setIsLoading(false));
          return unsub;
        });
      });
    });
  }, []);

  return (
    <section id="events" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="text-center mb-16">
        <motion.p variants={fadeUp} custom={0} className="text-sm font-medium text-primary mb-2">Featured Events</motion.p>
        <motion.h2 variants={fadeUp} custom={1} className="font-heading font-semibold text-3xl sm:text-4xl text-foreground">Upcoming Environmental Events</motion.h2>
        <motion.p variants={fadeUp} custom={2} className="mt-4 text-muted-foreground">Join these community-driven events and help protect Zamboanga's environment.</motion.p>
      </motion.div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-3xl border border-primary/5 overflow-hidden animate-pulse">
              <div className="h-44 bg-slate-100" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-16 bg-slate-100 rounded-full" />
                <div className="h-4 w-full bg-slate-100 rounded-full" />
                <div className="h-3 w-3/4 bg-slate-100 rounded-full" />
                <div className="h-3 w-2/3 bg-slate-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <TreePine className="w-12 h-12 mx-auto mb-4 text-primary/30" />
          <p className="font-medium">No upcoming events yet. Check back soon!</p>
        </div>
      ) : (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {events.map((e, i) => (
            <motion.div key={e.id} variants={fadeUp} custom={i} className="h-full">
              <Card
                className="rounded-3xl shadow-[0_10px_40px_-15px_rgba(31,122,99,0.08)] border-primary/5 hover:border-primary/20 hover:shadow-[0_20px_50px_-20px_rgba(31,122,99,0.15)] transition-all duration-500 group cursor-pointer overflow-hidden flex flex-col h-full"
                onClick={() => navigate('/login')}
              >
                {/* Fixed-height image area */}
                <div className="h-44 flex-shrink-0 bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/10 flex items-center justify-center relative overflow-hidden">
                  {e.coverImage ? (
                    <img src={e.coverImage} alt={e.title} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:12px_12px]" />
                      <span className="text-4xl opacity-40 group-hover:scale-110 transition-transform duration-500">
                        {categoryIcons[e.category] || '🌍'}
                      </span>
                    </>
                  )}
                </div>

                {/* Content pinned with flex-col so button stays at bottom */}
                <CardContent className="pt-4 flex flex-col flex-1 justify-between">
                  <div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 mb-3 border ${categoryColors[e.category] || 'bg-primary/10 text-primary border-primary/20'}`}
                    >
                      {e.category}
                    </Badge>
                    {/* Title always 2 lines tall */}
                    <h3 className="font-heading font-semibold text-sm text-foreground mb-2 line-clamp-2 min-h-[2.5rem]">{e.title}</h3>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5 truncate">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{e.date}</span>
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{e.location}</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(ev) => { ev.stopPropagation(); navigate('/login'); }}
                    className="mt-4 w-full text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-300 text-xs font-bold border border-emerald-600/10"
                  >
                    View Details <ArrowRight className="ml-2 w-3.5 h-3.5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );

}
function MapPreviewSection() {
  const navigate = useNavigate();
  const { token } = useMapboxToken();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [pins, setPins] = useState<Array<{
    id: string; title: string; date: string; location: string;
    category: string; participants: number; lat: number; lng: number; coverImage?: string;
  }>>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  const categoryColors: Record<string, string> = {
    cleanup: '#ef4444', planting: '#10b981', workshop: '#f59e0b',
    seminar: '#3b82f6', research: '#8b5cf6', other: '#64748b',
  };
  const categoryIcons: Record<string, string> = {
    cleanup: '🧹', planting: '🌱', workshop: '🎓',
    seminar: '🏛️', research: '🧬', other: '📍',
  };
  const categoryBadge: Record<string, string> = {
    cleanup: 'bg-red-50 text-red-600 border-red-100',
    planting: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    workshop: 'bg-amber-50 text-amber-600 border-amber-100',
    seminar: 'bg-blue-50 text-blue-600 border-blue-100',
    research: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setHasEnteredView(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasEnteredView) return;
    import('@/lib/firebase').then(({ db }) => {
      import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
        import('date-fns').then(({ format }) => {
          const q = query(
            collection(db, 'events'),
            where('visibility', '==', 'public'),
            where('status', '==', 'published')
          );
          const unsub = onSnapshot(q, (snap) => {
            setPins(snap.docs.map(doc => {
              const d = doc.data();
              let formattedDate = 'TBD';
              try { if (d.date) formattedDate = format(new Date(d.date), 'MMM d, yyyy'); } catch (_) { /* noop */ }
              return {
                id: doc.id, title: d.title || 'Untitled',
                date: formattedDate, location: d.locationName || 'Unknown',
                category: (d.category || 'other').toLowerCase(),
                participants: d.participantsCount || 0,
                lat: d.coordinates?.lat || 0, lng: d.coordinates?.lng || 0,
                coverImage: d.coverImageUrl || d.coverImage || null,
              };
            }).filter(p => p.lat !== 0 && p.lng !== 0));
          });
          return unsub;
        });
      });
    });
  }, [hasEnteredView]);

  const selectedPin = pins.find(p => p.id === selected);

  return (
    <section id="map" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50" ref={sectionRef}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
          <motion.p variants={fadeUp} custom={0} className="text-sm font-medium text-primary mb-2">Map View</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="font-heading font-semibold text-3xl sm:text-4xl text-foreground">Find Events Near You</motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-3 text-muted-foreground text-sm">Click any marker to see event details.</motion.p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="relative rounded-[2.5rem] overflow-hidden border border-emerald-600/10 shadow-[0_32px_64px_-16px_rgba(16,185,129,0.12)] h-[550px] transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(16,185,129,0.18)]">
            {hasEnteredView && token ? (
              <Map
                initialViewState={{ latitude: 6.9150, longitude: 122.0650, zoom: 12.8, pitch: 0, bearing: 0 }}
                style={{ width: '100%', height: '100%', filter: 'contrast(1.1) saturate(1.2) brightness(1.02)' }}
                mapStyle="mapbox://styles/mapbox/standard"
                mapboxAccessToken={token}
                attributionControl={false}
                scrollZoom={true}
                dragPan={true}
                onClick={() => setSelected(null)}
              >
                <NavigationControl position="top-left" showCompass={false} />

                {/* City label */}
                <div className="absolute top-4 right-4 z-40 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm pointer-events-none">
                  Zamboanga City, Philippines
                </div>

                {/* Event Markers */}
                {pins.map(pin => {
                  const hexColor = categoryColors[pin.category] || '#10b981';
                  const isActive = selected === pin.id || hoveredPin === pin.id;
                  return (
                    <Marker
                      key={pin.id}
                      latitude={pin.lat}
                      longitude={pin.lng}
                      style={{ zIndex: isActive ? 50 : 30 }}
                      onClick={(e) => { e.originalEvent.stopPropagation(); setSelected(pin.id); }}
                    >
                      <div
                        className="relative flex flex-col items-center cursor-pointer group"
                        onMouseEnter={() => setHoveredPin(pin.id)}
                        onMouseLeave={() => setHoveredPin(null)}
                      >
                        {isActive && (
                          <div className="absolute -top-1 w-8 h-8 rounded-full animate-ping" style={{ backgroundColor: `${hexColor}40` }} />
                        )}
                        <div
                          className={`flex items-center justify-center rounded-2xl border-2 border-white shadow-xl transition-all duration-300 ${isActive ? 'w-10 h-10 -translate-y-2' : 'w-8 h-8 group-hover:w-9 group-hover:h-9 group-hover:-translate-y-1'}`}
                          style={{ backgroundColor: hexColor }}
                        >
                          <span className="text-lg">{categoryIcons[pin.category] || '📍'}</span>
                        </div>
                        <div
                          className={`w-3 h-3 rotate-45 -mt-1.5 border-r border-b border-white transition-all ${isActive ? 'opacity-100' : 'opacity-0'}`}
                          style={{ backgroundColor: hexColor }}
                        />
                      </div>
                    </Marker>
                  );
                })}

                {/* Popup */}
                {selectedPin && (
                  <Popup
                    latitude={selectedPin.lat}
                    longitude={selectedPin.lng}
                    onClose={() => setSelected(null)}
                    closeButton={false}
                    closeOnClick={false}
                    anchor="bottom"
                    offset={25}
                    className="premium-mapbox-popup z-[60]"
                  >
                    <div className="p-0 overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl w-[260px] animate-in fade-in zoom-in-95 duration-200">
                      <div className="relative h-28 overflow-hidden">
                        <div className="absolute top-2 left-2 z-10">
                          <Badge className={`backdrop-blur-md border font-bold text-[10px] uppercase tracking-wider ${categoryBadge[selectedPin.category] || 'bg-slate-900/50 text-white border-0'}`}>
                            {selectedPin.category}
                          </Badge>
                        </div>
                        {selectedPin.coverImage ? (
                          <img src={selectedPin.coverImage} alt={selectedPin.title} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <div className="absolute inset-0 opacity-30" style={{ backgroundColor: categoryColors[selectedPin.category] || '#10b981' }} />
                            <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-40">
                              {categoryIcons[selectedPin.category] || '🌍'}
                            </div>
                          </>
                        )}
                        <button
                          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/30 text-white hover:bg-black/50 flex items-center justify-center z-10"
                          onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                        >
                          <span className="text-xs font-bold leading-none">✕</span>
                        </button>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-sm text-slate-900 leading-tight mb-3 line-clamp-2">{selectedPin.title}</h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <span>{selectedPin.date}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                              <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span className="truncate flex-1">{selectedPin.location}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                              <Users className="w-3.5 h-3.5 text-amber-600" />
                            </div>
                            <span>{selectedPin.participants} Volunteers joined</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => navigate('/login')}
                          className="w-full bg-slate-900 hover:bg-black text-white font-bold text-xs h-9 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          Login to View Details <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Popup>
                )}

                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-transparent pointer-events-none z-10" />
              </Map>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-emerald-50/50">
                <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                <p className="mt-4 text-xs font-bold text-emerald-800 tracking-widest uppercase">Initializing Map</p>
              </div>
            )}
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.03)] pointer-events-none z-20" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/30 to-transparent pointer-events-none z-20" />
          </div>

          {/* CTA below map */}
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => navigate('/app/map')}
              className="border-primary/20 text-primary hover:bg-primary/5 rounded-full px-8 font-bold text-sm h-11"
            >
              Open Full Map View <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );

}
function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-primary/[0.03]">
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        whileInView={{
          opacity: 1,
          y: 0
        }}
        viewport={{
          once: true
        }}
        transition={{
          duration: 0.8,
          ease: "easeOut"
        }}
        className="max-w-5xl mx-auto"
      >
        <Card className="rounded-[2.5rem] bg-gradient-to-br from-primary via-primary-800 to-primary-950 border-0 overflow-hidden shadow-2xl relative shadow-primary/30">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl opacity-70 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-foreground/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl opacity-50 pointer-events-none" />
          
          <CardContent className="p-12 sm:p-20 relative z-10 text-center">
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-8 drop-shadow-sm">
              Ready to make a <br className="hidden sm:block" /> difference?
            </h2>
            <p className="text-white/90 mt-4 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              Join the Junta community today and be part of the movement to protect
              and preserve Zamboanga's natural beauty for future generations.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-white text-primary hover:bg-white/90 h-14 px-10 rounded-2xl font-bold text-base shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95"
              >
                Register Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-14 px-10 rounded-2xl font-bold text-base backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              >
                Log In
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
function Footer() {
  return (
    <footer
      id="contact"
      className="bg-primary-950 text-white py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">

      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-['Lora'] font-bold text-[24px] text-white tracking-tight">
                Junta
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Connecting communities for environmental action in Zamboanga Peninsula. Building a sustainable future, one event at a time.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm mb-6 text-primary uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li>
                <Link
                  to="/app/events"
                  className="hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-1.5 h-[1px] bg-primary transition-all" />
                  Events
                </Link>
              </li>
              <li>
                <Link
                  to="/app/map"
                  className="hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-1.5 h-[1px] bg-primary transition-all" />
                  Map View
                </Link>
              </li>
              <li>
                <Link
                  to="/app/dashboard"
                  className="hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-1.5 h-[1px] bg-primary transition-all" />
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm mb-6 text-primary uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li>
                <a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-1.5 h-[1px] bg-primary transition-all" />
                  About
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-1.5 h-[1px] bg-primary transition-all" />
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-1.5 h-[1px] bg-primary transition-all" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-1.5 h-[1px] bg-primary transition-all" />
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm mb-6 text-primary uppercase tracking-wider">
              Connect
            </h4>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) =>
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all hover:translate-y-[-2px] border border-white/5">

                  <Icon className="w-5 h-5" />
                </a>
              )}
            </div>
            <p className="mt-8 text-xs text-white/30 italic">
              Follow our journey on social media.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>&copy; {new Date().getFullYear()} Junta Zamboanga. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>);
}
export function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <MapPreviewSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FeaturedEventsSection />
      <CTASection />
      <Footer />
    </div>);

}
