
import React from 'react';
import { Link } from 'react-router-dom';
import { Database, RarityTier } from '../types/database.types';
import { Zap, DollarSign } from 'lucide-react';

type Asset = Database['public']['Tables']['assets']['Row'];

const rarityStyles: Record<RarityTier, { border: string; bg: string; shadow: string; text: string }> = {
    COMMON:    { border: 'border-gray-600',  bg: 'bg-gray-800/10',  shadow: 'hover:shadow-gray-600/20',  text: 'text-gray-400' },
    UNCOMMON:  { border: 'border-green-600', bg: 'bg-green-800/10', shadow: 'hover:shadow-green-600/20', text: 'text-green-400' },
    RARE:      { border: 'border-blue-500',  bg: 'bg-blue-800/10',  shadow: 'hover:shadow-blue-500/20',  text: 'text-blue-400' },
    EPIC:      { border: 'border-purple-500',bg: 'bg-purple-800/10',shadow: 'hover:shadow-purple-500/20',text: 'text-purple-400' },
    LEGENDARY: { border: 'border-yellow-400',bg: 'bg-yellow-800/10',shadow: 'hover:shadow-yellow-400/20',text: 'text-yellow-300' },
    MYTHIC:    { border: 'border-red-500',   bg: 'bg-red-800/10',   shadow: 'hover:shadow-red-500/20',   text: 'text-red-400' },
};

interface MonolithCardProps {
    asset: Asset;
}

const MonolithCard: React.FC<MonolithCardProps> = ({ asset }) => {
    const styles = rarityStyles[asset.current_rarity];
    // This field is not in the DB. We derive it for display as requested.
    const cached_revenue_score = (asset.total_score * 0.12).toFixed(2);

    return (
        <Link to={`/biolab/${asset.id}`} className="block">
            <div className={`
                p-4 border-2 rounded-md transition-all duration-300 group
                ${styles.border} ${styles.bg} ${styles.shadow} hover:-translate-y-1 hover:shadow-2xl
            `}>
                <div className="flex justify-between items-center border-b-2 pb-2 mb-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <h3 className="font-bold text-lg text-gray-200 truncate group-hover:text-white">{asset.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${styles.border} ${styles.text}`}>
                        {asset.current_rarity}
                    </span>
                </div>
                <p className="text-sm text-gray-500 font-mono mb-4 truncate">{asset.sku_slug}</p>
                <div className="flex justify-between text-lg">
                    <div className="flex items-center gap-2" title="Total Score">
                        <Zap size={18} className="text-matrix" />
                        <span className="font-mono font-bold text-white">{asset.total_score.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2" title="Est. Revenue Score">
                        <DollarSign size={18} className="text-yellow-400" />
                        <span className="font-mono font-bold text-white">{cached_revenue_score}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default MonolithCard;
