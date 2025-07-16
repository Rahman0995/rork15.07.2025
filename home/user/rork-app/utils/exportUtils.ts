import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Report, Task, CalendarEvent } from '@/types';

export interface ExportData {
  title: string;
  data: any[] | any;
  type: 'pdf' | 'excel' | 'csv' | 'json';
  filename?: string;
}

export interface ExportOptions {
  includeHeaders?: boolean;
  dateFormat?: 'short' | 'long' | 'iso';
  fields?: string[];
}

export const exportToPDF = async (data: ExportData) => {
  // В реальном приложении здесь была бы интеграция с библиотекой для создания PDF
  // Например: react-native-html-to-pdf или @react-pdf/renderer
  
  Alert.alert(
    'Экспорт в PDF',
    `Экспорт "${data.title}" в PDF будет доступен в следующей версии приложения.`,
    [
      {
        text: 'OK',
        onPress: () => {
          console.log('PDF Export:', data);
        },
      },
    ]
  );
};

export const exportToExcel = async (data: ExportData) => {
  // В реальном приложении здесь была бы интеграция с библиотекой для создания Excel
  // Например: react-native-xlsx или подобной
  
  Alert.alert(
    'Экспорт в Excel',
    `Экспорт "${data.title}" в Excel будет доступен в следующей версии приложения.`,
    [
      {
        text: 'OK',
        onPress: () => {
          console.log('Excel Export:', data);
        },
      },
    ]
  );
};

export const exportToCSV = async (data: ExportData, options: ExportOptions = {}) => {
  try {
    const { includeHeaders = true, fields } = options;
    const filename = data.filename || `${data.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    
    if (data.data.length === 0) {
      Alert.alert('Ошибка', 'Нет данных для экспорта');
      return;
    }
    
    // Get headers from first object or use provided fields
    const headers = fields || Object.keys(data.data[0]);
    
    // Create CSV content
    let csvContent = '';
    
    if (includeHeaders) {
      csvContent += headers.join(',') + '\n';
    }
    
    data.data.forEach((row: any) => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvContent += values.join(',') + '\n';
    });
    
    // Save file
    const fileUri = FileSystem.documentDirectory + filename;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    // Share file if available
    if (Platform.OS !== 'web') {
      // On mobile, we would use expo-sharing here
      // For now, just show success message
      Alert.alert('Успех', `Файл сохранен: ${filename}`);
    } else {
      // On web, create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      Alert.alert('Успех', `Файл загружен: ${filename}`);
    }
    
  } catch (error) {
    console.error('CSV Export Error:', error);
    Alert.alert('Ошибка', 'Не удалось экспортировать данные в CSV');
  }
};

export const exportToJSON = async (data: ExportData) => {
  try {
    const filename = data.filename || `${data.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    const jsonContent = JSON.stringify({
      title: data.title,
      exportDate: new Date().toISOString(),
      data: data.data,
    }, null, 2);
    
    const fileUri = FileSystem.documentDirectory + filename;
    await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    if (Platform.OS !== 'web') {
      // On mobile, we would use expo-sharing here
      // For now, just show success message
      Alert.alert('Успех', `Файл сохранен: ${filename}`);
    } else {
      // On web, create download link
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      Alert.alert('Успех', `Файл загружен: ${filename}`);
    }
    
  } catch (error) {
    console.error('JSON Export Error:', error);
    Alert.alert('Ошибка', 'Не удалось экспортировать данные в JSON');
  }
};

export const shareReport = async (data: ExportData) => {
  if (Platform.OS === 'web') {
    Alert.alert('Информация', 'Функция "Поделиться" недоступна в веб-версии');
    return;
  }
  
  try {
    // Export as CSV first
    await exportToCSV(data);
  } catch (error) {
    Alert.alert('Ошибка', 'Не удалось поделиться отчетом');
  }
};

// Helper functions for specific data types
export const exportReports = async (reports: Report[], title: string = 'Отчеты') => {
  const exportData: ExportData = {
    title,
    type: 'csv',
    data: reports.map(report => ({
      id: report.id,
      title: report.title,
      author: report.authorId,
      status: report.status,
      priority: report.priority,
      unit: report.unit,
      createdAt: new Date(report.createdAt).toLocaleDateString('ru-RU'),
      updatedAt: new Date(report.updatedAt).toLocaleDateString('ru-RU'),
    })),
  };
  
  await exportToCSV(exportData);
};

export const exportTasks = async (tasks: Task[], title: string = 'Задачи') => {
  const exportData: ExportData = {
    title,
    type: 'csv',
    data: tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      assignedBy: task.createdBy,
      status: task.status,
      priority: task.priority,
      dueDate: new Date(task.dueDate).toLocaleDateString('ru-RU'),
      createdAt: new Date(task.createdAt).toLocaleDateString('ru-RU'),
      completedAt: task.completedAt ? new Date(task.completedAt).toLocaleDateString('ru-RU') : '',
    })),
  };
  
  await exportToCSV(exportData);
};

export const exportEvents = async (events: CalendarEvent[], title: string = 'События') => {
  const exportData: ExportData = {
    title,
    type: 'csv',
    data: events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      status: event.status,
      startDate: new Date(event.startDate).toLocaleDateString('ru-RU'),
      endDate: new Date(event.endDate).toLocaleDateString('ru-RU'),
      location: event.location || '',
      organizer: event.organizer,
      unit: event.unit,
      isAllDay: event.isAllDay ? 'Да' : 'Нет',
    })),
  };
  
  await exportToCSV(exportData);
};