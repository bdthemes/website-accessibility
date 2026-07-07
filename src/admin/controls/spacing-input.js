import { useEffect, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import {
	formatAxisPadding,
	formatPxValue,
	parseAxisPadding,
	parsePxValue,
} from "../utils/spacing";

const SpacingInput = ({ value, onChange, mode = "single", min = 0, ...inputProps }) => {
	const { WapInput } = window?.wapComponents;
	const [axis, setAxis] = useState(() => parseAxisPadding(value));

	useEffect(() => {
		if (mode === "axis") {
			setAxis(parseAxisPadding(value));
		}
	}, [value, mode]);

	if (mode === "axis") {

		const handleAxisChange = (field, fieldValue) => {
			const nextAxis = {
				...axis,
				[field]: fieldValue,
			};

			setAxis(nextAxis);

			const { vertical, horizontal } = nextAxis;

			if (vertical === "" && horizontal === "") {
				onChange("");
				return;
			}

			if (vertical !== "" && horizontal !== "") {
				onChange(formatAxisPadding(vertical, horizontal));
			}
		};

		return (
			<div className="wap-spacing-input wap-spacing-input--axis">
				<div className="wap-spacing-input__field">
					<span className="wap-spacing-input__label">
						{__("Top & bottom", "website-accessibility")}
					</span>
					<WapInput
						type="number"
						min={min}
						value={axis.vertical}
						onChange={(e) => handleAxisChange("vertical", e.target.value)}
						placeholder="10"
						addonAfter="px"
						aria-label={__("Top and bottom padding", "website-accessibility")}
					/>
				</div>
				<div className="wap-spacing-input__field">
					<span className="wap-spacing-input__label">
						{__("Left & right", "website-accessibility")}
					</span>
					<WapInput
						type="number"
						min={min}
						value={axis.horizontal}
						onChange={(e) => handleAxisChange("horizontal", e.target.value)}
						placeholder="20"
						addonAfter="px"
						aria-label={__("Left and right padding", "website-accessibility")}
					/>
				</div>
			</div>
		);
	}

	return (
		<WapInput
			type="number"
			min={min}
			value={parsePxValue(value)}
			onChange={(e) => onChange(formatPxValue(e.target.value))}
			addonAfter="px"
			{...inputProps}
		/>
	);
};

export default SpacingInput;
