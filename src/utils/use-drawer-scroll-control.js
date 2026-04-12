/**
 * Intentionally empty: do not set body overflow or wheel/touch guards here.
 * rc-drawer uses @rc-component/portal with autoLock when mask is true (injects overflow-y:hidden on body).
 * Frontend drawer uses mask={false} so the page can scroll with the panel open.
 */
export default function useDrawerScrollLock() {}
