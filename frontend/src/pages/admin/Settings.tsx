import { useState, useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { contentApi, mediaApi } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/Tabs';
import type { HomeContent } from '../../types/content';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '../../hooks/useUserRole';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  toolbarPlugin,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  UndoRedo,
  CodeToggle,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import debounce from 'lodash/debounce';
import { AIContentGenerator } from '../../components/AIContentGenerator';
import { AIGenerationPlugin } from '../../components/editor/AIGenerationPlugin';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/Dialog';

const SUPPORTED_LOCALES = ['en', 'fr', 'de', 'es'];
const SUPPORTED_ICONS = ['Brain', 'Sparkles', 'Zap'];
const imageUploadHandler = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await mediaApi.upload('image', formData);
    return response.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Add a default content structure
const DEFAULT_HOME_CONTENT: HomeContent = {
  content: {
    hero: {
      title: '',
    subtitle: '',
    ctaPrimary: '',
    ctaSecondary: ''
    },
    features: {
      title: '',
      subtitle: '',
      items: []
    }
  }
};

const mdxEditorPlugins = [
  headingsPlugin(),
  listsPlugin(),
  quotePlugin(),
  thematicBreakPlugin(),
  markdownShortcutPlugin(),
  linkPlugin(),
  linkDialogPlugin(),
  imagePlugin({
    imageUploadHandler,
    imageAutocompleteSuggestions: []
  }),
  tablePlugin(),
  codeBlockPlugin(),
  codeMirrorPlugin(),
  diffSourcePlugin(),
  frontmatterPlugin(),
  toolbarPlugin({
    toolbarContents: () => (
      <>
        <UndoRedo />
        <BlockTypeSelect />
        <BoldItalicUnderlineToggles />
        <CodeToggle />
        <CreateLink />
        <InsertImage />
        <InsertTable />
        <InsertThematicBreak />
        <ListsToggle />
      </>
    )
  })
];

const HomeContentEditor = ({ locale, content, onChange, onSave }: {
  locale: string,
  content?: HomeContent,
  onChange: (content: HomeContent) => void,
  onSave: () => void
}) => {
  const intl = useIntl();
  const safeContent = content ?? {...DEFAULT_HOME_CONTENT};
  const [isSaving, setIsSaving] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState<{
    section: string;
    field: string;
    index?: number;
  } | null>(null);

  const handleGeneratedContent = (section: string, field: string, value: string, index?: number) => {
    const newContent = { ...safeContent };
    if (section === 'features' && typeof index === 'number') {
      // Handle feature items
      const newItems = [...newContent.content.features.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
      onChange({
        ...safeContent,
        content: {
          ...safeContent.content,
          features: {
            ...safeContent.content.features,
            items: newItems
          }
        }
      });
    } else {
      // Handle other fields
      onChange({
        ...safeContent,
        content: {
          ...safeContent.content,
          [section]: {
            ...safeContent.content[section],
            [field]: value
          }
        }
      });
    }
  };

  const debouncedOnChange = useCallback(
    debounce((value: string, field: string, section: 'hero' | 'features', itemIndex?: number) => {
      if (itemIndex !== undefined) {
        // Handle feature item fields
        const newItems = [...safeContent.content.features.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          [field]: value
        };
        onChange({
          ...safeContent,
          content: {
            ...safeContent.content,
            features: {
              ...safeContent.content.features,
              items: newItems
            }
          }
        });
      } else {
        // Handle other fields
        onChange({
          ...safeContent,
          content: {
            ...safeContent.content,
            [section]: {
              ...safeContent.content[section],
              [field]: value
            }
          }
        });
      }
    }, 300),
    [safeContent, onChange]
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      toast.success(intl.formatMessage({ id: 'settings.home.save.success' }));
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error(intl.formatMessage({ id: 'settings.home.save.error' }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIButtonClick = (section: string, field: string, index?: number) => {
    setCurrentField({ section, field, index });
    setIsAIModalOpen(true);
  };

  const createEditorPlugins = (section: string, field: string, index?: number) => [
    ...mdxEditorPlugins,
    AIGenerationPlugin(() => handleAIButtonClick(section, field, index))
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Hero Section</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {intl.formatMessage({ id: 'settings.home.hero.title' })}
            </label>
            <MDXEditor
              markdown={safeContent.content.hero.title}
              onChange={(value) => debouncedOnChange(value, 'title', 'hero')}
              plugins={createEditorPlugins('hero', 'title')}
              contentEditableClassName="prose dark:prose-invert max-w-none"
              className="w-full min-h-[100px] border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {intl.formatMessage({ id: 'settings.home.hero.subtitle' })}
            </label>
            <MDXEditor
              markdown={safeContent.content.hero.subtitle}
              onChange={(value) => debouncedOnChange(value, 'subtitle', 'hero')}
              plugins={createEditorPlugins('hero', 'subtitle')}
              contentEditableClassName="prose dark:prose-invert max-w-none"
              className="w-full min-h-[100px] border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {intl.formatMessage({ id: 'settings.home.hero.ctaPrimary' })}
            </label>
            <MDXEditor
              markdown={safeContent.content.hero.ctaPrimary}
              onChange={(value) => debouncedOnChange(value, 'ctaPrimary', 'hero')}
              plugins={createEditorPlugins('hero', 'ctaPrimary')}
              contentEditableClassName="prose dark:prose-invert max-w-none"
              className="w-full min-h-[100px] border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {intl.formatMessage({ id: 'settings.home.hero.ctaSecondary' })}
            </label>
            <MDXEditor
              markdown={safeContent.content.hero.ctaSecondary}
              onChange={(value) => debouncedOnChange(value, 'ctaSecondary', 'hero')}
              plugins={createEditorPlugins('hero', 'ctaSecondary')}
              contentEditableClassName="prose dark:prose-invert max-w-none"
              className="w-full min-h-[100px] border rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Features Section</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {intl.formatMessage({ id: 'settings.home.features.title' })}
            </label>
            <MDXEditor
              markdown={safeContent.content.features.title}
              onChange={(value) => debouncedOnChange(value, 'title', 'features')}
              plugins={createEditorPlugins('features', 'title')}
              contentEditableClassName="prose dark:prose-invert max-w-none"
              className="w-full min-h-[100px] border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {intl.formatMessage({ id: 'settings.home.features.subtitle' })}
            </label>
            <MDXEditor
              markdown={safeContent.content.features.subtitle}
              onChange={(value) => debouncedOnChange(value, 'subtitle', 'features')}
              plugins={createEditorPlugins('features', 'subtitle')}
              contentEditableClassName="prose dark:prose-invert max-w-none"
              className="w-full min-h-[100px] border rounded-md"
            />
          </div>

          <div className="space-y-6">
            <h4 className="font-medium">Feature Items</h4>
            {safeContent.content.features.items.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {intl.formatMessage({ id: 'settings.home.features.icon' })}
                  </label>
                  <select
                    value={item.icon}
                    onChange={(e) => {
                      const newItems = [...safeContent.content.features.items];
                      newItems[index] = { ...item, icon: e.target.value as any };
                      onChange({
                        ...safeContent,
                        content: { ...safeContent.content, features: { ...safeContent.content.features, items: newItems } }
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    {SUPPORTED_ICONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {intl.formatMessage({ id: 'settings.home.features.item.title' })}
                  </label>
                  <MDXEditor
                    markdown={item.title}
                    onChange={(value) => debouncedOnChange(value, 'title', 'features', index)}
                    plugins={createEditorPlugins('features', 'item', index)}
                    contentEditableClassName="prose dark:prose-invert max-w-none"
                    className="w-full min-h-[100px] border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {intl.formatMessage({ id: 'settings.home.features.item.description' })}
                  </label>
                  <MDXEditor
                    markdown={item.description}
                    onChange={(value) => debouncedOnChange(value, 'description', 'features', index)}
                    plugins={createEditorPlugins('features', 'item', index)}
                    contentEditableClassName="prose dark:prose-invert max-w-none"
                    className="w-full min-h-[100px] border rounded-md"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = safeContent.content.features.items.filter((_, i) => i !== index);
                      onChange({
                        ...safeContent,
                        content: { ...safeContent.content, features: { ...safeContent.content.features, items: newItems } }
                      });
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                onChange({
                  ...safeContent,
                  content: {
                    ...safeContent.content,
                    features: {
                      ...safeContent.content.features,
                      items: [
                        ...safeContent.content.features.items,
                      {
                        icon: 'Brain',
                        title: '',
                        description: ''
                      }
                      ]
                    }
                  }
                });
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Add Feature
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
              {intl.formatMessage({ id: 'settings.saving' })}
            </div>
          ) : (
            intl.formatMessage({ id: 'settings.save' })
          )}
        </button>
      </div>

      {isAIModalOpen && currentField && (
        <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>AI Content Generator</DialogTitle>
            </DialogHeader>
            <AIContentGenerator
              type={locale !== 'en' ? 'translation' : 'markdown'}
              onGenerated={(content) => {
                handleGeneratedContent(
                  currentField.section,
                  currentField.field,
                  content,
                  currentField.index
                );
                setIsAIModalOpen(false);
              }}
              sourceLocale={locale !== 'en' ? 'en' : undefined}
              targetLocale={locale}
              contentType="home"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const AIGeneratorWrapper = ({ 
  onGenerated, 
  sourceLocale, 
  targetLocale,
  contentType = 'home'
}: { 
  onGenerated: (content: string) => void;
  sourceLocale?: string;
  targetLocale: string;
  contentType?: string;
}) => {
  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-md border mb-4">
      <AIContentGenerator
        type={sourceLocale ? 'translation' : 'markdown'}
        onGenerated={onGenerated}
        sourceLocale={sourceLocale}
        targetLocale={targetLocale}
        contentType={contentType}
        className="mt-2"
      />
    </div>
  );
};

const Settings = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { role, isLoading: roleLoading } = useUserRole();
  const [contents, setContents] = useState({
    privacy: {} as Record<string, string>,
    terms: {} as Record<string, string>,
    home: {} as Record<string, HomeContent>
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchContents = async () => {
      try {
        const privacyPromises = SUPPORTED_LOCALES.map(locale => 
          contentApi.getPrivacyPolicy(locale)
        );
        const termsPromises = SUPPORTED_LOCALES.map(locale => 
          contentApi.getTerms(locale)
        );
        const homePromises = SUPPORTED_LOCALES.map(locale => 
          contentApi.getHomeContent(locale)
        );

        const [privacyResponses, termsResponses, homeResponses] = await Promise.all([
          Promise.all(privacyPromises),
          Promise.all(termsPromises),
          Promise.all(homePromises)
        ]);

        const privacyContent: Record<string, string> = {};
        const termsContent: Record<string, string> = {};
        const homeContent: Record<string, HomeContent> = {};

        SUPPORTED_LOCALES.forEach((locale, index) => {
          privacyContent[locale] = privacyResponses[index].content;
          termsContent[locale] = termsResponses[index].content;
          const homeResponse = homeResponses[index];
          if (homeResponse && homeResponse.content?.hero && homeResponse.content?.features) {
            homeContent[locale] = homeResponse;
          } else {
            console.error('Invalid home content structure:', homeResponse);
            homeContent[locale] = DEFAULT_HOME_CONTENT;
          }
        });

        setContents({
          privacy: privacyContent,
          terms: termsContent,
          home: homeContent
        });
      } catch (error) {
        console.error('Error fetching content:', error);
        toast.error(intl.formatMessage({ id: 'settings.error.fetch' }));
      } finally {
        setLoading(false);
      }
    };

    if (!roleLoading && role === 'admin') {
      fetchContents();
    }
  }, [roleLoading, role, navigate, intl]);

  const handleSave = async (type: 'privacy' | 'terms' | 'home', locale: string) => {
    try {
      const content = contents[type][locale];
      
      if (type === 'home') {
        const homeContent = content as HomeContent;
        if (!homeContent.content?.hero?.title || !homeContent.content?.hero?.subtitle) {
          toast.error(intl.formatMessage({ id: 'settings.error.required' }));
          return;
        }
        if (homeContent.content?.features?.items?.some(item => !item.title || !item.description)) {
          toast.error(intl.formatMessage({ id: 'settings.error.features.required' }));
          return;
        }
        
        await contentApi.updateHomeContent(locale, homeContent);
        toast.success(intl.formatMessage({ id: 'settings.home.save.success' }));
      } else {
        if (type === 'privacy') {
          await contentApi.updatePrivacyPolicy(locale, content as string);
          } else if (type === 'terms') {
            await contentApi.updateTerms(locale, content as string);
        }
        
        toast.success(intl.formatMessage({ id: 'settings.success.save' }));
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error(intl.formatMessage({ id: 'settings.home.save.error' }));
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {intl.formatMessage({ id: 'settings.title' })}
      </h1>
      <Tabs defaultValue="privacy" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="privacy">
            {intl.formatMessage({ id: 'settings.privacy' })}
          </TabsTrigger>
          <TabsTrigger value="terms">
            {intl.formatMessage({ id: 'settings.terms' })}
          </TabsTrigger>
          <TabsTrigger value="home">
            {intl.formatMessage({ id: 'settings.home' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="privacy">
          <div className="mt-6 space-y-8">
            {SUPPORTED_LOCALES.map((locale) => (
              <div key={locale} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {intl.formatMessage({ id: `settings.locale.${locale}` })}
                  </h3>
                  <button
                    onClick={() => handleSave('privacy', locale)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {intl.formatMessage({ id: 'settings.save' })}
                  </button>
                </div>
                <MDXEditor
                  markdown={contents.privacy[locale] || ''}
                  onChange={(value) => {
                    setContents(prev => ({
                      ...prev,
                      privacy: {
                        ...prev.privacy,
                        [locale]: value || ''
                      }
                    }));
                  }}
                  plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin(),
                    linkPlugin(),
                    linkDialogPlugin(),
                    imagePlugin({
                      imageUploadHandler,
                      imageAutocompleteSuggestions: []
                    }),
                    tablePlugin(),
                    codeBlockPlugin(),
                    codeMirrorPlugin(),
                    diffSourcePlugin(),
                    frontmatterPlugin(),
                    toolbarPlugin({
                      toolbarContents: () => (
                        <>
                          <UndoRedo />
                          <BlockTypeSelect />
                          <BoldItalicUnderlineToggles />
                          <CodeToggle />
                          <CreateLink />
                          <InsertImage />
                          <InsertTable />
                          <InsertThematicBreak />
                          <ListsToggle />
                        </>
                      )
                    })
                  ]}
                  contentEditableClassName="prose dark:prose-invert max-w-none"
                  className="w-full min-h-[400px] border rounded-md p-4"
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="terms">
          <div className="mt-6 space-y-8">
            {SUPPORTED_LOCALES.map((locale) => (
              <div key={locale} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {intl.formatMessage({ id: `settings.locale.${locale}` })}
                  </h3>
                  <button
                    onClick={() => handleSave('terms', locale)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {intl.formatMessage({ id: 'settings.save' })}
                  </button>
                </div>
                <AIGeneratorWrapper
                  onGenerated={(content) => {
                    setContents(prev => ({
                      ...prev,
                      terms: {
                        ...prev.terms,
                        [locale]: content
                      }
                    }));
                  }}
                  sourceLocale={locale !== 'en' ? 'en' : undefined}
                  targetLocale={locale}
                />
                <MDXEditor
                  markdown={contents.terms[locale] || ''}
                  onChange={(value) => {
                    setContents(prev => ({
                      ...prev,
                      terms: {
                        ...prev.terms,
                        [locale]: value || ''
                      }
                    }));
                  }}
                  plugins={mdxEditorPlugins}
                  contentEditableClassName="prose dark:prose-invert max-w-none"
                  className="w-full min-h-[400px] border rounded-md p-4"
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="home">
          <div className="mt-6 space-y-8">
            {SUPPORTED_LOCALES.map((locale) => (
              <div key={locale} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {intl.formatMessage({ id: `settings.locale.${locale}` })}
                  </h3>
                </div>
                <HomeContentEditor
                  locale={locale}
                  content={contents.home[locale]}
                  onChange={(newContent) => {
                    setContents(prev => ({
                      ...prev,
                      home: {
                        ...prev.home,
                        [locale]: newContent
                      }
                    }));
                  }}
                  onSave={() => handleSave('home', locale)}
                />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings; 