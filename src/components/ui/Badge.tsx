
import React from 'react';
import { RarityTier } from '../../types/database.types';

const rarityStyles: Record<RarityTier, string> = {
    COMMON: 'bg-gray-600/50 text-gray-300',
    UNCOMMON: 'bg-green-600/50 text-green-300',
    RARE: 'bg-blue-600/50 text-blue-300',
    EPIC: 'bg-purple-600/50 text-purple-300',
    LEGENDARY: 'bg-yellow-600/50 text-yellow-300',
    MYTHIC: 'bg-red-600/50 text-red-300',
};

interface BadgeProps {
    rarity: RarityTier;
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({ rarity, className = '' }) => {
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold tracking-wider rounded-full ${rarityStyles[rarity]} ${className}`}>
            {rarity}
        </span>
    );
};

export default Badge;
