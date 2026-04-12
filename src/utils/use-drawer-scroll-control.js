import { useLayoutEffect } from "@wordpress/element";

export default function useDrawerScrollLock(contentRef, isOpen) {
    useLayoutEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = "";
            return;
        }

        const content = contentRef.current;
        if (!content) return;

        let startY = 0;

        /**
         * If wheel targets a nested scrollable (e.g. translation language list) that can still
         * move in this direction, do not preventDefault on the panel — otherwise atTop on the
         * panel blocks scrolling up inside the list when the panel itself is scrolled to top.
         */
        const canNestedScrollAbsorbWheel = (e) => {
            let el = e.target;
            if (el && el.nodeType === 3) {
                el = el.parentElement;
            }
            while (el && el !== content) {
                if (el.scrollHeight > el.clientHeight + 1) {
                    const st = el.scrollTop;
                    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
                    const goingDown = e.deltaY > 0;
                    if (goingDown && st < maxScroll - 0.5) {
                        return true;
                    }
                    if (!goingDown && st > 0.5) {
                        return true;
                    }
                }
                el = el.parentElement;
            }
            return false;
        };

        const onWheel = (e) => {
            if (canNestedScrollAbsorbWheel(e)) {
                return;
            }

            const { scrollTop, scrollHeight, clientHeight } = content;

            const isDown = e.deltaY > 0;
            const atBottom = scrollTop + clientHeight >= scrollHeight;
            const atTop = scrollTop === 0;

            if ((isDown && atBottom) || (!isDown && atTop)) {
                e.preventDefault();
            }

            e.stopPropagation();
        };

        // --- TOUCH SUPPORT ---
        const onTouchStart = (e) => {
            startY = e.touches[0].clientY;
        };

        const canNestedScrollAbsorbTouch = (e, diffY) => {
            let el = e.target;
            if (el && el.nodeType === 3) {
                el = el.parentElement;
            }
            while (el && el !== content) {
                if (el.scrollHeight > el.clientHeight + 1) {
                    const st = el.scrollTop;
                    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
                    const goingDown = diffY > 0;
                    if (goingDown && st < maxScroll - 0.5) {
                        return true;
                    }
                    if (!goingDown && st > 0.5) {
                        return true;
                    }
                }
                el = el.parentElement;
            }
            return false;
        };

        const onTouchMove = (e) => {
            const currentY = e.touches[0].clientY;
            const diffY = startY - currentY;

            if (canNestedScrollAbsorbTouch(e, diffY)) {
                return;
            }

            const { scrollTop, scrollHeight, clientHeight } = content;

            const isDown = diffY > 0;
            const atBottom = scrollTop + clientHeight >= scrollHeight;
            const atTop = scrollTop === 0;

            if ((isDown && atBottom) || (!isDown && atTop)) {
                e.preventDefault();
            }

            e.stopPropagation();
        };
        // --- END TOUCH SUPPORT ---

        // Lock while the drawer is open (touch devices never get mouseenter; CSS may also lock body).
        document.body.style.overflow = "hidden";
        content.addEventListener("wheel", onWheel, { passive: false });
        content.addEventListener("touchstart", onTouchStart, { passive: true });
        content.addEventListener("touchmove", onTouchMove, { passive: false });

        return () => {
            document.body.style.overflow = "";
            content.removeEventListener("wheel", onWheel);
            content.removeEventListener("touchstart", onTouchStart);
            content.removeEventListener("touchmove", onTouchMove);
        };
    }, [isOpen]);
}
