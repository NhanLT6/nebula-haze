export const palette = {
  base: {
    bg: '#21243a',
    text: '#c0caf5',
    comment: '#606480',
    inlayHint: '#565f89',
    chromeDim: '#2a2e48',
    chromeMid: '#414868',
  },
  blue: { dim: '#7494c8', mid: '#8aabe6', bright: '#a5bcf0' },
  violet: { whisper: '#c2c0e8', dim: '#9480c8', mid: '#c498ff', bright: '#dbbeff' },
  teal: { whisper: '#bdd8e8', dim: '#5a9e94', mid: '#6ec4b6', bright: '#8fd4c8' },
  green: { dim: '#6a9e78', mid: '#96cc9e', bright: '#88dda0' },
  pink: { dim: '#b07888', mid: '#e888c0', bright: '#e0aabf' },
  sand: { dim: '#a8a578', mid: '#c5c28a', bright: '#d4d07a' },
  orange: '#e09a68',
  diag: { error: '#e07891', warning: '#c9a55a' },
  vcs: { added: '#9fd4ae', modified: '#d4d07a', deleted: '#e0aabf' },
  ui: { selection: '#3c3465', caretRow: '#181a2c', popupBg: '#13152a' },
  vscode: {
    bg: '#1f2235',
    caretRow: '#171929',
    tabBar: '#171929',
    titleBar: '#13152a',
  },
} as const

export type Palette = typeof palette
