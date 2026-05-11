import React from 'react';

export default function EmptyState({
  icon: Icon,
  title = 'No items',
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="text-center py-16">
      {Icon && (
        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Icon className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{title}</h3>
      {description && (
        <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-medium text-white bg-violet-600 hover:bg-violet-700 transition-all duration-300 shadow-md hover:shadow-violet-500/25 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
