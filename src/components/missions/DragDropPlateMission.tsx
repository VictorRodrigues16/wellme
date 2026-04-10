import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Button3D } from '../Button3D';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import type { DragDropPlateContent, PlateFood } from '../../data/types';

interface Props { content: DragDropPlateContent; onComplete: () => void; }

export function DragDropPlateMission({ content, onComplete }: Props) {
  const [plate, setPlate] = useState<PlateFood[]>([]);
  const [scored, setScored] = useState(false);
  const [score, setScore] = useState(0);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const availableFoods = content.foods.filter((f) => !plate.find((p) => p.id === f.id));
  const isFull = plate.length >= content.maxItems;

  const addToPlate = (food: PlateFood) => {
    if (isFull) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPlate((prev) => [...prev, food]);
  };

  const removeFromPlate = (foodId: string) => {
    if (scored) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlate((prev) => prev.filter((f) => f.id !== foodId));
  };

  const handleFinalize = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const categories = plate.map((f) => f.category);
    let s = 0;
    if (categories.some((c) => c === 'vegetal')) s += content.scoring.hasVegetal;
    if (categories.some((c) => c === 'proteina' || c === 'proteina_vegetal')) s += content.scoring.hasProteina;
    if (categories.some((c) => c === 'carbo_bom')) s += content.scoring.hasCarboBom;
    if (categories.some((c) => c === 'gordura_boa')) s += content.scoring.hasGorduraBoa;
    const ultraCount = categories.filter((c) => c === 'ultra').length;
    if (ultraCount === 0) s += content.scoring.noUltra;
    s += ultraCount * content.scoring.perUltraPenalty;
    s = Math.max(0, Math.min(100, s));

    const fb = content.feedbackRanges.find((r) => s >= r.min) || content.feedbackRanges[content.feedbackRanges.length - 1];
    setScore(s);
    setFeedbackTitle(fb.title);
    setFeedbackMessage(fb.message);
    setScored(true);
  };

  if (scored) {
    return (
      <Animated.View entering={FadeIn.duration(400)}>
        <View style={st.scoreContainer}>
          <Ionicons name={score >= 70 ? 'star' : 'alert-circle'} size={48} color={score >= 70 ? colors.gold : colors.orange} />
          <Text style={st.scoreNumber}>{score}</Text>
          <Text style={st.scoreLabel}>pontos</Text>
          <Text style={st.fbTitle}>{feedbackTitle}</Text>
          <Text style={st.fbMessage}>{feedbackMessage}</Text>
        </View>
        <View style={st.plateReview}>
          <Text style={st.reviewLabel}>Seu prato:</Text>
          <View style={st.reviewGrid}>
            {plate.map((f) => {
              const isUltra = f.category === 'ultra';
              return (
                <View key={f.id} style={[st.reviewChip, isUltra && st.reviewChipBad]}>
                  <Ionicons name={f.emoji as any} size={16} color={isUltra ? colors.error : colors.primary} />
                  <Text style={[st.reviewChipText, isUltra && { color: colors.error }]}>{f.name}</Text>
                </View>
              );
            })}
          </View>
        </View>
        <Button3D label="COMPLETAR MISSÃO" onPress={onComplete} icon="trophy" color={colors.primary} shadowColor={colors.primaryDark} size="large" fullWidth />
      </Animated.View>
    );
  }

  return (
    <View>
      <Text style={st.instruction}>{content.instruction}</Text>

      {/* Plate */}
      <View style={st.plateContainer}>
        <View style={st.plate}>
          {plate.length === 0 ? (
            <Text style={st.plateEmpty}>Toque nos alimentos abaixo para adicionar</Text>
          ) : (
            <View style={st.plateItems}>
              {plate.map((f, i) => (
                <Animated.View key={f.id} entering={FadeIn.duration(200)}>
                  <Pressable onPress={() => removeFromPlate(f.id)} style={st.plateItem}>
                    <Ionicons name={f.emoji as any} size={20} color="#FFFFFF" />
                    <Text style={st.plateItemText}>{f.name}</Text>
                    <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.5)" />
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          )}
          <Text style={st.plateCount}>{plate.length}/{content.maxItems}</Text>
        </View>
      </View>

      {/* Food list */}
      <Text style={st.foodsLabel}>Alimentos disponiveis:</Text>
      <View style={st.foodsGrid}>
        {availableFoods.map((food, idx) => (
          <Animated.View key={food.id} entering={FadeInDown.delay(idx * 30).duration(200)}>
            <FoodCard food={food} onPress={() => addToPlate(food)} disabled={isFull} />
          </Animated.View>
        ))}
      </View>

      {plate.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Button3D
            label={isFull ? 'FINALIZAR PRATO' : `ADICIONAR MAIS (${plate.length}/${content.maxItems})`}
            onPress={handleFinalize}
            disabled={plate.length < 3}
            icon="restaurant"
            color={colors.primary}
            shadowColor={colors.primaryDark}
            size="large"
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

function FoodCard({ food, onPress, disabled }: { food: PlateFood; onPress: () => void; disabled: boolean }) {
  const isUltra = food.category === 'ultra';
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[st.foodCard, isUltra && st.foodCardUltra, disabled && st.foodCardDisabled]}>
      <Ionicons name={food.emoji as any} size={22} color={isUltra ? colors.error : '#FFFFFF'} />
      <Text style={[st.foodName, isUltra && { color: colors.error }]} numberOfLines={1}>{food.name}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  instruction: { fontFamily: fontFamily.bold, fontSize: 16, color: '#FFFFFF', marginBottom: 20, lineHeight: 24 },
  plateContainer: { alignItems: 'center', marginBottom: 20 },
  plate: { width: '100%', minHeight: 140, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', padding: 16, alignItems: 'center', justifyContent: 'center' },
  plateEmpty: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  plateItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  plateItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(88,204,2,0.2)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  plateItemText: { fontFamily: fontFamily.semiBold, fontSize: 12, color: '#FFFFFF' },
  plateCount: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.textSecondary, marginTop: 8 },
  foodsLabel: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.textSecondary, marginBottom: 10 },
  foodsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  foodCard: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  foodCardUltra: { borderColor: 'rgba(255,75,75,0.3)' },
  foodCardDisabled: { opacity: 0.4 },
  foodName: { fontFamily: fontFamily.semiBold, fontSize: 13, color: '#FFFFFF' },
  scoreContainer: { alignItems: 'center', paddingVertical: 24 },
  scoreNumber: { fontFamily: fontFamily.extraBold, fontSize: 56, color: colors.gold, marginTop: 8 },
  scoreLabel: { fontFamily: fontFamily.semiBold, fontSize: 16, color: colors.textSecondary },
  fbTitle: { fontFamily: fontFamily.extraBold, fontSize: 22, color: '#FFFFFF', marginTop: 12 },
  fbMessage: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 20 },
  plateReview: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 20 },
  reviewLabel: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  reviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  reviewChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(88,204,2,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  reviewChipBad: { backgroundColor: 'rgba(255,75,75,0.15)' },
  reviewChipText: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.primary },
});
