import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Button from './Button';

type EmptyStateProps = {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  title = 'No student guides found', 
  message = 'Try adjusting your filters or search query to find what you are looking for.',
  actionLabel = 'Clear all filters',
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="bg-slate-50 p-4 rounded-full mb-4">
        <MagnifyingGlassIcon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-6">{message}</p>
      {onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
