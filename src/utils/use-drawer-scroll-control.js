/**
 * Scroll isolation for third-party smooth-scroll libraries is now handled
 * directly inside WapDrawer (src/components/wap-drawer.js) so that every
 * drawer instance — Accessibility panel, Accessibility Checker, etc. —
 * is automatically protected.
 *
 * This hook is kept as a no-op for backward compatibility with call sites
 * that still invoke it (e.g. preview-content.js).
 */
export default function useDrawerScrollControl() {}
