import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { MapPin, Users, ArrowRight, Waves, TreePine, BookOpen, Flower2, Calendar, LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EventCardProps {
    event: {
        id: string | number
        title: string
        date: string
        location: string
        participants?: number
        category: string
        image?: string
        status?: string
    }
    view?: "grid" | "list"
    index?: number
}

const categoryIcons: Record<string, LucideIcon> = {
    Cleanup: Waves,
    Planting: TreePine,
    Workshop: BookOpen,
    Awareness: Flower2,
    Research: BookOpen,
}

export function EventCard({ event, view = "grid", index = 0 }: EventCardProps) {
    const navigate = useNavigate()
    const IconObj = categoryIcons[event.category] || Calendar;
    const isCompleted = event?.status === 'completed';

    // Find category color style - More subtle and premium
    const getCatStyles = (cat: string) => {
        const colors: Record<string, { bg: string, text: string, dot: string, glow: string }> = {
            Cleanup:   { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   glow: 'group-hover:shadow-blue-500/10' },
            Planting:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', glow: 'group-hover:shadow-emerald-500/10' },
            Workshop:  { bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-500',  glow: 'group-hover:shadow-purple-500/10' },
            Awareness: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500',   glow: 'group-hover:shadow-amber-500/10' },
            Research:  { bg: 'bg-cyan-50',    text: 'text-cyan-700',    dot: 'bg-cyan-500',    glow: 'group-hover:shadow-cyan-500/10' },
        };
        return colors[cat] || { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-500', glow: 'group-hover:shadow-slate-500/10' };
    };

    const catStyle = getCatStyles(event.category);

    if (view === "list") {
        return (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
            >
                <Card
                    className="group rounded-2xl border border-slate-100 bg-white transition-all duration-500 hover:border-slate-200 hover:shadow-2xl hover:shadow-slate-200/50 cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/app/events/${event.id}`)}
                >
                    <div className="flex items-center gap-6 p-4">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 relative">
                            {event.image ? (
                                <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                            ) : (
                                <div className={cn("w-full h-full flex items-center justify-center bg-slate-50")}>
                                    <IconObj className="w-10 h-10 text-slate-200" strokeWidth={1} />
                                </div>
                            )}
                            {isCompleted && (
                                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest border border-white/20 px-2 py-0.5 rounded-full">Done</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 py-1">
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className={cn("w-1.5 h-1.5 rounded-full", catStyle.dot)} />
                                <span className={cn("text-[9px] font-black uppercase tracking-[0.2em]", catStyle.text)}>{event.category}</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-950 leading-tight mb-3 group-hover:text-emerald-700 transition-colors">
                                {event.title}
                            </h3>
                            <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3" strokeWidth={2.5} />
                                    {event.date}
                                </span>
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3" strokeWidth={2.5} />
                                    {event.location}
                                </span>
                            </div>
                        </div>

                        <div className="pr-4">
                            <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-all">
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card
                className={cn(
                    "group h-full flex flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white transition-all duration-500 hover:border-slate-200 hover:shadow-2xl cursor-pointer",
                    catStyle.glow
                )}
                onClick={() => navigate(`/app/events/${event.id}`)}
            >
                {/* Image Section */}
                <div className="relative h-56 w-full overflow-hidden">
                    {event.image ? (
                        <img 
                            src={event.image} 
                            alt={event.title} 
                            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-50">
                            <IconObj className="h-16 w-16 text-slate-100 transition-colors group-hover:text-slate-200" strokeWidth={0.5} />
                        </div>
                    )}
                    
                    {/* Floating Labels - Minimalist */}
                    <div className="absolute inset-x-4 top-4 flex justify-between items-start">
                        <div className={cn("px-3 py-1.5 rounded-full backdrop-blur-md border shadow-sm flex items-center gap-2", catStyle.bg, catStyle.text, "border-white/20")}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", catStyle.dot)} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{event.category}</span>
                        </div>
                        
                        {isCompleted && (
                            <div className="px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
                                Completed
                            </div>
                        )}
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="flex flex-1 flex-col p-6">
                    <div className="flex-1">
                        <h3 className="text-[20px] font-black leading-[1.1] text-slate-950 group-hover:text-emerald-700 transition-colors line-clamp-2">
                            {event.title}
                        </h3>
                        
                        <div className="mt-6 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Date</span>
                                    <span className="text-[12px] font-bold text-slate-700">{event.date}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Location</span>
                                    <span className="text-[12px] font-bold text-slate-700 truncate max-w-[180px]">{event.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                    <Users className="w-3 h-3 text-slate-300" />
                                </div>
                            ))}
                            <span className="pl-3 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                +{event.participants || 0} Joined
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                            Join Mission <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}


