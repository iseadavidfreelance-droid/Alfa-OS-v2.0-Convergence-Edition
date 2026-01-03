
import React from 'react';
import { RarityTier } from '../types/database.types';

type FilterTier = RarityTier | 'ALL';
const tiers: FilterTier[] = ['ALL', 'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];

const rarityStyles: Record<RarityTier, { border: string; text: string; hoverBg: string }> = {
    COMMON:    { border: 'border-gray-500',  text: 'text-gray-400',  hoverBg: 'hover:bg-gray-700' },
    UNCOMMON:  { border: 'border-green-600', text: 'text-green-500', hoverBg: 'hover:bg-green-800' },
    RARE:      { border: 'border-blue-500',  text: 'text-blue-500',  hoverBg: 'hover:bg-blue-800' },
    EPIC:      { border: 'border-purple-500',text: 'text-purple-500',hoverBg: 'hover:bg-purple-800' },
    LEGENDARY: { border: 'border-yellow-400',text: 'text-yellow-400',hoverBg: 'hover:bg-yellow-800' },
    MYTHIC:    { border: 'border-red-500',   text: 'text-red-500',   hoverBg: 'hover:bg-red-800' },
};

interface SpectrumSelectorProps {
    selected: FilterTier;
    onSelect: (tier: FilterTier) => void;
}

const SpectrumSelector: React.FC<SpectrumSelectorProps> = ({ selected, onSelect }) => {
    return (
        <div className="flex flex-wrap gap-2">
            {tiers.map(tier => {
                const isAll = tier === 'ALL';
                const isSelected = selected === tier;
                const styles = !isAll ? rarityStyles[tier] : null;

                const baseClasses = 'px-3 py-1 text-xs font-bold tracking-wider border rounded-sm cursor-pointer transition-colors';
                const selectedClasses = isSelected 
                    ? isAll ? 'bg-matrix text-void border-matrix' : `${styles?.border.replace('border-', 'bg-')} text-void ${styles?.border}`
                    : isAll ? 'border-gray-500 text-gray-400 hover:bg-gray-700' : `${styles?.border} ${styles?.text} ${styles?.hoverBg}`;

                return (
                    <button key={tier} onClick={() => onSelect(tier)} className={`${baseClasses} ${selectedClasses}`}>
                        {tier}
                    </button>
                );
            })}
        </div>
    );
};

export default SpectrumSelector;
