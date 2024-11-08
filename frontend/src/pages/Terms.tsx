import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { contentApi } from '../services/api';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  linkPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

const Terms = () => {
  const intl = useIntl();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await contentApi.getTerms(intl.locale);
        setContent(response.content);
      } catch (error) {
        console.error('Error fetching terms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [intl.locale]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="prose prose-lg max-w-none markdown-body">
        <MDXEditor
          markdown={content}
          readOnly
          contentEditableClassName="prose dark:prose-invert max-w-none"
          className="w-full border-none focus:outline-none"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            linkPlugin(),
            imagePlugin(),
            tablePlugin(),
            codeBlockPlugin({
              defaultCodeBlockLanguage: 'typescript'
            }),
            codeMirrorPlugin(),
          ]}
        />
      </div>
    </div>
  );
};

export default Terms; 