'use client';

import ModelSelector from './ModelSelector';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  model: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
  isModelsLoading?: boolean;
}

export default function Header({ 
  model,
  onModelChange,
  disabled,
  isModelsLoading = false
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-white border-b dark:bg-gray-900 dark:border-gray-800">
      <h1 className="text-xl font-semibold">Multi-Model Chat</h1>
      <div className="flex items-center gap-4">
        <ModelSelector
          selectedModel={model}
          onModelChange={onModelChange}
          disabled={disabled}
          isLoading={isModelsLoading}
        />
        <ThemeToggle />
      </div>
    </header>
  );
}
