import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Shield, Phone, Mail, MapPin } from 'lucide-react-native';
import { useTheme } from '@/constants/theme';

interface Person {
  id: string;
  name: string;
  rank: string;
  position: string;
  unit: string;
  phone?: string;
  email?: string;
  location?: string;
  status: 'active' | 'inactive' | 'leave';
}

interface PersonCardProps {
  person: Person;
  onPress?: (person: Person) => void;
  style?: any;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  onPress,
  style
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'leave':
        return colors.warning;
      case 'inactive':
        return colors.error;
      default:
        return colors.textTertiary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'leave':
        return 'В отпуске';
      case 'inactive':
        return 'Неактивен';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={() => onPress?.(person)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Shield size={20} color={colors.primary} />
        </View>
        
        <View style={styles.mainInfo}>
          <Text style={styles.name}>{person.rank} {person.name}</Text>
          <Text style={styles.position}>{person.position}</Text>
          <Text style={styles.unit}>{person.unit}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(person.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(person.status) }]}>
            {getStatusText(person.status)}
          </Text>
        </View>
      </View>
      
      {(person.phone || person.email || person.location) && (
        <View style={styles.contactInfo}>
          {person.phone && (
            <View style={styles.contactItem}>
              <Phone size={14} color={colors.textTertiary} />
              <Text style={styles.contactText}>{person.phone}</Text>
            </View>
          )}
          
          {person.email && (
            <View style={styles.contactItem}>
              <Mail size={14} color={colors.textTertiary} />
              <Text style={styles.contactText}>{person.email}</Text>
            </View>
          )}
          
          {person.location && (
            <View style={styles.contactItem}>
              <MapPin size={14} color={colors.textTertiary} />
              <Text style={styles.contactText}>{person.location}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
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
  avatarContainer: {
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
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  position: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  unit: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});