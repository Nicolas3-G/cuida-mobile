import { Text as RNText, TextInput as RNTextInput, StyleSheet } from 'react-native';
import type { ComponentProps } from 'react';

// Setting a single fontFamily + fontWeight doesn't synthesize bold reliably on
// React Native's New Architecture, so pick the actual DM Sans weight file that
// matches the weight implied by the element's className (or inline fontWeight).
function weightedFont(className?: string, style?: unknown): string {
  const cn = className ?? '';
  const flat = (StyleSheet.flatten(style as never) ?? {}) as { fontWeight?: string | number };
  const w = String(flat.fontWeight ?? '');
  if (/\bfont-extrabold\b/.test(cn) || w === '800') return 'DMSans_800ExtraBold';
  if (/\bfont-bold\b/.test(cn) || w === '700' || w === 'bold') return 'DMSans_700Bold';
  if (/\bfont-semibold\b/.test(cn) || w === '600') return 'DMSans_600SemiBold';
  if (/\bfont-medium\b/.test(cn) || w === '500') return 'DMSans_500Medium';
  return 'DMSans_400Regular';
}

/**
 * App-wide Text / TextInput. Applies the correct DM Sans weight file and disables
 * OS font scaling, while forwarding className (NativeWind) and style so size and
 * color from classes still apply on top.
 */
export function Text({
  className,
  style,
  allowFontScaling = false,
  ...rest
}: ComponentProps<typeof RNText>) {
  return (
    <RNText
      className={className}
      allowFontScaling={allowFontScaling}
      style={[{ fontFamily: weightedFont(className, style) }, style]}
      {...rest}
    />
  );
}

export function TextInput({
  className,
  style,
  allowFontScaling = false,
  ...rest
}: ComponentProps<typeof RNTextInput>) {
  return (
    <RNTextInput
      className={className}
      allowFontScaling={allowFontScaling}
      style={[{ fontFamily: weightedFont(className, style) }, style]}
      {...rest}
    />
  );
}
