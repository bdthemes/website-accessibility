/**
 * Guided tour: Welcome → Presets (sidebar) → Presets list → Edit preset → Save → Preview.
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
import { addQueryArgs, getQueryArgs } from '@wordpress/url';
import { Joyride, EVENTS, STATUS } from 'react-joyride';
import { useHistory } from '../router';

async function persistDashboardTourComplete() {
	const admin = typeof window !== 'undefined' ? window.websacAdmin : null;
	if (!admin?.apiUrl || !admin?.nonce) {
		return false;
	}
	const url = `${admin.apiUrl}one-accessibility/v1/dashboard-tour/complete`;
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

/** Zero-based index of the Save preset step (after welcome step). */
const SAVE_STEP_INDEX = 4;

/** WordPress admin bar: site name / front-end URL (same as core #wp-admin-bar-site-name). */
const WP_ADMIN_BAR_SITE_LINK = '#wp-admin-bar-site-name > a';

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

/** First-row Edit tour control or current edit URL (after navigating to preset editor). */
function getTourFirstPresetEditId() {
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
}

const DashboardTourContext = createContext({
	startTour: () => {},
	notifyPresetSavedForTour: () => {},
	dismissTourUnderstood: () => {},
});

export function useDashboardTour() {
	return useContext(DashboardTourContext);
}

export function DashboardTourProvider({ children }) {
	const history = useHistory();
	const [run, setRun] = useState(false);
	const [tourNonce, setTourNonce] = useState(0);
	const runRef = useRef(false);
	const tourIndexRef = useRef(-1);
	const joyrideControlsRef = useRef(null);

	const homeUrl =
		typeof window !== 'undefined' && window.websacAdmin?.homeUrl ? window.websacAdmin.homeUrl : '/';

	const siteOpenPanelUrl = useMemo(() => addQueryArgs(homeUrl, { websac_open: '1' }), [homeUrl]);

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

	const navigateToEditFirstPresetAndWait = useCallback(
		(selector) => {
			return async () => {
				let id = getTourFirstPresetEditId();
				if (!id) {
					history.push({ page: 'website-accessibility-presets' });
					await new Promise((r) => setTimeout(r, 250));
					await waitForSelector('[data-tour="wap-tour-presets-edit-first"]', 120000);
					id = getTourFirstPresetEditId();
				}
				if (id) {
					history.push({ page: 'website-accessibility-presets-edit', id });
					await new Promise((r) => setTimeout(r, 250));
					await waitForSelector(selector, 120000);
				}
			};
		},
		[history]
	);

	const waitForAdminBarSiteLink = useCallback(async () => {
		await waitForSelector(WP_ADMIN_BAR_SITE_LINK, 120000);
	}, []);

	const waitForFullDashboardShell = useCallback(async () => {
		await waitForSelector('[data-tour="wap-tour-full-dashboard"]', 120000);
	}, []);

	const waitForPresetsNavMenuItem = useCallback(async () => {
		await waitForSelector('[data-tour="wap-tour-presets-item"]', 120000);
	}, []);

	const markDone = useCallback(async () => {
		setRun(false);
		const ok = await persistDashboardTourComplete();
		if (ok && typeof window !== 'undefined' && window.websacAdmin) {
			window.websacAdmin.shouldAutoStartDashboardTour = false;
		}
	}, []);

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
				title: __('Welcome', 'website-accessibility'),
				content: (
					<div className="wap-dashboard-tour__step-body">
						<p>
							{__(
								'Welcome to One Accessibility. This short tour walks you through editing a preset and previewing it on your site.',
								'website-accessibility'
							)}
						</p>
						<p>
							{__(
								'Do you already know how presets and the accessibility toolbar work? If you already know your way around, tap I understand to skip. If you would like a guided walkthrough, tap Next.',
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
				target: '[data-tour="wap-tour-presets-item"]',
				title: __('Presets', 'website-accessibility'),
				content: __(
					'Use Presets in the sidebar to manage accessibility toolbars and where they apply. Tap Next to open the Presets screen, or click Presets now.',
					'website-accessibility'
				),
				placement: 'right',
				skipBeacon: true,
				spotlightClicks: true,
				before: waitForPresetsNavMenuItem,
			},
			{
				target: '[data-tour="wap-tour-presets-edit-first"]',
				title: __('Presets', 'website-accessibility'),
				content: __(
					'Here you manage accessibility presets. A default preset is already included. Tap Next to open it in the editor, or click Edit on that row.',
					'website-accessibility'
				),
				placement: 'bottom',
				skipBeacon: true,
				spotlightClicks: true,
				before: navAndWait(
					'website-accessibility-presets',
					'[data-tour="wap-tour-presets-edit-first"]'
				),
			},
			{
				target: '[data-tour="wap-tour-preset-editor"]',
				title: __('Edit preset', 'website-accessibility'),
				content: __(
					'Customize the launcher button, panel, footer, and controls. Next we highlight Update Preset when you are ready to save your toolbar.',
					'website-accessibility'
				),
				placement: 'left',
				skipBeacon: true,
				before: navigateToEditFirstPresetAndWait('[data-tour="wap-tour-preset-editor"]'),
			},
			{
				target: '[data-tour="wap-tour-save-preset"]',
				title: __('Save preset', 'website-accessibility'),
				content: __(
					'Click Update Preset to store your changes — add a title first if this button stays disabled. After a successful save, the tour will open the preview step.',
					'website-accessibility'
				),
				placement: 'top',
				skipBeacon: true,
				spotlightClicks: true,
				before: navigateToEditFirstPresetAndWait('[data-tour="wap-tour-save-preset"]'),
			},
			{
				target: WP_ADMIN_BAR_SITE_LINK,
				title: __('Preview on your site', 'website-accessibility'),
				content: (
					<div className="wap-dashboard-tour__step-body">
						<p>
							{__(
								'Use your site title in the WordPress admin bar (top) to open the front of your site — or use the button below to open it with the accessibility panel.',
								'website-accessibility'
							)}
						</p>
						<div className="wap-dashboard-tour__step-actions wap-dashboard-tour__step-actions--row wap-dashboard-tour__step-actions--center">
							<a
								href={siteOpenPanelUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="wap-dashboard-tour__open-site-btn"
							>
								{__('Open site & show panel', 'website-accessibility')}
							</a>
						</div>
					</div>
				),
				placement: 'bottom',
				skipBeacon: true,
				spotlightClicks: true,
				before: waitForAdminBarSiteLink,
			},
		],
		[
			markDone,
			navAndWait,
			navigateToEditFirstPresetAndWait,
			siteOpenPanelUrl,
			waitForAdminBarSiteLink,
			waitForFullDashboardShell,
			waitForPresetsNavMenuItem,
		]
	);

	useEffect(() => {
		if (!window.websacAdmin?.shouldAutoStartDashboardTour) {
			return undefined;
		}
		const id = window.setTimeout(() => setRun(true), 900);
		return () => window.clearTimeout(id);
	}, []);

	const notifyPresetSavedForTour = useCallback(() => {
		if (!runRef.current || tourIndexRef.current !== SAVE_STEP_INDEX) {
			return;
		}
		window.setTimeout(() => {
			joyrideControlsRef.current?.next?.();
		}, 150);
	}, []);

	const startTour = useCallback(() => {
		setTourNonce((n) => n + 1);
		setRun(true);
	}, []);

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
		() => ({ startTour, notifyPresetSavedForTour, dismissTourUnderstood: markDone }),
		[startTour, notifyPresetSavedForTour, markDone]
	);

	return (
		<DashboardTourContext.Provider value={contextValue}>
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
					zIndex: 100050,
					spotlightPadding: 8,
					buttons: ['back', 'skip', 'primary'],
					closeButtonAction: 'skip',
					showProgress: true,
					targetWaitTimeout: 125000,
				}}
			/>
		</DashboardTourContext.Provider>
	);
}
