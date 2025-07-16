import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView
} from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function PrivacyScreen() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Политика конфиденциальности',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.title}>Политика конфиденциальности</Text>
          <Text style={styles.lastUpdated}>Последнее обновление: 15 января 2025</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Общие положения</Text>
          <Text style={styles.text}>
            Настоящая Политика конфиденциальности определяет порядок обработки персональных данных 
            пользователей мобильного приложения для военных подразделений.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Сбор информации</Text>
          <Text style={styles.text}>
            Мы собираем следующие типы информации:
          </Text>
          <Text style={styles.bulletPoint}>• Личная информация (имя, email, телефон)</Text>
          <Text style={styles.bulletPoint}>• Служебная информация (звание, подразделение)</Text>
          <Text style={styles.bulletPoint}>• Данные об использовании приложения</Text>
          <Text style={styles.bulletPoint}>• Техническая информация об устройстве</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Использование информации</Text>
          <Text style={styles.text}>
            Собранная информация используется для:
          </Text>
          <Text style={styles.bulletPoint}>• Предоставления функций приложения</Text>
          <Text style={styles.bulletPoint}>• Обеспечения безопасности системы</Text>
          <Text style={styles.bulletPoint}>• Улучшения качества сервиса</Text>
          <Text style={styles.bulletPoint}>• Отправки уведомлений и обновлений</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Защита данных</Text>
          <Text style={styles.text}>
            Мы применяем современные методы защиты информации:
          </Text>
          <Text style={styles.bulletPoint}>• Шифрование данных при передаче</Text>
          <Text style={styles.bulletPoint}>• Безопасное хранение на серверах</Text>
          <Text style={styles.bulletPoint}>• Ограниченный доступ к данным</Text>
          <Text style={styles.bulletPoint}>• Регулярные аудиты безопасности</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Права пользователей</Text>
          <Text style={styles.text}>
            Вы имеете право:
          </Text>
          <Text style={styles.bulletPoint}>• Получать информацию о ваших данных</Text>
          <Text style={styles.bulletPoint}>• Исправлять неточные данные</Text>
          <Text style={styles.bulletPoint}>• Удалять ваши данные</Text>
          <Text style={styles.bulletPoint}>• Ограничивать обработку данных</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Файлы cookie</Text>
          <Text style={styles.text}>
            Приложение может использовать файлы cookie и аналогичные технологии для 
            улучшения пользовательского опыта и анализа использования.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Передача данных третьим лицам</Text>
          <Text style={styles.text}>
            Мы не передаем ваши персональные данные третьим лицам без вашего согласия, 
            за исключением случаев, предусмотренных законодательством.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Хранение данных</Text>
          <Text style={styles.text}>
            Персональные данные хранятся в течение периода, необходимого для достижения 
            целей обработки, или в соответствии с требованиями законодательства.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Изменения в политике</Text>
          <Text style={styles.text}>
            Мы оставляем за собой право изменять данную Политику конфиденциальности. 
            О существенных изменениях будет сообщено пользователям.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Контактная информация</Text>
          <Text style={styles.text}>
            По вопросам обработки персональных данных обращайтесь:
          </Text>
          <Text style={styles.bulletPoint}>• Email: privacy@military-app.com</Text>
          <Text style={styles.bulletPoint}>• Телефон: 8 (800) 123-45-67</Text>
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
    padding: 16,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 4,
  },
});