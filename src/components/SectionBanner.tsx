import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fontFamily } from '../theme/typography';

interface SectionBannerProps {
  moduleNumber: number;
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  darkColor: string;
}

export function SectionBanner({ moduleNumber, title, iconName, color, darkColor }: SectionBannerProps) {
  return (
    <View style={styles.container}>
      {/* Shadow */}
      <View style={[styles.shadow, { backgroundColor: darkColor }]} />
      {/* Body */}
      <LinearGradient
        colors={[color, darkColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.body}
      >
        <Ionicons name={iconName} size={36} color="#FFFFFF" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.section}>MODULO {moduleNumber}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  shadow: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    bottom: -6,
    borderRadius: 16,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    zIndex: 1,
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  section: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    marginBottom: 2,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: 20,
    color: '#FFFFFF',
  },
});
