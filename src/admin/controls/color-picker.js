import { ColorPalette } from '@wordpress/components';

const ColorPicker = ({ value, onChange }) => {
    return (
        <ColorPalette
            value={value}
            onChange={onChange}
        />
    )
}

export default ColorPicker;