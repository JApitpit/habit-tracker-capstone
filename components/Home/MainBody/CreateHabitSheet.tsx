import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { COLORS } from '../../../styles/globalStyles';

type CreateHabitSheetProps = {
  onClose: () => void;
  onCreateHabit: (newHabit: {
    id: string;
    title: string;
    subtitle?: string;
    currentCount: number;
    targetCount: number;
    repetition: 'Daily' | 'Weekly' | 'One Time';
    reminderEnabled: boolean;
    reminderTime?: string;
    notificationId?: string | null;
  }) => void;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CreateHabitSheet = forwardRef<BottomSheet, CreateHabitSheetProps>(
  ({ onClose, onCreateHabit }, ref) => {
    const snapPoints = useMemo(() => ['55%', '82%', '96%'], []);

    const [createType, setCreateType] = useState<'habit' | 'todo'>('habit');
    const [itemName, setItemName] = useState('');
    const [repetition, setRepetition] = useState<'Daily' | 'Weekly' | 'One Time'>('Daily');
    const [notes, setNotes] = useState('');
    const [dueDate, setDueDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [counterAmount, setCounterAmount] = useState(1);

    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState<Date>(() => {
      const date = new Date();
      date.setHours(9, 0, 0, 0);
      return date;
    });
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
      const setupNotifications = async () => {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();

        if (existingStatus !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('habit-reminders', {
            name: 'Habit Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'default',
          });
        }
      };

      setupNotifications();
    }, []);

    const resetForm = () => {
      setCreateType('habit');
      setItemName('');
      setRepetition('Daily');
      setNotes('');
      setDueDate(new Date());
      setCounterAmount(1);
      setReminderEnabled(false);

      const date = new Date();
      date.setHours(9, 0, 0, 0);
      setReminderTime(date);

      setShowDatePicker(false);
      setShowTimePicker(false);
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString();
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
    };

    const onChangeDate = (_event: any, selectedDate?: Date) => {
      setShowDatePicker(false);
      if (selectedDate) {
        setDueDate(selectedDate);
      }
    };

    const onChangeTime = (_event: any, selectedTime?: Date) => {
      setShowTimePicker(false);
      if (selectedTime) {
        setReminderTime(selectedTime);
      }
    };

    const decreaseCounter = () => {
      setCounterAmount((prev) => Math.max(1, prev - 1));
    };

    const increaseCounter = () => {
      setCounterAmount((prev) => prev + 1);
    };

    const scheduleReminder = async (): Promise<string | null> => {
      if (!reminderEnabled) return null;

      const { status } = await Notifications.getPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Notifications disabled', 'Please allow notifications to use reminders.');
        return null;
      }

      const title = itemName.trim() || (createType === 'habit' ? 'Habit Reminder' : 'To Do Reminder');
      const body =
        createType === 'habit'
          ? `Time to work on "${title}".`
          : `Reminder for "${title}".`;

      if (createType === 'habit') {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: reminderTime.getHours(),
            minute: reminderTime.getMinutes(),
            channelId: 'habit-reminders',
          },
        });

        return id;
      } else {
        const triggerDate = new Date(dueDate);
        triggerDate.setHours(reminderTime.getHours());
        triggerDate.setMinutes(reminderTime.getMinutes());
        triggerDate.setSeconds(0);
        triggerDate.setMilliseconds(0);

        if (triggerDate.getTime() <= Date.now()) {
          Alert.alert('Invalid reminder', 'Pick a future due date and time.');
          return null;
        }

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
            channelId: 'habit-reminders',
          },
        });

        return id;
      }
    };

    const handleCreate = async () => {
      const trimmedName = itemName.trim();
      const trimmedNotes = notes.trim();

      if (!trimmedName) {
        Alert.alert('Missing name', 'Please enter a habit name.');
        return;
      }

      if (createType !== 'habit') {
        Alert.alert('Not ready yet', 'To Do creation is not wired up yet. Switch to Habit for now.');
        return;
      }

      try {
        const notificationId = await scheduleReminder();

        onCreateHabit({
          id: Date.now().toString(),
          title: trimmedName,
          subtitle: trimmedNotes,
          currentCount: 0,
          targetCount: counterAmount,
          repetition,
          reminderEnabled,
          reminderTime: reminderEnabled ? reminderTime.toISOString() : '',
          notificationId: reminderEnabled ? notificationId : null,
        });

        resetForm();
        onClose();
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Could not create item.');
      }
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableContentPanningGesture
        enableHandlePanningGesture
        overDragResistanceFactor={2}
        onClose={onClose}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handle}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          bounces
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
        >
          <Text style={styles.title}>
            {createType === 'habit' ? 'Create a Habit' : 'Create a To Do'}
          </Text>

          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            <Pressable
              onPress={() => setCreateType('habit')}
              style={[
                styles.typeButton,
                createType === 'habit' && styles.activeButton,
              ]}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  createType === 'habit' && styles.activeButtonText,
                ]}
              >
                Habit
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setCreateType('todo')}
              style={[
                styles.typeButton,
                createType === 'todo' && styles.activeButton,
              ]}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  createType === 'todo' && styles.activeButtonText,
                ]}
              >
                To Do
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>
            {createType === 'habit' ? 'Habit Name' : 'To Do Name'}
          </Text>
          <TextInput
            value={itemName}
            onChangeText={setItemName}
            placeholder={createType === 'habit' ? 'Enter habit name' : 'Enter to do name'}
            placeholderTextColor="#cfcfcf"
            style={styles.input}
          />

          {createType === 'habit' ? (
            <>
              <Text style={styles.label}>Repetition</Text>
              <View style={styles.repeatRow}>
                <Pressable
                  onPress={() => setRepetition('Daily')}
                  style={[
                    styles.repeatButton,
                    repetition === 'Daily' && styles.activeButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.repeatText,
                      repetition === 'Daily' && styles.activeButtonText,
                    ]}
                  >
                    Daily
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setRepetition('Weekly')}
                  style={[
                    styles.repeatButton,
                    repetition === 'Weekly' && styles.activeButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.repeatText,
                      repetition === 'Weekly' && styles.activeButtonText,
                    ]}
                  >
                    Weekly
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setRepetition('One Time')}
                  style={[
                    styles.repeatButton,
                    repetition === 'One Time' && styles.activeButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.repeatText,
                      repetition === 'One Time' && styles.activeButtonText,
                    ]}
                  >
                    One Time
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.label}>Counter Amount</Text>
              <View style={styles.counterRow}>
                <Pressable style={styles.counterButton} onPress={decreaseCounter}>
                  <Text style={styles.counterButtonText}>-</Text>
                </Pressable>

                <View style={styles.counterValueBox}>
                  <Text style={styles.counterValueText}>{counterAmount}</Text>
                </View>

                <Pressable style={styles.counterButton} onPress={increaseCounter}>
                  <Text style={styles.counterButtonText}>+</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Due Date</Text>
              <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </>
          )}

          <Text style={styles.label}>Reminder</Text>
          <View style={styles.reminderRow}>
            <Text style={styles.reminderText}>Enable Reminder</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: '#666', true: COLORS.sunshineYellow }}
              thumbColor={reminderEnabled ? COLORS.deepMidnightBlue : '#f4f3f4'}
            />
          </View>

          {reminderEnabled && (
            <>
              <Text style={styles.label}>Reminder Time</Text>
              <Pressable style={styles.input} onPress={() => setShowTimePicker(true)}>
                <Text style={styles.dateText}>{formatTime(reminderTime)}</Text>
              </Pressable>

              {showTimePicker && (
                <DateTimePicker
                  value={reminderTime}
                  mode="time"
                  display="default"
                  onChange={onChangeTime}
                />
              )}
            </>
          )}

          <Text style={styles.label}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes"
            placeholderTextColor="#cfcfcf"
            style={styles.notesInput}
            multiline
            textAlignVertical="top"
          />

          <Pressable style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>
              {createType === 'habit' ? 'Create Habit' : 'Create To Do'}
            </Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

export default CreateHabitSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.deepMidnightBlue,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },

  handle: {
    backgroundColor: '#4fd6d2',
    width: 70,
    height: 5,
    borderRadius: 999,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },

  title: {
    textAlign: 'center',
    color: COLORS.sunshineYellow,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 28,
    marginTop: 8,
  },

  label: {
    color: COLORS.sunshineYellow,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 12,
  },

  input: {
    borderWidth: 1.5,
    borderColor: COLORS.sunshineYellow,
    borderRadius: 8,
    minHeight: 42,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginBottom: 18,
    color: 'white',
  },

  dateText: {
    color: 'white',
    fontSize: 15,
  },

  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  typeButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.sunshineYellow,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },

  typeButtonText: {
    color: COLORS.sunshineYellow,
    fontWeight: '600',
  },

  repeatRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  repeatButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.sunshineYellow,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },

  repeatText: {
    color: COLORS.sunshineYellow,
    fontWeight: '600',
  },

  activeButton: {
    backgroundColor: COLORS.sunshineYellow,
  },

  activeButtonText: {
    color: COLORS.deepMidnightBlue,
    fontWeight: '700',
  },

  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },

  counterButton: {
    width: 52,
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.sunshineYellow,
    borderRadius: 10,
    backgroundColor: COLORS.sunshineYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  counterButtonText: {
    color: COLORS.deepMidnightBlue,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30,
  },

  counterValueBox: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: COLORS.sunshineYellow,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  counterValueText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },

  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: COLORS.sunshineYellow,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 52,
  },

  reminderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  notesInput: {
    borderWidth: 1.5,
    borderColor: COLORS.sunshineYellow,
    borderRadius: 8,
    minHeight: 150,
    marginBottom: 18,
    color: 'white',
    paddingHorizontal: 12,
    paddingTop: 12,
  },

  createButton: {
    backgroundColor: COLORS.sunshineYellow,
    borderRadius: 10,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  createButtonText: {
    color: COLORS.deepMidnightBlue,
    fontSize: 18,
    fontWeight: '700',
  },
});