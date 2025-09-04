const isScreenReaderActive = (setttings) => {
	return setttings?.screenReader?.currentStep > 0;
};

export default isScreenReaderActive;