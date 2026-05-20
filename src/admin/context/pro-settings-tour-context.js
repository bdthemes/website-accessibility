/**
 * Pro settings guided tour — runs when the user activates a Pro license (separate from Quick Tour).
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
import { Joyride, EVENTS, STATUS } from 'react-joyride';
import { useHistory } from '../router';
import { useLicense } from './LicenseContext';

async function persistProSettingsTourComplete() {
	const admin = typeof window !== 'undefined' ? window.websacAdmin : null;
	if (!admin?.apiUrl || !admin?.nonce) {
		return false;
	}
	const url = `${admin.apiUrl}one-accessibility/v1/pro-settings-tour/complete`;
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

/** Sidebar Settings nav — users may click instead of Next. */
const SETTINGS_SIDEBAR_STEP_INDEX = 1;

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

const ProSettingsTourContext = createContext({
	startProSettingsTour: () => {},
	tryAdvanceProSettingsTourViaSidebarMenu: () => false,
});

export function useProSettingsTour() {
	return useContext(ProSettingsTourContext);
}

export function ProSettingsTourProvider({ children }) {
	const history = useHistory();
	const { isProActive, isProPluginActive } = useLicense();
	const canRunProTour = isProActive && isProPluginActive;

	const [run, setRun] = useState(false);
	const [tourNonce, setTourNonce] = useState(0);
	const runRef = useRef(false);
	const tourIndexRef = useRef(-1);
	const joyrideControlsRef = useRef(null);
	const pendingActivationStartRef = useRef(false);

	useEffect(() => {
		runRef.current = run;
	}, [run]);

	const navAndWait = useCallback(
		(page, selector) => {
			return async () => {
				history.push({ page });
				await new Promise((r) => setTimeout(r, 200));
				await waitForSelector(selector);
			};
		},
		[history]
	);

	const waitForFullDashboardShell = useCallback(async () => {
		await waitForSelector('[data-tour="wap-tour-full-dashboard"]', 120000);
	}, []);

	const waitForSettingsNavMenuItem = useCallback(async () => {
		await waitForSelector('[data-tour="wap-tour-settings-item"]', 120000);
	}, []);

	const markDone = useCallback(async () => {
		setRun(false);
		pendingActivationStartRef.current = false;
		const ok = await persistProSettingsTourComplete();
		if (ok && typeof window !== 'undefined' && window.websacAdmin) {
			window.websacAdmin.isProSettingsTourCompleted = true;
		}
	}, []);

	const startProSettingsTour = useCallback(({ force = false } = {}) => {
		if (!canRunProTour) {
			return;
		}
		if (
			!force &&
			typeof window !== 'undefined' &&
			window.websacAdmin?.isProSettingsTourCompleted
		) {
			return;
		}
		setTourNonce((n) => n + 1);
		setRun(true);
	}, [canRunProTour]);

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
				target: '[data-tour="wap-tour-full-dashboard"]',
				title: __('Pro license activated', 'website-accessibility'),
				content: (
					<div className="wap-dashboard-tour__step-body">
						<p>
							{__(
								'Your Pro license is active. This short tour shows Pro-only settings: translation options and the accessibility checker.',
								'website-accessibility'
							)}
						</p>
						<p>
							{__(
								'Tap Next to continue, or I understand to skip this tour.',
								'website-accessibility'
							)}
						</p>
						<div className="wap-dashboard-tour__step-actions wap-dashboard-tour__step-actions--row wap-dashboard-tour__step-actions--center">
							<button type="button" className="wap-dashboard-tour__understood-btn" onClick={markDone}>
								{__('I understand', 'website-accessibility')}
							</button>
						</div>
					</div>
				),
				placement: 'center',
				skipBeacon: true,
				before: waitForFullDashboardShell,
			},
			{
				target: '[data-tour="wap-tour-settings-item"]',
				title: __('Settings', 'website-accessibility'),
				content: __(
					'Open Settings in the sidebar for Pro-only options. Tap Next to open Settings, or click Settings now.',
					'website-accessibility'
				),
				placement: 'right',
				skipBeacon: true,
				spotlightClicks: true,
				before: waitForSettingsNavMenuItem,
			},
			{
				target: '[data-tour="wap-tour-settings-translation"]',
				title: __('Translation', 'website-accessibility'),
				content: __(
					'Control translation consent and whether to force-translate your site language for visitors using the language panel.',
					'website-accessibility'
				),
				placement: 'left',
				skipBeacon: true,
				before: navAndWait('website-accessibility-settings', '[data-tour="wap-tour-settings-translation"]'),
			},
			{
				target: '[data-tour="wap-tour-settings-checker"]',
				title: __('Accessibility checker', 'website-accessibility'),
				content: __(
					'Enable the checker for logged-in admins on the front end. When enabled, configure AI-powered fixes in the section below.',
					'website-accessibility'
				),
				placement: 'left',
				skipBeacon: true,
				before: navAndWait('website-accessibility-settings', '[data-tour="wap-tour-settings-checker"]'),
			},
		],
		[markDone, navAndWait, waitForFullDashboardShell, waitForSettingsNavMenuItem]
	);

	/** Start tour after license activation (not on routine status checks). */
	useEffect(() => {
		const onLicenseChanged = (event) => {
			if (!event.detail?.justActivated || !event.detail?.isLicenseValid) {
				return;
			}
			if (typeof window !== 'undefined' && window.websacAdmin?.isProSettingsTourCompleted) {
				return;
			}
			pendingActivationStartRef.current = true;
		};

		window.addEventListener('websac-license-changed', onLicenseChanged);
		return () => window.removeEventListener('websac-license-changed', onLicenseChanged);
	}, []);

	useEffect(() => {
		if (!pendingActivationStartRef.current || !canRunProTour) {
			return undefined;
		}
		if (typeof window !== 'undefined' && window.websacAdmin?.isProSettingsTourCompleted) {
			pendingActivationStartRef.current = false;
			return undefined;
		}
		const id = window.setTimeout(() => {
			pendingActivationStartRef.current = false;
			startProSettingsTour();
		}, 600);
		return () => window.clearTimeout(id);
	}, [canRunProTour, isProActive, startProSettingsTour]);

	const tryAdvanceProSettingsTourViaSidebarMenu = useCallback(
		(menuKey) => {
			if (!runRef.current || menuKey !== 'website-accessibility-settings') {
				return false;
			}
			if (tourIndexRef.current !== SETTINGS_SIDEBAR_STEP_INDEX) {
				return false;
			}
			const ctrls = joyrideControlsRef.current;
			if (!ctrls?.next) {
				return false;
			}
			ctrls.next();
			return true;
		},
		[]
	);

	const onEvent = useCallback(
		(data, controls) => {
			joyrideControlsRef.current = controls;
			if (typeof data.index === 'number') {
				tourIndexRef.current = data.index;
			}
			if (data.type === EVENTS.TOUR_END) {
				if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
					markDone();
				}
			}
		},
		[markDone]
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
			startProSettingsTour,
			tryAdvanceProSettingsTourViaSidebarMenu,
		}),
		[startProSettingsTour, tryAdvanceProSettingsTourViaSidebarMenu]
	);

	if (!canRunProTour) {
		return <ProSettingsTourContext.Provider value={contextValue}>{children}</ProSettingsTourContext.Provider>;
	}

	return (
		<ProSettingsTourContext.Provider value={contextValue}>
			{children}
			<Joyride
				key={tourNonce}
				steps={steps}
				run={run}
				continuous
				scrollToFirstStep
				locale={locale}
				onEvent={onEvent}
				options={{
					primaryColor: '#1677ff',
					zIndex: 1005001,
					spotlightPadding: 8,
					buttons: ['back', 'skip', 'primary'],
					closeButtonAction: 'skip',
					showProgress: true,
					targetWaitTimeout: 125000,
				}}
			/>
		</ProSettingsTourContext.Provider>
	);
}
