import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/constants/theme';
import { User } from '@/types';

interface AvatarProps {
  uri?: string;
  name?: string;
  user?: User;
  size?: number;
  showBadge?: boolean;
  online?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  uri, 
  name, 
  user,
  size = 40, 
  showBadge = false,
  online = false
}) => {
  const { colors } = useTheme();
  const displayName = name || user?.name || 'User';
  const avatarUri = uri || user?.avatar;
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={{ width: size, height: size }}>
      {avatarUri ? (
        <Image
          source={{ uri: avatarUri }}
          style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[
          styles.placeholder, 
          { width: size, height: size, borderRadius: size / 2 }
        ]}>
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
            {getInitials(displayName)}
          </Text>
        </View>
      )}
      
      {showBadge && (
        <View style={[
          styles.badge,
          { backgroundColor: online ? colors.success : colors.inactive }
        ]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.border,
  },
  placeholder: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: 'white',
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.background,
  },
});