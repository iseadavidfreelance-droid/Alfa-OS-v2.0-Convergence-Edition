
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Zap, Link as LinkIcon, GitCommit } from 'lucide-react';

type AssetWithPins = Database['public']['Tables']['assets']['Row'] & {
    active_pins: Database['public']['Tables']['active_pins']['Row'][];
};

const SwarmPage: React.FC = () => {
    const [assets, setAssets] = useState<AssetWithPins[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<AssetWithPins | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAssetsWithPins = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('assets')
                    .select('*, active_pins(*)')
                    .limit(50); // Limit to avoid fetching too much data

                if (error) throw error;
                setAssets(data as AssetWithPins[]);
                if (data.length > 0) {
                    setSelectedAsset(data[0] as AssetWithPins);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAssetsWithPins();
    }, []);

    const handleAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const asset = assets.find(a => a.id === e.target.value) || null;
        setSelectedAsset(asset);
    };
    
    const pinPositions = useMemo(() => {
        if (!selectedAsset) return [];
        const count = selectedAsset.active_pins.length;
        const radius = Math.min(300, 100 + count * 10); // Dynamic radius
        return selectedAsset.active_pins.map((_, index) => {
            const angle = (index / count) * 2 * Math.PI;
            return {
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
            };
        });
    }, [selectedAsset]);

    return (
        <div>
            <h1 className="text-4xl font-bold border-b border-matrix/20 pb-2 mb-6 text-matrix">Pin Swarm</h1>
            
            {error && <div className="bg-alert/10 border border-alert text-alert p-4 rounded-md mb-6">{error}</div>}

            <div className="mb-4">
                <label htmlFor="asset-select" className="block mb-2 text-sm font-medium text-gray-400">Select Asset to Visualize</label>
                <select
                    id="asset-select"
                    value={selectedAsset?.id || ''}
                    onChange={handleAssetChange}
                    disabled={loading}
                    className="bg-gray-900 border border-gray-700 text-white text-sm rounded-md focus:ring-matrix focus:border-matrix block w-full md:w-1/2 p-2.5"
                >
                    {loading ? <option>Loading assets...</option> : assets.map(asset => (
                        <option key={asset.id} value={asset.id}>{asset.name}</option>
                    ))}
                </select>
            </div>

            <div className="relative flex items-center justify-center w-full min-h-[600px] bg-gray-900/30 border border-gray-800 rounded-md p-8 mt-8">
                {selectedAsset ? (
                    <>
                        <Card rarity={selectedAsset.current_rarity} className="z-10 w-72">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-300 pr-2">{selectedAsset.name}</h3>
                                <Badge rarity={selectedAsset.current_rarity} />
                            </div>
                            <p className="text-sm text-gray-500 mb-3">{selectedAsset.sku_slug}</p>
                            <p className="text-2xl font-mono text-matrix flex items-center gap-2">
                                <Zap size={20}/> {selectedAsset.total_score.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-400 mt-2 flex items-center gap-2"><LinkIcon size={14}/> {selectedAsset.active_pins.length} Linked Pins</p>
                        </Card>
                        {selectedAsset.active_pins.map((pin, index) => {
                            const isDeadWeight = (pin.last_stats as any)?.outbound_click_count === 0;
                            const pos = pinPositions[index];
                            return (
                                <div key={pin.pin_id}
                                     className="absolute flex flex-col items-center transition-transform duration-500"
                                     style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
                                    <div className={`p-2 rounded-full border ${isDeadWeight ? 'bg-alert/20 border-alert' : 'bg-matrix/20 border-matrix'}`}>
                                        <GitCommit size={16} className={isDeadWeight ? 'text-alert' : 'text-matrix'}/>
                                    </div>
                                    <p className={`mt-1 text-xs text-center w-24 truncate ${isDeadWeight ? 'text-red-400' : 'text-gray-400'}`}>
                                        {pin.title || pin.pin_id}
                                    </p>
                                </div>
                            )
                        })}
                    </>
                ) : !loading && (
                     <p className="text-gray-500">No asset selected or available.</p>
                )}
                 {loading && <p className="text-matrix animate-pulse">Loading Swarm Data...</p>}
            </div>
        </div>
    );
};

export default SwarmPage;
