
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Database, RarityTier } from '../../types/database.types';
import MonolithCard from '../../components/MonolithCard';
import SpectrumSelector from '../../components/SpectrumSelector';
import Button from '../../components/ui/Button';
import { PlusCircle } from 'lucide-react';

type Asset = Database['public']['Tables']['assets']['Row'];
type FilterTier = RarityTier | 'ALL';

const AssetGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 border-2 border-gray-800 rounded-md bg-gray-900/50 animate-pulse">
                <div className="h-5 bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between">
                    <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                </div>
            </div>
        ))}
    </div>
);

const MatrixDeck: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rarityFilter, setRarityFilter] = useState<FilterTier>('ALL');

    useEffect(() => {
        const fetchAssets = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('assets')
                    .select('*')
                    .order('total_score', { ascending: false });
                if (error) throw error;
                setAssets(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAssets();
    }, []);

    const filteredAssets = useMemo(() => {
        if (rarityFilter === 'ALL') {
            return assets;
        }
        return assets.filter(asset => asset.current_rarity === rarityFilter);
    }, [assets, rarityFilter]);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-matrix/20 pb-4 mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-matrix">Matrix Deck</h1>
                    <p className="text-gray-500 mt-1">Asset visualization and management portal.</p>
                </div>
                <Link to="/biolab/new">
                    <Button variant="primary">
                        <PlusCircle size={16} className="inline-block mr-2" />
                        Synthesize Asset
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <SpectrumSelector selected={rarityFilter} onSelect={setRarityFilter} />
            </div>
            
            {error && <div className="bg-alert/10 border border-alert text-alert p-4 rounded-md mb-6">{error}</div>}
            
            {loading ? <AssetGridSkeleton /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAssets.map(asset => (
                        <MonolithCard key={asset.id} asset={asset} />
                    ))}
                </div>
            )}
            {!loading && filteredAssets.length === 0 && (
                <div className="text-center py-16 text-gray-600 border border-dashed border-gray-800 rounded-md">
                    <p>No assets match the current filter.</p>
                </div>
            )}
        </div>
    );
};

export default MatrixDeck;
