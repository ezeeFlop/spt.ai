import React from 'react';
import { useBlog } from '../../context/BlogContext';

interface BlogSidebarProps {
  className?: string;
}

export const BlogSidebar: React.FC<BlogSidebarProps> = ({ className }) => {
  const { tags, selectedTag, setSelectedTag } = useBlog();

  return (
    <aside className={className}>
      <div className="sticky top-24">
        <h2 className="text-xl font-semibold mb-4">Popular Tags</h2>
        <div className="flex flex-col gap-2">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-4 py-2 rounded-full text-left ${
                tag === selectedTag 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
