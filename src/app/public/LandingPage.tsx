import { useState } from 'react';
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
  const links = ['Features', 'How It Works', 'Events', 'Map', 'Contact'];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/50 backdrop-blur-xl border-b border-primary/5 shadow-[0_10px_40px_rgba(31,122,99,0.06)] transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-18 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-[#06241d] rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
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
  return (
    <section className="relative flex min-h-[750px] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-primary/[0.03] via-background to-transparent px-4 py-20 md:py-32">
      {/* Background Pattern - Light Rings */}
      <div
        className="absolute inset-0 z-0 opacity-[0.1] pointer-events-none select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='1' fill='%231F7A63'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Sophisticated Glow System */}
      <div className="absolute left-1/4 top-1/4 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute right-1/4 bottom-1/4 -z-10 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/10 blur-[130px] pointer-events-none" />

      <div className="container relative z-10 flex flex-col items-center text-center">
        {/* Animated Badge Tagline */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold tracking-wide text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Leaf className="h-4 w-4" />
          <span>Zamboanga City's Environmental Platform</span>
        </div>

        {/* Hero Title - Black font weight with tight tracking */}
        <h1 className="max-w-4xl text-pretty text-5xl font-black leading-[1.1] tracking-tight text-foreground sm:text-7xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
          Join Environmental <br className="hidden sm:block" />
          Activities in Your <br className="hidden sm:block" />
          Community
        </h1>

        {/* Hero Subtitle / Description */}
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          Discover, join, and organize local initiatives to protect and preserve Zamboanga City's natural beauty. Together, we can make a difference.
        </p>

        {/* Action Buttons - Rounded-2xl and 14px height to match image exactly */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <Button
            size="lg"
            onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
            className="h-14 min-w-[200px] rounded-2xl bg-primary px-10 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:translate-y-[-2px]"
          >
            Browse Events
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/register')}
            className="h-14 min-w-[200px] rounded-2xl border-2 border-border/60 bg-white px-10 text-lg font-bold transition-all hover:bg-muted/30 hover:translate-y-[-2px]"
          >
            Create an Event
          </Button>
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
  const events = [
    {
      title: 'Sta. Cruz Beach Cleanup Drive',
      date: 'Jan 15, 2025',
      location: 'Great Sta. Cruz Island',
      category: 'Cleanup'
    },
    {
      title: 'Mangrove Planting Initiative',
      date: 'Jan 22, 2025',
      location: 'Sinunuc Mangrove Area',
      category: 'Planting'
    },
    {
      title: 'Marine Biodiversity Workshop',
      date: 'Feb 3, 2025',
      location: 'Zamboanga City Hall',
      category: 'Workshop'
    },
    {
      title: 'Paseo del Mar Awareness Walk',
      date: 'Feb 10, 2025',
      location: 'Paseo del Mar',
      category: 'Awareness'
    }];

  const categoryColors: Record<string, string> = {
    Cleanup: 'bg-primary/10 text-primary border-primary/20',
    Planting: 'bg-primary/10 text-primary border-primary/20',
    Workshop: 'bg-primary/10 text-primary border-primary/20',
    Awareness: 'bg-primary/10 text-primary border-primary/20'
  };
  return (
    <section
      id="events"
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

          Featured Events
        </motion.p>
        <motion.h2
          variants={fadeUp}
          custom={1}
          className="font-heading font-semibold text-3xl sm:text-4xl text-foreground">

          Upcoming Environmental Events
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={2}
          className="mt-4 text-muted-foreground">

          Join these community-driven events and help protect Zamboanga's
          environment.
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

        {events.map((e, i) =>
          <motion.div key={e.title} variants={fadeUp} custom={i}>
            <Card
              className="rounded-3xl shadow-[0_10px_40px_-15px_rgba(31,122,99,0.08)] border-primary/5 hover:border-primary/20 hover:shadow-[0_20px_50px_-20px_rgba(31,122,99,0.15)] transition-all duration-500 group cursor-pointer overflow-hidden"
              onClick={() => navigate('/app/events/1')}>

              <div className="h-44 bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/10 flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:12px_12px]" />
                <TreePine className="w-12 h-12 text-primary/40 group-hover:text-primary/60 transition-all duration-500 group-hover:scale-110" />
              </div>
              <CardContent className="pt-4">
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 mb-3 border ${categoryColors[e.category]}`}>
                  {e.category}
                </Badge>
                <h3 className="font-heading font-semibold text-sm text-foreground mb-2 line-clamp-2">
                  {e.title}
                </h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {e.date}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {e.location}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full text-primary hover:text-white hover:bg-primary rounded-xl transition-all duration-300 text-xs font-bold border border-primary/10">

                  View Details <ArrowRight className="ml-2 w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </section>);

}
function MapPreviewSection() {
  const navigate = useNavigate();
  return (
    <section id="map" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true
          }}
          variants={stagger}
          className="text-center mb-12">

          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-sm font-medium text-primary mb-2">

            Map View
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="font-heading font-semibold text-3xl sm:text-4xl text-foreground">

            Find Events Near You
          </motion.h2>
        </motion.div>
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
            duration: 0.6
          }}>

          <div className="relative rounded-3xl overflow-hidden border border-primary/10 shadow-2xl bg-gradient-to-br from-primary/5 via-background to-secondary/5 h-80 sm:h-[450px]">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #1F7A63 0.5px, transparent 0)',
                backgroundSize: '24px 24px'
              }} />

            {[
              {
                top: '25%',
                left: '35%',
                label: 'Sta. Cruz Island'
              },
              {
                top: '40%',
                left: '55%',
                label: 'City Center'
              },
              {
                top: '60%',
                left: '30%',
                label: 'Sinunuc'
              },
              {
                top: '35%',
                left: '70%',
                label: 'Paseo del Mar'
              },
              {
                top: '55%',
                left: '60%',
                label: 'Pasonanca'
              }].
              map((pin, i) =>
                <div
                  key={i}
                  className="absolute group"
                  style={{
                    top: pin.top,
                    left: pin.left
                  }}>

                  <div className="relative">
                    <div className="absolute -inset-2 bg-primary/30 rounded-full animate-ping" />
                    <div className="w-5 h-5 bg-primary rounded-full border-2 border-white shadow-xl relative z-10" />
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white rounded-lg px-2 py-1 shadow-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {pin.label}
                  </div>
                </div>
              )}
            <div className="absolute bottom-4 right-4">
              <Button
                onClick={() => navigate('/app/map')}
                className="bg-white text-foreground hover:bg-white/90 shadow-md">

                <MapPin className="w-4 h-4 mr-2" /> View Full Map
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>);

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
        className="max-w-5xl mx-auto text-center bg-gradient-to-br from-primary via-primary to-[#06241d] rounded-[2.5rem] p-12 sm:p-20 relative overflow-hidden shadow-2xl shadow-primary/20">

        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        <div className="relative z-10">
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white leading-tight">
            Ready to make a <br className="hidden sm:block" /> difference?
          </h2>
          <p className="text-white/80 mt-8 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Join the Junta community today and be part of the movement to protect
            and preserve Zamboanga's natural beauty for future generations.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-primary hover:bg-white/90 h-16 px-12 rounded-2xl font-bold shadow-xl shadow-black/10 transition-all hover:translate-y-[-2px]">
              Register Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-white/30 text-white hover:bg-white/10 h-16 px-12 rounded-2xl font-bold transition-all hover:translate-y-[-2px]">
              Log In
            </Button>
          </div>
        </div>
      </motion.div>
    </section>);

}
function Footer() {
  return (
    <footer
      id="contact"
      className="bg-[#0b241e] text-white py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">

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
      <FeaturesSection />
      <HowItWorksSection />
      <FeaturedEventsSection />
      <MapPreviewSection />
      <CTASection />
      <Footer />
    </div>);

}
