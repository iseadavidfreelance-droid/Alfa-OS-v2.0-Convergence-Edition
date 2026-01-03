
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import { AlertTriangle, ServerCrash } from 'lucide-react';

type RawBufferItem = Database['public']['Tables']['raw_buffer']['Row'];

const ListItemSkeleton = () => (
    <div className="p-3 border-b border-gray-800 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-3/4"></div>
    </div>
);

const QuarantinePage: React.FC = () => {
    const [items, setItems] = useState<RawBufferItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<RawBufferItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuarantinedItems = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from('raw_buffer')
                    .select('*')
                    .eq('is_processed', false)
                    .not('error_log', 'is', null)
                    .order('received_at', { ascending: false });

                if (error) throw error;
                setItems(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchQuarantinedItems();
    }, []);

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-4xl font-bold border-b border-matrix/20 pb-2 mb-6 text-matrix">Quarantine</h1>
            
            {error && <div className="bg-alert/10 border border-alert text-alert p-4 rounded-md mb-6">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow min-h-0">
                <div className="md:col-span-1 bg-gray-900/50 border border-gray-800 rounded-md flex flex-col">
                    <h2 className="p-3 text-sm text-gray-400 border-b border-gray-800">Failed Payloads ({loading ? '...' : items.length})</h2>
                    <div className="overflow-y-auto">
                        {loading ? (
                             Array.from({ length: 10 }).map((_, i) => <ListItemSkeleton key={i} />)
                        ) : (
                            <ul>
                                {items.map(item => (
                                    <li key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className={`p-3 cursor-pointer border-b border-gray-800 transition-colors ${selectedItem?.id === item.id ? 'bg-matrix/10 text-matrix' : 'hover:bg-gray-800/50'}`}>
                                        <p className="font-bold">ID: {item.id}</p>
                                        <p className="text-xs text-gray-400">{new Date(item.received_at).toLocaleString()}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 bg-gray-900/50 border border-gray-800 rounded-md flex flex-col p-4">
                    {selectedItem ? (
                        <div className="flex flex-col h-full min-h-0">
                            <h2 className="text-lg font-bold mb-2 text-gray-300">Inspector // ID: {selectedItem.id}</h2>
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-alert flex items-center gap-2"><AlertTriangle size={14}/> Error Log</h3>
                                <pre className="text-xs bg-alert/10 p-2 mt-1 rounded-sm text-red-300 overflow-auto">{selectedItem.error_log}</pre>
                            </div>
                            <div className="flex-grow min-h-0">
                                <h3 className="text-sm font-semibold text-gray-400 mb-1">Payload</h3>
                                <pre className="text-xs bg-gray-900 p-3 rounded-sm h-full overflow-auto font-mono">{JSON.stringify(selectedItem.payload, null, 2)}</pre>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600">
                            <ServerCrash size={48} className="mb-4" />
                            <p>No payload selected.</p>
                            <p className="text-sm">Select an item from the list to inspect.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuarantinePage;
