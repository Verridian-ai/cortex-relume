'use client';

import React, { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onSearch: () => void;
  onCreateProject: () => void;
  onToggleView: () => void;
  onToggleFilters: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onImport: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkActions: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onEnter: () => void;
  onEscape: () => void;
  onHelp: () => void;
  shortcutsEnabled?: boolean;
}

export function KeyboardShortcuts({
  onSearch,
  onCreateProject,
  onToggleView,
  onToggleFilters,
  onRefresh,
  onExport,
  onImport,
  onSelectAll,
  onClearSelection,
  onBulkActions,
  onNext,
  onPrevious,
  onEnter,
  onEscape,
  onHelp,
  shortcutsEnabled = true
}: KeyboardShortcutsProps) {
  
  const handleGlobalKeydown = useCallback((event: KeyboardEvent) => {
    if (!shortcutsEnabled) return;
    
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    // Ctrl/Cmd + key combinations
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'f':
          event.preventDefault();
          onSearch();
          break;
        case 'n':
          event.preventDefault();
          onCreateProject();
          break;
        case 'e':
          event.preventDefault();
          onExport();
          break;
        case 'i':
          event.preventDefault();
          onImport();
          break;
        case 'a':
          event.preventDefault();
          onSelectAll();
          break;
        case 'g':
          event.preventDefault();
          onToggleView();
          break;
      }
    }

    // Single key shortcuts
    switch (event.key) {
      case 'F1':
        event.preventDefault();
        onHelp();
        break;
      case 'F5':
        event.preventDefault();
        onRefresh();
        break;
      case 'Escape':
        onEscape();
        break;
      case 'Enter':
        onEnter();
        break;
      case '?':
        if (event.shiftKey) {
          event.preventDefault();
          onHelp();
        }
        break;
      
      // Alt + key combinations
      case 'ArrowDown':
        if (event.altKey) {
          event.preventDefault();
          onNext();
        }
        break;
      
      case 'ArrowUp':
        if (event.altKey) {
          event.preventDefault();
          onPrevious();
        }
        break;
    }
  }, [
    shortcutsEnabled,
    onSearch,
    onCreateProject,
    onExport,
    onImport,
    onSelectAll,
    onToggleView,
    onRefresh,
    onNext,
    onPrevious,
    onEnter,
    onEscape,
    onHelp
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeydown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeydown);
    };
  }, [handleGlobalKeydown]);

  // Additional shortcuts handled in global keydown

  return null; // This component doesn't render anything
}

// Hook for registering individual shortcuts
export function useProjectShortcuts() {
  const shortcuts = {
    // Navigation
    openSearch: 'ctrl+f',
    createProject: 'ctrl+n',
    toggleView: 'ctrl+g',
    openFilters: 'ctrl+alt+f',
    
    // Selection & Actions
    selectAll: 'ctrl+a',
    clearSelection: 'escape',
    openBulkActions: 'ctrl+alt+b',
    
    // Data Management
    export: 'ctrl+e',
    import: 'ctrl+i',
    refresh: 'f5',
    
    // Navigation
    next: 'alt+arrowdown',
    previous: 'alt+arrowup',
    confirm: 'enter',
    cancel: 'escape',
    
    // Help & Info
    showHelp: 'shift+?',
    help: 'f1'
  };

  return shortcuts;
}

// Shortcuts help dialog component
interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Ctrl', '+', 'N'], description: 'Create new project' },
    { keys: ['Ctrl', '+', 'F'], description: 'Open search' },
    { keys: ['Ctrl', '+', 'G'], description: 'Toggle view mode (grid/list)' },
    { keys: ['Ctrl', '+', 'Alt', '+', 'F'], description: 'Toggle filters' },
    { keys: ['Ctrl', '+', 'A'], description: 'Select all projects' },
    { keys: ['Ctrl', '+', 'Alt', '+', 'B'], description: 'Open bulk actions' },
    { keys: ['Ctrl', '+', 'E'], description: 'Export projects' },
    { keys: ['Ctrl', '+', 'I'], description: 'Import projects' },
    { keys: ['Alt', '↑'], description: 'Previous project' },
    { keys: ['Alt', '↓'], description: 'Next project' },
    { keys: ['Enter'], description: 'Open selected project' },
    { keys: ['Esc'], description: 'Clear selection / Close dialogs' },
    { keys: ['F5'], description: 'Refresh projects' },
    { keys: ['Shift', '+', '?'], description: 'Show this help' },
    { keys: ['F1'], description: 'Show keyboard shortcuts' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      <kbd className="px-2 py-1 text-xs bg-muted border border-border rounded">
                        {key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="text-xs text-muted-foreground mx-1">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-xs">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}

// Component to display available shortcuts
export function ShortcutsIndicator({ shortcuts }: { shortcuts: string[] }) {
  if (shortcuts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-muted/90 backdrop-blur border rounded-lg p-2 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Shortcuts:</span>
          {shortcuts.slice(0, 3).map((shortcut, index) => (
            <kbd key={index} className="px-1.5 py-0.5 text-xs bg-background border rounded">
              {shortcut}
            </kbd>
          ))}
          {shortcuts.length > 3 && (
            <span className="text-xs text-muted-foreground">+{shortcuts.length - 3} more</span>
          )}
        </div>
      </div>
    </div>
  );
}

// For JSX imports
const X = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
