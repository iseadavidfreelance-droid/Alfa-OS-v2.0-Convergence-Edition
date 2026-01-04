
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { ClipboardCopy } from 'lucide-react';

type OrphanPin = Database['public']['Tables']['active_pins']['Row'];

const OrphanPinSkeleton = () => (
    <div className="bg-gray-900/50 border border-gray-800 rounded-md p-4 flex gap-4 animate-pulse">
        <div className="w-24 h-24 bg-gray-700 rounded-sm flex-shrink-0"></div>
        <div className="flex-grow">
            <div className="h-5 bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-gray-700 rounded w-32"></div>
        </div>
    </div>
);

const MissionsPage: React.FC = () => {
    const [orphanPins, setOrphanPins] = useState<OrphanPin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchOrphanPins = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('active_pins')
                .select('*')
                .is('asset_id', null)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrphanPins(data);
        } catch (err: any) {
            setError(`Failed to fetch orphan pins: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrphanPins();
    }, [fetchOrphanPins]);

    const handleCopyId = (pinId: string) => {
        navigator.clipboard.writeText(pinId).then(() => {
            setToast({ message: `Pin ID ${pinId.substring(0,8)}... copied!`, type: 'success' });
        }).catch(() => {
            setToast({ message: 'Failed to copy ID.', type: 'error' });
        });
    };

    return (
        <div>
            <h1 className="text-4xl font-bold border-b border-matrix/20 pb-2 mb-6 text-matrix">Missions Control</h1>
            <p className="text-gray-400 mb-6">Read-only list of orphan pins requiring CLI-based adoption.</p>
            
            {error && <div className="bg-alert/10 border border-alert text-alert p-4 rounded-md mb-6">{error}</div>}

            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <OrphanPinSkeleton key={i} />)
                ) : orphanPins.length > 0 ? (
                    orphanPins.map(pin => (
                        <div key={pin.pin_id} className="bg-gray-900/50 border border-gray-800 rounded-md p-4 flex flex-col md:flex-row gap-4 items-center">
                            <img src={pin.image_url} alt={pin.title || 'Pin image'} className="w-full md:w-32 md:h-32 object-cover rounded-sm flex-shrink-0" />
                            <div className="flex-grow">
                                <h3 className="font-bold text-lg text-gray-200">{pin.title || 'Untitled Pin'}</h3>
                                <p className="text-xs text-gray-500 font-mono mb-2">PIN_ID: {pin.pin_id}</p>
                                <p className="text-sm text-gray-400 line-clamp-2">{pin.description}</p>
                            </div>
                            <div className="w-full md:w-auto flex-shrink-0 flex items-center">
                                <Button onClick={() => handleCopyId(pin.pin_id)} variant="default">
                                    <ClipboardCopy size={14} className="inline-block mr-2" />
                                    Copy ID
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 text-gray-600 border border-dashed border-gray-800 rounded-md">
                        <p>All pins assigned.</p>
                        <p className="text-sm">No active missions.</p>
                    </div>
                )}
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default MissionsPage;
