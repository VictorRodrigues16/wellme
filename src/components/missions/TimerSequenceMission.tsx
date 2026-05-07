import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Button3D } from '../ui/Button3D';
import { ProgressBar } from '../ui/ProgressBar';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import type { TimerSequenceContent } from '../../data/types';

type IoniconName = keyof typeof Ionicons.glyphMap;

function asIcon(name: string): IoniconName {
  return name as IoniconName;
}

interface Props { content: TimerSequenceContent; onComplete: () => void; catColor: string; catDark: string; }

export function TimerSequenceMission({ content, onComplete, catColor, catDark }: Props) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = intro
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = currentStep >= 0 ? content.steps[currentStep] : null;
  const totalSteps = content.steps.length;
  const progress = currentStep < 0 ? 0 : (currentStep + (secondsLeft === 0 && running === false && currentStep >= 0 ? 1 : 0)) / totalSteps;

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startStep = (idx: number) => {
    setCurrentStep(idx);
    setSecondsLeft(content.steps[idx].duration);
    setRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNext = () => {
    if (currentStep + 1 < totalSteps) {
      startStep(currentStep + 1);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    const totalTime = content.steps.reduce((sum, s) => sum + s.duration, 0);
    return (
      <Animated.View entering={FadeIn.duration(400)}>
        <View style={s.doneContainer}>
          <Ionicons name="checkmark-done-circle" size={56} color={colors.primary} />
          <Text style={s.doneTitle}>Concluído!</Text>
          <Text style={s.doneSub}>{content.completion}</Text>
          <Text style={s.doneTime}>{Math.round(totalTime / 60)} minutos de pratica</Text>
        </View>
        <Button3D label="COMPLETAR MISSÃO" onPress={onComplete} icon="trophy" color={colors.primary} shadowColor={colors.primaryDark} size="large" fullWidth />
      </Animated.View>
    );
  }

  // Intro screen
  if (currentStep < 0) {
    return (
      <View>
        <Text style={s.intro}>{content.intro}</Text>
        <View style={s.stepsPreview}>
          {content.steps.map((st, i) => (
            <View key={i} style={s.previewRow}>
              <View style={[s.previewBadge, { backgroundColor: catColor }]}>
                <Ionicons name={asIcon(st.icon)} size={18} color="#FFFFFF" />
              </View>
              <View style={s.previewInfo}>
                <Text style={s.previewName}>{st.name}</Text>
                <Text style={s.previewDur}>{st.duration}s</Text>
              </View>
            </View>
          ))}
        </View>
        <Button3D label="COMEÇAR" onPress={() => startStep(0)} icon="play" color={catColor} shadowColor={catDark} size="large" fullWidth />
      </View>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <View>
      <ProgressBar progress={progress} label={`${currentStep + 1}/${totalSteps}`} gradientColors={[catColor, catDark]} />

      <Animated.View entering={FadeIn.duration(300)} key={currentStep} style={s.stepContainer}>
        <View style={[s.stepIcon, { backgroundColor: catColor }]}>
          <Ionicons name={asIcon(step?.icon ?? 'body')} size={40} color="#FFFFFF" />
        </View>
        <Text style={s.stepName}>{step?.name}</Text>
        <Text style={s.stepInstruction}>{step?.instruction}</Text>

        <View style={s.timerCircle}>
          <Text style={s.timerText}>{pad(Math.floor(secondsLeft / 60))}:{pad(secondsLeft % 60)}</Text>
          <Text style={s.timerLabel}>{running ? 'Em andamento...' : 'Concluído!'}</Text>
        </View>
      </Animated.View>

      {!running && secondsLeft === 0 && currentStep >= 0 && (
        <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 16 }}>
          <Button3D
            label={currentStep + 1 < totalSteps ? 'PRÓXIMO EXERCÍCIO' : 'FINALIZAR'}
            onPress={handleNext}
            icon="arrow-forward"
            color={catColor}
            shadowColor={catDark}
            size="large"
            fullWidth
          />
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  intro: { fontFamily: fontFamily.semiBold, fontSize: 15, color: '#FFFFFF', marginBottom: 20, lineHeight: 22 },
  stepsPreview: { gap: 10, marginBottom: 24 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 12, padding: 14 },
  previewBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  previewInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewName: { fontFamily: fontFamily.bold, fontSize: 16, color: '#FFFFFF' },
  previewDur: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textSecondary },
  stepContainer: { alignItems: 'center', paddingVertical: 24 },
  stepIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  stepName: { fontFamily: fontFamily.extraBold, fontSize: 24, color: '#FFFFFF', marginBottom: 12 },
  stepInstruction: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 16, marginBottom: 24 },
  timerCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: colors.locked, alignItems: 'center', justifyContent: 'center' },
  timerText: { fontFamily: fontFamily.extraBold, fontSize: 36, color: '#FFFFFF' },
  timerLabel: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  doneContainer: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  doneTitle: { fontFamily: fontFamily.extraBold, fontSize: 28, color: '#FFFFFF' },
  doneSub: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  doneTime: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.gold, marginBottom: 16 },
});
