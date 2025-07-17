import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Shield, Phone, Mail, MapPin } from 'lucide-react-native';
import { useTheme } from '@/constants/theme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate
} from 'react-native-reanimated';

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
  viewMode?: 'list' | 'grid';
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  onPress,
  style,
  viewMode = 'list'
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors, viewMode);
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  
  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (viewMode === 'grid') {
    return (
      <Animated.View style={[animatedStyle, style]}>
        <TouchableOpacity 
          style={styles.container}
          onPress={() => onPress?.(person)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={styles.gridHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{getInitials(person.name)}</Text>
            </View>
            <View style={[styles.gridStatusDot, { backgroundColor: getStatusColor(person.status) }]} />
          </View>
          
          <View style={styles.gridContent}>
            <Text style={styles.gridName} numberOfLines={2}>
              {person.name}
            </Text>
            <Text style={styles.gridRank}>{person.rank}</Text>
            <Text style={styles.gridPosition} numberOfLines={2}>
              {person.position}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity 
        style={styles.container}
        onPress={() => onPress?.(person)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(person.name)}</Text>
        </View>
        
        <View style={styles.mainInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{person.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(person.status) + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(person.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(person.status) }]}>
                {getStatusText(person.status)}
              </Text>
            </View>
          </View>
          <Text style={styles.rank}>{person.rank}</Text>
          <Text style={styles.position}>{person.position}</Text>
          <Text style={styles.unit}>{person.unit}</Text>
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
    </Animated.View>
  );
};

const createStyles = (colors: any, viewMode: 'list' | 'grid') => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: viewMode === 'grid' ? 16 : 12,
    padding: viewMode === 'grid' ? 16 : 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    ...(viewMode === 'grid' && {
      minHeight: 160,
      justifyContent: 'space-between',
    }),
  },
  
  // List View Styles
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    width: viewMode === 'grid' ? 48 : 52,
    height: viewMode === 'grid' ? 48 : 52,
    borderRadius: viewMode === 'grid' ? 24 : 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: viewMode === 'grid' ? 0 : 16,
  },
  avatarText: {
    fontSize: viewMode === 'grid' ? 16 : 18,
    fontWeight: '700' as const,
    color: colors.white,
  },
  mainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  rank: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.primary,
    marginBottom: 4,
  },
  position: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  unit: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  contactInfo: {
    gap: 10,
    paddingTop: 4,
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

  // Grid View Styles
  gridHeader: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  gridContent: {
    alignItems: 'center',
  },
  gridName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 18,
  },
  gridRank: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.primary,
    marginBottom: 4,
  },
  gridPosition: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  gridStatusDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.card,
  },
});