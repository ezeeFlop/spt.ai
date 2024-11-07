export interface MediaFile {
    url: string;
    filename: string;
    type: 'image' | 'video' | 'document';
    size: number;
    created_at: string;
  }