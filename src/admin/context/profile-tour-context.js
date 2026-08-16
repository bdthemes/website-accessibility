/**
 * Custom Profiles guided tour — manual start from About (Pro settings tour pattern).
 */
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Joyride, EVENTS, STATUS, ACTIONS } from 'react-joyride';
import { getQueryArgs } from '@wordpress/url';
import { useDispatch } from '@wordpress/data';
import { useHistory, useLocation } from '../router';
import { STORE_NAME } from '../store';

async function persistProfileTourComplete() {
	const admin = typeof window !== 'undefined' ? window.websacAdmin : null;
	if (!admin?.apiUrl || !admin?.nonce) {
		return false;
	}
	const url = `${admin.apiUrl}websac/v1/profile-tour/complete`;
	try {
		const res = await fetch(url, {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': admin.nonce,
			},
			body: JSON.stringify({}),
		});
		return res.ok;
	} catch {
		return false;
	}
}

/** Sidebar Custom Profiles nav — users may click instead of Next. */
const PROFILES_SIDEBAR_STEP_INDEX = 0;
/** Add New Profile button — users may click instead of Next. */
const ADD_NEW_PROFILE_STEP_INDEX = 1;
/** Create Profile step — Next triggers save (same as Create Profile button). */
const SAVE_PROFILE_STEP_INDEX = 4;
/** Enable new profile in preset — tour completes when toggled on. */
const ENABLE_PROFILE_IN_PRESET_STEP_INDEX = 5;
const PROFILE_TOUR_STEP_COUNT = 6;

function waitForSelector(selector, timeout = 9000) {
	return new Promise((resolve) => {
		const start = Date.now();
		const check = () => {
			if (document.querySelector(selector)) {
				resolve(true);
				return;
			}
			if (Date.now() - start >= timeout) {
				resolve(false);
				return;
			}
			requestAnimationFrame(check);
		};
		check();
	});
}

const ProfileTourContext = createContext({
	startProfileTour: () => {},
	notifyOpenedCreateProfileFromTour: () => false,
	notifyProfileSavedForTour: () => false,
	notifyProfileEnabledInPresetForTour: () => false,
	notifyProfileTourPresetSaved: () => {},
	registerProfileSaveHandler: () => {},
	tourCreatedProfileId: null,
	tryAdvanceProfileTourViaSidebarMenu: () => false,
});

export function useProfileTour() {
	return useContext(ProfileTourContext);
}

export function ProfileTourProvider({ children }) {
	const history = useHistory();
	const location = useLocation();
	const { refreshProfiles } = useDispatch(STORE_NAME);
	// Custom profiles ship in this plugin, so the tour is available to everyone.
	const canRunProfileTour = true;

	const [run, setRun] = useState(false);
	const [stepIndex, setStepIndex] = useState(0);
	const [tourNonce, setTourNonce] = useState(0);
	const [tourCreatedProfileId, setTourCreatedProfileId] = useState(null);
	const runRef = useRef(false);
	const tourIndexRef = useRef(-1);
	const joyrideControlsRef = useRef(null);
	const createdProfileIdRef = useRef(null);
	const tourPresetIdRef = useRef(null);
	const profileSaveHandlerRef = useRef(null);
	const profileSaveInFlightRef = useRef(false);
	const profileTabAutoStartRef = useRef(false);

	const setTourStep = useCallback((index) => {
		const clamped = Math.max(0, Math.min(index, PROFILE_TOUR_STEP_COUNT - 1));
		setStepIndex(clamped);
		tourIndexRef.current = clamped;
	}, []);

	const advanceTourStep = useCallback(() => {
		setTourStep(tourIndexRef.current + 1);
	}, [setTourStep]);

	useEffect(() => {
		runRef.current = run;
	}, [run]);

	const navAndWait = useCallback(
		(page, selector) => {
			return async () => {
				history.push({ page });
				await new Promise((r) => setTimeout(r, 200));
				await waitForSelector(selector, 120000);
			};
		},
		[history]
	);

	const navigateToCreateProfileAndWait = useCallback(
		(selector) => {
			return async () => {
				history.push({ page: 'website-accessibilityfiles-create' });
				await new Promise((r) => setTimeout(r, 250));
				await waitForSelector(selector, 120000);
			};
		},
		[history]
	);

	const waitForProfilesNavMenuItem = useCallback(async () => {
		await waitForSelector('[data-tour="wap-tour-profiles-item"]', 120000);
	}, []);

	const getTourPresetEditTargetId = useCallback(() => {
		const btn = document.querySelector('[data-tour="wap-tour-presets-edit-first"]');
		const tr = btn?.closest('tr');
		const fromRow = tr?.getAttribute('data-row-key');
		if (fromRow) {
			return String(fromRow);
		}
		const args = typeof window !== 'undefined' ? getQueryArgs(window.location.href) : {};
		if (args.page === 'website-accessibility-presets-edit' && args.id) {
			return String(args.id);
		}
		return null;
	}, []);

	const navigateToPresetEditAndWaitForTourProfile = useCallback(async () => {
		await refreshProfiles();
		let presetId = getTourPresetEditTargetId();
		if (!presetId) {
			history.push({ page: 'website-accessibility-presets' });
			await new Promise((r) => setTimeout(r, 250));
			await waitForSelector('[data-tour="wap-tour-presets-edit-first"]', 120000);
			presetId = getTourPresetEditTargetId();
		}
		if (presetId) {
			tourPresetIdRef.current = presetId;
			history.push({ page: 'website-accessibility-presets-edit', id: presetId });
			await new Promise((r) => setTimeout(r, 400));
			await waitForSelector('[data-tour="wap-tour-preset-enable-profile"]', 120000);
			const el = document.querySelector('[data-tour="wap-tour-preset-enable-profile"]');
			el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
		}
	}, [history, getTourPresetEditTargetId, refreshProfiles]);

	const markDone = useCallback(async () => {
		setRun(false);
		setStepIndex(0);
		const ok = await persistProfileTourComplete();
		if (ok && typeof window !== 'undefined' && window.websacAdmin) {
			window.websacAdmin.isProfileTourCompleted = true;
			window.websacAdmin.shouldAutoStartProfileTour = false;
		}
	}, []);

	const startProfileTour = useCallback(({ force = false, fromProfilesPage = false } = {}) => {
		if (!canRunProfileTour) {
			return;
		}
		if (
			!force &&
			typeof window !== 'undefined' &&
			window.websacAdmin?.isProfileTourCompleted
		) {
			return;
		}
		const startAt = fromProfilesPage ? ADD_NEW_PROFILE_STEP_INDEX : PROFILES_SIDEBAR_STEP_INDEX;
		setTourNonce((n) => n + 1);
		setTourCreatedProfileId(null);
		createdProfileIdRef.current = null;
		tourPresetIdRef.current = null;
		setTourStep(startAt);
		setRun(true);
	}, [canRunProfileTour, setTourStep]);

	/** First visit to Custom Profiles tab — auto-start tour at Add New Profile step. */
	useEffect(() => {
		if (profileTabAutoStartRef.current) {
			return undefined;
		}
		if (!canRunProfileTour) {
			return undefined;
		}
		if (
			typeof window !== 'undefined' &&
			!window.websacAdmin?.shouldAutoStartProfileTour
		) {
			return undefined;
		}
		if (location?.params?.page !== 'website-accessibilityfiles') {
			return undefined;
		}

		profileTabAutoStartRef.current = true;
		const id = window.setTimeout(() => {
			startProfileTour({ fromProfilesPage: true });
		}, 700);
		return () => window.clearTimeout(id);
	}, [location?.params?.page, canRunProfileTour, startProfileTour]);

	/** Escape closes the tour and persists completion (same as skip / done). */
	useEffect(() => {
		if (!run) {
			return undefined;
		}
		const onEscape = (event) => {
			if (event.key !== 'Escape') {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			void markDone();
		};
		window.addEventListener('keydown', onEscape, true);
		return () => window.removeEventListener('keydown', onEscape, true);
	}, [run, markDone]);

	const steps = useMemo(
		() => [
			{
				target: '[data-tour="wap-tour-profiles-item"]',
				title: __('Custom Profiles', 'website-accessibility'),
				content: __(
					'Open Custom Profiles in the sidebar to create accessibility bundles for different user needs. Tap Next to open the list, or click Custom Profiles now.',
					'website-accessibility'
				),
				placement: 'right',
				skipBeacon: true,
				spotlightClicks: true,
				before: waitForProfilesNavMenuItem,
			},
			{
				target: '[data-tour="wap-tour-profiles-add-new"]',
				title: __('Add New Profile', 'website-accessibility'),
				content: __(
					'Tap Add New Profile to open the editor, or click the button now.',
					'website-accessibility'
				),
				placement: 'bottom',
				skipBeacon: true,
				spotlightClicks: true,
				before: navAndWait(
					'website-accessibilityfiles',
					'[data-tour="wap-tour-profiles-add-new"]'
				),
			},
			{
				target: '[data-tour="wap-tour-profile-information"]',
				title: __('Profile information', 'website-accessibility'),
				content: __(
					'Set up your profile: give it a clear name, add an optional description, and upload an SVG icon. The name and icon appear in the accessibility panel for visitors.',
					'website-accessibility'
				),
				placement: 'left',
				skipBeacon: true,
				spotlightClicks: true,
				before: navigateToCreateProfileAndWait('[data-tour="wap-tour-profile-information"]'),
			},
			{
				target: '[data-tour="wap-tour-profile-features"]',
				title: __('Accessibility features', 'website-accessibility'),
				content: __(
					'Choose which features this profile applies when a visitor selects it — contrast, text size, and more.',
					'website-accessibility'
				),
				placement: 'left',
				skipBeacon: true,
				before: navigateToCreateProfileAndWait('[data-tour="wap-tour-profile-features"]'),
			},
			{
				target: '[data-tour="wap-tour-save-profile"]',
				title: __('Create Profile', 'website-accessibility'),
				content: __(
					'Click Create Profile to save, or tap the button below. Next you will enable it in a preset so visitors can use it.',
					'website-accessibility'
				),
				placement: 'left',
				skipBeacon: true,
				spotlightClicks: true,
				locale: {
					next: __('Create Profile', 'website-accessibility'),
				},
				before: navigateToCreateProfileAndWait('[data-tour="wap-tour-save-profile"]'),
			},
			{
				target: '[data-tour="wap-tour-preset-enable-profile"]',
				title: __('Enable profile in preset', 'website-accessibility'),
				content: __(
					'Turn on your new profile in this preset so it appears in the accessibility panel. The preset will be saved automatically.',
					'website-accessibility'
				),
				placement: 'left',
				skipBeacon: true,
				spotlightClicks: true,
				before: navigateToPresetEditAndWaitForTourProfile,
			},
		],
		[
			navAndWait,
			navigateToCreateProfileAndWait,
			navigateToPresetEditAndWaitForTourProfile,
			waitForProfilesNavMenuItem,
		]
	);

	const notifyOpenedCreateProfileFromTour = useCallback(() => {
		if (!runRef.current || tourIndexRef.current !== ADD_NEW_PROFILE_STEP_INDEX) {
			return false;
		}
		advanceTourStep();
		return true;
	}, [advanceTourStep]);

	const registerProfileSaveHandler = useCallback((handler) => {
		profileSaveHandlerRef.current = typeof handler === 'function' ? handler : null;
	}, []);

	const notifyProfileSavedForTour = useCallback((profileId) => {
		if (!runRef.current || tourIndexRef.current !== SAVE_PROFILE_STEP_INDEX) {
			return false;
		}
		if (profileId !== null && profileId !== undefined && `${profileId}` !== '') {
			const id = String(profileId);
			createdProfileIdRef.current = id;
			setTourCreatedProfileId(id);
		}
		profileSaveInFlightRef.current = false;
		window.setTimeout(() => {
			advanceTourStep();
		}, 120);
		return true;
	}, [advanceTourStep]);

	const notifyProfileEnabledInPresetForTour = useCallback((profileId) => {
		if (!runRef.current || tourIndexRef.current !== ENABLE_PROFILE_IN_PRESET_STEP_INDEX) {
			return false;
		}
		const tourId = createdProfileIdRef.current;
		if (tourId && String(profileId) !== String(tourId)) {
			return false;
		}
		return true;
	}, []);

	const notifyProfileTourPresetSaved = useCallback(() => {
		if (!runRef.current || tourIndexRef.current !== ENABLE_PROFILE_IN_PRESET_STEP_INDEX) {
			return;
		}
		window.setTimeout(() => {
			void markDone();
		}, 150);
	}, [markDone]);

	const tryAdvanceProfileTourViaSidebarMenu = useCallback((menuKey) => {
		if (menuKey !== 'website-accessibilityfiles') {
			return false;
		}
		if (!runRef.current || tourIndexRef.current !== PROFILES_SIDEBAR_STEP_INDEX) {
			return false;
		}
		advanceTourStep();
		return true;
	}, [advanceTourStep]);

	const onEvent = useCallback(
		(data, controls) => {
			joyrideControlsRef.current = controls;
			if (typeof data.index === 'number') {
				tourIndexRef.current = data.index;
			}

			if (
				runRef.current &&
				data.type === EVENTS.STEP_AFTER &&
				data.action === ACTIONS.NEXT &&
				data.index === SAVE_PROFILE_STEP_INDEX
			) {
				const saveHandler = profileSaveHandlerRef.current;
				if (saveHandler && !profileSaveInFlightRef.current) {
					profileSaveInFlightRef.current = true;
					setTourStep(SAVE_PROFILE_STEP_INDEX);
					void Promise.resolve(saveHandler()).finally(() => {
						profileSaveInFlightRef.current = false;
					});
				}
				return;
			}

			if (data.type === EVENTS.STEP_AFTER || data.type === EVENTS.TARGET_NOT_FOUND) {
				if (data.action === ACTIONS.PREV) {
					setTourStep(data.index - 1);
				} else if (data.action === ACTIONS.NEXT) {
					setTourStep(data.index + 1);
				}
			}

			if (data.type === EVENTS.TOUR_END) {
				if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
					markDone();
				}
			}
		},
		[markDone, setTourStep]
	);

	const locale = useMemo(
		() => ({
			back: __('Back', 'website-accessibility'),
			close: __('Close', 'website-accessibility'),
			last: __('Done', 'website-accessibility'),
			next: __('Next', 'website-accessibility'),
			nextWithProgress: __('Next ({current} of {total})', 'website-accessibility'),
			skip: __('Skip tour', 'website-accessibility'),
		}),
		[]
	);

	const contextValue = useMemo(
		() => ({
			startProfileTour,
			notifyOpenedCreateProfileFromTour,
			notifyProfileSavedForTour,
			notifyProfileEnabledInPresetForTour,
			notifyProfileTourPresetSaved,
			registerProfileSaveHandler,
			tryAdvanceProfileTourViaSidebarMenu,
			tourCreatedProfileId,
		}),
		[
			startProfileTour,
			notifyOpenedCreateProfileFromTour,
			notifyProfileSavedForTour,
			notifyProfileEnabledInPresetForTour,
			notifyProfileTourPresetSaved,
			registerProfileSaveHandler,
			tryAdvanceProfileTourViaSidebarMenu,
			tourCreatedProfileId,
		]
	);

	if (!canRunProfileTour) {
		return <ProfileTourContext.Provider value={contextValue}>{children}</ProfileTourContext.Provider>;
	}

	return (
		<ProfileTourContext.Provider value={contextValue}>
			{children}
			<Joyride
				key={tourNonce}
				steps={steps}
				stepIndex={stepIndex}
				run={run}
				continuous
				scrollToFirstStep
				locale={locale}
				onEvent={onEvent}
				styles={{
					tooltip: {
						borderRadius: 12,
						padding: 24,
						boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 20px rgba(0, 0, 0, 0.08)',
						border: '1px solid rgba(0, 0, 0, 0.04)',
						maxWidth: 420,
					},
					tooltipContainer: {
						textAlign: 'left',
						lineHeight: 1.6,
					},
					tooltipTitle: {
						fontSize: 18,
						fontWeight: 700,
						color: '#111827',
						marginBottom: 4,
						letterSpacing: '-0.01em',
					},
					tooltipContent: {
						fontSize: 14,
						color: '#4b5563',
						paddingTop: 8,
						paddingBottom: 16,
					},
					tooltipFooter: {
						marginTop: 0,
						borderTop: '1px solid #f3f4f6',
						paddingTop: 14,
					},
					buttonPrimary: {
						backgroundColor: '#1677ff',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						padding: '0 22px',
						height: 36,
						lineHeight: '36px',
						boxShadow: '0 2px 8px rgba(22, 119, 255, 0.3)',
						border: 'none',
					},
					buttonBack: {
						color: '#6b7280',
						fontSize: 14,
						fontWeight: 500,
						marginRight: 8,
					},
					buttonSkip: {
						color: '#9ca3af',
						fontSize: 13,
						fontWeight: 500,
					},
					buttonClose: {
						top: 12,
						right: 12,
						width: 14,
						height: 14,
						color: '#9ca3af',
					},
					spotlight: {
						borderRadius: 12,
					},
					overlay: {
						backgroundColor: 'rgba(17, 24, 39, 0.4)',
					},
				}}
				options={{
					primaryColor: '#1677ff',
					zIndex: 1005002,
					spotlightPadding: 10,
					buttons: ['back', 'skip', 'primary'],
					closeButtonAction: 'skip',
					showProgress: true,
					targetWaitTimeout: 125000,
				}}
			/>
		</ProfileTourContext.Provider>
	);
}
