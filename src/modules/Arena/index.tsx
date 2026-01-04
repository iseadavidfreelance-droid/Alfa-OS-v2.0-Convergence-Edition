import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Database, RarityTier } from '../../types/database.types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { PlusCircle, Zap } from 'lucide-react';

type Asset = Database['public']['Tables']['assets']['Row'];
// FIX: Explicitly define the Insert type for an Asset to ensure type safety when creating new records.
type AssetInsert = Database['public']['Tables']['assets']['Insert'];

const AssetCardSkeleton = () => (
    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-md animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-5 bg-gray-700 rounded w-1/4"></div>
    </div>
);

const ArenaPage: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('assets')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setAssets(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const handleGenesisSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);
        // FIX: The Supabase client's `insert` method was failing type inference, resulting in an argument type of `never`.
        // By explicitly typing the `newAssetData` object with the `AssetInsert` type, we provide TypeScript
        // with the correct shape, which resolves the overload error.
        const newAssetData: AssetInsert = {
            sku_slug: formData.get('sku_slug') as string,
            name: formData.get('name') as string,
            current_rarity: formData.get('current_rarity') as RarityTier,
            total_score: parseInt(formData.get('total_score') as string, 10),
        };

        try {
            const { error } = await supabase.from('assets').insert([newAssetData]);
            if (error) throw error;
            setIsModalOpen(false);
            fetchAssets(); // Refresh asset list
        } catch (err: any) {
            alert(`Error creating asset: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center border-b border-matrix/20 pb-2 mb-6">
                <h1 className="text-4xl font-bold text-matrix">Asset Arena</h1>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    <PlusCircle size={16} className="inline-block mr-2" />
                    Genesis
                </Button>
            </div>
            
            {error && <div className="bg-alert/10 border border-alert text-alert p-4 rounded-md mb-6">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => <AssetCardSkeleton key={i} />)
                ) : (
                    assets.map(asset => (
                        <Card key={asset.id} rarity={asset.current_rarity}>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-300 pr-2">{asset.name}</h3>
                                <Badge rarity={asset.current_rarity} />
                            </div>
                            <p className="text-sm text-gray-500 mb-3">{asset.sku_slug}</p>
                            <p className="text-2xl font-mono text-matrix flex items-center gap-2">
                                <Zap size={20}/> {asset.total_score.toLocaleString()}
                            </p>
                        </Card>
                    ))
                )}
            </div>

            <Modal title="Initiate Genesis Protocol" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleGenesisSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block mb-1 text-sm text-gray-400">Asset Name</label>
                        <input type="text" name="name" id="name" required className="w-full bg-gray-800 border border-gray-700 rounded-sm p-2 text-white focus:ring-matrix focus:border-matrix"/>
                    </div>
                    <div>
                        <label htmlFor="sku_slug" className="block mb-1 text-sm text-gray-400">SKU Slug</label>
                        <input type="text" name="sku_slug" id="sku_slug" required className="w-full bg-gray-800 border border-gray-700 rounded-sm p-2 text-white focus:ring-matrix focus:border-matrix"/>
                    </div>
                     <div>
                        <label htmlFor="current_rarity" className="block mb-1 text-sm text-gray-400">Rarity Tier</label>
                        <select name="current_rarity" id="current_rarity" defaultValue="COMMON" required className="w-full bg-gray-800 border border-gray-700 rounded-sm p-2 text-white focus:ring-matrix focus:border-matrix">
                            {(Object.keys(rarityTiers) as RarityTier[]).map(tier => <option key={tier} value={tier}>{tier}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="total_score" className="block mb-1 text-sm text-gray-400">Total Score</label>
                        <input type="number" name="total_score" id="total_score" defaultValue="0" required className="w-full bg-gray-800 border border-gray-700 rounded-sm p-2 text-white focus:ring-matrix focus:border-matrix"/>
                    </div>
                    <div className="pt-2 flex justify-end">
                        <Button type="submit" variant="primary" isLoading={isSubmitting}>Create Asset</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const rarityTiers: Record<RarityTier, null> = { COMMON: null, UNCOMMON: null, RARE: null, EPIC: null, LEGENDARY: null, MYTHIC: null };

export default ArenaPage;