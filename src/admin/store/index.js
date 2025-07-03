import { createReduxStore, createRegistrySelector } from '@wordpress/data';
export const STORE_NAME = 'wap/admin-store';
import { store as coreStore } from '@wordpress/core-data';
import { defaultProfiles } from '../utils';
import { __ } from '@wordpress/i18n';

export const generateUniqueTitle = (base) => {
    const timestamp = Date.now(); // milliseconds since epoch
    const randomPart = Math.random().toString(36).slice(2, 8); // 6-char random string
    return `${base}-${timestamp}-${randomPart}`;
};


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
                width: '500',
            },
            items: [
                {
                    id: 'header',
                    title: 'Header',
                    slug: 'header',
                    active: true,
                    disableDrag: true,
                    attributes: {
                        text: 'Accessibility Menu (CTRL+U)',
                        showClose: true,
                        background: '#2e6cf6',
                        border: '1px solid #2e6cf6',
                        borderRadius: '6px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                        padding: '10px 20px',
                    }
                },
                {
                    id: 'language',
                    title: 'Language',
                    slug: 'language',
                    active: true,
                    close: true,
                    attributes: {
                        text: 'Language',
                        showClose: true,
                        flipContent: false,
                        background: '#ffffff',
                        border: '1px solid #e0e0e0',
                    }
                },
                {
                    id: 'profiles',
                    title: 'Profiles',
                    slug: 'profiles',
                    active: true,
                    attributes: {
                        profiles: [
                            "motor",
                            "blind",
                            "color-blind",
                            "dyslexia",
                            "low-vision",
                            "cognitive",
                            "seizure",
                            "adhd"
                        ],
                    }
                },
                {
                    id: 'features',
                    title: 'Features',
                    slug: 'features',
                    active: true,
                    close: true,
                    attributes: {
                        text: 'Features',
                        showClose: true,
                        flipContent: false,
                        background: '#ffffff',
                        border: '1px solid #e0e0e0',
                    }
                },
                {
                    id: 'footer',
                    title: 'Footer',
                    slug: 'footer',
                    active: true,
                    close: true,
                    disableDrag: true,
                }
            ]
        },
        button: {
            text: __('Accessibility Menu', 'website-accessibility'),
            showIcon: true,
            icon: 'accessibility1',
            color: '#ffffff',
            bgColor: '#1677ff',
            padding: '20px',
            borderRadius: '6px',
            position: 'bottom-right',
        },
    },
    profilesFormData: {
        name: generateUniqueTitle('New Profile'),
        description: '',
        features: {
            contrast: 'normal',
            screenReader: 'none',
            smartContrast: false,
            highlightLinks: false,
            biggerText: 'none',
            textSpacing: 'none',
            pauseAnimations: false,
            hideImages: false,
            dyslexiaFriendly: 'none',
            cursor: 'none',
            tooltips: false,
            lineHeight: 'none',
            textAlign: 'none',
            saturation: 'none',
            dictionary: false,
        },
    },
};

const store = createReduxStore(STORE_NAME, {
    reducer(state = DEFAULT_STATE, action) {
        switch (action.type) {
            case 'SET_PRESETS_FORM_DATA':
                return { ...state, presetsFormData: action.presetsFormData };
            case 'SET_PROFILES_FORM_DATA':
                return { ...state, profilesFormData: action.profilesFormData };
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
            case 'CREATE_PROFILE':
                return { ...state, profile: action.profile };
            case 'UPDATE_PROFILE':
                return { ...state, profile: action.profile };
            case 'SAVE_EDITED_PROFILE':
                return { ...state, profile: action.profile };
            case 'DELETE_PROFILE':
                return { ...state, profile: action.profile };
        }

        return state;
    },
    actions: {
        setPresetsFormData: (presetsFormData) => {
            return { type: 'SET_PRESETS_FORM_DATA', presetsFormData };
        },
        setProfilesFormData: (profilesFormData) => {
            return { type: 'SET_PROFILES_FORM_DATA', profilesFormData };
        },
        createPreset: (presetFormData) => {
            return async ({ dispatch, registry }) => {
                const { saveEntityRecord } = registry.dispatch('core');
                const preset = await saveEntityRecord('postType', 'wap_preset', {
                    title: presetFormData.title,
                    status: 'publish',
                    content: JSON.stringify({
                        preset: presetFormData.preset,
                        panel: presetFormData.panel,
                        button: presetFormData.button,
                    }),
                });

                await dispatch({ type: 'CREATE_PRESET', preset });
            };
        },
        updatePreset: (id, presetFormData) => {
            return async ({ dispatch, registry }) => {
                const { editEntityRecord } = registry.dispatch('core');
                const preset = await editEntityRecord('postType', 'wap_preset', id, presetFormData);
                await dispatch({ type: 'UPDATE_PRESET', preset });
            };
        },
        saveEditedPreset: (id) => {
            return async ({ dispatch, registry }) => {
                const { saveEditedEntityRecord } = registry.dispatch('core');
                const preset = await saveEditedEntityRecord('postType', 'wap_preset', id);
                await dispatch({ type: 'SAVE_EDITED_PRESET', preset });
            };
        },
        setPresetFilters: (filters = {}) => {
            return { type: 'SET_PRESET_FILTERS', presetFilters: filters };
        },
        deletePreset: (id) => {
            return async ({ dispatch, registry }) => {
                const { deleteEntityRecord } = registry.dispatch('core');
                const preset = await deleteEntityRecord('postType', 'wap_preset', id, { force: true });
                await dispatch({ type: 'DELETE_PRESET', preset });
            };
        },
        createProfile: (profileFormData) => {
            return async ({ dispatch, registry }) => {
                const { saveEntityRecord } = registry.dispatch('core');
                const profile = await saveEntityRecord('postType', 'wap_profile', {
                    title: profileFormData?.name,
                    status: 'publish',
                    content: JSON.stringify({
                        description: profileFormData?.description,
                        features: profileFormData?.features,
                        icon: profileFormData?.icon,
                    }),
                });

                await dispatch({ type: 'CREATE_PROFILE', profile });
            };
        },
        updateProfile: (id, profileFormData) => {
            return async ({ dispatch, registry }) => {
                const { editEntityRecord } = registry.dispatch('core');
                const profile = await editEntityRecord('postType', 'wap_profile', id, {
                    title: profileFormData.name,
                    content: JSON.stringify({
                        description: profileFormData.description,
                        features: profileFormData.features,
                        icon: profileFormData?.icon,
                    }),
                });
                await dispatch({ type: 'UPDATE_PROFILE', profile });
            };
        },
        saveEditedProfile: (id) => {
            return async ({ dispatch, registry }) => {
                const { saveEditedEntityRecord } = registry.dispatch('core');
                const profile = await saveEditedEntityRecord('postType', 'wap_profile', id);
                await dispatch({ type: 'SAVE_EDITED_PROFILE', profile });
            };
        },
        deleteProfile: (id) => {
            return async ({ dispatch, registry }) => {
                const { deleteEntityRecord } = registry.dispatch('core');
                const profile = await deleteEntityRecord('postType', 'wap_profile', id, { force: true });
                await dispatch({ type: 'DELETE_PROFILE', profile });
            };
        },
    },
    selectors: {
        getPresets: createRegistrySelector(
            (select) => (state, args = {}) => {
                const { getEntityRecords } = select(coreStore);
                const presets = getEntityRecords('postType', 'wap_preset', {
                    ...args,
                    per_page: -1,
                });
                return presets;
            }
        ),
        getPreset: createRegistrySelector(
            (select) => (state, id) => {
                const { getEditedEntityRecord } = select(coreStore);
                const preset = getEditedEntityRecord('postType', 'wap_preset', id);
                return preset;
            }
        ),
        getProfiles: createRegistrySelector(
            (select) => (state, withDefault = false) => {
                const { getEntityRecords } = select(coreStore);
                const profiles = getEntityRecords('postType', 'wap_profile');
                if (withDefault && profiles) {
                    return [...defaultProfiles, ...profiles];
                }
                return profiles;
            }
        ),
        getProfile: createRegistrySelector(
            (select) => (state, id) => {
                const { getEditedEntityRecord } = select(coreStore);
                const profile = getEditedEntityRecord('postType', 'wap_profile', id);
                return profile;
            }
        ),
        getPresetsFormData: (state) => {
            return {
                presetsFormData: state.presetsFormData,
            }
        },
        getProfilesFormData: (state) => {
            return {
                profilesFormData: state.profilesFormData,
            }
        },
        getPresetFilters: (state) => {
            return state.presetFilters;
        },
    }
});

export default store;