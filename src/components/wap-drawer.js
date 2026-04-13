import { Drawer } from "antd";
import { useEffect, useRef, useState } from "@wordpress/element";

let uid = 0;
let openCount = 0;

function findLenis() {
    return window.lenis
        || window.__lenis
        || document.querySelector("[data-lenis]")?.__lenis
        || null;
}

function pauseLibraries() {
    findLenis()?.stop?.();
    window.locomotiveScroll?.stop?.();
    try { window.ScrollSmoother?.get?.()?.paused?.(true); } catch (_) {}
}

function resumeLibraries() {
    findLenis()?.start?.();
    window.locomotiveScroll?.start?.();
    try { window.ScrollSmoother?.get?.()?.paused?.(false); } catch (_) {}
}

const stop = (e) => e.stopPropagation();

const WapDrawer = ({ open, rootClassName, children, ...rest }) => {
    const [id] = useState(() => `wap-drawer-${++uid}`);
    const elRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        let mounted = false;

        const raf = requestAnimationFrame(() => {
            const el = document.querySelector(`.${id}`);
            if (!el) return;

            mounted = true;
            elRef.current = el;
            el.setAttribute("data-lenis-prevent", "");
            el.addEventListener("wheel", stop, { passive: false });
            el.addEventListener("touchmove", stop, { passive: false });
            el.addEventListener("touchstart", stop, { passive: true });

            if (++openCount === 1) pauseLibraries();
        });

        return () => {
            cancelAnimationFrame(raf);
            const el = elRef.current;
            if (el) {
                el.removeEventListener("wheel", stop);
                el.removeEventListener("touchmove", stop);
                el.removeEventListener("touchstart", stop);
                el.removeAttribute("data-lenis-prevent");
            }
            elRef.current = null;
            if (mounted && --openCount === 0) resumeLibraries();
        };
    }, [open, id]);

    return (
        <Drawer
            {...rest}
            open={open}
            rootClassName={rootClassName ? `${id} ${rootClassName}` : id}
        >
            {children}
        </Drawer>
    );
};

export default WapDrawer;