import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FileText, Download, Eye, Calendar, User } from 'lucide-react-native';
import { useTheme } from '@/constants/theme';

interface Document {
  id: string;
  title: string;
  type: string;
  size: string;
  createdAt: string;
  author: string;
  status: 'draft' | 'approved' | 'pending' | 'rejected';
}

interface DocumentCardProps {
  document: Document;
  onPress?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  style?: any;
  viewMode?: 'list' | 'grid';
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPress,
  onDownload,
  style,
  viewMode = 'list'
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'rejected':
        return colors.error;
      case 'draft':
        return colors.textTertiary;
      default:
        return colors.textTertiary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Утвержден';
      case 'pending':
        return 'На рассмотрении';
      case 'rejected':
        return 'Отклонен';
      case 'draft':
        return 'Черновик';
      default:
        return 'Неизвестно';
    }
  };

  const getTypeIcon = (type: string) => {
    return <FileText size={20} color={colors.primary} />;
  };

  if (viewMode === 'grid') {
    return (
      <TouchableOpacity 
        style={[styles.containerGrid, style]}
        onPress={() => onPress?.(document)}
        activeOpacity={0.7}
      >
        <View style={styles.headerGrid}>
          <View style={styles.iconContainer}>
            {getTypeIcon(document.type)}
          </View>
          <View style={[styles.statusBadgeGrid, { backgroundColor: getStatusColor(document.status) + '20' }]}>
            <Text style={[styles.statusTextGrid, { color: getStatusColor(document.status) }]}>
              {getStatusText(document.status)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.titleGrid} numberOfLines={2}>
          {document.title}
        </Text>
        
        <Text style={styles.typeGrid}>{document.type}</Text>
        
        <View style={styles.metadataGrid}>
          <Text style={styles.metadataTextGrid}>{document.author}</Text>
          <Text style={styles.sizeGrid}>{document.size}</Text>
        </View>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionButtonGrid}
            onPress={() => onPress?.(document)}
          >
            <Eye size={14} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButtonGrid}
            onPress={() => onDownload?.(document)}
          >
            <Download size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={() => onPress?.(document)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {getTypeIcon(document.type)}
        </View>
        
        <View style={styles.mainInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {document.title}
          </Text>
          <Text style={styles.type}>{document.type}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(document.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(document.status) }]}>
            {getStatusText(document.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.metadata}>
        <View style={styles.metadataItem}>
          <User size={14} color={colors.textTertiary} />
          <Text style={styles.metadataText}>{document.author}</Text>
        </View>
        
        <View style={styles.metadataItem}>
          <Calendar size={14} color={colors.textTertiary} />
          <Text style={styles.metadataText}>{document.createdAt}</Text>
        </View>
        
        <Text style={styles.size}>{document.size}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onPress?.(document)}
        >
          <Eye size={16} color={colors.primary} />
          <Text style={styles.actionText}>Просмотр</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onDownload?.(document)}
        >
          <Download size={16} color={colors.primary} />
          <Text style={styles.actionText}>Скачать</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  // List view styles
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mainInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  size: {
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: 'auto',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.primary,
  },

  // Grid view styles
  containerGrid: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 180,
  },
  headerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusBadgeGrid: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusTextGrid: {
    fontSize: 10,
    fontWeight: '500' as const,
  },
  titleGrid: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  typeGrid: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  metadataGrid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  metadataTextGrid: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  sizeGrid: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButtonGrid: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
});