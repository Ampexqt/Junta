import { useAuth } from '@/features/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Shield, Medal, Sparkles } from 'lucide-react';

export function GamificationDashboardCard() {
    const { profile, role } = useAuth();

    if (!profile) return null;

    if (role === 'participant') {
        const xp = profile.xp || 0;
        const level = profile.level || 1;
        const streak = profile.streak || 0;
        const badges = profile.badges || [];

        // Simple level curve: 100 XP per level
        const xpForCurrentLevel = (level - 1) * 100;
        const currentLevelProgress = xp - xpForCurrentLevel;
        const progressPercent = Math.min(100, Math.max(0, (currentLevelProgress / 100) * 100));

        return (
            <Card className="rounded-2xl shadow-sm border overflow-hidden bg-gradient-to-br from-white to-emerald-50/30">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white shadow-sm relative">
                                <Trophy className="w-7 h-7 text-emerald-600" />
                                <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white">
                                    LVL {level}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Eco Warrior Profile</h3>
                                <p className="text-sm font-medium text-slate-500">
                                    {xp} Total XP <span className="mx-1">•</span> {streak} Day Streak 🔥
                                </p>
                            </div>
                        </div>
                        {badges.length > 0 && (
                            <div className="flex gap-2">
                                {badges.slice(0, 3).map((badge, idx) => (
                                    <div key={idx} className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200" title={badge}>
                                        <Medal className="w-5 h-5 text-amber-500" />
                                    </div>
                                ))}
                                {badges.length > 3 && (
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                                        <span className="text-xs font-bold text-slate-500">+{badges.length - 3}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                            <span>Level {level} Progress</span>
                            <span>{currentLevelProgress} / 100 XP to Next Level</span>
                        </div>
                        <Progress value={progressPercent} className="h-3 bg-slate-100 [&>div]:bg-emerald-500" />
                        <p className="text-xs text-slate-400 font-medium text-right mt-1">
                            Join events and earn ratings to level up!
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (role === 'organizer') {
        const op = profile.organizerPoints || 0;
        const tier = profile.organizerTier || 1;
        const badges = profile.organizerBadges || [];

        const tierNames = ['Bronze Partner', 'Silver Guardian', 'Gold Champion', 'Platinum Leader'];
        const currentTierName = tierNames[Math.min(tier - 1, tierNames.length - 1)];

        const nextTierOp = tier * 500; // Example threshold
        const progressPercent = Math.min(100, Math.max(0, (op / nextTierOp) * 100));

        return (
            <Card className="rounded-2xl shadow-sm border overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-sm relative">
                                <Shield className="w-7 h-7 text-blue-600" />
                                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm uppercase tracking-wider">
                                    Tier {tier}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{currentTierName}</h3>
                                <p className="text-sm font-medium text-slate-500">
                                    {op} Organizer Points (OP)
                                </p>
                            </div>
                        </div>
                        {badges.length > 0 && (
                            <div className="flex gap-2">
                                {badges.slice(0, 3).map((badge, idx) => (
                                    <div key={idx} className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200" title={badge}>
                                        <Sparkles className="w-5 h-5 text-blue-500" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                            <span>Journey to Next Tier</span>
                            <span>{op} / {nextTierOp} OP</span>
                        </div>
                        <Progress value={progressPercent} className="h-3 bg-slate-100 [&>div]:bg-blue-500" />
                        <p className="text-xs text-slate-400 font-medium text-right mt-1">
                            Complete events with high turnout to rank up!
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}
