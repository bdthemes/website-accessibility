import { createReduxStore, createRegistrySelector } from '@wordpress/data';
export const STORE_NAME = 'wap/admin-store';
import { store as coreStore } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';

export const generateUniqueTitle = (base) => {
    const timestamp = Date.now(); // milliseconds since epoch
    const randomPart = Math.random().toString(36).slice(2, 8); // 6-char random string
    return `${base}-${timestamp}-${randomPart}`;
};

const { panelItems = [], defaultProfiles = [] } = window?.wapHelpers || {};

export const DEFAULT_STATE = {
    presets: [],
    profiles: [],
    presetsFormData: {
        title: generateUniqueTitle('New Preset'),
        preset: {
            active: true,
            condition: 'entire_site',
        },
        panel: {
            wrapper: {
                width: '450',
                maxHeight: '90',
            },
            items: panelItems,
        },
        button: {
            text: __('Accessibility Menu', 'website-accessibility'),
            showIcon: true,
            icon: 'accessibility1',
            color: '#ffffff',
            bgColor: '#1677ff',
            position: 'bottom-right',
            buttonType: 'icon',
            offsetX: 40,
            offsetY: 40,
        },
    },
};

const store = createReduxStore(STORE_NAME, {
    reducer(state = DEFAULT_STATE, action) {
        switch (action.type) {
            case 'SET_PRESETS_FORM_DATA':
                return { ...state, presetsFormData: action.presetsFormData };
            case 'CREATE_PRESET':
                return { ...state, preset: action.preset };
            case 'UPDATE_PRESET':
                return { ...state, preset: action.preset };
            case 'SAVE_EDITED_PRESET':
                return { ...state, preset: action.preset };
            case 'SET_PRESET_FILTERS':
                return { ...state, presetFilters: action.presetFilters };
            case 'DELETE_PRESET':
                return { ...state, preset: action.preset };
        }

        return state;
    },
    actions: {
        setPresetsFormData: (presetsFormData) => {
            return { type: 'SET_PRESETS_FORM_DATA', presetsFormData };
        },
        createPreset: (presetFormData) => {
            return async ({ dispatch, registry }) => {
                const { saveEntityRecord, invalidateResolutionForStoreSelector } = registry.dispatch('core');

                // Other active presets covering the same pages are switched off on the
                // server while this one saves (Core\AccessibilityPreset::save_preset).
                // Doing it here first left the site with no active preset whenever
                // the save then failed, and it ignored the selected pages/archives.
                const newPreset = await saveEntityRecord('postType', 'websac_preset', {
                    title: presetFormData.title,
                    status: 'publish',
                    content: JSON.stringify({
                        preset: presetFormData.preset,
                        panel: presetFormData.panel,
                        button: presetFormData.button,
                    }),
                });

                // core-data resolves to undefined on failure rather than throwing,
                // so a dead REST call would otherwise look like a successful save.
                if (!newPreset) {
                    const error = registry
                        .select(coreStore)
                        .getLastEntitySaveError('postType', 'websac_preset');
                    return { success: false, error };
                }

                // Reload the list: the server may have switched other presets off.
                invalidateResolutionForStoreSelector('getEntityRecords');
                await dispatch({ type: 'CREATE_PRESET', preset: newPreset });

                return { success: true };
            };
        },
        updatePreset: (id, presetFormData) => {
            return async ({ dispatch, registry }) => {
                if (!id || !presetFormData?.title) {
                    return;
                }

                const { editEntityRecord } = registry.dispatch('core');
                const preset = await editEntityRecord('postType', 'websac_preset', id, presetFormData);
                await dispatch({ type: 'UPDATE_PRESET', preset });
            };
        },
        saveEditedPreset: (id) => {
            return async ({ dispatch, registry }) => {
                const { select, dispatch: coreDispatch } = registry;
                const { getEditedEntityRecord, hasEditsForEntityRecord } = select('core');
                const { saveEditedEntityRecord, invalidateResolutionForStoreSelector } = coreDispatch('core');

                const currentPreset = getEditedEntityRecord('postType', 'websac_preset', id);
                if (!currentPreset) return;

                // Nothing changed: core-data saves nothing and resolves undefined, which
                // read as a failed save ("Could not save the preset…"). Say so instead.
                if (!hasEditsForEntityRecord('postType', 'websac_preset', id)) {
                    return { success: true, unchanged: true };
                }

                // Other active presets covering the same pages are switched off on the
                // server while this one saves (Core\AccessibilityPreset::save_preset).
                const savedPreset = await saveEditedEntityRecord('postType', 'websac_preset', id);

                // core-data resolves to undefined on failure rather than throwing,
                // so a dead REST call would otherwise look like a successful save.
                if (!savedPreset) {
                    const error = select('core').getLastEntitySaveError(
                        'postType',
                        'websac_preset',
                        id
                    );
                    return { success: false, error };
                }

                // Reload the list: the server may have switched other presets off.
                invalidateResolutionForStoreSelector('getEntityRecords');
                await dispatch({ type: 'SAVE_EDITED_PRESET', preset: savedPreset });

                return { success: true };
            };
        },

        setPresetFilters: (filters = {}) => {
            return { type: 'SET_PRESET_FILTERS', presetFilters: filters };
        },
        deletePreset: (id) => {
            return async ({ dispatch, registry }) => {
                const { deleteEntityRecord } = registry.dispatch('core');
                const preset = await deleteEntityRecord('postType', 'websac_preset', id, { force: true });
                await dispatch({ type: 'DELETE_PRESET', preset });
            };
        },
    },
    selectors: {
        getPresets: createRegistrySelector(
            (select) => (state, args = {}) => {
                const { getEntityRecords } = select(coreStore);
                const presets = getEntityRecords('postType', 'websac_preset', {
                    ...args,
                    per_page: -1,
                });
                return presets;
            }
        ),
        getPreset: createRegistrySelector(
            (select) => (state, id) => {
                const { getEditedEntityRecord } = select(coreStore);
                const preset = getEditedEntityRecord('postType', 'websac_preset', id);
                return preset;
            }
        ),
        /**
         * Profiles offered in the preset editor: the built-in ones plus any
         * provided by an add-on store that implements `getProfiles()`
         * (registered under the name in window.websacAdminExtensions.profilesStore).
         */
        getProfiles: createRegistrySelector(
            (select) => (state, withDefault = false) => {
                const storeName = window?.websacAdminExtensions?.profilesStore;
                let custom = [];
                if (storeName) {
                    try {
                        custom = select(storeName)?.getProfiles?.() || [];
                    } catch (e) {
                        custom = [];
                    }
                }
                if (withDefault) {
                    return [...defaultProfiles, ...custom];
                }
                return custom;
            }
        ),
        getPresetsFormData: (state) => {
            return {
                presetsFormData: state.presetsFormData,
            }
        },
        getPresetFilters: (state) => {
            return state.presetFilters;
        }
    }
});

export default store;
