import React from 'react';
import { useIntl } from 'react-intl';

interface TierBadgeProps {
  tierName: string | undefined;
  tokensLeft?: number;
  className?: string;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tierName, tokensLeft, className = '' }) => {
  const intl = useIntl();

  if (!tierName) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {intl.formatMessage({ id: 'tier.none' })}
      </span>
    );
  }

  return (
    <div className={`flex flex-col items-end gap-1 ${className}`}>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        {tierName}
      </span>
      {tokensLeft !== undefined && (
        <span className="text-xs text-gray-500">
          {intl.formatMessage({ id: 'tier.tokensLeft' }, { count: tokensLeft })}
        </span>
      )}
    </div>
  );
};
