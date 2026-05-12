import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

const API_NAMESPACE = '/sigmally/v1/settings';

/** Example CSS shown when the field is empty (textarea `placeholder`; CodeMirror `placeholder` opt when addon present). */
const CSS_PLACEHOLDER_EXAMPLE = `.example {
  color: red;
}`;

/**
 * Prefer WordPress core CodeMirror (wp.codeEditor) using settings from PHP `wp_enqueue_code_editor`.
 */
function getWpCodeMirrorSettingsFromBootstrap() {
	if (
		typeof window !== 'undefined' &&
		typeof window.websacCssOverridesCodeEditor === 'object' &&
		window.websacCssOverridesCodeEditor !== null &&
		window.websacCssOverridesCodeEditor !== false &&
		Object.keys(window.websacCssOverridesCodeEditor).length > 0
	) {
		return window.websacCssOverridesCodeEditor;
	}
	return null;
}

function getCssFromEditor(cmRef, textareaRef) {
	if (cmRef.current && typeof cmRef.current.getValue === 'function') {
		return cmRef.current.getValue();
	}
	return textareaRef.current?.value ?? '';
}

const CssOverrides = () => {
	const { WapSpin, WapMessage, WapCard, WapButton, WapTypography } = window?.wapComponents || {};
	const { Title, Text } = WapTypography || {};
	const textareaRef = useRef(null);
	const cmRef = useRef(null);

	const [css, setCss] = useState('');
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const fetchSettings = useCallback(async () => {
		setLoading(true);
		try {
			const res = await apiFetch({ path: API_NAMESPACE });
			const raw = res?.data?.frontend_custom_css;
			setCss(typeof raw === 'string' ? raw : '');
		} catch (error) {
			console.error('Failed to load settings:', error);
			WapMessage?.error(__('Failed to load CSS overrides.', 'website-accessibility'));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSettings();
	}, [fetchSettings]);

	useEffect(() => {
		if (loading) {
			cmRef.current = null;
			return undefined;
		}

		const el = textareaRef.current;
		if (!el) return undefined;

		let editorInstance = null;
		let cancelled = false;
		let intervalId = null;
		let raf1 = null;
		let raf2 = null;

		function initOnce() {
			if (cancelled || editorInstance || !textareaRef.current) {
				return !!editorInstance;
			}
			if (typeof window.wp?.codeEditor?.initialize !== 'function') {
				return false;
			}

			const bootstrap = getWpCodeMirrorSettingsFromBootstrap() ?? {};
			const cmBootstrap = bootstrap.codemirror && typeof bootstrap.codemirror === 'object' ? bootstrap.codemirror : {};
			try {
				editorInstance = window.wp.codeEditor.initialize(el, {
					...bootstrap,
					codemirror: {
						...cmBootstrap,
						placeholder: CSS_PLACEHOLDER_EXAMPLE,
					},
				});
				cmRef.current = editorInstance?.codemirror ?? null;
				raf1 = window.requestAnimationFrame(() => {
					if (cancelled || !editorInstance?.codemirror?.refresh) return;
					editorInstance.codemirror.refresh();
					raf2 = window.requestAnimationFrame(() => {
						if (!cancelled && editorInstance?.codemirror?.refresh) {
							editorInstance.codemirror.refresh();
						}
					});
				});
				return true;
			} catch (err) {
				console.error('WP CodeMirror failed to initialize:', err);
				cmRef.current = null;
				return true;
			}
		}

		if (!initOnce()) {
			let tries = 0;
			intervalId = window.setInterval(() => {
				tries += 1;
				if (cancelled || initOnce() || tries >= 40) {
					window.clearInterval(intervalId);
					intervalId = null;
				}
			}, 50);
		}

		return () => {
			cancelled = true;
			if (intervalId) window.clearInterval(intervalId);
			if (raf1 !== null) window.cancelAnimationFrame(raf1);
			if (raf2 !== null) window.cancelAnimationFrame(raf2);
			cmRef.current = null;
			if (editorInstance?.codemirror && typeof editorInstance.codemirror.toTextArea === 'function') {
				editorInstance.codemirror.toTextArea();
			}
		};
	}, [loading]);

	const handleSave = async () => {
		const value = getCssFromEditor(cmRef, textareaRef);
		setSaving(true);
		try {
			await apiFetch({
				path: API_NAMESPACE,
				method: 'POST',
				data: { frontend_custom_css: value },
			});
			setCss(value);
			WapMessage.success({
				content: __('Frontend CSS saved. Clear caches if styles do not appear.', 'website-accessibility'),
				style: { marginBlockStart: 20 },
			});
		} catch (error) {
			console.error('Failed to save CSS overrides:', error);
			WapMessage.error({
				content: __('Failed to save CSS.', 'website-accessibility'),
				style: { marginBlockStart: 20 },
			});
		} finally {
			setSaving(false);
		}
	};

	if (!WapCard || !WapButton || !Title) {
		return null;
	}

	return (
		<div className="wap-settings wap-css-overrides">
			<WapCard className="wap-settings-row wap-header-card wap-css-overrides__header-card">
				<div className="wap-header-card-content">
					<Title level={4} className="wap-header-card-title">
						{__('CSS Overrides', 'website-accessibility')}
					</Title>
					<Text type="secondary" className="wap-header-card-description">
						{__(
							'Add custom CSS for the public site. It loads on the frontend so you can fine-tune the accessibility widget and toolbar.',
							'website-accessibility'
						)}
					</Text>
				</div>
			</WapCard>

			<WapCard className="wap-settings-row wap-css-overrides__editor-card">
				{loading ? (
					<div className="wap-css-overrides__loading">
						<WapSpin />
					</div>
				) : (
					<>
						<div className="wap-css-overrides__editor-wrap">
							<label className="screen-reader-text" htmlFor="websac-css-overrides-field">
								{__('Custom frontend CSS', 'website-accessibility')}
							</label>
							<textarea
								id="websac-css-overrides-field"
								ref={textareaRef}
								className="wap-css-overrides__textarea code"
								rows={22}
								defaultValue={css}
								spellCheck={false}
								placeholder={CSS_PLACEHOLDER_EXAMPLE}
							/>
						</div>

						<div className="wap-css-overrides__footer-actions">
							<WapButton type="primary" onClick={handleSave} loading={saving}>
								{__('Save CSS', 'website-accessibility')}
							</WapButton>
						</div>
					</>
				)}
			</WapCard>
		</div>
	);
};

export default CssOverrides;
