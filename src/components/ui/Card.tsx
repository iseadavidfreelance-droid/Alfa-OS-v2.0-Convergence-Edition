
import React from 'react';
import { RarityTier } from '../../types/database.types';

const rarityBorderColors: Record<RarityTier, string> = {
    COMMON: 'border-gray-600',
    UNCOMMON: 'border-green-500',
    RARE: 'border-blue-500',
    EPIC: 'border-purple-500',
    LEGENDARY: 'border-yellow-400',
    MYTHIC: 'border-red-500',
};

interface CardProps {
    children: React.ReactNode;
    rarity?: RarityTier;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, rarity = 'COMMON', className = '' }) => {
    return (
        <div className={`bg-gray-900/50 border ${rarityBorderColors[rarity]} rounded-md p-4 transition-all duration-300 hover:shadow-lg hover:shadow-matrix/10 ${className}`}>
            {children}
        </div>
    );
};

export default Card;
