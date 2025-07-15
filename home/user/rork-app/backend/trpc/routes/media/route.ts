import { z } from 'zod';
import { publicProcedure } from '../../create-context';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
  };
}

// Mock данные для медиа файлов
const mockMediaFiles: MediaFile[] = [
  {
    id: '1',
    name: 'report_photo.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    size: 245760,
    mimeType: 'image/jpeg',
    uploadedBy: '2',
    uploadedAt: new Date(2025, 7, 10).toISOString(),
    metadata: { width: 800, height: 600 },
  },
  {
    id: '2',
    name: 'training_video.mp4',
    type: 'video',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    size: 1048576,
    mimeType: 'video/mp4',
    uploadedBy: '3',
    uploadedAt: new Date(2025, 7, 8).toISOString(),
    metadata: { width: 1280, height: 720, duration: 30 },
  },
  {
    id: '3',
    name: 'equipment_manual.pdf',
    type: 'document',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    size: 524288,
    mimeType: 'application/pdf',
    uploadedBy: '1',
    uploadedAt: new Date(2025, 7, 5).toISOString(),
  },
];

export const uploadFileProcedure = publicProcedure
  .input(z.object({
    name: z.string(),
    type: z.enum(['image', 'video', 'document', 'audio']),
    size: z.number(),
    mimeType: z.string(),
    uploadedBy: z.string(),
    base64Data: z.string().optional(), // В реальном приложении файл будет загружаться через FormData
  }))
  .mutation(({ input }) => {
    // В реальном приложении здесь будет загрузка файла в облачное хранилище
    const newFile: MediaFile = {
      id: `file_${Date.now()}`,
      name: input.name,
      type: input.type,
      url: `https://mock-storage.com/files/${Date.now()}_${input.name}`,
      size: input.size,
      mimeType: input.mimeType,
      uploadedBy: input.uploadedBy,
      uploadedAt: new Date().toISOString(),
    };
    
    mockMediaFiles.push(newFile);
    return newFile;
  });

export const getFilesProcedure = publicProcedure
  .input(z.object({
    type: z.enum(['image', 'video', 'document', 'audio']).optional(),
    uploadedBy: z.string().optional(),
    limit: z.number().optional().default(20),
    offset: z.number().optional().default(0),
  }).optional())
  .query(({ input }) => {
    let files = [...mockMediaFiles];
    
    if (input?.type) {
      files = files.filter(file => file.type === input.type);
    }
    
    if (input?.uploadedBy) {
      files = files.filter(file => file.uploadedBy === input.uploadedBy);
    }
    
    // Сортировка по дате загрузки (новые первыми)
    files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    
    const paginatedFiles = files.slice(input?.offset || 0, (input?.offset || 0) + (input?.limit || 20));
    
    return {
      files: paginatedFiles,
      total: files.length,
    };
  });

export const getFileByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }) => {
    const file = mockMediaFiles.find(f => f.id === input.id);
    if (!file) {
      throw new Error('File not found');
    }
    return file;
  });

export const deleteFileProcedure = publicProcedure
  .input(z.object({ 
    id: z.string(),
    userId: z.string(), // Проверка прав доступа
  }))
  .mutation(({ input }) => {
    const fileIndex = mockMediaFiles.findIndex(f => f.id === input.id);
    if (fileIndex === -1) {
      throw new Error('File not found');
    }
    
    const file = mockMediaFiles[fileIndex];
    
    // Проверка прав доступа (только загрузивший может удалить)
    if (file.uploadedBy !== input.userId) {
      throw new Error('Access denied');
    }
    
    const deletedFile = mockMediaFiles.splice(fileIndex, 1)[0];
    
    // В реальном приложении здесь будет удаление файла из облачного хранилища
    
    return { success: true, deletedFile };
  });

export const generateUploadUrlProcedure = publicProcedure
  .input(z.object({
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
  }))
  .mutation(({ input }) => {
    // В реальном приложении здесь будет генерация подписанного URL для прямой загрузки в S3/CloudStorage
    return {
      uploadUrl: `https://mock-storage.com/upload/${Date.now()}_${input.fileName}`,
      fileId: `file_${Date.now()}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 минут
    };
  });

export const getStorageStatsProcedure = publicProcedure
  .input(z.object({ userId: z.string().optional() }).optional())
  .query(({ input }) => {
    let files = mockMediaFiles;
    
    if (input?.userId) {
      files = files.filter(f => f.uploadedBy === input.userId);
    }
    
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const typeStats = files.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalFiles: files.length,
      totalSize,
      typeStats,
      averageFileSize: files.length > 0 ? Math.round(totalSize / files.length) : 0,
    };
  });