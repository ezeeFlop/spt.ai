import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { contentApi } from '../services/api';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export type ContentType = 'markdown' | 'image' | 'translation';

interface AIContentGeneratorProps {
  type: ContentType;
  onGenerated: (content: any) => void;
  sourceLocale?: string;
  targetLocale?: string;
  contentType?: string;
  className?: string;
  placeholder?: string;
  locale?: string;
}

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  type,
  onGenerated,
  sourceLocale,
  targetLocale,
  contentType,
  className = '',
  placeholder,
  locale
}) => {
  const intl = useIntl();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    try {
      let result;
      
      switch (type) {
        case 'markdown':
          result = await contentApi.generateMarkdown(prompt, locale || intl.locale);
          onGenerated(result.content);
          break;
          
        case 'image':
          result = await contentApi.generateImage(prompt);
          onGenerated(result.url);
          break;
          
        case 'translation':
          if (!sourceLocale || !targetLocale || !contentType) {
            throw new Error('Missing translation parameters');
          }
          result = await contentApi.translateContent(
            contentType,
            sourceLocale,
            targetLocale
          );
          onGenerated(result.translated_content);
          break;
      }
      
      toast.success(intl.formatMessage({ id: 'ai.generate.success' }));
      setPrompt('');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(intl.formatMessage({ id: 'ai.generate.error' }));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <select
          value={locale || intl.locale}
          onChange={(e) => locale = e.target.value}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="es">Español</option>
        </select>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder || intl.formatMessage({ id: 'ai.prompt.placeholder' })}
          className="flex-1 min-h-[100px] p-3 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={isGenerating}
        />
      </div>
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            {intl.formatMessage({ id: 'ai.generate.loading' })}
          </>
        ) : (
          intl.formatMessage({ id: 'ai.generate.button' })
        )}
      </button>
    </div>
  );
};
