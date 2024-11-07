import React, { useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { X, Image, FileVideo, FileText } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { mediaApi } from '../../services/api';

interface MediaUploaderProps {
  onUploadComplete?: (url: string) => void;
  acceptedFileTypes?: 'image' | 'video' | 'document';
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUploadComplete,
  acceptedFileTypes = 'image'
}) => {
  const intl = useIntl();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);

    try {
      const response = await mediaApi.upload(acceptedFileTypes, formData);
      onUploadComplete?.(response.data.url);
    } catch (err) {
      console.error('Upload error:', err);
      setError(intl.formatMessage({ id: 'admin.media.error.upload' }));
    } finally {
      setUploading(false);
    }
  }, [acceptedFileTypes, onUploadComplete, intl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes === 'image' 
      ? { 'image/*': ['.jpg', '.jpeg', '.png', '.gif'] }
      : acceptedFileTypes === 'video'
      ? { 'video/*': ['.mp4', '.webm', '.mov'] }
      : { 'application/pdf': ['.pdf'], 'application/msword': ['.doc', '.docx'] },
    maxSize: 10485760, // 10MB
    multiple: false
  });

  const getIcon = () => {
    switch (acceptedFileTypes) {
      case 'image':
        return <Image className="h-8 w-8 text-gray-400" />;
      case 'video':
        return <FileVideo className="h-8 w-8 text-gray-400" />;
      case 'document':
        return <FileText className="h-8 w-8 text-gray-400" />;
      default:
        return <Image className="h-8 w-8 text-gray-400" />;
    }
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
          ${error ? 'border-red-500' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          {uploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          ) : (
            getIcon()
          )}
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? intl.formatMessage({ id: 'admin.media.dropHere' })
              : intl.formatMessage({ id: 'admin.media.dragDrop' })}
          </p>
        </div>
      </div>
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <X className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
