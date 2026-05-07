import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../src/context/GameContext';
import { colors } from '../src/theme/colors';
import { fontFamily } from '../src/theme/typography';
import { Button3D } from '../src/components/ui/Button3D';
import { VitaMascot } from '../src/components/mascot/VitaMascot';

interface FormErrors {
  name?: string;
  heroCode?: string;
}

const NAME_MIN = 2;
const NAME_MAX = 30;
const CODE_MIN = 4;

function validate(name: string, heroCode: string): FormErrors {
  const errors: FormErrors = {};
  const trimmedName = name.trim();
  const trimmedCode = heroCode.trim();

  if (trimmedName.length === 0) {
    errors.name = 'Informe seu nome de heroi';
  } else if (trimmedName.length < NAME_MIN) {
    errors.name = `Minimo de ${NAME_MIN} caracteres`;
  } else if (trimmedName.length > NAME_MAX) {
    errors.name = `Maximo de ${NAME_MAX} caracteres`;
  }

  if (trimmedCode.length === 0) {
    errors.heroCode = 'Informe o codigo de heroi';
  } else if (trimmedCode.length < CODE_MIN) {
    errors.heroCode = `Minimo de ${CODE_MIN} caracteres`;
  }

  return errors;
}

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useGame();

  const [name, setName] = useState('');
  const [heroCode, setHeroCode] = useState('');
  const [touched, setTouched] = useState<{ name: boolean; heroCode: boolean }>({
    name: false,
    heroCode: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (touched.name) setErrors(validate(val, heroCode));
  };

  const handleCodeChange = (val: string) => {
    setHeroCode(val);
    if (touched.heroCode) setErrors(validate(name, val));
  };

  const handleBlur = (field: 'name' | 'heroCode') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(name, heroCode));
  };

  const isValid =
    name.trim().length >= NAME_MIN &&
    name.trim().length <= NAME_MAX &&
    heroCode.trim().length >= CODE_MIN;

  const handleSubmit = async () => {
    setTouched({ name: true, heroCode: true });
    const errs = validate(name, heroCode);
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setSubmitError('Corrija os campos destacados.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    // Simula latencia de rede para feedback visual de loading
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      await login(name.trim(), heroCode.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch {
      setSubmitError('Erro ao iniciar sessao. Tente novamente.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={[styles.heroBg, { paddingTop: insets.top + 20 }]}
      >
        <Animated.View entering={FadeIn.duration(500)} style={styles.heroInner}>
          <VitaMascot size={120} expression="happy" animated />
          <Text style={styles.brand}>WellMe</Text>
          <Text style={styles.tagline}>Sua jornada de saude comeca aqui</Text>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formWrapper}
      >
        <ScrollView
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(450)} style={styles.formCard}>
            <Text style={styles.formTitle}>Entrar</Text>
            <Text style={styles.formSubtitle}>
              Identifique-se para comecar sua trilha
            </Text>

            {/* Campo: Nome */}
            <View style={styles.field}>
              <Text style={styles.label}>NOME DO HEROI</Text>
              <View
                style={[
                  styles.inputWrap,
                  touched.name && errors.name ? styles.inputWrapError : null,
                ]}
              >
                <Ionicons
                  name="person"
                  size={18}
                  color={touched.name && errors.name ? colors.error : colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Victor"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={name}
                  onChangeText={handleNameChange}
                  onBlur={() => handleBlur('name')}
                  maxLength={NAME_MAX}
                  autoCapitalize="words"
                  returnKeyType="next"
                  editable={!submitting}
                />
              </View>
              {touched.name && errors.name ? (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={14} color={colors.error} />
                  <Text style={styles.errorText}>{errors.name}</Text>
                </View>
              ) : null}
            </View>

            {/* Campo: Codigo */}
            <View style={styles.field}>
              <Text style={styles.label}>CODIGO DE HEROI</Text>
              <View
                style={[
                  styles.inputWrap,
                  touched.heroCode && errors.heroCode ? styles.inputWrapError : null,
                ]}
              >
                <Ionicons
                  name="key"
                  size={18}
                  color={
                    touched.heroCode && errors.heroCode
                      ? colors.error
                      : colors.textSecondary
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Minimo 4 caracteres"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={heroCode}
                  onChangeText={handleCodeChange}
                  onBlur={() => handleBlur('heroCode')}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  editable={!submitting}
                />
              </View>
              {touched.heroCode && errors.heroCode ? (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={14} color={colors.error} />
                  <Text style={styles.errorText}>{errors.heroCode}</Text>
                </View>
              ) : (
                <Text style={styles.hint}>
                  Pode ser qualquer combinacao — fica salva localmente.
                </Text>
              )}
            </View>

            {submitError ? (
              <View style={styles.banner}>
                <Ionicons name="warning" size={16} color={colors.error} />
                <Text style={styles.bannerText}>{submitError}</Text>
              </View>
            ) : null}

            <View style={styles.submitWrap}>
              {submitting ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator color={colors.primary} size="large" />
                  <Text style={styles.loadingText}>Carregando sessao...</Text>
                </View>
              ) : (
                <Button3D
                  label="ENTRAR"
                  onPress={handleSubmit}
                  icon="log-in"
                  color={isValid ? colors.primary : colors.locked}
                  shadowColor={isValid ? colors.primaryDark : colors.lockedDark}
                  size="large"
                  fullWidth
                  disabled={!isValid}
                />
              )}
            </View>

            <Pressable
              onPress={() => {
                setName('Estudante FIAP');
                setHeroCode('FIAP2025');
                setTouched({ name: true, heroCode: true });
                setErrors({});
              }}
              style={styles.demoBtn}
              disabled={submitting}
            >
              <Ionicons name="flash" size={14} color={colors.gold} />
              <Text style={styles.demoText}> Preencher demo</Text>
            </Pressable>
          </Animated.View>

          <Text style={styles.footerText}>
            Os dados ficam apenas no seu dispositivo. Sem servidor, sem cadastro.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heroBg: {
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroInner: { alignItems: 'center' },
  brand: {
    fontFamily: fontFamily.extraBold,
    fontSize: 36,
    color: '#FFFFFF',
    marginTop: 12,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  formWrapper: { flex: 1 },
  formScroll: { padding: 20, paddingBottom: 40 },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 22,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  formTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  formSubtitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 18,
  },
  field: { marginBottom: 14 },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputWrapError: {
    borderColor: colors.error,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 12,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  errorText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.error,
  },
  hint: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,75,75,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 12,
  },
  bannerText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.error,
    flex: 1,
  },
  submitWrap: { marginTop: 8 },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  loadingText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  demoText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.gold,
    letterSpacing: 1,
  },
  footerText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 18,
    paddingHorizontal: 20,
  },
});
