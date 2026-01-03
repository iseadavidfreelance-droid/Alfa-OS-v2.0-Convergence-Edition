
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'primary' | 'destructive';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'default',
    isLoading = false,
    className = '',
    ...props
}) => {
    const baseStyle = 'px-4 py-2 text-sm font-bold tracking-wider rounded-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-void disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
        default: 'bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500',
        primary: 'bg-matrix/80 border border-matrix text-void hover:bg-matrix hover:shadow-[0_0_15px_rgba(0,255,65,0.7)]',
        destructive: 'bg-alert/80 border border-alert text-white hover:bg-alert hover:shadow-[0_0_15px_rgba(239,68,68,0.7)]',
    };

    return (
        <button
            className={`${baseStyle} ${variantStyles[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? 'Processing...' : children}
        </button>
    );
};

export default Button;
