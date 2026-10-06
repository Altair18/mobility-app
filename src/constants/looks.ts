import { colors } from './theme';

/** Colours and accents for each Today screen look (prototype). */
export type LookTokens = {
  dark: boolean;
  /** Page background, top to bottom. Null keeps the standard cream-to-sand backdrop. */
  background: [string, string] | null;
  ink: string;
  muted: string;
  faint: string;
  /** Structure: kickers, links, selected states. */
  accent: string;
  /** Used only for progress and glow. */
  bright: string;
  /** Text on the bright colour. */
  onBright: string;
  rule: string;
  chip: { bg: string; border: string; text: string; icon: string; onBg: string; onText: string };
  /** 'region': the hero takes the colour of today's focus area. */
  hero: 'card' | 'region';
  /** The hero's base colour, blended with the region colour at the top. */
  heroBase: string;
  /** How much region colour the top of the hero gets. */
  heroTint: number;
  heroBorder: string;
  /** 'hold': press and hold to start, with a breathing halo. */
  start: 'tap' | 'hold';
  button: { bg: string; text: string; halo: string };
  figureFill: string;
  glow: string;
  weekGlow: boolean;
};

export const LOOKS: Record<'current' | 'vision' | 'evening', LookTokens> = {
  current: {
    dark: false,
    background: null,
    ink: colors.ink,
    muted: colors.muted,
    faint: colors.faint,
    accent: colors.greenText,
    bright: colors.green,
    onBright: colors.white,
    rule: colors.line,
    chip: { bg: 'rgba(255,253,249,0.82)', border: 'rgba(90,70,40,0.16)', text: colors.ink, icon: colors.green, onBg: colors.green, onText: colors.white },
    hero: 'card',
    heroBase: colors.card,
    heroTint: 0,
    heroBorder: colors.border,
    start: 'tap',
    button: { bg: colors.ink, text: colors.cream, halo: 'transparent' },
    figureFill: colors.figure,
    glow: colors.green,
    weekGlow: false,
  },
  vision: {
    dark: false,
    background: ['#FCFAF6', '#F6F1E8'],
    ink: '#1A1915',
    muted: '#5E574B',
    faint: '#8A8173',
    accent: '#1F5A3E',
    bright: '#A6F2C8',
    onBright: '#1F5A3E',
    rule: 'rgba(31,90,62,0.10)',
    chip: { bg: '#FFFFFF', border: 'rgba(26,25,21,0.08)', text: '#1A1915', icon: '#1F5A3E', onBg: '#1F5A3E', onText: '#FBF8F3' },
    hero: 'region',
    heroBase: '#FFFFFF',
    heroTint: 0.42,
    heroBorder: 'rgba(255,255,255,0.9)',
    start: 'hold',
    button: { bg: '#1F5A3E', text: '#FBF8F3', halo: '#A6F2C8' },
    figureFill: colors.figure,
    glow: colors.green,
    weekGlow: true,
  },
  evening: {
    dark: true,
    background: ['#15241D', '#0C1611'],
    ink: '#F4EEE3',
    muted: 'rgba(244,238,227,0.68)',
    faint: 'rgba(244,238,227,0.45)',
    accent: '#A6F2C8',
    bright: '#A6F2C8',
    onBright: '#10201A',
    rule: 'rgba(244,238,227,0.10)',
    chip: { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.10)', text: '#F4EEE3', icon: '#A6F2C8', onBg: '#A6F2C8', onText: '#10201A' },
    hero: 'region',
    heroBase: '#17271F',
    heroTint: 0.3,
    heroBorder: 'rgba(255,255,255,0.08)',
    start: 'hold',
    button: { bg: '#A6F2C8', text: '#10201A', halo: '#A6F2C8' },
    figureFill: '#3B6351',
    glow: '#A6F2C8',
    weekGlow: true,
  },
};
