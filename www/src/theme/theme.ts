import { createTheme, type MantineColorsTuple } from '@mantine/core';

const brand: MantineColorsTuple = [
  '#e5f4ff',
  '#cde4ff',
  '#9bc6ff',
  '#64a6ff',
  '#398bfe',
  '#1d7afe',
  '#0071ff',
  '#005fe4',
  '#0054cd',
  '#0048b5',
];

export const theme = createTheme({
  primaryColor: 'brand',
  colors: { brand },
  primaryShade: { light: 6, dark: 4 },
  fontFamily: 'Outfit, system-ui, sans-serif',
  headings: { fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: '700' },
  defaultRadius: 'md',
  defaultGradient: { from: 'brand.6', to: 'teal.4', deg: 120 },
  components: {
    Button: { defaultProps: { radius: 'xl' } },
    Card: { defaultProps: { radius: 'lg' } },
    Paper: { defaultProps: { radius: 'lg' } },
  },
});
