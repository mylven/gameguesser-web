export const avatarOptions = ['🎮', '🕹️', '👾', '🤖', '👽', '🧙', '🥷', '🐉', '🚀', '⚡', '🔥', '💀'] as const;
export type AvatarId = typeof avatarOptions[number];
export const defaultAvatar: AvatarId = avatarOptions[0];

export function isAvatar(value: unknown): value is AvatarId {
  return typeof value === 'string' && (avatarOptions as readonly string[]).includes(value);
}
