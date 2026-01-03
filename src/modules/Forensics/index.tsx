
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';

type Pin = Pick<Database['public']['Tables']['active_pins']['Row'], 'pin_id' | 'title'>;
type PinHistory = Database['public']['Tables']['pin_metric_history']['Row'];

const TableSkeleton = () => (
    <div className="overflow-x-auto bg-gray-900/50 border border-gray-800 rounded-md mt-4">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-900">
                <tr>
                    <th className="p-3">Recorded At</th>
                    <th className="p-3">Impressions</th>
                    <th className="p-3">Outbound Clicks</th>
                    <th className="p-3">Saves</th>
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-800 animate-pulse">
                        <td className="p-3"><div className="h-4 bg-gray-700 rounded w-32"></div></td>
                        <td className="p-3"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
                        <td className="p-3"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
                        <td className="p-3"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const ForensicsPage: React.FC = () => {
    const [pins, setPins] = useState<Pin[]>([]);
    const [selectedPinId, setSelectedPinId] = useState<string>('');
    const [history, setHistory] = useState<PinHistory[]>([]);
    const [loadingPins, setLoadingPins] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPins = async () => {
            setLoadingPins(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from('active_pins')
                    .select('pin_id, title')
                    .limit(100);
                if (error) throw error;
                setPins(data);
            } catch (err: any) {
                setError(`Failed to load pins: ${err.message}`);
            } finally {
                setLoadingPins(false);
            }
        };
        fetchPins();
    }, []);

    const fetchHistory = useCallback(async (pinId: string) => {
        if (!pinId) {
            setHistory([]);
            return;
        }
        setLoadingHistory(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('pin_metric_history')
                .select('*')
                .eq('pin_id_fk', pinId)
                .order('recorded_at', { ascending: false });
            if (error) throw error;
            setHistory(data);
        } catch (err: any) {
            setError(`Failed to load history for pin ${pinId}: ${err.message}`);
            setHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    const handlePinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pinId = e.target.value;
        setSelectedPinId(pinId);
        fetchHistory(pinId);
    };

    return (
        <div>
            <h1 className="text-4xl font-bold border-b border-matrix/20 pb-2 mb-6 text-matrix">Forensics</h1>
            
            {error && <div className="bg-alert/10 border border-alert text-alert p-4 rounded-md mb-6">{error}</div>}

            <div className="mb-4">
                <label htmlFor="pin-select" className="block mb-2 text-sm font-medium text-gray-400">Select Pin for Analysis</label>
                <select
                    id="pin-select"
                    value={selectedPinId}
                    onChange={handlePinChange}
                    disabled={loadingPins}
                    className="bg-gray-900 border border-gray-700 text-white text-sm rounded-md focus:ring-matrix focus:border-matrix block w-full md:w-1/2 p-2.5"
                >
                    <option value="">{loadingPins ? 'Loading pins...' : '-- Select a Pin --'}</option>
                    {pins.map(pin => (
                        <option key={pin.pin_id} value={pin.pin_id}>
                            {pin.title ? `${pin.title.substring(0, 50)}...` : pin.pin_id}
                        </option>
                    ))}
                </select>
            </div>
            
            {loadingHistory ? <TableSkeleton /> : (
                selectedPinId && (
                    <div className="overflow-x-auto bg-gray-900/50 border border-gray-800 rounded-md">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-900 border-b border-gray-800">
                                <tr>
                                    <th className="p-3">Recorded At</th>
                                    <th className="p-3 text-right">Impressions</th>
                                    <th className="p-3 text-right">Outbound Clicks</th>
                                    <th className="p-3 text-right">Saves</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? history.map(record => (
                                    <tr key={record.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="p-3 font-mono">{new Date(record.recorded_at).toLocaleString()}</td>
                                        <td className="p-3 text-right font-mono">{record.impression_count.toLocaleString()}</td>
                                        <td className="p-3 text-right font-mono">{record.outbound_click_count.toLocaleString()}</td>
                                        <td className="p-3 text-right font-mono">{record.save_count.toLocaleString()}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center p-4 text-gray-500">No metric history found for this pin.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
};

export default ForensicsPage;
