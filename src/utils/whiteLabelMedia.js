import { __ } from "@wordpress/i18n";
import { isSvgFile, readSvgFileAsMarkup, svgMarkupToDataUri } from "./svgUpload";

export function getAttachmentImageUrl(att) {
	if (!att) {
		return "";
	}

	if (typeof att.url === "string" && att.url) {
		return att.url;
	}

	const sizes = att.sizes;
	if (sizes?.thumbnail?.url) {
		return sizes.thumbnail.url;
	}
	if (sizes?.full?.url) {
		return sizes.full.url;
	}

	return "";
}

export function isWhiteLabelImageAttachment(att) {
	if (!att || typeof att !== "object") {
		return false;
	}

	const mime = typeof att.mime === "string" ? att.mime : "";
	const url = typeof att.url === "string" ? att.url : "";

	return att.type === "image" || mime === "image/svg+xml" || /\.svg($|\?)/i.test(url);
}

function isSvgPluploadFile(file) {
	if (!file) {
		return false;
	}

	const native = file.getNative?.();
	if (native && isSvgFile(native)) {
		return true;
	}

	const name = file.name || file.filename || "";
	const type = file.type || "";
	return /\.svg$/i.test(name) || type === "image/svg+xml";
}

function processSvgFile(native, onSelect, frame) {
	return readSvgFileAsMarkup(native)
		.then((markup) => {
			onSelect?.({ url: svgMarkupToDataUri(markup), id: 0 });
			frame?.close?.();
		})
		.catch(() => {
			const { WapMessage } = window?.wapComponents || {};
			WapMessage?.error?.(__("Uploaded file is not a valid SVG.", "website-accessibility"));
		});
}

function bindSvgUploadInterceptor(frame, onSelect) {
	if (!frame) {
		return;
	}

	const attachPluploadHook = (uploaderWrapper) => {
		const plupload = uploaderWrapper?.uploader;
		if (!plupload || plupload.__websacSvgBound === onSelect) {
			return;
		}

		plupload.__websacSvgBound = onSelect;

		plupload.bind("FilesAdded", (up, files) => {
			files.forEach((file) => {
				if (!isSvgPluploadFile(file)) {
					return;
				}

				up.removeFile(file);

				const native = file.getNative?.();
				if (!native) {
					return;
				}

				processSvgFile(native, onSelect, frame);
			});
		});

		plupload.bind("BeforeUpload", (up, file) => {
			if (!isSvgPluploadFile(file)) {
				return;
			}

			up.stop();
			up.removeFile(file);

			const native = file.getNative?.();
			if (native) {
				processSvgFile(native, onSelect, frame);
			}

			return false;
		});
	};

	const tryBind = () => {
		attachPluploadHook(frame.state()?.get?.("uploader"));
	};

	frame.on("uploader:ready", tryBind);
	frame.on("content:activate:upload", tryBind);
	frame.on("open", tryBind);

	let attempts = 0;
	const retryTimer = window.setInterval(() => {
		attempts += 1;
		tryBind();
		if (attempts >= 20) {
			window.clearInterval(retryTimer);
		}
	}, 100);

	frame.on("close", () => {
		window.clearInterval(retryTimer);
	});
}

export function openWhiteLabelImagePicker({ title, onSelect }) {
	const { WapMessage } = window?.wapComponents || {};

	if (typeof window === "undefined" || !window.wp?.media) {
		WapMessage?.error?.(__("WordPress media library is not available", "website-accessibility"));
		return;
	}

	const frame = window.wp.media({
		title,
		button: { text: __("Use image", "website-accessibility") },
		library: { type: "image" },
		multiple: false,
	});

	bindSvgUploadInterceptor(frame, onSelect);

	frame.off("select");
	frame.on("select", () => {
		const attachment = frame.state().get("selection").first();
		if (!attachment) {
			return;
		}

		const att = attachment.toJSON();
		if (!isWhiteLabelImageAttachment(att)) {
			WapMessage?.error?.(
				__("Please select a PNG, JPG, or SVG image.", "website-accessibility")
			);
			return;
		}

		onSelect?.({
			url: getAttachmentImageUrl(att),
			id: att.id || 0,
		});
	});

	frame.open();
}
