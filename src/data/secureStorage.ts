import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Armazenamento seguro de dados sensíveis (ex.: heroCode).
 *
 * - Mobile (iOS/Android): usa o Keychain/Keystore via expo-secure-store.
 * - Web: o SecureStore não encripta (não há Keychain no navegador), então
 *   caímos para AsyncStorage com aviso. No web o heroCode é credencial mock,
 *   não senha real — documentado no README.
 *
 * Observação: chaves do SecureStore só aceitam [A-Za-z0-9._-]; por isso a
 * chave NÃO usa o prefixo `@wellme:` das chaves de AsyncStorage.
 */

export const SECURE_HEROCODE_KEY = 'wellme_secure_heroCode_v1';

const isWeb = Platform.OS === 'web';

async function secureAvailable(): Promise<boolean> {
  if (isWeb) return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    if (await secureAvailable()) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    if (__DEV__) {
      console.warn(
        `[secureStorage] SecureStore indisponível (web?) — usando AsyncStorage para "${key}".`,
      );
    }
    await AsyncStorage.setItem(`secure:${key}`, value);
  } catch (err) {
    console.warn('[secureStorage] erro ao gravar', key, err);
  }
}

export async function getSecureItem(key: string): Promise<string | null> {
  try {
    if (await secureAvailable()) {
      return await SecureStore.getItemAsync(key);
    }
    return await AsyncStorage.getItem(`secure:${key}`);
  } catch (err) {
    console.warn('[secureStorage] erro ao ler', key, err);
    return null;
  }
}

export async function removeSecureItem(key: string): Promise<void> {
  try {
    if (await secureAvailable()) {
      await SecureStore.deleteItemAsync(key);
      return;
    }
    await AsyncStorage.removeItem(`secure:${key}`);
  } catch (err) {
    console.warn('[secureStorage] erro ao remover', key, err);
  }
}
