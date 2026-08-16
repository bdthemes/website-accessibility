/**
 * Admin SPA extension registry.
 *
 * Lives in the shared components bundle (loaded before every other bundle) so
 * add-ons such as One Accessibility Pro can register screens, sidebar entries,
 * settings sections and controls before the admin app mounts. The free plugin
 * only ever *reads* from this registry — nothing in this plugin depends on an
 * add-on being present.
 *
 * window.websacAdminExtensions = {
 *   pages: { [pageSlug]: Component },
 *   sidebarItems: [{ group: 'general'|'compliance'|'support', key, icon | () => icon, label, position, isVisible? }],
 *   controls: { [slotName]: Component },
 *   settingsSections: [Component],           // props: { settings, saving, updateSetting, refreshSettings }
 *   providers: [Component],                  // React providers wrapping the admin app
 *   sidebarMenuInterceptors: [fn(key) => bool],
 *   tourActions: [{ id, label, start, isVisible? }],
 *   sidebarGroups: { compliance: 'COMPLIANCE' }, // labels for extra sidebar groups
 *   profilesStore: 'store/name'             // add-on store exposing getProfiles()
 * }
 */

const createRegistry = () => {
	const registry = {
		version: 1,
		pages: {},
		sidebarItems: [],
		controls: {},
		settingsSections: [],
		providers: [],
		sidebarMenuInterceptors: [],
		tourActions: [],
		sidebarGroups: {},
		/** Name of a @wordpress/data store exposing getProfiles() for add-on-provided profiles. */
		profilesStore: null,
	};

	registry.registerPage = (slug, Component) => {
		if (typeof slug === 'string' && slug && Component) {
			registry.pages[slug] = Component;
		}
	};
	registry.registerSidebarItem = (item) => {
		if (item && typeof item.key === 'string') {
			registry.sidebarItems.push({ group: 'support', position: 100, ...item });
		}
	};
	registry.registerSidebarGroup = (group, label) => {
		if (typeof group === 'string' && group) {
			registry.sidebarGroups[group] = label;
		}
	};
	registry.registerControl = (slot, Component) => {
		if (typeof slot === 'string' && slot && Component) {
			registry.controls[slot] = Component;
		}
	};
	registry.registerSettingsSection = (Component) => {
		if (Component) {
			registry.settingsSections.push(Component);
		}
	};
	registry.registerProvider = (Component) => {
		if (Component) {
			registry.providers.push(Component);
		}
	};
	registry.registerSidebarMenuInterceptor = (fn) => {
		if (typeof fn === 'function') {
			registry.sidebarMenuInterceptors.push(fn);
		}
	};
	registry.registerProfilesStore = (storeName) => {
		if (typeof storeName === 'string' && storeName) {
			registry.profilesStore = storeName;
		}
	};
	registry.registerTourAction = (action) => {
		if (action && typeof action.start === 'function') {
			registry.tourActions.push(action);
		}
	};

	return registry;
};

export const getAdminExtensions = () => {
	if (typeof window === 'undefined') {
		return createRegistry();
	}
	if (!window.websacAdminExtensions) {
		window.websacAdminExtensions = createRegistry();
	}
	return window.websacAdminExtensions;
};

export default getAdminExtensions;
