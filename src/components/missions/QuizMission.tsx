import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Button3D } from '../ui/Button3D';
import { ProgressBar } from '../ui/ProgressBar';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import type { QuizContent } from '../../data/types';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface Props { content: QuizContent; onComplete: () => void; catColor: string; catDark: string; }

export function QuizMission({ content, onComplete, catColor, catDark }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = content.questions[currentQ];
  const isCorrect = selected !== null && q.options[selected]?.correct;
  const progress = (currentQ + (answered ? 1 : 0)) / content.questions.length;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (q.options[idx].correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCorrectCount((c) => c + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 < content.questions.length) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    const isPerfect = correctCount === content.questions.length;
    return (
      <Animated.View entering={FadeIn.duration(400)}>
        <View style={s.resultContainer}>
          <Ionicons name={isPerfect ? 'trophy' : 'bar-chart'} size={48} color={isPerfect ? colors.gold : colors.blue} />
          <Text style={s.resultTitle}>{correctCount} de {content.questions.length}</Text>
          <Text style={s.resultSub}>respostas corretas</Text>
          <Text style={s.resultMsg}>{isPerfect ? 'Perfeito!' : 'Bom trabalho! Continue aprendendo.'}</Text>
        </View>
        <Button3D label="COMPLETAR MISSÃO" onPress={onComplete} icon="trophy" color={colors.primary} shadowColor={colors.primaryDark} size="large" fullWidth />
      </Animated.View>
    );
  }

  return (
    <View>
      <ProgressBar progress={progress} label={`${currentQ + 1}/${content.questions.length}`} gradientColors={[catColor, catDark]} />
      {content.intro && currentQ === 0 && !answered && (
        <Text style={s.intro}>{content.intro}</Text>
      )}
      <Animated.View entering={FadeIn.duration(300)} key={currentQ}>
        <Text style={s.counter}>PERGUNTA {currentQ + 1} DE {content.questions.length}</Text>
        <Text style={s.question}>{q.text}</Text>
        {q.options.map((opt, idx) => {
          const isSel = idx === selected;
          const showCorrect = answered && opt.correct;
          const showWrong = answered && isSel && !opt.correct;
          const bg = showCorrect ? colors.primary : showWrong ? colors.error : isSel && !answered ? colors.blue : colors.surface;
          const shadow = showCorrect ? colors.primaryDark : showWrong ? colors.errorDark : colors.lockedDark;
          return (
            <Animated.View key={idx} entering={FadeInDown.delay(idx * 60).duration(200)}>
              <OptionCard text={opt.text} letter={String.fromCharCode(65 + idx)} bg={bg} shadow={shadow} onPress={() => handleSelect(idx)} disabled={answered} showIcon={showCorrect ? 'checkmark-circle' : showWrong ? 'close-circle' : undefined} />
            </Animated.View>
          );
        })}
      </Animated.View>
      {answered && (
        <Animated.View entering={FadeIn.duration(300)} style={[s.feedback, { backgroundColor: isCorrect ? 'rgba(88,204,2,0.15)' : 'rgba(255,75,75,0.15)' }]}>
          <Ionicons name={isCorrect ? 'checkmark-circle' : 'close-circle'} size={24} color={isCorrect ? colors.primary : colors.error} />
          <Text style={[s.feedbackTitle, { color: isCorrect ? colors.primary : colors.error }]}>{isCorrect ? 'Correto!' : 'Incorreto'}</Text>
          <Text style={s.feedbackExpl}>{q.explanation}</Text>
          <Button3D label={currentQ + 1 < content.questions.length ? 'PRÓXIMA' : 'VER RESULTADO'} onPress={handleNext} color={catColor} shadowColor={catDark} icon="arrow-forward" size="small" />
        </Animated.View>
      )}
    </View>
  );
}

function OptionCard({ text, letter, bg, shadow, onPress, disabled, showIcon }: { text: string; letter: string; bg: string; shadow: string; onPress: () => void; disabled: boolean; showIcon?: IoniconName }) {
  const pressed = useSharedValue(0);
  const bodyStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pressed.value * 4 }] }));
  const shadowStyle = useAnimatedStyle(() => ({ opacity: 1 - pressed.value }));
  return (
    <Pressable onPressIn={() => { if (!disabled) pressed.value = withTiming(1, { duration: 80 }); }} onPressOut={() => { pressed.value = withSpring(0); }} onPress={onPress} disabled={disabled}>
      <View style={s.optWrap}>
        <Animated.View style={[s.optShadow, { backgroundColor: shadow }, shadowStyle]} />
        <Animated.View style={[s.optBody, { backgroundColor: bg }, bodyStyle]}>
          <View style={s.optLetter}><Text style={s.optLetterTxt}>{letter}</Text></View>
          <Text style={s.optText}>{text}</Text>
          {showIcon && <Ionicons name={showIcon} size={24} color="#FFFFFF" />}
        </Animated.View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  intro: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textSecondary, marginTop: 12, marginBottom: 8, lineHeight: 20 },
  counter: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.textSecondary, letterSpacing: 2, marginTop: 14, marginBottom: 6 },
  question: { fontFamily: fontFamily.extraBold, fontSize: 16, color: '#FFFFFF', marginBottom: 14, lineHeight: 23 },
  optWrap: { marginBottom: 7, position: 'relative' },
  optShadow: { position: 'absolute', top: 3, left: 0, right: 0, bottom: -3, borderRadius: 12 },
  optBody: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, zIndex: 1 },
  optLetter: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  optLetterTxt: { fontFamily: fontFamily.extraBold, fontSize: 13, color: '#FFFFFF' },
  optText: { fontFamily: fontFamily.semiBold, flex: 1, fontSize: 14, color: '#FFFFFF', lineHeight: 19 },
  feedback: { borderRadius: 14, padding: 16, marginTop: 10, alignItems: 'center', gap: 6 },
  feedbackTitle: { fontFamily: fontFamily.extraBold, fontSize: 18 },
  feedbackExpl: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: 6 },
  resultContainer: { alignItems: 'center', paddingVertical: 24 },
  resultTitle: { fontFamily: fontFamily.extraBold, fontSize: 36, color: '#FFFFFF', marginTop: 12 },
  resultSub: { fontFamily: fontFamily.semiBold, fontSize: 16, color: colors.textSecondary, marginTop: 4 },
  resultMsg: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.primary, marginTop: 12, textAlign: 'center', marginBottom: 24 },
});
