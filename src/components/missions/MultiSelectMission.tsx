import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Button3D } from '../ui/Button3D';
import { ProgressBar } from '../ui/ProgressBar';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import type { MultiSelectContent } from '../../data/types';

interface Props { content: MultiSelectContent; onComplete: () => void; }

export function MultiSelectMission({ content, onComplete }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [verified, setVerified] = useState(false);

  const toggle = (idx: number) => {
    if (verified) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const handleVerify = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setVerified(true);
  };

  const correctCount = content.options.filter((o, i) => {
    const isSel = selected.has(i);
    return (o.correct && isSel) || (!o.correct && !isSel);
  }).length;
  const score = Math.round((correctCount / content.options.length) * 100);

  return (
    <View>
      <Text style={s.question}>{content.question}</Text>

      {content.options.map((opt, idx) => {
        const isSel = selected.has(idx);
        const isCorrectChoice = verified && opt.correct;
        const isWrongChoice = verified && isSel && !opt.correct;
        const isMissed = verified && !isSel && opt.correct;
        const bg = isCorrectChoice ? colors.primary : isWrongChoice ? colors.error : isMissed ? 'rgba(88,204,2,0.3)' : isSel ? colors.blue : colors.surface;
        const borderColor = isCorrectChoice ? colors.primaryDark : isWrongChoice ? colors.errorDark : isSel ? colors.blueDark : 'transparent';

        return (
          <Animated.View key={idx} entering={FadeInDown.delay(idx * 50).duration(200)}>
            <Pressable onPress={() => toggle(idx)} disabled={verified}>
              <View style={[s.option, { backgroundColor: bg, borderColor }]}>
                <View style={[s.checkbox, isSel && s.checkboxSel]}>
                  {isSel && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
                <Text style={s.optText}>{opt.text}</Text>
                {verified && (isCorrectChoice || isWrongChoice || isMissed) && (
                  <Ionicons name={opt.correct ? 'checkmark-circle' : 'close-circle'} size={20} color={opt.correct ? '#FFFFFF' : '#FFFFFF'} />
                )}
              </View>
            </Pressable>
            {verified && (isCorrectChoice || isWrongChoice || isMissed) && (
              <Animated.View entering={FadeIn.duration(300)} style={s.explanation}>
                <Text style={s.explanationText}>{opt.explanation}</Text>
              </Animated.View>
            )}
          </Animated.View>
        );
      })}

      {!verified ? (
        <View style={{ marginTop: 20 }}>
          <Button3D label="VERIFICAR" onPress={handleVerify} disabled={selected.size === 0} icon="checkmark-done" color={colors.primary} shadowColor={colors.primaryDark} size="large" fullWidth />
        </View>
      ) : (
        <Animated.View entering={FadeIn.duration(400)} style={{ marginTop: 20 }}>
          <View style={s.scoreCard}>
            <Text style={s.scoreNumber}>{score}%</Text>
            <Text style={s.scoreSub}>de acerto</Text>
          </View>
          <Button3D label="COMPLETAR MISSÃO" onPress={onComplete} icon="trophy" color={colors.primary} shadowColor={colors.primaryDark} size="large" fullWidth />
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  question: { fontFamily: fontFamily.extraBold, fontSize: 16, color: '#FFFFFF', marginBottom: 12, lineHeight: 22 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, marginBottom: 5, borderWidth: 2 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.locked, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  checkboxSel: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  optText: { fontFamily: fontFamily.semiBold, flex: 1, fontSize: 14, color: '#FFFFFF', lineHeight: 19 },
  explanation: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 8, marginBottom: 5, marginTop: -2 },
  explanationText: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondary, lineHeight: 16 },
  scoreCard: { alignItems: 'center', marginBottom: 20 },
  scoreNumber: { fontFamily: fontFamily.extraBold, fontSize: 48, color: colors.gold },
  scoreSub: { fontFamily: fontFamily.semiBold, fontSize: 16, color: colors.textSecondary },
});
