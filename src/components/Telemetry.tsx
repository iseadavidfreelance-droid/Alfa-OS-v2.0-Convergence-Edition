import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Zap, Link } from 'lucide-react';

const Stat: React.FC<{ icon: React.ElementType; value: string | number; label: string; loading: boolean }> = ({ icon: Icon, value, label, loading }) => (
    <div className="flex items-center gap-2 border border-gray-700 bg-gray-900 px-3 py-1 rounded-sm">
        <Icon size={16} className="text-matrix" />
        <div className="text-left">
            {loading ? (
                <div className="h-4 bg-gray-700 rounded w-12 animate-pulse"></div>
            ) : (
                <p className="font-mono font-bold text-lg leading-none text-white">{value}</p>
            )}
            <p className="text-xs text-gray-500 leading-none">{label}</p>
        </div>
    </div>
);

const Telemetry: React.FC = () => {
    const [stats, setStats] = useState({ pinCount: 0, totalScore: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTelemetryData = async () => {
            setLoading(true);
            try {
                const pinCountPromise = supabase.from('active_pins').select('*', { count: 'exact', head: true });
                // FIX: Type inference for `select('*')` on 'assets' was failing, causing `asset` to be `never`.
                // Selecting only the specific 'total_score' column resolves the type issue.
                const totalScorePromise = supabase.from('assets').select('total_score');

                const [pinCountRes, totalScoreRes] = await Promise.all([pinCountPromise, totalScorePromise]);

                if (pinCountRes.error) throw pinCountRes.error;
                if (totalScoreRes.error) throw totalScoreRes.error;
                
                const totalScore = (totalScoreRes.data ?? []).reduce((acc, asset) => acc + asset.total_score, 0);
                
                setStats({
                    pinCount: pinCountRes.count ?? 0,
                    totalScore: totalScore
                });

            } catch (error) {
                console.error("Error fetching telemetry data:", error);
            } finally {
                setLoading(false);
            }
        };

        const interval = setInterval(fetchTelemetryData, 30000); // Refresh every 30 seconds
        fetchTelemetryData(); // Initial fetch

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-4">
            <Stat
                icon={Link}
                value={stats.pinCount.toLocaleString()}
                label="PINS LINKED"
                loading={loading}
            />
            <Stat
                icon={Zap}
                value={stats.totalScore.toLocaleString()}
                label="TOTAL SCORE"
                loading={loading}
            />
        </div>
    );
};

export default Telemetry;