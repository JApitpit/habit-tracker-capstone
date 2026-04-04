import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';

type TaskType = 'habit' | 'todo';
type RepetitionType = 'Daily' | 'Weekly' | 'One Time';

type TaskDetailsPromptProps = {
  type: TaskType;
  onClose: () => void;
  onSave?: (updatedItem: {
    title: string;
    subtitle: string;
    repetition?: RepetitionType;
    dueDate?: string;
    progress: number;
    targetCount: number;
    currentCount: number;
    reminderEnabled: boolean;
    reminderTime?: string;
    notificationId?: string | null;
  }) => void;
  onDelete?: () => void;

  title?: string;
  subtitle?: string;
  repetition?: RepetitionType;
  dueDate?: string;
  progress?: number;
  targetCount?: number;
  currentCount?: number;
  reminderEnabled?: boolean;
  reminderTime?: string;
  notificationId?: string | null;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const TaskDetailsPrompt = forwardRef<BottomSheet, TaskDetailsPromptProps>(
  (
    {
      type,
      onClose,
      onSave,
      onDelete,
      title = 'Task Title',
      subtitle = '',
      repetition = 'Daily',
      dueDate,
      progress = 0,
      targetCount = 1,
      currentCount = 0,
      reminderEnabled = false,
      reminderTime,
      notificationId = null,
    },
    ref
  ) => {
    const snapPoints = useMemo(() => ['60%', '85%', '98%'], []);

    const [editedTitle, setEditedTitle] = useState(title);
    const [editedSubtitle, setEditedSubtitle] = useState(subtitle);
    const [editedRepetition, setEditedRepetition] =
      useState<RepetitionType>(repetition);

    const [editedCurrentCount, setEditedCurrentCount] = useState(
      Math.max(0, currentCount)
    );
    const [editedTargetCount, setEditedTargetCount] = useState(
      Math.max(1, targetCount)
    );

    const [editedDueDate, setEditedDueDate] = useState<Date>(
      dueDate ? new Date(dueDate) : new Date()
    );
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [editedReminderEnabled, setEditedReminderEnabled] =
      useState(reminderEnabled);
    const [editedReminderTime, setEditedReminderTime] = useState<Date>(() => {
      if (reminderTime) {
        const parsed = new Date(reminderTime);
        if (!isNaN(parsed.getTime())) return parsed;
      }
      const d = new Date();
      d.setHours(9, 0, 0, 0);
      return d;
    });
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [editedNotificationId, setEditedNotificationId] = useState<
      string | null
    >(notificationId);

    useEffect(() => {
      const setupNotifications = async () => {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
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

    useEffect(() => {
      setEditedTitle(title);
      setEditedSubtitle(subtitle);
      setEditedRepetition(repetition);
      setEditedCurrentCount(Math.max(0, currentCount));
      setEditedTargetCount(Math.max(1, targetCount));
      setEditedDueDate(dueDate ? new Date(dueDate) : new Date());
      setEditedReminderEnabled(reminderEnabled);
      setEditedNotificationId(notificationId);

      if (reminderTime) {
        const parsed = new Date(reminderTime);
        if (!isNaN(parsed.getTime())) {
          setEditedReminderTime(parsed);
        }
      }
    }, [
      title,
      subtitle,
      repetition,
      dueDate,
      currentCount,
      targetCount,
      reminderEnabled,
      reminderTime,
      notificationId,
    ]);

    const clampedCurrent = Math.min(editedCurrentCount, editedTargetCount);
    const calculatedProgress =
      editedTargetCount > 0 ? clampedCurrent / editedTargetCount : 0;

    const formatDate = (date: Date) => date.toLocaleDateString();

    const formatTime = (date: Date) =>
      date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });

    const onChangeDate = (_event: any, selectedDate?: Date) => {
      setShowDatePicker(false);
      if (selectedDate) {
        setEditedDueDate(selectedDate);
      }
    };

    const onChangeTime = (_event: any, selectedTime?: Date) => {
      setShowTimePicker(false);
      if (selectedTime) {
        setEditedReminderTime(selectedTime);
      }
    };

    const decreaseProgress = () => {
      setEditedCurrentCount((prev) => Math.max(0, prev - 1));
    };

    const increaseProgress = () => {
      setEditedCurrentCount((prev) => Math.min(editedTargetCount, prev + 1));
    };

    const decreaseTarget = () => {
      setEditedTargetCount((prev) => {
        const next = Math.max(1, prev - 1);
        setEditedCurrentCount((current) => Math.min(current, next));
        return next;
      });
    };

    const increaseTarget = () => {
      setEditedTargetCount((prev) => prev + 1);
    };

    const cancelExistingReminder = async () => {
      if (!editedNotificationId) return;

      try {
        await Notifications.cancelScheduledNotificationAsync(
          editedNotificationId
        );
        setEditedNotificationId(null);
      } catch (error) {
        console.log('Could not cancel reminder:', error);
      }
    };

    const scheduleReminder = async (): Promise<string | null> => {
      if (!editedReminderEnabled) {
        await cancelExistingReminder();
        return null;
      }

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Notifications disabled',
          'Please allow notifications to use reminders.'
        );
        return editedNotificationId;
      }

      await cancelExistingReminder();

      const cleanedTitle = editedTitle.trim() || 'Reminder';
      const body =
        type === 'habit'
          ? `Time to work on "${cleanedTitle}".`
          : `Reminder for "${cleanedTitle}".`;

      if (type === 'habit') {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: cleanedTitle,
            body,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: editedReminderTime.getHours(),
            minute: editedReminderTime.getMinutes(),
            channelId: 'habit-reminders',
          },
        });

        setEditedNotificationId(id);
        return id;
      }

      const triggerDate = new Date(editedDueDate);
      triggerDate.setHours(editedReminderTime.getHours());
      triggerDate.setMinutes(editedReminderTime.getMinutes());
      triggerDate.setSeconds(0);
      triggerDate.setMilliseconds(0);

      if (triggerDate.getTime() <= Date.now()) {
        Alert.alert('Invalid reminder', 'Pick a future due date and time.');
        return editedNotificationId;
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: cleanedTitle,
          body,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: 'habit-reminders',
        },
      });

      setEditedNotificationId(id);
      return id;
    };

    const handleSave = async () => {
      if (!editedTitle.trim()) {
        Alert.alert('Missing title', 'Please enter a title.');
        return;
      }

      const newNotificationId = await scheduleReminder();

      onSave?.({
        title: editedTitle.trim(),
        subtitle: editedSubtitle.trim(),
        repetition: type === 'habit' ? editedRepetition : undefined,
        dueDate: type === 'todo' ? editedDueDate.toISOString() : undefined,
        progress: calculatedProgress,
        targetCount: editedTargetCount,
        currentCount: clampedCurrent,
        reminderEnabled: editedReminderEnabled,
        reminderTime: editedReminderEnabled
          ? editedReminderTime.toISOString()
          : '',
        notificationId: editedReminderEnabled ? newNotificationId : null,
      });

      onClose();
    };

    const handleDelete = () => {
      Alert.alert('Delete item', 'Are you sure you want to delete this item?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await cancelExistingReminder();
            onDelete?.();
            onClose();
          },
        },
      ]);
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
          <Text style={styles.title}>Edit Details</Text>

          <Text style={styles.label}>Title</Text>
          <TextInput
            value={editedTitle}
            onChangeText={setEditedTitle}
            placeholder="Enter title"
            placeholderTextColor="#7a7350"
            style={styles.titleInput}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={editedSubtitle}
            onChangeText={setEditedSubtitle}
            placeholder="Enter short description"
            placeholderTextColor="#7a7350"
            style={styles.subtitleInput}
          />

          {type === 'habit' ? (
            <>
              <Text style={styles.label}>Repetition</Text>
              <View style={styles.repeatRow}>
                {(['Daily', 'Weekly', 'One Time'] as RepetitionType[]).map(
                  (item) => (
                    <Pressable
                      key={item}
                      onPress={() => setEditedRepetition(item)}
                      style={[
                        styles.repeatButton,
                        editedRepetition === item && styles.activeButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.repeatText,
                          editedRepetition === item && styles.activeButtonText,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  )
                )}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Due Date</Text>
              <Pressable
                style={styles.dateBox}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(editedDueDate)}</Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={editedDueDate}
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
              value={editedReminderEnabled}
              onValueChange={setEditedReminderEnabled}
              trackColor={{ false: '#666', true: '#F5D94E' }}
              thumbColor={editedReminderEnabled ? '#0B1235' : '#f4f3f4'}
            />
          </View>

          {editedReminderEnabled && (
            <>
              <Text style={styles.label}>Reminder Time</Text>
              <Pressable
                style={styles.dateBox}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateText}>
                  {formatTime(editedReminderTime)}
                </Text>
              </Pressable>

              {showTimePicker && (
                <DateTimePicker
                  value={editedReminderTime}
                  mode="time"
                  display="default"
                  onChange={onChangeTime}
                />
              )}
            </>
          )}

          <Text style={styles.label}>Progress</Text>
          <View style={styles.progressBlock}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${calculatedProgress * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressCounter}>
              {clampedCurrent}/{editedTargetCount}
            </Text>
          </View>

          {editedTargetCount === 1 ? (
            <Pressable
              style={[
                styles.checkButton,
                clampedCurrent >= 1
                  ? styles.checkButtonCompleted
                  : styles.checkButtonIncomplete,
              ]}
              onPress={() =>
                setEditedCurrentCount((prev) => (prev >= 1 ? 0 : 1))
              }
            >
              <Text
                style={[
                  styles.checkButtonText,
                  clampedCurrent >= 1 && styles.checkButtonTextCompleted,
                ]}
              >
                ✓
              </Text>
            </Pressable>
          ) : (
            <View style={styles.actions}>
              <Pressable style={styles.actionButton} onPress={decreaseProgress}>
                <Text style={styles.actionText}>-</Text>
              </Pressable>

              <Pressable style={styles.actionButton} onPress={increaseProgress}>
                <Text style={styles.actionText}>+</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.label}>Target Count</Text>
          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={decreaseTarget}>
              <Text style={styles.actionText}>-</Text>
            </Pressable>

            <View style={styles.targetValueBox}>
              <Text style={styles.targetValueText}>{editedTargetCount}</Text>
            </View>

            <Pressable style={styles.actionButton} onPress={increaseTarget}>
              <Text style={styles.actionText}>+</Text>
            </Pressable>
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>

          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

export default TaskDetailsPrompt;

const CREAM = '#d8cf9d';
const ORANGE = '#F07A2B';
const TEAL = '#47C7C2';
const NAVY = '#0B1235';

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: CREAM,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },

  handle: {
    backgroundColor: TEAL,
    width: 70,
    height: 5,
    borderRadius: 999,
  },

  contentContainer: {
    paddingHorizontal: 18,
    paddingBottom: 140,
  },

  title: {
    textAlign: 'center',
    color: NAVY,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 22,
  },

  label: {
    color: NAVY,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
  },

  titleInput: {
    backgroundColor: '#efe8ba',
    borderWidth: 1.5,
    borderColor: NAVY,
    borderRadius: 10,
    minHeight: 48,
    color: NAVY,
    paddingHorizontal: 12,
    marginBottom: 14,
    fontWeight: '700',
  },

  subtitleInput: {
    backgroundColor: '#efe8ba',
    borderWidth: 1.5,
    borderColor: ORANGE,
    borderRadius: 10,
    minHeight: 40,
    color: ORANGE,
    paddingHorizontal: 12,
    marginBottom: 14,
    fontSize: 14,
  },

  repeatRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  repeatButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: NAVY,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#efe8ba',
  },

  repeatText: {
    color: NAVY,
    fontWeight: '700',
    fontSize: 13,
  },

  activeButton: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },

  activeButtonText: {
    color: NAVY,
  },

  dateBox: {
    backgroundColor: '#efe8ba',
    borderWidth: 1.5,
    borderColor: NAVY,
    borderRadius: 10,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  dateText: {
    color: NAVY,
    fontWeight: '700',
  },

  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: NAVY,
    backgroundColor: '#efe8ba',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  reminderText: {
    color: NAVY,
    fontWeight: '700',
    fontSize: 15,
  },

  progressBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  progressTrack: {
    flex: 1,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#b6efe5',
    overflow: 'hidden',
    marginRight: 10,
  },

  progressFill: {
    height: '100%',
    backgroundColor: TEAL,
    borderRadius: 999,
  },

  progressCounter: {
    minWidth: 46,
    textAlign: 'right',
    color: NAVY,
    fontWeight: '800',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  actionButton: {
    flex: 1,
    backgroundColor: TEAL,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },

  actionText: {
    color: NAVY,
    fontSize: 24,
    fontWeight: '800',
  },

  checkButton: {
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  checkButtonIncomplete: {
    backgroundColor: TEAL,
  },

  checkButtonCompleted: {
    backgroundColor: NAVY,
  },

  checkButtonText: {
    fontSize: 24,
    fontWeight: '800',
    color: NAVY,
  },

  checkButtonTextCompleted: {
    color: CREAM,
  },

  targetValueBox: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#efe8ba',
  },

  targetValueText: {
    color: NAVY,
    fontSize: 18,
    fontWeight: '800',
  },

  saveButton: {
    backgroundColor: NAVY,
    borderRadius: 10,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  saveButtonText: {
    color: CREAM,
    fontSize: 18,
    fontWeight: '800',
  },

  deleteButton: {
    backgroundColor: '#c94d45',
    borderRadius: 10,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
});