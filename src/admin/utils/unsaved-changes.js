import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Unsaved-changes guard for the preset editors.
 *
 * The editor page reports whether its form differs from what was loaded;
 * leaving the page (reload, closing the tab, a wp-admin link) then shows the
 * browser's "Leave site?" prompt, and the SPA sidebar asks before switching
 * screens (`confirmDiscardUnsavedChanges()` in admin-layout). Programmatic
 * navigation (a successful save, the guided tours) is never blocked.
 */
let dirty = false;

const onBeforeUnload = (event) => {
	if (!dirty) {
		return undefined;
	}
	event.preventDefault();
	// Chrome < 119 needs returnValue set; the text itself is not shown.
	event.returnValue = '';
	return '';
};

export function useUnsavedChangesGuard(isDirty) {
	useEffect(() => {
		dirty = !!isDirty;
		if (!isDirty) {
			return undefined;
		}
		window.addEventListener('beforeunload', onBeforeUnload);
		return () => {
			window.removeEventListener('beforeunload', onBeforeUnload);
		};
	}, [isDirty]);

	// Leaving the editor (unmount) always clears the flag.
	useEffect(() => () => {
		dirty = false;
	}, []);
}

export function hasUnsavedChanges() {
	return dirty;
}

/**
 * Ask before an in-app navigation drops unsaved preset changes.
 *
 * @return {boolean} true when it is fine to navigate.
 */
export function confirmDiscardUnsavedChanges() {
	if (!dirty) {
		return true;
	}
	// eslint-disable-next-line no-alert
	const ok = window.confirm(
		__('You have unsaved changes to this preset. Leave without saving?', 'website-accessibility')
	);
	if (ok) {
		dirty = false;
	}
	return ok;
}
