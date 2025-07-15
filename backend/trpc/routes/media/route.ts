import { z } from 'zod';
import { publicProcedure } from '../../create-context';

const mockFiles = [
  {
    id: '1',
    name: 'security-report.pdf',
    type: 'file' as const,
    url: 'https://example.com/files/security-report.pdf',
    size: 1024000, // 1MB
    uploadedBy: '1',
    createdAt: new Date().toISOString(),
    metadata: {
      mimeType: 'application/pdf',
      originalName: 'security-report.pdf',
    },
  },
  {
    id: '2',
    name: 'equipment-photo.jpg',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    size: 512000, // 512KB
    uploadedBy: '2',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    metadata: {
      mimeType: 'image/jpeg',
      originalName: 'equipment-photo.jpg',
      dimensions: { width: 800, height: 600 },
    },
  },
];

export const uploadFileProcedure = publicProcedure
  .input(z.object({
    name: z.string(),
    type: z.enum(['file', 'image', 'video']),
    size: z.number(),
    uploadedBy: z.string(),
    mimeType: z.string(),
    // In a real implementation, this would be a file upload
    data: z.string().optional(), // Base64 or file path
  }))
  .mutation(({ input }) => {
    const newFile = {
      id: `file_${Date.now()}`,
      name: input.name,
      type: input.type,
      url: `https://example.com/files/${input.name}`, // Mock URL
      size: input.size,
      uploadedBy: input.uploadedBy,
      createdAt: new Date().toISOString(),
      metadata: {
        mimeType: input.mimeType,
        originalName: input.name,
      },
    };
    
    mockFiles.push(newFile);
    return newFile;
  });

export const getFilesProcedure = publicProcedure
  .input(z.object({
    type: z.enum(['file', 'image', 'video']).optional(),
    uploadedBy: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional())
  .query(({ input }) => {
    let files = [...mockFiles];
    
    if (input?.type) {
      files = files.filter(file => file.type === input.type);
    }
    
    if (input?.uploadedBy) {
      files = files.filter(file => file.uploadedBy === input.uploadedBy);
    }
    
    // Sort by creation date (newest first)
    files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (input?.offset || input?.limit) {
      const offset = input.offset || 0;
      const limit = input.limit || 20;
      files = files.slice(offset, offset + limit);
    }
    
    return {
      files,
      total: mockFiles.length,
    };
  });

export const getFileByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }) => {
    const file = mockFiles.find(f => f.id === input.id);
    if (!file) {
      throw new Error('File not found');
    }
    return file;
  });

export const deleteFileProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    userId: z.string(), // Only the uploader or admin can delete
  }))
  .mutation(({ input }) => {
    const fileIndex = mockFiles.findIndex(f => f.id === input.id);
    if (fileIndex === -1) {
      throw new Error('File not found');
    }
    
    const file = mockFiles[fileIndex];
    
    // Check permissions (simplified - in real app, check user roles)
    if (file.uploadedBy !== input.userId) {
      throw new Error('Permission denied');
    }
    
    const deletedFile = mockFiles.splice(fileIndex, 1)[0];
    return { success: true, deletedFile };
  });

export const generateUploadUrlProcedure = publicProcedure
  .input(z.object({
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
  }))
  .mutation(({ input }) => {
    // In a real implementation, this would generate a signed URL for direct upload
    // to cloud storage (AWS S3, Google Cloud Storage, etc.)
    const uploadUrl = `https://example.com/upload/${Date.now()}_${input.fileName}`;
    const fileId = `file_${Date.now()}`;
    
    return {
      uploadUrl,
      fileId,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    };
  });

export const getStorageStatsProcedure = publicProcedure
  .input(z.object({
    userId: z.string().optional(),
  }).optional())
  .query(({ input }) => {
    let files = mockFiles;
    
    if (input?.userId) {
      files = files.filter(file => file.uploadedBy === input.userId);
    }
    
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const filesByType = {
      image: files.filter(f => f.type === 'image').length,
      file: files.filter(f => f.type === 'file').length,
      video: files.filter(f => f.type === 'video').length,
    };
    
    const sizeByType = {
      image: files.filter(f => f.type === 'image').reduce((sum, f) => sum + f.size, 0),
      file: files.filter(f => f.type === 'file').reduce((sum, f) => sum + f.size, 0),
      video: files.filter(f => f.type === 'video').reduce((sum, f) => sum + f.size, 0),
    };
    
    return {
      totalFiles: files.length,
      totalSize,
      filesByType,
      sizeByType,
      averageFileSize: files.length > 0 ? totalSize / files.length : 0,
    };
  });