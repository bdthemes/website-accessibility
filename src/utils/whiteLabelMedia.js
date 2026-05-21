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

function bindSvgUploadInterceptor(frame, onSelect) {
	if (!frame || frame.__websacSvgBound) {
		return;
	}

	frame.__websacSvgBound = true;

	const attachPluploadHook = (uploaderWrapper) => {
		const plupload = uploaderWrapper?.uploader;
		if (!plupload || plupload.__websacSvgBound) {
			return;
		}

		plupload.__websacSvgBound = true;
		plupload.bind("FilesAdded", (up, files) => {
			files.forEach((file) => {
				const native = file.getNative?.();
				if (!native || !isSvgFile(native)) {
					return;
				}

				up.removeFile(file);

				readSvgFileAsMarkup(native)
					.then((markup) => {
						onSelect?.({ url: svgMarkupToDataUri(markup), id: 0 });
						frame.close();
					})
					.catch(() => {
						const { WapMessage } = window?.wapComponents || {};
						WapMessage?.error?.(
							__("Uploaded file is not a valid SVG.", "website-accessibility")
						);
					});
			});
		});
	};

	frame.on("uploader:ready", attachPluploadHook);
	frame.on("content:activate:upload", () => {
		attachPluploadHook(frame.state()?.get?.("uploader"));
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
