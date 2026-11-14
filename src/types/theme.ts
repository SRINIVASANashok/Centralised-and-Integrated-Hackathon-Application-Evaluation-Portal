export type BackgroundThemeId =
  | 'red-noir'
  | 'campus-exterior'
  | 'campus-atrium'
  | 'oxford-navy'
  | 'architectural-blueprint'
  | 'pearl-slate';

export type BackgroundContrast = 'subtle' | 'balanced' | 'high';

export interface BackgroundThemeOption {
  id: BackgroundThemeId;
  name: string;
  tagline: string;
  category: 'Red Noir' | 'Photographic' | 'Heritage' | 'Technical' | 'Minimal';
  thumbnailUrl?: string;
  previewGradient: string;
  accentColor: string;
  isDarkTheme?: boolean;
}

export const BACKGROUND_THEMES: BackgroundThemeOption[] = [
  {
    id: 'red-noir',
    name: 'Red Noir',
    tagline: 'Deep black with crimson starlight & radial glow',
    category: 'Red Noir',
    previewGradient: 'from-[#1a0505] via-black to-[#ef233c]',
    accentColor: '#ef233c',
    isDarkTheme: true,
  },
  {
    id: 'campus-exterior',
    name: 'Campus Quadrangle',
    tagline: 'SRM IST Tiruchirappalli architectural exterior & quadrangle',
    category: 'Photographic',
    thumbnailUrl: '/assets/srm_campus_bg.jpg',
    previewGradient: 'from-sky-800 to-amber-900',
    accentColor: '#c5a059',
    isDarkTheme: false,
  },
  {
    id: 'campus-atrium',
    name: 'Grand Atrium Hall',
    tagline: 'Sweeping architectural rotunda & glass skylight interior',
    category: 'Photographic',
    thumbnailUrl: '/assets/srm_hall_bg.jpg',
    previewGradient: 'from-slate-900 to-blue-950',
    accentColor: '#c5a059',
    isDarkTheme: true,
  },
  {
    id: 'oxford-navy',
    name: 'Oxford Navy & Gold',
    tagline: 'Regal academic heritage with warm ambient golden aura',
    category: 'Heritage',
    previewGradient: 'from-[#001733] via-[#002147] to-[#041026]',
    accentColor: '#d4af37',
    isDarkTheme: true,
  },
  {
    id: 'architectural-blueprint',
    name: 'Engineering Blueprint',
    tagline: 'Precision drafting grid & technical STEM coordinates',
    category: 'Technical',
    previewGradient: 'from-[#031b38] to-[#0a254a]',
    accentColor: '#38bdf8',
    isDarkTheme: true,
  },
  {
    id: 'pearl-slate',
    name: 'Academic Pearl',
    tagline: 'Crisp institutional parchment for high-clarity reading',
    category: 'Minimal',
    previewGradient: 'from-slate-100 to-slate-200',
    accentColor: '#002147',
    isDarkTheme: false,
  },
];
