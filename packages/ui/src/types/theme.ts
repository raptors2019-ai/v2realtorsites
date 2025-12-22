export type ThemeName = 'newhomeshow' | 'sri-collective'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'outline'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-accent'

export interface ThemeConfig {
  name: ThemeName
  displayName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  supportsDarkMode: boolean
}
