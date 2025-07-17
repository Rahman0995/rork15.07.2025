import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Animated } from 'react-native';
import { ChatMessage as ChatMessageType } from '@/types';
import { formatTime } from '@/utils/dateUtils';
import { useTheme } from '@/constants/theme';
import { File, Play, Pause, Download } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
  showAvatar?: boolean;
}

const VoiceMessage: React.FC<{ 
  attachment: any; 
  isCurrentUser: boolean;
}> = ({ attachment, isCurrentUser }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(attachment.duration || 0);
  const pulseAnim = useState(new Animated.Value(1))[0];
  
  useEffect(() => {
    if (isPlaying) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying, pulseAnim]);
  
  const playPauseAudio = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Недоступно', 'Воспроизведение голосовых сообщений недоступно в веб-версии');
      return;
    }
    
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: attachment.url },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);
        
        newSound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis || 0);
            if (status.durationMillis) {
              setDuration(Math.floor(status.durationMillis / 1000));
            }
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
            }
          }
        });
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось воспроизвести голосовое сообщение');
    }
  };
  
  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = duration > 0 ? (position / 1000) / duration : 0;
  
  // Generate waveform bars with more realistic pattern
  const generateWaveformBars = () => {
    const bars = [];
    const barCount = 30;
    // Create a more realistic waveform pattern
    const waveformPattern = [
      0.3, 0.5, 0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.8, 0.3,
      0.6, 0.9, 0.7, 0.4, 0.8, 0.5, 0.6, 0.9, 0.3, 0.7,
      0.4, 0.8, 0.6, 0.5, 0.9, 0.3, 0.7, 0.4, 0.8, 0.5
    ];
    
    for (let i = 0; i < barCount; i++) {
      const height = waveformPattern[i] || 0.5;
      const isActive = progress > i / barCount;
      bars.push(
        <View
          key={i}
          style={[
            styles.waveformBar,
            {
              height: `${height * 100}%`,
              backgroundColor: isActive 
                ? (isCurrentUser ? 'rgba(255,255,255,0.9)' : colors.primary)
                : (isCurrentUser ? 'rgba(255,255,255,0.3)' : colors.border),
              opacity: isActive ? 1 : 0.6
            }
          ]}
        />
      );
    }
    return bars;
  };
  
  return (
    <View style={styles.voiceContainer}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity onPress={playPauseAudio} style={[
          styles.playButton,
          { backgroundColor: isCurrentUser ? 'rgba(255,255,255,0.2)' : colors.primaryLight }
        ]}>
        {isPlaying ? (
          <Pause size={18} color={isCurrentUser ? 'white' : colors.primary} />
        ) : (
          <Play size={18} color={isCurrentUser ? 'white' : colors.primary} style={{ marginLeft: 2 }} />
        )}
        </TouchableOpacity>
      </Animated.View>
      
      <View style={styles.waveformContainer}>
        <View style={styles.waveform}>
          {generateWaveformBars()}
        </View>
        <Text style={[
          styles.voiceDuration,
          { color: isCurrentUser ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
        ]}>
          {isPlaying ? formatDuration(Math.floor(position / 1000)) : formatDuration(duration)}
        </Text>
      </View>
    </View>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isCurrentUser,
  showAvatar = false,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const handleFileDownload = () => {
    if (message.attachment) {
      Alert.alert(
        'Скачать файл',
        `Скачать ${message.attachment.name}?`,
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Скачать', onPress: () => {
            // In a real app, this would download the file
            Alert.alert('Скачивание', 'Файл будет скачан');
          }}
        ]
      );
    }
  };
  
  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <View>
            {message.attachment && (
              <Image 
                source={{ uri: message.attachment.url }} 
                style={styles.imageMessage}
                resizeMode="cover"
              />
            )}
            {message.text && (
              <Text style={[
                styles.text,
                isCurrentUser ? styles.currentUserText : styles.otherUserText,
                { marginTop: 8 }
              ]}>
                {message.text}
              </Text>
            )}
          </View>
        );
      
      case 'file':
        return (
          <TouchableOpacity onPress={handleFileDownload} style={styles.fileContainer}>
            <File size={24} color={isCurrentUser ? 'white' : colors.primary} />
            <View style={styles.fileInfo}>
              <Text style={[
                styles.fileName,
                { color: isCurrentUser ? 'white' : colors.text }
              ]}>
                {message.attachment?.name || 'Файл'}
              </Text>
              {message.attachment?.size && (
                <Text style={[
                  styles.fileSize,
                  { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
                ]}>
                  {(message.attachment.size / 1024 / 1024).toFixed(1)} МБ
                </Text>
              )}
            </View>
            <Download size={16} color={isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary} />
          </TouchableOpacity>
        );
      
      case 'voice':
        return message.attachment ? (
          <VoiceMessage 
            attachment={message.attachment} 
            isCurrentUser={isCurrentUser}
          />
        ) : null;
      
      default:
        return (
          <Text style={[
            styles.text,
            isCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {message.text}
          </Text>
        );
    }
  };
  
  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
    ]}>
      <View style={[
        styles.bubble,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        message.type === 'image' && styles.imageBubble
      ]}>
        {renderMessageContent()}
        <View style={[
          styles.timeContainer,
          message.type === 'image' && styles.imageTimeContainer
        ]}>
          <Text style={[
            styles.time,
            isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
            message.type === 'image' && styles.imageTime
          ]}>
            {formatTime(message.createdAt)}
          </Text>
          {isCurrentUser && (
            <Text style={[
              styles.readStatus,
              message.read ? styles.read : styles.unread,
              message.type === 'image' && styles.imageReadStatus
            ]}>
              {message.read ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  currentUserContainer: {
    alignSelf: 'flex-end',
  },
  otherUserContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 20,
  },
  imageBubble: {
    padding: 4,
    paddingBottom: 24,
  },
  currentUserBubble: {
    backgroundColor: colors.primary,
  },
  otherUserBubble: {
    backgroundColor: colors.border,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  currentUserText: {
    color: 'white',
  },
  otherUserText: {
    color: colors.text,
  },
  imageMessage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    marginTop: 2,
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 180,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  waveform: {
    flex: 1,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 12,
    paddingHorizontal: 4,
  },
  waveformBar: {
    width: 2.5,
    borderRadius: 1.25,
    minHeight: 6,
    maxHeight: 28,
  },
  voiceDuration: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 35,
    textAlign: 'right',
  },
  timeContainer: {
    position: 'absolute',
    right: 8,
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageTimeContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  time: {
    fontSize: 10,
  },
  imageTime: {
    color: 'white',
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTime: {
    color: colors.textSecondary,
  },
  readStatus: {
    fontSize: 10,
    marginLeft: 2,
  },
  imageReadStatus: {
    color: 'white',
  },
  read: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  unread: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});