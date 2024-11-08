import React from 'react';
import { useIntl } from 'react-intl';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { codeBlockPlugin, codeMirrorPlugin, headingsPlugin, imagePlugin, linkPlugin, listsPlugin, MDXEditor, MDXEditorMethods, quotePlugin, tablePlugin } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

interface BlogPostProps {
  frontMatter: {
    title: string;
    date: string;
    author: {
      name: string;
      avatar: string;
    };
    readingTime: string;
    tags: string[];
  };
  content: string;
}

const BlogPost: React.FC<BlogPostProps> = ({ frontMatter, content }) => {
  const intl = useIntl();
  const editorRef = React.useRef<MDXEditorMethods>(null);

  return (
    <article className="max-w-4xl mx-auto px-6 py-16">
      <Link to="/blog" className="flex items-center text-gray-600 hover:text-gray-900 mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {intl.formatMessage({ id: 'blog.backToBlog' })}
      </Link>
      
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{frontMatter.title}</h1>
        <div className="flex items-center gap-x-4 text-sm text-gray-500">
          <time dateTime={frontMatter.date} className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            {new Date(frontMatter.date).toLocaleDateString()}
          </time>
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {frontMatter.readingTime}
          </div>
        </div>
        <div className="flex items-center mt-4">
          <img
            src={frontMatter.author.avatar}
            alt={frontMatter.author.name}
            className="h-10 w-10 rounded-full mr-4"
          />
          <span className="text-gray-900 font-medium">{frontMatter.author.name}</span>
        </div>
        <div className="flex gap-2 mt-4">
          {frontMatter.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="prose prose-lg prose-primary max-w-none">
        <MDXEditor
          ref={editorRef}
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
    </article>
  );
};

export default BlogPost; 