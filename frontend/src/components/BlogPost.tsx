import React from 'react';
import { useIntl } from 'react-intl';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

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
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
          className="markdown-body"
          components={{
            // Custom components for markdown elements
            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
            p: ({ node, ...props }) => <p className="my-4 leading-7" {...props} />,
            a: ({ node, ...props }) => (
              <a className="text-primary-600 hover:text-primary-800 underline" {...props} />
            ),
            ul: ({ node, ...props }) => <ul className="list-disc list-inside my-4" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-4" {...props} />,
            code: ({ inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div className="relative">
                  <div className="absolute right-2 top-2 text-xs text-gray-400">{match[1]}</div>
                  <pre className={`${className} rounded-lg p-4 bg-gray-900 text-white overflow-x-auto`}>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              ) : (
                <code className="bg-gray-100 rounded px-2 py-1 text-sm" {...props}>
                  {children}
                </code>
              );
            },
            pre: ({ node, ...props }) => (
              <pre className="bg-gray-900 rounded-lg p-4 my-4 overflow-x-auto" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-primary-200 pl-4 my-4 italic text-gray-700"
                {...props}
              />
            ),
            img: ({ node, ...props }) => (
              <img className="rounded-lg shadow-lg my-8" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
};

export default BlogPost; 