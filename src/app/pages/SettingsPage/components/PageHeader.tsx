import { Settings, RotateCcw, Save, Loader2, Lock } from 'lucide-react';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface Props {
  isDirty:   boolean;
  saveState: SaveState;
  canEdit:   boolean;
  onSave:    () => void;
  onReset:   () => void;
}

export function PageHeader({ isDirty, saveState, canEdit, onSave, onReset }: Props) {
  return (
    <header className="flex-shrink-0 h-12 flex items-center justify-between px-6 border-b border-border">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-xl font-bold">System Settings</h1>
        {isDirty && (
          <span className="text-xs text-orange-500 dark:text-orange-400 font-medium">
            · unsaved changes
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {canEdit ? (
          <>
            <button
              onClick={onReset}
              disabled={saveState === 'saving'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Defaults
            </button>
            <button
              onClick={onSave}
              disabled={!isDirty || saveState === 'saving'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 ${
                saveState === 'saved' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                saveState === 'error' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              {saveState === 'saving'
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Save    className="w-3.5 h-3.5" />
              }
              {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved!' : 'Save Changes'}
            </button>
          </>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            Read-only
          </span>
        )}
      </div>
    </header>
  );
}
