export const siteThemes = [
  { id: 'arcade', name: 'Arcade', description: 'Neon cián és gamer lime', swatches: ['#62e8e6', '#a887ff', '#c8ff55'] },
  { id: 'cyberpunk', name: 'Cyberpunk', description: 'Forró pink és elektromos lila', swatches: ['#ff5ce1', '#9d7bff', '#faff58'] },
  { id: 'forest', name: 'Forest', description: 'Smaragdzöld és napfényes borostyán', swatches: ['#65e6a5', '#76b97e', '#ffd166'] },
  { id: 'synthwave', name: 'Synthwave', description: 'Neonmagenta és retro narancs', swatches: ['#ff56b8', '#a477ff', '#ffb454'] },
] as const;

export type ThemeId = typeof siteThemes[number]['id'];

export function isThemeId(value: string | null): value is ThemeId {
  return siteThemes.some((theme) => theme.id === value);
}
