import React, { useState, ReactElement } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInputProps,
  StyleProp,
  ViewStyle
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  isPassword?: boolean;
  icon?: ReactElement;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  isPassword = false,
  icon,
  ...props
}) => {
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : null,
        props.editable === false ? styles.inputDisabled : null
      ]}>
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.inactive}
          secureTextEntry={secureTextEntry}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={toggleSecureEntry} style={styles.eyeIcon}>
            {secureTextEntry ? (
              <Eye size={20} color={colors.textSecondary} />
            ) : (
              <EyeOff size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: colors.border,
    opacity: 0.7,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  eyeIcon: {
    padding: 10,
  },
  iconContainer: {
    paddingLeft: 12,
    justifyContent: 'center',
  },
});