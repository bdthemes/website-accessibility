import { useEffect } from "@wordpress/element";

export default function useDrawerScrollLock(contentRef, isOpen) {
    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = "";
            return;
        }

        const content = contentRef.current;
        if (!content) return;

        let startY = 0;

        const onWheel = (e) => {
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

        const onTouchMove = (e) => {
            const currentY = e.touches[0].clientY;
            const diffY = startY - currentY;

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

        const handleEnter = () => {
            document.body.style.overflow = "hidden";
            content.addEventListener("wheel", onWheel, { passive: false });
            content.addEventListener("touchstart", onTouchStart, { passive: false });
            content.addEventListener("touchmove", onTouchMove, { passive: false });
        };

        const handleLeave = () => {
            document.body.style.overflow = "";
            content.removeEventListener("wheel", onWheel);
            content.removeEventListener("touchstart", onTouchStart);
            content.removeEventListener("touchmove", onTouchMove);
        };

        content.addEventListener("mouseenter", handleEnter);
        content.addEventListener("mouseleave", handleLeave);

        return () => {
            document.body.style.overflow = "";
            content.removeEventListener("mouseenter", handleEnter);
            content.removeEventListener("mouseleave", handleLeave);
            content.removeEventListener("wheel", onWheel);
            content.removeEventListener("touchstart", onTouchStart);
            content.removeEventListener("touchmove", onTouchMove);
        };
    }, [isOpen]);
}
