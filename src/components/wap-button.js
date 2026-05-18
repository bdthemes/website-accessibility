import { forwardRef } from '@wordpress/element';
import { Button } from 'antd';

const WapButton = forwardRef(({ children, ...rest }, ref) => (
	<Button ref={ref} {...rest}>
		{children}
	</Button>
));

WapButton.displayName = 'WapButton';

export default WapButton;
