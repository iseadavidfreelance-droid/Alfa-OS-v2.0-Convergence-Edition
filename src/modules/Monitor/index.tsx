
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import { AlertTriangle, CheckCircle, Clock, Loader } from 'lucide-react';

type Token = Database['public']['Tables']['integration_tokens']['Row'];
type Cycle = Database['public']['Tables']['ingestion_cycles']['Row'];

const getTimeLeft = (expiry: string) => {
    const now = new Date();
    const expires = new Date(expiry);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return { text: "EXPIRED", color: "text-alert" };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 1) return { text: `${days} days`, color: "text-matrix" };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 1) return { text: `${hours} hours`, color: "text-yellow-400" };
    
    const minutes = Math.floor(diff / (1000 * 60));
    return { text: `${minutes} mins`, color: "text-alert" };
};

const TokenCardSkeleton = () => (
    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-md animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-gray-700 rounded w-1/2"></div>
    </div>
);

const CycleRowSkeleton = () => (
    <tr className="border-b border-gray-800 bg-gray-900/50 animate-pulse">
        <td className="p-3"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
        <td className="p-3"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
        <td className="p-3"><div className="h-4 bg-gray-700 rounded w-32"></div></td>
        <td className="p-3"><div className="h-4 bg-gray-700 rounded w-12"></div></td>
        <td className="p-3"><div className="h-4 bg-gray-700 rounded w-12"></div></td>
    </tr>
);

const MonitorPage: React.FC = () => {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const tokensPromise = supabase.from('integration_tokens').select('*');
                const cyclesPromise = supabase.from('ingestion_cycles').select('*').order('started_at', { ascending: false }).limit(5);

                const [tokenRes, cycleRes] = await Promise.all([tokensPromise, cyclesPromise]);
                
                if (tokenRes.error) throw new Error(`Tokens Error: ${tokenRes.error.message}`);
                if (cycleRes.error) throw new Error(`Cycles Error: ${cycleRes.error.message}`);
                
                setTokens(tokenRes.data);
                setCycles(cycleRes.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderStatus = (status: Cycle['status']) => {
        switch (status) {
            case 'COMPLETED': return <span className="flex items-center gap-2 text-matrix"><CheckCircle size={14}/> {status}</span>;
            case 'RUNNING': return <span className="flex items-center gap-2 text-blue-400"><Loader size={14} className="animate-spin"/> {status}</span>;
            case 'FAILED': return <span className="flex items-center gap-2 text-alert"><AlertTriangle size={14}/> {status}</span>;
            case 'PENDING': return <span className="flex items-center gap-2 text-gray-400"><Clock size={14}/> {status}</span>;
            default: return status;
        }
    };

    return (
        <div>
            <h1 className="text-4xl font-bold border-b border-matrix/20 pb-2 mb-6 text-matrix">System Monitor</h1>
            
            {error && <div className="bg-alert/10 border border-alert text-alert p-4 rounded-md mb-6">{error}</div>}

            <section className="mb-8">
                <h2 className="text-xl text-gray-400 mb-4 tracking-wider">Integration Tokens</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <TokenCardSkeleton key={i} />)
                    ) : (
                        tokens.map(token => {
                            const timeLeft = getTimeLeft(token.expires_at);
                            return (
                                <div key={token.id} className="bg-gray-900/50 border border-gray-800 p-4 rounded-md">
                                    <h3 className="font-bold text-lg text-gray-300">{token.service_name}</h3>
                                    <p className={`text-2xl font-mono mt-1 ${timeLeft.color}`}>{timeLeft.text}</p>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>

            <section>
                <h2 className="text-xl text-gray-400 mb-4 tracking-wider">Recent Ingestion Cycles</h2>
                <div className="overflow-x-auto bg-gray-900/50 border border-gray-800 rounded-md">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-900 border-b border-gray-800">
                            <tr>
                                <th className="p-3">Cycle ID</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Started At</th>
                                <th className="p-3">Pins</th>
                                <th className="p-3">Errors</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <CycleRowSkeleton key={i} />)
                            ) : (
                                cycles.map(cycle => (
                                    <tr key={cycle.cycle_id} className={`border-b border-gray-800 transition-colors ${cycle.status === 'FAILED' ? 'bg-alert/20 text-red-300 animate-pulse' : 'bg-transparent hover:bg-gray-800/50'}`}>
                                        <td className="p-3 font-mono">{cycle.cycle_id.split('-')[0]}...</td>
                                        <td className="p-3">{renderStatus(cycle.status)}</td>
                                        <td className="p-3">{new Date(cycle.started_at).toLocaleString()}</td>
                                        <td className="p-3 text-right">{cycle.pins_processed}</td>
                                        <td className={`p-3 text-right ${cycle.errors_encountered > 0 ? 'text-alert' : ''}`}>{cycle.errors_encountered}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default MonitorPage;
