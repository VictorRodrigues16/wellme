import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { useGame } from '../../context/GameContext';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface TabConfig {
  icon: IoniconName;
  activeIcon: IoniconName;
  label: string;
  color: string;
}

// Config indexada por NOME da rota (não por índice) — assim adicionar/reordenar
// abas em (tabs)/_layout.tsx nunca troca ícones/labels por engano.
function useTabConfig(): Record<string, TabConfig> {
  const { state: gameState } = useGame();
  const hasStreak = (gameState?.user.streak ?? 0) > 0;

  return {
    index: { icon: 'map', activeIcon: 'map', label: 'Trilha', color: colors.primary },
    movimento: {
      icon: 'walk-outline',
      activeIcon: 'walk',
      label: 'Movimento',
      color: colors.orange,
    },
    arena: {
      icon: 'flash-outline',
      activeIcon: 'flash',
      label: 'Arena',
      color: colors.purple,
    },
    conquistas: {
      icon: hasStreak ? 'flame' : 'trophy-outline',
      activeIcon: hasStreak ? 'flame' : 'trophy',
      label: 'Ofensiva',
      color: hasStreak ? colors.orange : colors.gold,
    },
    perfil: { icon: 'person-outline', activeIcon: 'person', label: 'Perfil', color: colors.blue },
  };
}

const FALLBACK_TAB: TabConfig = {
  icon: 'ellipse-outline',
  activeIcon: 'ellipse',
  label: '',
  color: colors.textSecondary,
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const tabConfig = useTabConfig();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <View style={styles.tabRow}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const config = tabConfig[route.name] ?? FALLBACK_TAB;

            return (
              <TabItem
                key={route.key}
                label={config.label}
                icon={isFocused ? config.activeIcon : config.icon}
                color={config.color}
                isFocused={isFocused}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate(route.name, route.params);
                  }
                }}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

interface TabItemProps {
  label: string;
  icon: IoniconName;
  color: string;
  isFocused: boolean;
  onPress: () => void;
}

function TabItem({ label, icon, color, isFocused, onPress }: TabItemProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withTiming(0.9, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onPress}
      style={styles.tabItem}
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
    >
      <Animated.View style={[styles.tabContent, animStyle]}>
        {isFocused && (
          <View style={[styles.activeIndicator, { backgroundColor: color + '20' }]} />
        )}
        <Ionicons
          name={icon}
          size={26}
          color={isFocused ? color : colors.textSecondary}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isFocused ? color : colors.textSecondary },
            isFocused && styles.tabLabelActive,
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  blur: {
    overflow: 'hidden',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Platform.OS === 'android' ? 'rgba(15,27,45,0.95)' : 'transparent',
  },
  tabItem: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  tabLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    marginTop: 2,
  },
  tabLabelActive: {
    fontFamily: fontFamily.bold,
  },
});
