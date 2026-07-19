import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useTranslation } from '../contexts/LanguageContext';

export default function FeedbackScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [feedbackType, setFeedbackType] = useState<'idea' | 'bug' | 'other' | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled = !feedbackType || !message.trim();

  const handleSubmit = async () => {
    if (isSubmitDisabled || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const feedbackRef = doc(collection(db, 'feedback'));
      const uuid = feedbackRef.id;
      const timestamp = serverTimestamp();

      await setDoc(feedbackRef, {
        uuid,
        type: feedbackType,
        subject: subject.trim() || null,
        message: message.trim(),
        rating: rating ?? null,
        dateCreated: timestamp,
        dateModified: timestamp,
        platform: Platform.OS,
        createdFrom: 'app-feedback-screen',
      });

      Alert.alert(
        t('feedback.successTitle'),
        t('feedback.successBody'),
        [
          {
            text: t('feedback.ok'),
            onPress: () => router.back(),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert(t('feedback.errorTitle'), t('feedback.errorBody'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fff6e8]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-4 pt-6">
          <View className="mb-4">
            <View className="relative items-center justify-center">
              <Text className="text-2xl font-extrabold text-slate-800 text-center">
                {t('feedback.title')}
              </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.8}
                className="absolute right-0 w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#1e293b" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1" contentContainerClassName="pb-10" keyboardShouldPersistTaps="handled">
            <Text className="text-sm text-slate-600 mb-4">
              {t('feedback.intro')}
            </Text>

            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              {t('feedback.typeLabel')}
            </Text>
            <View className="flex-row mb-5">
              {[
                { key: 'idea', label: t('feedback.typeIdea') },
                { key: 'bug', label: t('feedback.typeBug') },
                { key: 'other', label: t('feedback.typeOther') },
              ].map(({ key, label }) => {
                const selected = feedbackType === key;
                return (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.8}
                    onPress={() => setFeedbackType(key as any)}
                    className={`px-4 py-2 rounded-full mr-2 border ${
                      selected ? 'bg-[#FFF3E0] border-[#F57C00]' : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selected ? 'text-[#BF360C]' : 'text-slate-700'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              {t('feedback.ratingLabel')}
            </Text>
            <View className="flex-row items-center mb-5">
              {[1, 2, 3, 4, 5].map((star) => {
                const selected = rating !== null && star <= rating;
                return (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.8}
                    onPress={() => setRating(star === rating ? null : star)}
                    className="mr-1.5"
                  >
                    <Ionicons
                      name={selected ? 'star' : 'star-outline'}
                      size={24}
                      color={selected ? '#F59E0B' : '#CBD5E1'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              {t('feedback.subjectLabel')}
            </Text>
            <TextInput
              className="w-full bg-white rounded-xl px-4 py-3 text-base text-slate-800 border border-slate-200 mb-5"
              placeholder={t('feedback.subjectPlaceholder')}
              placeholderTextColor="#94a3b8"
              value={subject}
              onChangeText={setSubject}
            />

            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              {t('feedback.messageLabel')}
            </Text>
            <TextInput
              className="w-full bg-white rounded-xl px-4 py-3 text-base text-slate-800 border border-slate-200"
              placeholder={t('feedback.messagePlaceholder')}
              placeholderTextColor="#94a3b8"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </ScrollView>

          <View className="pb-4">
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isSubmitDisabled || isSubmitting}
              onPress={handleSubmit}
              className={`w-full rounded-[14px] py-[14px] items-center ${
                isSubmitDisabled || isSubmitting ? 'bg-slate-300' : 'bg-[#F57C00]'
              }`}
            >
              <Text className="text-white text-[15px] font-bold">
                {isSubmitting ? t('feedback.sending') : t('feedback.submit')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

