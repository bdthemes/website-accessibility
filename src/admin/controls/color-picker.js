import { useRef, useState } from '@wordpress/element';
import { ColorPicker as WPColorPicker, Popover } from '@wordpress/components';

const ColorPicker = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef(null);
    const selectedColor = value || '#000000';

    return (
        <div className="wap-color-picker">
            <button
                ref={anchorRef}
                type="button"
                className="wap-color-picker__trigger"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="Select color"
                aria-expanded={isOpen}
            >
                <span
                    className="wap-color-picker__swatch"
                    style={{ backgroundColor: selectedColor }}
                />
                <span className="wap-color-picker__value">{selectedColor}</span>
            </button>

            {isOpen && (
                <Popover
                    anchor={anchorRef.current}
                    onClose={() => setIsOpen(false)}
                    placement="bottom-start"
                    className="wap-color-picker__popover"
                >
                    <WPColorPicker
                        color={selectedColor}
                        onChangeComplete={(nextColor) => onChange?.(nextColor?.hex || selectedColor)}
                        enableAlpha={false}
                    />
                </Popover>
            )}
        </div>
    )
}

export default ColorPicker;
