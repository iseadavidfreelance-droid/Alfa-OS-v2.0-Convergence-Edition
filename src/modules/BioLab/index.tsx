import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Database, RarityTier } from '../../types/database.types';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { Save, ArrowLeft, Dna } from 'lucide-react';

type Asset = Database['public']['Tables']['assets']['Row'];
type Matrix = Database['public']['Tables']['matrices']['Row'];

const rarityTiers: RarityTier[] = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];

const DnaVisualization = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900/50 border border-gray-800 rounded-md p-8">
        <Dna size={128} className="text-matrix/20 animate-pulse" />
    </div>
);

const BioLab: React.FC = () => {
    const { assetId } = useParams();
    const navigate = useNavigate();
    const isNew = assetId === 'new';

    const [formState, setFormState] = useState<Partial<Asset>>({
        name: '',
        sku_slug: '',
        current_rarity: 'COMMON',
    });
    const [matrices, setMatrices] = useState<Matrix[]>([]);
    const [primaryMatrixId, setPrimaryMatrixId] = useState<string>('');
    
    const [loading, setLoading] = useState(!isNew);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch matrices for the dropdown
            const { data: matricesData, error: matricesError } = await supabase.from('matrices').select('*');
            if (matricesError) {
                setToast({ message: `Failed to load matrices: ${matricesError.message}`, type: 'error' });
            } else {
                setMatrices(matricesData);
            }

            if (!isNew) {
                setLoading(true);
                const { data: assetData, error: assetError } = await supabase
                    .from('assets')
                    .select('*')
                    .eq('id', assetId!)
                    .single();
                
                if (assetError) {
                    setToast({ message: `Failed to load asset: ${assetError.message}`, type: 'error' });
                    navigate('/arena');
                // FIX: Added a null check for assetData, as .single() can return null if no record is found.
                } else if (assetData) {
                    setFormState(assetData);
                    // Extract matrix_id from metadata
                    const meta = assetData.metadata as { primary_matrix_id?: number };
                    if (meta?.primary_matrix_id) {
                        setPrimaryMatrixId(String(meta.primary_matrix_id));
                    }
                } else {
                    setToast({ message: `Asset with ID ${assetId} not found.`, type: 'error' });
                    navigate('/arena');
                }
                setLoading(false);
            }
        };
        fetchData();
    }, [assetId, isNew, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleMatrixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPrimaryMatrixId(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const upsertData = {
            ...formState,
            id: isNew ? undefined : assetId,
            metadata: { primary_matrix_id: primaryMatrixId ? parseInt(primaryMatrixId, 10) : null },
            total_score: formState.total_score || 0,
        };
        
        const { error } = await supabase.from('assets').upsert(upsertData as Asset);

        setIsSubmitting(false);

        if (error) {
            if (error.code === '23505') { // Unique violation
                setToast({ message: 'Error: SKU Slug must be unique.', type: 'error' });
            } else {
                setToast({ message: `Save failed: ${error.message}`, type: 'error' });
            }
        } else {
            setToast({ message: `Asset ${isNew ? 'created' : 'updated'} successfully.`, type: 'success' });
            setTimeout(() => navigate('/arena'), 1000);
        }
    };
    
    if (loading) {
        return <div className="text-center text-matrix animate-pulse">Loading BioLab Interface...</div>
    }

    return (
        <div>
            <div className="flex items-center gap-4 border-b border-matrix/20 pb-4 mb-6">
                <button onClick={() => navigate('/arena')} className="text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-4xl font-bold text-matrix">{isNew ? 'Synthesize New Asset' : 'Edit Asset Sequence'}</h1>
                    <p className="text-gray-500">{isNew ? 'Define a new asset matrix.' : `Modifying SKU: ${formState.sku_slug}`}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <label htmlFor="name" className="block mb-1 text-sm text-gray-400">Asset Name</label>
                            <input type="text" name="name" id="name" required value={formState.name} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-sm p-2 text-white focus:ring-matrix focus:border-matrix"/>
                        </div>
                        <div>
                            <label htmlFor="sku_slug" className="block mb-1 text-sm text-gray-400">SKU Slug</label>
                            <input type="text" name="sku_slug" id="sku_slug" required value={formState.sku_slug} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-sm p-2 text-white focus:ring-matrix focus:border-matrix"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="current_rarity" className="block mb-1 text-sm text-gray-400">Rarity Tier</label>
                                <select name="current_rarity" id="current_rarity" required value={formState.current_rarity} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-sm p-2 text-white focus:ring-matrix focus:border-matrix">
                                    {rarityTiers.map(tier => <option key={tier} value={tier}>{tier}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="primary_matrix_id" className="block mb-1 text-sm text-gray-400">Primary Matrix</label>
                                <select name="primary_matrix_id" id="primary_matrix_id" value={primaryMatrixId} onChange={handleMatrixChange} className="w-full bg-gray-800 border border-gray-700 rounded-sm p-2 text-white focus:ring-matrix focus:border-matrix">
                                    <option value="">-- None --</option>
                                    {matrices.map(matrix => <option key={matrix.id} value={matrix.id}>{matrix.code}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="pt-4">
                            <Button type="submit" variant="primary" isLoading={isSubmitting}>
                                <Save size={16} className="inline-block mr-2" />
                                Save Sequence
                            </Button>
                        </div>
                    </div>
                    <div className="md:col-span-1">
                        <DnaVisualization />
                    </div>
                </div>
            </form>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default BioLab;