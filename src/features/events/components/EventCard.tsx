import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CalendarDays, MapPin, Users, ArrowRight, Waves, TreePine, BookOpen, Flower2, Calendar } from "lucide-react"
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

const categoryIcons: Record<string, any> = {
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
                    className="rounded-2xl shadow-sm border hover:shadow-md transition-all cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/app/events/${event.id}`)}
                >
                    <CardContent className="py-4 flex items-center gap-4">
                        <div
                            className={cn(
                                "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                                categoryGradients[event.category] || "from-gray-50 to-gray-100"
                            )}
                        >
                            <IconObj className="w-6 h-6 text-primary/30" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-heading font-semibold text-sm text-foreground truncate">
                                    {event.title}
                                </h3>
                                <Badge
                                    variant="outline"
                                    className={cn("text-[10px] border-0 flex-shrink-0", categoryColors[event.category])}
                                >
                                    {event.category}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    {event.date}
                                </span>
                                <span className="flex items-center gap-1 truncate">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {event.location}
                                </span>
                                <span className="hidden sm:flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" />
                                    {event.participants || 0}
                                </span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </CardContent>
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
                className="rounded-2xl shadow-sm border hover:shadow-md transition-all group cursor-pointer overflow-hidden h-full flex flex-col"
                onClick={() => navigate(`/app/events/${event.id}`)}
            >
                <div
                    className={cn(
                        "h-32 bg-gradient-to-br flex items-center justify-center",
                        categoryGradients[event.category] || "from-gray-50 to-gray-100"
                    )}
                >
                    <IconObj className="w-10 h-10 text-primary/20 group-hover:text-primary/40 transition-colors" />
                </div>
                <CardContent className="pt-4 flex-1 flex flex-col">
                    <Badge variant="outline" className={cn("text-[10px] mb-2 border-0 w-fit", categoryColors[event.category])}>
                        {event.category}
                    </Badge>
                    <h3 className="font-heading font-semibold text-sm text-foreground mb-3 line-clamp-2 h-10">
                        {event.title}
                    </h3>
                    <div className="space-y-1.5 text-xs text-muted-foreground mt-auto">
                        <p className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {event.date}
                        </p>
                        <p className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.location}
                        </p>
                        <p className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {event.participants || 0} participants
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-4 w-full text-primary hover:text-primary hover:bg-primary/5 text-xs border-t rounded-none -mx-4 h-9"
                    >
                        View Details <ArrowRight className="ml-1 w-3 h-3" />
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    )
}
