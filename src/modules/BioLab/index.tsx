
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import Toast from '../../components/ui/Toast';
import { ArrowLeft, Dna, Info, FileJson } from 'lucide-react';
import Badge from '../../components/ui/Badge';

type Asset = Database['public']['Tables']['assets']['Row'];

const DnaVisualization = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900/50 border border-gray-800 rounded-md p-8 min-h-[200px]">
        <Dna size={128} className="text-matrix/20 animate-pulse" />
    </div>
);

const DetailField: React.FC<{ label: string; children: React.ReactNode; icon: React.ElementType }> = ({ label, children, icon: Icon }) => (
    <div>
        <h3 className="text-sm text-gray-500 font-bold tracking-wider uppercase flex items-center gap-2 mb-1">
            <Icon size={14} /> {label}
        </h3>
        <div className="bg-gray-800/50 border border-gray-700 rounded-sm p-3 text-gray-200 font-mono text-sm">
            {children}
        </div>
    </div>
);

const BioLab: React.FC = () => {
    const { assetId } = useParams();
    const navigate = useNavigate();

    const [asset, setAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (!assetId || assetId === 'new') {
            setToast({ message: "Asset creation is handled via CLI.", type: 'error' });
            navigate('/arena');
            return;
        }

        const fetchAsset = async () => {
            setLoading(true);
            const { data: assetData, error: assetError } = await supabase
                .from('assets')
                .select('*')
                .eq('id', assetId)
                .single();

            if (assetError || !assetData) {
                setToast({ message: `Failed to load asset: ${assetError?.message || 'Not found'}`, type: 'error' });
                navigate('/arena');
            } else {
                setAsset(assetData as Asset);
            }
            setLoading(false);
        };

        fetchAsset();
    }, [assetId, navigate]);
    
    if (loading) {
        return <div className="text-center text-matrix animate-pulse">Loading Asset Sequence...</div>
    }

    if (!asset) {
        return null; // or a not found component
    }

    return (
        <div>
            <div className="flex items-center gap-4 border-b border-matrix/20 pb-4 mb-6">
                <button onClick={() => navigate('/arena')} className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-4xl font-bold text-matrix truncate" title={asset.name}>{asset.name}</h1>
                    <p className="text-gray-500 font-mono">ASSET_ID: {asset.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <DetailField label="SKU Slug" icon={Info}>
                        {asset.sku_slug}
                    </DetailField>
                    <div className="grid grid-cols-2 gap-6">
                         <DetailField label="Rarity Tier" icon={Info}>
                            <Badge rarity={asset.current_rarity} />
                        </DetailField>
                         <DetailField label="Destination Link" icon={Info}>
                            {asset.destination_link || <span className="text-gray-500">Not Set</span>}
                        </DetailField>
                    </div>
                    <DetailField label="Matrix Configuration" icon={FileJson}>
                        <pre className="text-xs whitespace-pre-wrap">{asset.matrix_config ? JSON.stringify(asset.matrix_config, null, 2) : '{ }'}</pre>
                    </DetailField>
                     <DetailField label="Metadata" icon={FileJson}>
                        <pre className="text-xs whitespace-pre-wrap">{asset.metadata ? JSON.stringify(asset.metadata, null, 2) : '{ }'}</pre>
                    </DetailField>
                </div>

                <div className="md:col-span-1">
                    <DnaVisualization />
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default BioLab;
