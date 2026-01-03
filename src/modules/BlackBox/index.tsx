
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import { CheckCircle, AlertTriangle, Loader, RefreshCw, Trash2, Power } from 'lucide-react';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

type Tab = 'logs' | 'quarantine';
type Cycle = Database['public']['Tables']['ingestion_cycles']['Row'];
type Token = Database['public']['Tables']['integration_tokens']['Row'];
type RawItem = Database['public']['Tables']['raw_buffer']['Row'];

const getTimeLeftStatus = (expiry: string): 'ok' | 'warn' | 'error' => {
    const diff = new Date(expiry).getTime() - new Date().getTime();
    if (diff <= 0) return 'error';
    if (diff < 1000 * 60 * 60 * 24) return 'warn'; // Less than 24 hours
    return 'ok';
};

const TokenStatus: React.FC = () => {
    const [tokens, setTokens] = useState<Token[]>([]);
    useEffect(() => {
        supabase.from('integration_tokens').select('*').then(({ data }) => setTokens(data || []));
    }, []);
    return (
        <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-bold tracking-widest text-gray-500 mb-3">TOKEN STATUS</h3>
            <div className="space-y-2">
                {tokens.map(token => {
                    const status = getTimeLeftStatus(token.expires_at);
                    const color = { ok: 'bg-matrix', warn: 'bg-yellow-400', error: 'bg-alert'}[status];
                    return (
                        <div key={token.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">{token.service_name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">{status.toUpperCase()}</span>
                                <div className={`w-3 h-3 rounded-full ${color} shadow-lg ${status !== 'ok' ? 'animate-pulse' : ''}`} style={{boxShadow: `0 0 5px var(--tw-color-${color})`}}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SystemLogs: React.FC = () => {
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [selected, setSelected] = useState<Cycle | null>(null);
    useEffect(() => {
        supabase.from('ingestion_cycles').select('*').order('started_at', { ascending: false }).limit(50)
            .then(({ data }) => setCycles(data || []));
    }, []);

    const renderStatus = (status: Cycle['status']) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle size={14} className="text-matrix"/>;
            case 'RUNNING': return <Loader size={14} className="text-blue-400 animate-spin"/>;
            case 'FAILED': return <AlertTriangle size={14} className="text-alert"/>;
            default: return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
        }
    };
    
    return (
        <div className="grid grid-cols-3 gap-4 h-full">
            <div className="col-span-1 flex flex-col border-r border-gray-800">
                <div className="p-2 border-b border-gray-800 text-sm text-gray-400">Recent Cycles</div>
                <ul className="overflow-y-auto">
                    {cycles.map(c => (
                        <li key={c.cycle_id} onClick={() => setSelected(c)} className={`flex items-center justify-between p-2 border-b border-gray-800 cursor-pointer ${selected?.cycle_id === c.cycle_id ? 'bg-matrix/10 text-matrix' : 'hover:bg-gray-800/50'}`}>
                           <div className="flex items-center gap-2">
                               {renderStatus(c.status)}
                               <span className="font-mono text-xs">{new Date(c.started_at).toLocaleString()}</span>
                           </div>
                           <span className="font-mono text-xs text-gray-500">{c.cycle_id.substring(0,8)}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="col-span-2 p-2">
                {selected ? (
                    <div>
                        <h3 className="text-gray-300 font-bold mb-2">Cycle Log: {selected.cycle_id}</h3>
                        <pre className="text-xs bg-gray-900 p-3 rounded-sm h-[calc(100vh-250px)] overflow-auto">{JSON.stringify(selected.logs, null, 2) || 'No logs available.'}</pre>
                    </div>
                ) : <div className="text-gray-600 text-center pt-20">Select a cycle to view logs.</div>}
            </div>
        </div>
    );
};

const QuarantineZone: React.FC<{ setToast: (toast: any) => void }> = ({ setToast }) => {
    const [items, setItems] = useState<RawItem[]>([]);
    const [selected, setSelected] = useState<RawItem | null>(null);

    const fetchItems = useCallback(async () => {
        const { data, error } = await supabase.from('raw_buffer').select('*').eq('is_processed', false).not('error_log', 'is', null).order('received_at', { ascending: false });
        if (error) setToast({ message: error.message, type: 'error' });
        else setItems(data);
    }, [setToast]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const handleAction = async (action: 'purge' | 'retry') => {
        if (!selected) return;
        
        let query;
        if (action === 'purge') {
            query = supabase.from('raw_buffer').delete().eq('id', selected.id);
        } else { // retry
            query = supabase.from('raw_buffer').update({ error_log: null }).eq('id', selected.id);
        }

        const { error } = await query;
        if (error) {
            setToast({ message: error.message, type: 'error' });
        } else {
            setToast({ message: `Item ${action}d successfully.`, type: 'success' });
            setSelected(null);
            fetchItems(); // Refresh list
        }
    };
    
    return (
        <div className="grid grid-cols-3 gap-4 h-full">
            <div className="col-span-1 flex flex-col border-r border-gray-800">
                <div className="p-2 border-b border-gray-800 text-sm text-alert">Quarantined Items</div>
                <ul className="overflow-y-auto">
                    {items.map(i => (
                        <li key={i.id} onClick={() => setSelected(i)} className={`flex items-center justify-between p-2 border-b border-gray-800 cursor-pointer ${selected?.id === i.id ? 'bg-alert/10 text-alert' : 'hover:bg-gray-800/50'}`}>
                           <span className="font-mono text-xs">{new Date(i.received_at).toLocaleString()}</span>
                           <span className="font-mono text-xs text-gray-500">ID: {i.id}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="col-span-2 p-2">
                {selected ? (
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-gray-300 font-bold">Inspector: {selected.id}</h3>
                            <div className="flex gap-2">
                                <Button onClick={() => handleAction('retry')} variant="primary"><RefreshCw size={14} className="mr-2"/>RETRY</Button>
                                <Button onClick={() => handleAction('purge')} variant="destructive"><Trash2 size={14} className="mr-2"/>PURGE</Button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-alert">Error Log</h4>
                            <pre className="text-xs bg-alert/10 p-2 mt-1 rounded-sm text-red-300 overflow-auto">{selected.error_log}</pre>
                        </div>
                        <div className="flex-grow min-h-0">
                            <h4 className="text-sm font-semibold text-gray-400">Payload</h4>
                            <pre className="text-xs bg-gray-900 p-3 rounded-sm h-[calc(100vh-350px)] overflow-auto">{JSON.stringify(selected.payload, null, 2)}</pre>
                        </div>
                    </div>
                ) : <div className="text-gray-600 text-center pt-20">Select an item to inspect.</div>}
            </div>
        </div>
    );
};

const BlackBox: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('logs');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    return (
        <div className="flex h-[calc(100vh-160px)]">
            <aside className="w-64 flex-shrink-0 bg-gray-900/30 border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                    <h1 className="text-2xl font-bold text-matrix">BlackBox</h1>
                    <p className="text-xs text-gray-500">System Internals</p>
                </div>
                <TokenStatus />
            </aside>

            <main className="flex-1 flex flex-col">
                <div className="flex border-b border-gray-800">
                    <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 text-sm font-bold ${activeTab === 'logs' ? 'text-matrix border-b-2 border-matrix bg-matrix/10' : 'text-gray-400'}`}>
                        SYSTEM_LOGS
                    </button>
                    <button onClick={() => setActiveTab('quarantine')} className={`px-4 py-2 text-sm font-bold ${activeTab === 'quarantine' ? 'text-alert border-b-2 border-alert bg-alert/10' : 'text-gray-400'}`}>
                        QUARANTINE_ZONE
                    </button>
                </div>
                <div className="flex-grow bg-gray-900/50">
                    {activeTab === 'logs' ? <SystemLogs /> : <QuarantineZone setToast={setToast}/>}
                </div>
            </main>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default BlackBox;
