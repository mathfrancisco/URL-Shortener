import React from 'react';

interface StatsCardProps {
    title: string,
    value: string | number,
    icon: React.ComponentType<{ className?: string }>,
    change?: {
        value: number;
        type: 'increase' | 'decrease' | 'neutral';
    },
    description?: string,
    variant?: 'small' | 'medium' | 'large',
    className?: string,
    loading?: boolean
}

const StatsCard: React.FC<StatsCardProps> = ({
                                                 title,
                                                 value,
                                                 icon: Icon,
                                                 change,
                                                 description,
                                                 variant = 'medium',
                                                 className = '',

                                             }) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'small':
                return 'p-4';
            case 'large':
                return 'p-8';
            default:
                return 'p-6';
        }
    };

    const getChangeColor = () => {
        if (!change) return '';
        switch (change.type) {
            case 'increase':
                return 'text-green-600';
            case 'decrease':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getChangeIcon = () => {
        if (!change) return null;
        const symbol = change.type === 'increase' ? '↗' : change.type === 'decrease' ? '↘' : '→';
        return symbol;
    };

    return (
        <div
            className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow ${getVariantClasses()} ${className}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Icon className="w-5 h-5 text-purple-600"/>
                        </div>
                        {variant !== 'small' && (
                            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                        )}
                    </div>

                    {variant === 'small' && (
                        <h3 className="text-xs font-medium text-gray-600 mb-1">{title}</h3>
                    )}

                    <div className="flex items-baseline gap-2">
            <span
                className={`font-bold ${variant === 'large' ? 'text-3xl' : variant === 'small' ? 'text-xl' : 'text-2xl'} text-gray-900`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>

                        {change && (
                            <span className={`text-sm font-medium ${getChangeColor()}`}>
                {getChangeIcon()} {Math.abs(change.value)}%
              </span>
                        )}
                    </div>

                    {description && (
                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;