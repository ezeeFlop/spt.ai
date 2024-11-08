import { type Plugin } from '@mdxeditor/editor';
import { Sparkles } from 'lucide-react';

export const AIGenerationPlugin = (
  onAIGenerate: () => void
): Plugin => {
  const AIGenerateCommand = {
    key: 'AIGenerate' as const,
    label: 'Generate with AI',
    run: (): boolean => {
      onAIGenerate();
      return true;
    },
    icon: <Sparkles className="h-4 w-4" />
  };

  return {
    commands: [AIGenerateCommand],
    toolbar: () => [AIGenerateCommand]
  } satisfies Plugin;
};
