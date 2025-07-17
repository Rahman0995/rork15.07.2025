import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, FolderOpen, Calendar, Settings, Shield, FileText } from 'lucide-react-native';
import { useTheme } from '@/constants/theme';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  route: string;
  color: string;
}

export const QuickActions: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();

  const quickActions: QuickAction[] = [
    {
      id: 'documents',
      title: 'Документы',
      subtitle: 'Документооборот',
      icon: FolderOpen,
      route: '/documents',
      color: colors.secondary,
    },
    {
      id: 'calendar',
      title: 'Календарь',
      subtitle: 'События и планы',
      icon: Calendar,
      route: '/calendar',
      color: colors.success,
    },
  ];

  const handleActionPress = (action: QuickAction) => {
    router.push(action.route as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Быстрые действия</Text>
      
      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionCard}
            onPress={() => handleActionPress(action)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.color + '20' }]}>
              <action.icon size={24} color={action.color} />
            </View>
            
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});