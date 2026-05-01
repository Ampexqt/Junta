import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Shield, Medal, Sparkles, History, Lock, Leaf, Sprout, Zap, Globe, Star, Crown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { XPHistoryPanel } from './XPHistoryPanel';

const PARTICIPANT_BADGES = [
    { id: 'first_step', title: 'First Step', desc: 'Join your first event', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-100' },
    { id: 'eco_starter', title: 'Eco Starter', desc: 'Reach Level 2', icon: Medal, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { id: 'streak_3', title: '3-Day Streak', desc: 'Complete events 3 days in a row', icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-100' },
    { id: 'eco_warrior', title: 'Eco Warrior', desc: 'Reach Level 4', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'planet_defender', title: 'Planet Defender', desc: 'Reach Level 5', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-100' },
    { id: 'streak_7', title: '7-Day Streak', desc: 'Complete events 7 days in a row', icon: Sparkles, color: 'text-red-500', bg: 'bg-red-100' },
    { id: 'top_rater', title: 'Top Rater', desc: 'Rate 5 events', icon: Sparkles, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { id: 'veteran', title: 'Veteran', desc: 'Complete 10 events', icon: Medal, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    { id: 'eco_champion', title: 'Eco Champion', desc: 'Maintain 4.8 avg rating across 3 events', icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-200' },
];

const ORGANIZER_BADGES = [
    { id: 'first_event', title: 'First Event', desc: 'Complete 1 event as an organizer', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'silver_guardian', title: 'Silver Guardian', desc: 'Reach Tier 2', icon: Shield, color: 'text-slate-500', bg: 'bg-slate-200' },
    { id: 'crowd_puller', title: 'Crowd Puller', desc: 'Host 50+ participants', icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-100' },
    { id: 'gold_champion', title: 'Gold Champion', desc: 'Reach Tier 3', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { id: 'platinum_leader', title: 'Platinum Leader', desc: 'Reach Tier 4', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-100' },
];

export function GamificationDashboardCard() {
    const { profile, role } = useAuth();
    const [activeTab, setActiveTab] = useState<'badges' | 'history'>('badges');

    if (!profile) return null;

    if (role === 'participant') {
        const xp = profile.xp || 0;
        const level = profile.level || 1;
        const streak = profile.streak || 0;
        const badges = profile.badges || [];

        // Use defined level thresholds
        const LEVELS = [
            { level: 1, xpRequired: 0,    label: 'Seedling', icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { level: 2, xpRequired: 100,  label: 'Eco Starter', icon: Sprout, color: 'text-lime-600', bg: 'bg-lime-100' },
            { level: 3, xpRequired: 300,  label: 'Green Guardian', icon: Shield, color: 'text-teal-600', bg: 'bg-teal-100' },
            { level: 4, xpRequired: 600,  label: 'Eco Warrior', icon: Zap, color: 'text-green-600', bg: 'bg-green-100' },
            { level: 5, xpRequired: 1000, label: 'Planet Defender', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-100' },
        ];
        
        const currentLevelData = LEVELS.find(l => l.level === level) || LEVELS[0];
        const nextLevelData = LEVELS.find(l => l.level === level + 1);
        
        const xpForCurrentLevel = currentLevelData.xpRequired;
        const xpForNextLevel = nextLevelData ? nextLevelData.xpRequired : xpForCurrentLevel;
        const xpNeeded = xpForNextLevel - xpForCurrentLevel;
        
        const currentLevelProgress = xp - xpForCurrentLevel;
        const progressPercent = nextLevelData 
            ? Math.min(100, Math.max(0, (currentLevelProgress / xpNeeded) * 100))
            : 100;

        return (
            <Card className="rounded-2xl shadow-sm border overflow-hidden bg-gradient-to-br from-white to-emerald-50/30">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-full ${currentLevelData.bg} flex items-center justify-center border-4 border-white shadow-sm relative`}>
                                <currentLevelData.icon className={`w-7 h-7 ${currentLevelData.color}`} />
                                <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white">
                                    LVL {level}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{currentLevelData.label} Profile</h3>
                                <p className="text-sm font-medium text-slate-500">
                                    {xp} Total XP <span className="mx-1">•</span> {streak} Day Streak 🔥
                                </p>
                            </div>
                        </div>
                        {badges.length > 0 && (
                            <div className="flex gap-2">
                                {badges.slice(0, 3).map((badgeId, idx) => {
                                    const badgeConfig = PARTICIPANT_BADGES.find(b => b.id === badgeId) || PARTICIPANT_BADGES[0];
                                    return (
                                        <div key={idx} className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-sm ${badgeConfig.bg} border-white`} title={badgeConfig.title}>
                                            <badgeConfig.icon className={`w-5 h-5 ${badgeConfig.color}`} />
                                        </div>
                                    );
                                })}
                                {badges.length > 3 && (
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm">
                                        <span className="text-xs font-bold text-slate-500">+{badges.length - 3}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                            <div className="flex items-center gap-1.5">
                                <span className="uppercase tracking-wider">XP Progress</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>
                                    {nextLevelData 
                                        ? `${currentLevelProgress} / ${xpNeeded} XP to Next Level`
                                        : 'Max Level Reached!'}
                                </span>
                                {nextLevelData && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button className="text-emerald-600 hover:text-emerald-700 hover:underline text-[10px] uppercase tracking-wide bg-emerald-50 px-2 py-0.5 rounded-full">
                                                View Next Level
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-sm text-center">
                                            <DialogHeader>
                                                <DialogTitle className="text-center">Next Level: {nextLevelData.label}</DialogTitle>
                                            </DialogHeader>
                                            <div className="py-6 flex flex-col items-center">
                                                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white shadow-md mb-4">
                                                    <Trophy className="w-10 h-10 text-emerald-600" />
                                                </div>
                                                <h4 className="text-xl font-black text-slate-800 mb-2">Reach Level {nextLevelData.level}</h4>
                                                <p className="text-sm text-slate-500 text-balance mb-6">
                                                    You need <strong className="text-emerald-600">{xpNeeded - currentLevelProgress} more XP</strong> to become a {nextLevelData.label}. Join events, attend them, and rate your experience to earn XP faster!
                                                </p>
                                                <Progress value={progressPercent} className="h-3 w-full bg-slate-100 [&>div]:bg-emerald-500 mb-2" />
                                                <p className="text-xs font-bold text-slate-400">{currentLevelProgress} / {xpNeeded} XP</p>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </div>
                        <Progress value={progressPercent} className="h-3 bg-slate-100 [&>div]:bg-emerald-500" />
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center grayscale opacity-60">
                                    <Medal className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Next Milestone</p>
                                    <p className="text-xs text-slate-500">Reach Level {nextLevelData ? nextLevelData.level : 'Max'} or 3-Day Streak!</p>
                                </div>
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 w-full sm:w-auto">
                                        <Trophy className="w-3.5 h-3.5 mr-1.5" />
                                        Rewards & Badges
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-xl">
                                    <DialogHeader>
                                        <DialogTitle>Gamification Overview</DialogTitle>
                                    </DialogHeader>
                                    <div className="w-full mt-2 flex flex-col space-y-4">
                                        <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60 shadow-inner">
                                            <button 
                                                onClick={() => setActiveTab('badges')}
                                                className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2 rounded-lg transition-all duration-200 ${activeTab === 'badges' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                                            >
                                                <Trophy className={`w-4 h-4 ${activeTab === 'badges' ? 'text-emerald-500' : 'text-slate-400'}`} />
                                                My Badges
                                            </button>
                                            <button 
                                                onClick={() => setActiveTab('history')}
                                                className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2 rounded-lg transition-all duration-200 ${activeTab === 'history' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                                            >
                                                <History className={`w-4 h-4 ${activeTab === 'history' ? 'text-emerald-500' : 'text-slate-400'}`} />
                                                Reward History
                                            </button>
                                        </div>
                                        
                                        {activeTab === 'badges' && (
                                            <div className="max-h-[50vh] overflow-y-auto pr-2 pb-2">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {PARTICIPANT_BADGES.map(badge => {
                                                        const isUnlocked = badges.includes(badge.id);
                                                        return (
                                                            <div key={badge.id} className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${isUnlocked ? 'bg-white border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-70 grayscale'}`}>
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isUnlocked ? badge.bg : 'bg-slate-200'}`}>
                                                                    <badge.icon className={`w-5 h-5 ${isUnlocked ? badge.color : 'text-slate-400'}`} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-sm font-bold text-slate-800 leading-none">{badge.title}</p>
                                                                        {!isUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
                                                                    </div>
                                                                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">{badge.desc}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {activeTab === 'history' && (
                                            <div className="max-h-[50vh] overflow-y-auto pr-1">
                                                <XPHistoryPanel />
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (role === 'organizer') {
        const op = profile.organizerPoints || 0;
        const tier = profile.organizerTier || 1;
        const badges = profile.organizerBadges || [];

        const TIERS = [
            { tier: 1, opRequired: 0,    label: 'Bronze Partner', icon: Star, color: 'text-orange-600', bg: 'bg-orange-100' },
            { tier: 2, opRequired: 500,  label: 'Silver Guardian', icon: Shield, color: 'text-slate-600', bg: 'bg-slate-100' },
            { tier: 3, opRequired: 1500, label: 'Gold Champion', icon: Medal, color: 'text-yellow-600', bg: 'bg-yellow-100' },
            { tier: 4, opRequired: 3000, label: 'Platinum Leader', icon: Crown, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        ];
        
        const currentTierData = TIERS.find(t => t.tier === tier) || TIERS[0];
        const nextTierData = TIERS.find(t => t.tier === tier + 1);
        const currentTierName = currentTierData.label;

        const opForCurrentTier = currentTierData.opRequired;
        const opForNextTier = nextTierData ? nextTierData.opRequired : opForCurrentTier;
        const opNeeded = opForNextTier - opForCurrentTier;
        
        const currentTierProgress = op - opForCurrentTier;
        const progressPercent = nextTierData
            ? Math.min(100, Math.max(0, (currentTierProgress / opNeeded) * 100))
            : 100;

        return (
            <Card className="rounded-2xl shadow-sm border overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-full ${currentTierData.bg} flex items-center justify-center border-4 border-white shadow-sm relative`}>
                                <currentTierData.icon className={`w-7 h-7 ${currentTierData.color}`} />
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
                                {badges.slice(0, 3).map((badgeId, idx) => {
                                    const badgeConfig = ORGANIZER_BADGES.find(b => b.id === badgeId) || ORGANIZER_BADGES[0];
                                    return (
                                        <div key={idx} className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-sm ${badgeConfig.bg} border-white`} title={badgeConfig.title}>
                                            <badgeConfig.icon className={`w-5 h-5 ${badgeConfig.color}`} />
                                        </div>
                                    );
                                })}
                                {badges.length > 3 && (
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm">
                                        <span className="text-xs font-bold text-slate-500">+{badges.length - 3}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1">
                            <span className="uppercase tracking-wider">Tier Progress</span>
                            <div className="flex items-center gap-2">
                                <span>
                                    {nextTierData
                                        ? `${currentTierProgress} / ${opNeeded} OP`
                                        : 'Max Tier Reached!'}
                                </span>
                                {nextTierData && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button className="text-blue-600 hover:text-blue-700 hover:underline text-[10px] uppercase tracking-wide bg-blue-50 px-2 py-0.5 rounded-full">
                                                View Next Tier
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-sm text-center">
                                            <DialogHeader>
                                                <DialogTitle className="text-center">Next Tier: {nextTierData.label}</DialogTitle>
                                            </DialogHeader>
                                            <div className="py-6 flex flex-col items-center">
                                                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-md mb-4">
                                                    <Shield className="w-10 h-10 text-blue-600" />
                                                </div>
                                                <h4 className="text-xl font-black text-slate-800 mb-2">Reach Tier {nextTierData.tier}</h4>
                                                <p className="text-sm text-slate-500 text-balance mb-6">
                                                    You need <strong className="text-blue-600">{opNeeded - currentTierProgress} more OP</strong> to unlock the {nextTierData.label} tier. Successfully host events and accommodate more participants to earn Organizer Points!
                                                </p>
                                                <Progress value={progressPercent} className="h-3 w-full bg-slate-100 [&>div]:bg-blue-500 mb-2" />
                                                <p className="text-xs font-bold text-slate-400">{currentTierProgress} / {opNeeded} OP</p>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </div>
                        <Progress value={progressPercent} className="h-3 bg-slate-100 [&>div]:bg-blue-500" />
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center grayscale opacity-60">
                                    <Sparkles className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Next Milestone</p>
                                    <p className="text-xs text-slate-500">Reach Tier {nextTierData ? nextTierData.tier : 'Max'} or host 50 participants!</p>
                                </div>
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:text-blue-800 w-full sm:w-auto">
                                        <Shield className="w-3.5 h-3.5 mr-1.5" />
                                        Rewards & Badges
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-xl">
                                    <DialogHeader>
                                        <DialogTitle>Gamification Overview</DialogTitle>
                                    </DialogHeader>
                                    <div className="w-full mt-2 flex flex-col space-y-4">
                                        <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60 shadow-inner">
                                            <button 
                                                onClick={() => setActiveTab('badges')}
                                                className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2 rounded-lg transition-all duration-200 ${activeTab === 'badges' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                                            >
                                                <Shield className={`w-4 h-4 ${activeTab === 'badges' ? 'text-blue-500' : 'text-slate-400'}`} />
                                                My Badges
                                            </button>
                                            <button 
                                                onClick={() => setActiveTab('history')}
                                                className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2 rounded-lg transition-all duration-200 ${activeTab === 'history' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                                            >
                                                <History className={`w-4 h-4 ${activeTab === 'history' ? 'text-blue-500' : 'text-slate-400'}`} />
                                                Reward History
                                            </button>
                                        </div>
                                        
                                        {activeTab === 'badges' && (
                                            <div className="max-h-[50vh] overflow-y-auto pr-2 pb-2">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {ORGANIZER_BADGES.map(badge => {
                                                        const isUnlocked = badges.includes(badge.id);
                                                        return (
                                                            <div key={badge.id} className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${isUnlocked ? 'bg-white border-blue-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-70 grayscale'}`}>
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isUnlocked ? badge.bg : 'bg-slate-200'}`}>
                                                                    <badge.icon className={`w-5 h-5 ${isUnlocked ? badge.color : 'text-slate-400'}`} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-sm font-bold text-slate-800 leading-none">{badge.title}</p>
                                                                        {!isUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
                                                                    </div>
                                                                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">{badge.desc}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {activeTab === 'history' && (
                                            <div className="max-h-[50vh] overflow-y-auto pr-1">
                                                <XPHistoryPanel />
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}
