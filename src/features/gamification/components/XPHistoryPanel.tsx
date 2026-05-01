import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { History, Zap, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface XPLog {
    id: string;
    type: 'xp' | 'op';
    amount: number;
    reason: string;
    grantedAt: string;
    balanceAfter: number;
}

export function XPHistoryPanel() {
    const { uid } = useAuth();
    const [logs, setLogs] = useState<XPLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) return;

        const fetchLogs = async () => {
            try {
                const logsRef = collection(db, `users/${uid}/xp_logs`);
                const q = query(logsRef, orderBy('grantedAt', 'desc'), limit(10));
                const snap = await getDocs(q);
                
                const fetchedLogs: XPLog[] = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as XPLog[];
                
                setLogs(fetchedLogs);
            } catch (error) {
                console.error('Failed to fetch XP logs', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [uid]);

    if (loading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-medium text-slate-500">Loading history...</p>
            </div>
        );
    }

    return (
        <Card className="rounded-xl shadow-none border-0">
            <CardContent className="p-0">
                {logs.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center bg-slate-50/30">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                            <History className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-600">No History Yet</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs">
                            Join events to earn XP, or organize successful events to earn Organizer Points.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {logs.map(log => (
                            <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${log.type === 'xp' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                                        {log.type === 'xp' ? (
                                            <Zap className="w-5 h-5 text-emerald-600" />
                                        ) : (
                                            <Award className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 text-sm">{log.reason}</p>
                                        <p className="text-xs text-slate-500">
                                            {formatDistanceToNow(new Date(log.grantedAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                <div className={`font-bold text-sm ${log.type === 'xp' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                    +{log.amount} {log.type.toUpperCase()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
