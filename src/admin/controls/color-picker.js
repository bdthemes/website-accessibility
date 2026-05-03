import { useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ColorPicker as WPColorPicker, Popover } from '@wordpress/components';

const normalizeHex = (raw) => {
    if (raw == null) return '';
    const s = String(raw).trim();
    if (!s) return '';
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(s)) return s;
    return s;
};

const ColorPicker = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef(null);
    const hex = normalizeHex(value);
    const hasValue = hex.length > 0;
    /** Neutral default for the picker UI only — does not persist until the user confirms a color. */
    const pickerFallback = '#f1f3f8';

    const extractHex = (nextColor) => {
        if (nextColor == null) return '';
        if (typeof nextColor === 'string') return normalizeHex(nextColor);
        if (typeof nextColor === 'object' && nextColor.hex) return normalizeHex(nextColor.hex);
        return '';
    };

    return (
        <div className="wap-color-picker">
            <button
                ref={anchorRef}
                type="button"
                className="wap-color-picker__trigger"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={__('Select color', 'website-accessibility')}
                aria-expanded={isOpen}
            >
                <span
                    className={`wap-color-picker__swatch${hasValue ? '' : ' wap-color-picker__swatch--unset'}`}
                    style={hasValue ? { backgroundColor: hex } : undefined}
                />
                <span className="wap-color-picker__value">
                    {hasValue ? hex : __('Default', 'website-accessibility')}
                </span>
            </button>

            {isOpen && (
                <Popover
                    anchor={anchorRef.current}
                    onClose={() => setIsOpen(false)}
                    placement="bottom-start"
                    className="wap-color-picker__popover"
                >
                    <WPColorPicker
                        color={hasValue ? hex : pickerFallback}
                        onChangeComplete={(nextColor) => {
                            const nextHex = extractHex(nextColor);
                            if (nextHex) {
                                onChange?.(nextHex);
                            }
                        }}
                        enableAlpha={false}
                    />
                    {hasValue && (
                        <button
                            type="button"
                            className="wap-color-picker__clear"
                            onClick={() => {
                                onChange?.('');
                                setIsOpen(false);
                            }}
                        >
                            {__('Clear', 'website-accessibility')}
                        </button>
                    )}
                </Popover>
            )}
        </div>
    )
}

export default ColorPicker;
