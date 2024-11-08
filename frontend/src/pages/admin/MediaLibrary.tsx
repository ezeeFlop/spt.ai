import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Tabs, TabsList, TabsTrigger } from '../../components/Tabs';
import MediaUploader from '../../components/admin/MediaUploader';
import { mediaApi } from '../../services/api';
import { Copy, Check, FileVideo, FileText, AlertCircle, FolderOpen, Trash2 } from 'lucide-react';
import ErrorBoundary from '../../components/ErrorBoundary';

const MediaLibrary: React.FC = () => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'document'>('image');
  const [files, setFiles] = useState<Array<{ url: string; filename: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      const response = await mediaApi.listFiles(activeTab);
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(intl.formatMessage({ id: 'admin.media.error.fetch' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [activeTab]);

  const handleUploadComplete = () => {
    fetchFiles();
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = async (filename: string) => {
    if (window.confirm(intl.formatMessage({ id: 'admin.media.confirmDelete' }))) {
      try {
        await mediaApi.deleteFile(activeTab, filename);
        setFiles(files.filter(file => file.filename !== filename));
      } catch (error) {
        console.error('Error deleting file:', error);
        setError(intl.formatMessage({ id: 'admin.media.error.delete' }));
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {intl.formatMessage({ id: 'admin.media.title' })}
        </h1>

        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList>
            <TabsTrigger value="image">
              {intl.formatMessage({ id: 'admin.media.images' })}
            </TabsTrigger>
            <TabsTrigger value="video">
              {intl.formatMessage({ id: 'admin.media.videos' })}
            </TabsTrigger>
            <TabsTrigger value="document">
              {intl.formatMessage({ id: 'admin.media.documents' })}
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <MediaUploader
              acceptedFileTypes={activeTab}
              onUploadComplete={handleUploadComplete}
            />
          </div>

          <div className="mt-8">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-5 w-5 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))
              ) : files.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No files</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {intl.formatMessage({ id: 'admin.media.noFiles' })}
                  </p>
                </div>
              ) : (
                files.map((file) => (
                  <div key={file.url} className="border rounded-lg p-4 group hover:border-primary-500 transition-colors">
                    <div className="relative">
                      {activeTab === 'image' ? (
                        <img
                          src={file.url}
                          alt={file.filename}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                          {activeTab === 'video' ? (
                            <FileVideo className="h-12 w-12 text-gray-400" />
                          ) : (
                            <FileText className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 truncate max-w-[80%]">
                        {file.filename}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(file.url)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                          title="Copy URL"
                        >
                          {copiedUrl === file.url ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(file.filename)}
                          className="text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};

export default MediaLibrary;
