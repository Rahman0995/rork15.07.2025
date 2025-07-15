import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Linking,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { 
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Book,
  Video,
  Users,
  Bug
} from 'lucide-react-native';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'Как сбросить пароль?',
    answer: 'Для сброса пароля перейдите в настройки аккаунта и нажмите "Изменить пароль". На ваш email будет отправлена ссылка для сброса.'
  },
  {
    id: '2',
    question: 'Как включить двухфакторную аутентификацию?',
    answer: 'В настройках аккаунта найдите раздел "Безопасность" и включите переключатель "Двухфакторная аутентификация". Следуйте инструкциям для настройки.'
  },
  {
    id: '3',
    question: 'Как создать новый отчет?',
    answer: 'Перейдите на вкладку "Отчеты" и нажмите кнопку "+" в правом верхнем углу. Заполните необходимые поля и сохраните отчет.'
  },
  {
    id: '4',
    question: 'Как назначить задачу другому пользователю?',
    answer: 'При создании или редактировании задачи выберите исполнителя в поле "Назначить". Доступны только пользователи вашего подразделения.'
  },
  {
    id: '5',
    question: 'Почему я не получаю уведомления?',
    answer: 'Проверьте настройки уведомлений в профиле и убедитесь, что разрешения на уведомления включены в настройках устройства.'
  },
  {
    id: '6',
    question: 'Как экспортировать данные?',
    answer: 'В разделе отчетов или задач нажмите на кнопку меню (три точки) и выберите "Экспорт". Данные можно экспортировать в форматах PDF или Excel.'
  }
];

const FAQItem: React.FC<{ item: FAQItem }> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity 
        style={styles.faqQuestion}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.faqQuestionText}>{item.question}</Text>
        {expanded ? (
          <ChevronUp size={20} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
      {expanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
};

export default function HelpScreen() {
  const router = useRouter();
  const handleContactSupport = () => {
    Alert.alert(
      'Связаться с поддержкой',
      'Выберите способ связи:',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Email', 
          onPress: () => Linking.openURL('mailto:support@military-app.com?subject=Поддержка приложения')
        },
        { 
          text: 'Телефон', 
          onPress: () => Linking.openURL('tel:+78001234567')
        }
      ]
    );
  };

  const handleReportBug = () => {
    Alert.alert(
      'Сообщить об ошибке',
      'Опишите проблему и отправьте отчет разработчикам.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Отправить', 
          onPress: () => Linking.openURL('mailto:bugs@military-app.com?subject=Отчет об ошибке')
        }
      ]
    );
  };

  const renderMenuItem = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          {icon}
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Помощь и поддержка',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Быстрые действия</Text>
          <View style={styles.card}>
            {renderMenuItem(
              <MessageCircle size={20} color={colors.primary} />,
              'Связаться с поддержкой',
              'Получить помощь от службы под��ержки',
              handleContactSupport
            )}
            
            {renderMenuItem(
              <Bug size={20} color={colors.primary} />,
              'Сообщить об ошибке',
              'Отправить отчет о найденной проблеме',
              handleReportBug
            )}
            
            {renderMenuItem(
              <FileText size={20} color={colors.primary} />,
              'Руководство пользователя',
              'Подробная инструкция по использованию',
              () => Alert.alert('Руководство', 'Руководство пользователя будет доступно в следующих версиях')
            )}
          </View>
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ресурсы</Text>
          <View style={styles.card}>
            {renderMenuItem(
              <Book size={20} color={colors.primary} />,
              'База знаний',
              'Статьи и инструкции',
              () => Alert.alert('База знаний', 'Раздел в разработке')
            )}
            
            {renderMenuItem(
              <Video size={20} color={colors.primary} />,
              'Видеоуроки',
              'Обучающие видео',
              () => Alert.alert('Видеоуроки', 'Раздел в разработке')
            )}
            
            {renderMenuItem(
              <Users size={20} color={colors.primary} />,
              'Сообщество',
              'Форум пользователей',
              () => Alert.alert('Сообщество', 'Раздел в разработке')
            )}
            
            {renderMenuItem(
              <FileText size={20} color={colors.primary} />,
              'Политика конфиденциальности',
              'Обработка и защита данных',
              () => router.push('/settings/privacy')
            )}
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Часто задаваемые вопросы</Text>
          <View style={styles.card}>
            {faqData.map((item) => (
              <FAQItem key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Контактная информация</Text>
          <View style={styles.card}>
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Mail size={20} color={colors.primary} />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Email поддержки</Text>
                <Text style={styles.contactValue}>support@military-app.com</Text>
              </View>
            </View>
            
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Phone size={20} color={colors.primary} />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Телефон поддержки</Text>
                <Text style={styles.contactValue}>8 (800) 123-45-67</Text>
              </View>
            </View>
            
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <HelpCircle size={20} color={colors.primary} />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Часы работы</Text>
                <Text style={styles.contactValue}>Пн-Пт: 9:00 - 18:00 (МСК)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>О приложении</Text>
          <View style={styles.card}>
            <View style={styles.appInfo}>
              <Text style={styles.appInfoLabel}>Версия приложения</Text>
              <Text style={styles.appInfoValue}>1.0.0</Text>
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appInfoLabel}>Последнее обновление</Text>
              <Text style={styles.appInfoValue}>15 января 2025</Text>
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appInfoLabel}>Платформа</Text>
              <Text style={styles.appInfoValue}>{Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  appInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appInfoLabel: {
    fontSize: 16,
    color: colors.text,
  },
  appInfoValue: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});