import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CalendarDays, MapPin, Users, ArrowRight, Waves, TreePine, BookOpen, Flower2, Calendar, LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    }
    view?: "grid" | "list"
    index?: number
}

const categoryColors: Record<string, string> = {
    Cleanup: "bg-blue-50 text-blue-700",
    Planting: "bg-green-50 text-green-700",
    Workshop: "bg-purple-50 text-purple-700",
    Awareness: "bg-amber-50 text-amber-700",
    Research: "bg-cyan-50 text-cyan-700",
}

const categoryGradients: Record<string, string> = {
    Cleanup: "from-blue-50 to-blue-100",
    Planting: "from-green-50 to-green-100",
    Workshop: "from-purple-50 to-purple-100",
    Awareness: "from-amber-50 to-amber-100",
    Research: "from-cyan-50 to-cyan-100",
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

    if (view === "list") {
        return (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
            >
                <Card
                    className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/5 cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/app/events/${event.id}`)}
                >
                    <div className="flex items-center gap-5 p-4">
                        {/* Compact Image/Icon */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm bg-slate-50">
                            {event.image ? (
                                <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className={cn(
                                    "w-full h-full bg-gradient-to-br flex items-center justify-center",
                                    categoryGradients[event.category] || "from-slate-50 to-slate-100"
                                )}>
                                    <IconObj className="w-8 h-8 text-primary/30 group-hover:text-primary/50 transition-colors" />
                                </div>
                            )}
                        </div>

                        {/* Title and Meta Section */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 mb-2">
                                <h3 className="font-heading font-bold text-sm text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                                    {event.title}
                                </h3>
                                <Badge
                                    variant="secondary"
                                    className={cn("text-[10px] border-0 flex-shrink-0 font-bold uppercase tracking-wider px-2 py-0.5", categoryColors[event.category])}
                                >
                                    {event.category}
                                </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-medium text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                                    {event.date}
                                </span>
                                <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    {event.location}
                                </span>
                                <span className="hidden sm:flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-slate-400" />
                                    {event.participants || 0} participants
                                </span>
                            </div>
                        </div>

                        {/* Action Arrow */}
                        <div className="flex-shrink-0">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-full w-10 h-10 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all"
                            >
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                            </Button>
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
                className="group h-full flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5 cursor-pointer"
                onClick={() => navigate(`/app/events/${event.id}`)}
            >
                {/* Image Section */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    {event.image ? (
                        <img 
                            src={event.image} 
                            alt={event.title} 
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                    ) : (
                        <div className={cn(
                            "flex h-full w-full items-center justify-center bg-gradient-to-br",
                            categoryGradients[event.category] || "from-slate-50 to-slate-100"
                        )}>
                            <IconObj className="h-12 w-12 text-primary/20 transition-colors group-hover:text-primary/40" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                    
                    {/* Floating Badge (Visual Hierarchy Tip) */}
                    <div className="absolute left-3 top-3">
                        <Badge 
                            variant="secondary" 
                            className={cn(
                                "border-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md",
                                categoryColors[event.category] || "bg-white/90 text-slate-900"
                            )}
                        >
                            {event.category}
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                    {/* Content Section */}
                    <div className="flex-1">
                        <h3 className="font-heading text-base font-bold leading-tight text-slate-900 line-clamp-2 transition-colors group-hover:text-primary min-h-[2.5rem]">
                            {event.title}
                        </h3>
                        
                        <div className="mt-4 space-y-2.5">
                            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                </div>
                                {event.date}
                            </div>
                            
                            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                    <MapPin className="h-3.5 w-3.5" />
                                </div>
                                <span className="truncate">{event.location}</span>
                            </div>

                            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                    <Users className="h-3.5 w-3.5" />
                                </div>
                                {event.participants || 0} participants enrolled
                            </div>
                        </div>
                    </div>

                    {/* Action Section */}
                    <div className="mt-6 pt-4 border-t border-slate-100/80">
                        <Button 
                            variant="ghost" 
                            className="w-full group/btn h-10 gap-2 rounded-xl text-emerald-600 hover:text-white hover:bg-emerald-600 transition-all font-bold text-xs"
                        >
                            View Details 
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
