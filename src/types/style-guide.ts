// Style Guide System Types

export type DesignStyle = 'modern' | 'minimal' | 'corporate' | 'creative' | 'tech' | 'ecommerce';

export interface ColorPalette {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  success: string;
  warning: string;
  error: string;
  info: string;
  background: {
    primary: string;
    secondary: string;
    muted: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
}

export interface TypographyScale {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
    display: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
    '7xl': string;
    '8xl': string;
    '9xl': string;
  };
  fontWeight: {
    thin: number;
    extralight: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  lineHeight: {
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}

export interface SpacingScale {
  base: number; // 4px
  scale: {
    0: string;
    0.5: string;
    1: string;
    1.5: string;
    2: string;
    2.5: string;
    3: string;
    3.5: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
    11: string;
    12: string;
    14: string;
    16: string;
    20: string;
    24: string;
    28: string;
    32: string;
    36: string;
    40: string;
    44: string;
    48: string;
    52: string;
    56: string;
    60: string;
    64: string;
    72: string;
    80: string;
    96: string;
  };
}

export interface BorderRadius {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface Shadows {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

export interface ComponentStyles {
  button: {
    primary: StyleObject;
    secondary: StyleObject;
    outline: StyleObject;
    ghost: StyleObject;
  };
  card: {
    base: StyleObject;
    elevated: StyleObject;
    outlined: StyleObject;
  };
  input: {
    base: StyleObject;
    focus: StyleObject;
    error: StyleObject;
  };
  badge: {
    primary: StyleObject;
    secondary: StyleObject;
    outline: StyleObject;
  };
}

export interface StyleObject {
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  padding?: string;
  margin?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  boxShadow?: string;
  transition?: string;
  [key: string]: any;
}

export interface BrandGuidelines {
  name: string;
  industry: string;
  targetAudience: string;
  brandPersonality: string[];
  brandValues: string[];
  colorPreferences?: string[];
  colorAvoid?: string[];
  typographyPreference?: 'serif' | 'sans-serif' | 'mixed';
  stylePreferences?: DesignStyle[];
}

export interface StyleGuide {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  brandGuidelines: BrandGuidelines;
  designStyle: DesignStyle;
  colorPalette: ColorPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  borderRadius: BorderRadius;
  shadows: Shadows;
  componentStyles: ComponentStyles;
  cssVariables: Record<string, string>;
}

export interface StyleGenerationRequest {
  brandGuidelines: BrandGuidelines;
  designStyle: DesignStyle;
  wireframeDescription?: string;
  existingColors?: string[];
  preferences?: {
    colorIntensity?: 'muted' | 'balanced' | 'vibrant';
    typographyStyle?: 'classic' | 'modern' | 'futuristic';
    spacingDensity?: 'compact' | 'comfortable' | 'spacious';
  };
}

export interface StyleGenerationResponse {
  success: boolean;
  styleGuide?: StyleGuide;
  error?: string;
  warnings?: string[];
}

export interface ThemeTokens {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
    fontWeight: Record<string, string>;
    lineHeight: Record<string, string>;
    letterSpacing: Record<string, string>;
  };
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

export interface ComponentTheme {
  name: string;
  styles: StyleObject;
  variants?: Record<string, StyleObject>;
  states?: Record<string, StyleObject>;
}

export interface ThemeProvider {
  theme: string;
  tokens: ThemeTokens;
  components: Record<string, ComponentTheme>;
}