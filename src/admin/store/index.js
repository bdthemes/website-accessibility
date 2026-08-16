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
                width: '420',
                maxHeight: '605',
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
                const { editEntityRecord, saveEditedEntityRecord, saveEntityRecord } = registry.dispatch('core');

                // Wait until presets are resolved — synchronous getEntityRecords can be undefined on first load,
                // which made sameTypePresets undefined and crashed `for...of` on the first Save click.
                const prevPresets =
                    (await registry.resolveSelect(coreStore).getEntityRecords('postType', 'websac_preset', {
                        per_page: -1,
                    })) ?? [];

                // Step 2: If new preset is active, deactivate others of same type
                if (presetFormData?.preset?.active) {
                    const sameTypePresets = prevPresets.filter((preset) => {
                        let presetData = {};
                        try {
                            presetData = JSON.parse(preset?.content?.raw);
                        } catch (error) {
                            console.error(error);
                        }

                        const isSameType = presetData?.preset?.condition === presetFormData?.preset?.condition;
                        const isActive = presetData?.preset?.active;

                        return isSameType && isActive;
                    });

                    for (const oldPreset of sameTypePresets) {
                        let oldContent = {};
                        try {
                            oldContent = JSON.parse(oldPreset.content.raw);
                        } catch (error) {
                            console.error(error);
                        }

                        // Deactivate it
                        oldContent.preset.active = false;

                        editEntityRecord('postType', 'websac_preset', oldPreset.id, {
                            content: JSON.stringify(oldContent),
                        });

                        await saveEditedEntityRecord('postType', 'websac_preset', oldPreset.id);
                    }
                }

                // Step 3: Save new preset
                const newPreset = await saveEntityRecord('postType', 'websac_preset', {
                    title: presetFormData.title,
                    status: 'publish',
                    content: JSON.stringify({
                        preset: presetFormData.preset,
                        panel: presetFormData.panel,
                        button: presetFormData.button,
                    }),
                });

                await dispatch({ type: 'CREATE_PRESET', preset: newPreset });
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
                const { getEditedEntityRecord, getEntityRecord } = select('core');
                const { editEntityRecord, saveEditedEntityRecord } = coreDispatch('core');

                // Step 1: Get the edited version of the preset (unsaved)
                const currentPreset = getEditedEntityRecord('postType', 'websac_preset', id);
                if (!currentPreset) return;

                let currentContent = {};
                try {
                    currentContent = JSON.parse(currentPreset.content?.raw || currentPreset.content);
                } catch (error) {
                    console.error('Failed to parse current preset content', error);
                }

                const isActive = currentContent?.preset?.active;
                const currentCondition = currentContent?.preset?.condition;

                // Step 1.5: Get the original (saved) version of the preset
                const originalPreset = getEntityRecord('postType', 'websac_preset', id);
                let originalContent = {};
                try {
                    originalContent = JSON.parse(originalPreset?.content?.raw || originalPreset?.content);
                } catch (error) {
                    // It's ok if not found (new preset), just fallback to empty
                }
                const wasActive = originalContent?.preset?.active;
                const wasCondition = originalContent?.preset?.condition;

                // Only deactivate others if:
                // - The preset is now active, and
                // - It was previously inactive, or the condition changed
                const shouldDeactivateOthers = (
                    isActive &&
                    (
                        wasActive !== true ||
                        wasCondition !== currentCondition
                    )
                );

                if (shouldDeactivateOthers && currentCondition) {
                    const allPresets =
                        (await registry.resolveSelect(coreStore).getEntityRecords('postType', 'websac_preset', {
                            per_page: -1,
                        })) ?? [];

                    const sameTypePresets = allPresets.filter((preset) => {
                        if (preset.id === id) return false; // Skip current

                        let content = {};
                        try {
                            content = JSON.parse(preset.content?.raw || preset.content);
                        } catch (error) {
                            console.error('Failed to parse other preset content', error);
                        }

                        const sameType = content?.preset?.condition === currentCondition;
                        const isActive = content?.preset?.active === true;

                        return sameType && isActive;
                    });

                    for (const preset of sameTypePresets) {
                        let content = {};
                        try {
                            content = JSON.parse(preset.content?.raw || preset.content);
                        } catch (error) {
                            console.error('Failed to parse same-type preset', error);
                        }

                        // Deactivate it
                        content.preset.active = false;

                        editEntityRecord('postType', 'websac_preset', preset.id, {
                            content: JSON.stringify(content),
                        });

                        await saveEditedEntityRecord('postType', 'websac_preset', preset.id);
                    }
                }

                // Step 3: Save the current edited preset
                const savedPreset = await saveEditedEntityRecord('postType', 'websac_preset', id);

                // Step 4: Dispatch custom action if needed
                await dispatch({ type: 'SAVE_EDITED_PRESET', preset: savedPreset });
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
