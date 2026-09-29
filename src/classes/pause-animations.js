/**
 * Pause Animations.
 *
 * Stops motion without hiding anything. The stylesheet under `html.wap-animations-paused`
 * (frontend/styles/main.scss) makes CSS animations end at once and cuts transitions to
 * 1ms rather than removing them, so every one of them ends in its resting state:
 * content that fades in stays visible, a preloader that fades out is gone, and the
 * animationend/transitionend events that scripts wait for still fire.
 *
 * What CSS cannot reach is stopped here — JavaScript animation (GSAP, anime.js,
 * jQuery, UIkit parallax, the Web Animations API), video, GIFs, SVG animation,
 * marquees, Lottie, particles, autoplaying sliders and scripted smooth scrolling —
 * and all of it is handed back as it was when the feature is switched off.
 */

const PAUSED_CLASS = "wap-animations-paused";
const FIXED_BACKGROUND_ATTR = "data-websac-fixed-bg";
const HOLD_ATTR = "data-websac-hold";
const OWN_UI = ".wap-accessibility-view, .wap-preset__preview-drawer-root, .wap-preview-button, [class*='oachecker']";
const MEDIA_SELECTOR = "img, video, iframe, svg, marquee, lottie-player, dotlottie-player, dotlottie-wc";
const GESTURE_EVENTS = ["pointerdown", "pointerup", "pointercancel", "keydown", "touchstart"];

// The safety net for motion no hook below knows (a builder's own parallax or mouse
// effects, a library without an API): whatever drives it, a script has to rewrite the
// element's look over and over. An element whose look is rewritten this often…
const MOTION_REWRITES = 4;
const MOTION_WINDOW_MS = 1000;
// …is held on its own look by a stylesheet rule, which outranks whatever inline style
// the script goes on writing. What counts as its look:
const MOTION_PROPS = ["transform", "translate", "rotate", "scale", "opacity", "filter", "background-position"];
// Motion that answers the visitor is theirs: a slider arrow they pressed, a thumb they
// drag. It is left alone this long after a click, tap or key press, unless the page
// scrolled meanwhile (scroll-driven effects are exactly what the net is for).
const INTERACTION_GRACE_MS = 800;
// Positioned by script on purpose, to follow what they point at.
const POPUP_SELECTOR = "[role='tooltip'], [role='dialog'], [role='menu'], [role='listbox'], [data-popper-placement], [data-tippy-root], .tippy-box, .tooltip, .popover, .dropdown-menu";

// Library instances created after the feature was switched on are picked up on this beat.
const SWEEP_INTERVAL_MS = 1000;
// Effects libraries mostly start while the page loads (Elementor runs its handlers then);
// for this long after switching on they are looked for on every frame instead.
const LOAD_WATCH_MS = 3000;
// UIkit components, as used by Element Pack (bdtUIkit) or on their own (UIkit).
const UIKIT_PARALLAX = "[class*='parallax'], [bdt-parallax], [data-bdt-parallax], [uk-parallax], [data-uk-parallax]";
const UIKIT_SLIDERS = "[bdt-slideshow], [data-bdt-slideshow], [bdt-slider], [data-bdt-slider], [uk-slideshow], [data-uk-slideshow], [uk-slider], [data-uk-slider]";
// GSAP reports an endlessly repeating animation with a total duration of about 1e10s.
const ENDLESS_SECONDS = 1e9;
// A tap or key press this recent means a video that starts playing was started by the visitor.
const GESTURE_WINDOW_MS = 1000;
// Finishing an animation can start the next one on the same element: a slide timer, a
// rotating word, a scripted blink. Finished one after another, such a chain would flip
// through its states every frame, so it is paused instead once it shows up in
// consecutive frames, or as a burst within one frame (a promise loop).
const CHAIN_GAP_MS = 100;
const CHAIN_FRAMES = 2;
const CHAIN_BURST = 20;

const isOwnUi = (node) => typeof node?.closest === "function" && !!node.closest(OWN_UI);

// One failing piece (a library in an odd state, a global the page locked down) must
// not stop the rest of the page from being paused.
const attempt = (step) => {
    try {
        step();
    } catch (error) {
        // Left as the page has it.
    }
};

const isGif = (url) => /^data:image\/gif/i.test(url) || /\.gif(?:$|[?#])/i.test(url);

const customPropertyNames = (style) => {
    const names = [];
    for (let index = 0; index < style.length; index += 1) {
        if (style[index].startsWith("--")) names.push(style[index]);
    }
    return names;
};

/**
 * The inline declarations that decide how an element looks rather than where it sits
 * in the layout, plus its custom properties — builders often move an element by
 * updating a variable the stylesheet feeds into its transform.
 */
const lookOf = (style) => {
    const look = {};
    MOTION_PROPS.forEach((name) => {
        look[name] = style.getPropertyValue(name);
    });
    look.custom = customPropertyNames(style).map((name) => `${name}:${style.getPropertyValue(name)}`).join(";");
    return look;
};

// Background and decorative clips. A video the visitor controls is left alone.
const isAmbientVideo = (video) => video.autoplay || video.loop || (video.muted && !video.controls);

const restoreAttribute = (element, name, value) => {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
};

const drawStill = (image) => {
    try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext("2d").drawImage(image, 0, 0);
        return canvas.toDataURL("image/png");
    } catch (error) {
        // A GIF served from another origin without CORS taints the canvas.
        return null;
    }
};

const isStylesheetAnimation = (animation) =>
    (typeof window.CSSAnimation === "function" && animation instanceof window.CSSAnimation) ||
    (typeof window.CSSTransition === "function" && animation instanceof window.CSSTransition);

/**
 * postMessage commands for autoplaying YouTube/Vimeo embeds (usually section
 * backgrounds). Embeds that wait for the visitor to press play are not touched.
 */
const embedCommands = (src) => {
    let url;
    try {
        url = new URL(src, window.location.href);
    } catch (error) {
        return null;
    }

    const autoplays = ["1", "true"].includes(url.searchParams.get("autoplay")) || url.searchParams.get("background") === "1";
    if (!autoplays) return null;

    if (/(^|\.)youtube(-nocookie)?\.com$/.test(url.hostname) && url.pathname.startsWith("/embed/")) {
        const command = (func) => JSON.stringify({ event: "command", func, args: [] });
        return { origin: url.origin, pause: command("pauseVideo"), play: command("playVideo") };
    }

    if (url.hostname === "player.vimeo.com") {
        return { origin: url.origin, pause: JSON.stringify({ method: "pause" }), play: JSON.stringify({ method: "play" }) };
    }

    return null;
};

// GSAP helpers.

const tweensOf = (animation) => (typeof animation.getChildren === "function" ? animation.getChildren(true, true, false) : [animation]);

const isEndless = (animation) => !!animation && animation.totalDuration() >= ENDLESS_SECONDS;

const hasScrollTrigger = (animation) =>
    !!animation.scrollTrigger ||
    (typeof animation.getChildren === "function" && animation.getChildren(true, true, true).some((child) => child.scrollTrigger));

const allTargets = (animation) => {
    const targets = new Set();
    tweensOf(animation).forEach((tween) => (tween.targets?.() || []).forEach((target) => targets.add(target)));
    return [...targets];
};

const elementTargets = (animation) => allTargets(animation).filter((target) => target instanceof window.Element);

// What a chain is tracked by: the animated objects, or the document for animations
// without any (timers, delayed calls), so even those cannot spin in a loop.
const chainKeys = (targets) => {
    const objects = targets.filter((target) => target && typeof target === "object");
    return objects.length ? objects : [document];
};

/**
 * How settled a set of elements looks: visible, in place, unscaled, unrotated and
 * sharp scores highest. Visibility outweighs everything else, so hidden content is
 * never the pick.
 */
const restScore = (elements) => elements.reduce((score, element) => {
    const style = window.getComputedStyle(element);
    const opacity = style.visibility === "hidden" ? 0 : parseFloat(style.opacity) || 0;
    const matrix = new window.DOMMatrixReadOnly(style.transform === "none" ? undefined : style.transform);
    const shift = Math.hypot(matrix.m41, matrix.m42, matrix.m43);
    const scale = Math.abs(Math.hypot(matrix.a, matrix.b) - 1) + Math.abs(Math.hypot(matrix.c, matrix.d) - 1);
    const angle = Math.abs((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI);
    const blur = parseFloat((/blur\(([\d.]+)px\)/.exec(style.filter) || [])[1]) || 0;
    return score + opacity * 1000 - shift - scale * 200 - angle * 2 - blur * 20;
}, 0);

/**
 * Render an animation at `progress` without firing its callbacks. It steps off the
 * spot first because GSAP skips rendering when the playhead does not move, and the
 * page may have changed the element since (e.g. another animation on it finishing
 * with clearProps), which would leave a stale picture on screen.
 */
const renderAt = (animation, progress, method = "totalProgress") => {
    animation[method](0.5, true);
    animation[method](progress, true);
};

/**
 * Switch transitions off on these elements until the returned function is called.
 * While paused every element carries a 1ms transition, and an element that
 * transitions `all` would report the value from *before* each change to
 * getComputedStyle, so measuring through it compares two stale pictures.
 */
const holdTransitions = (elements) => {
    const saved = elements.map((element) => [
        element,
        element.style.getPropertyValue("transition"),
        element.style.getPropertyPriority("transition"),
    ]);
    elements.forEach((element) => element.style.setProperty("transition", "none", "important"));

    return () => saved.forEach(([element, value, priority]) => {
        // Settle the current style first, so letting go starts no transition.
        void window.getComputedStyle(element).transform;
        if (value) element.style.setProperty("transition", value, priority);
        else element.style.removeProperty("transition");
    });
};

/**
 * A from() tween animates *to* the element's own state, so an animation made only of
 * those rests finished (1) — known without rendering anything, which matters because
 * measuring costs a forced layout per animation and entrance effects come by the dozen.
 */
const isFromOnly = (animation) => {
    const tweens = tweensOf(animation);
    return tweens.length > 0 && tweens.every((tween) => !!tween.vars?.runBackwards);
};

/**
 * The end (0 or 1) a scroll-driven animation should rest on. Which end is "normal"
 * depends on how it was written — a reveal is finished at 1, a parallax drift is
 * untouched at 0, a fade-out is visible at 0 — so both ends are rendered and the
 * more settled one wins; a tie goes to the finished state. Leaves it rendered at 0;
 * call with transitions held (holdTransitions).
 */
const restingEnd = (animation, elements) => {
    if (!elements.length) return 1;

    renderAt(animation, 1);
    const finished = restScore(elements);
    renderAt(animation, 0);
    const untouched = restScore(elements);

    return untouched > finished + 1 ? 0 : 1;
};

/**
 * Rest an endless loop on the start of its cycle — for a loop written as `to()` that
 * is the element's own state — unless the cycle starts hidden.
 */
const restLoop = (animation) => {
    const loops = tweensOf(animation).filter(isEndless);
    (loops.length ? loops : [animation]).forEach((loop) => {
        const from = loop.vars?.startAt || {};
        const startsHidden = !!loop.vars?.runBackwards || from.opacity === 0 || from.autoAlpha === 0;
        renderAt(loop, startsHidden ? 1 : 0, "progress");
    });
};

class PauseAnimations {
    static instance = null;

    constructor() {
        if (PauseAnimations.instance) return PauseAnimations.instance;

        this._active = false;
        // What the toolbar asked for last (apply/remove), as opposed to what is running.
        this._wanted = false;
        this._teardownQueued = false;
        // The page head may already have paused motion from the visitor's saved choice
        // (see View/Frontend.php). Hold it until the toolbar has loaded that choice itself.
        this._bootHold = document.documentElement.classList.contains(PAUSED_CLASS);
        this._lastGesture = 0;
        this._gestureScroll = 0;
        this._pointerDown = false;

        this._sweep = this._sweep.bind(this);
        this._gsapTick = this._gsapTick.bind(this);
        this._onMutations = this._onMutations.bind(this);
        this._onStyleMutations = this._onStyleMutations.bind(this);
        this._flushQueue = this._flushQueue.bind(this);
        this._onPlay = this._onPlay.bind(this);
        this._onGesture = this._onGesture.bind(this);

        this._resetState();

        PauseAnimations.instance = this;
    }

    static getInstance() {
        if (!PauseAnimations.instance) {
            PauseAnimations.instance = new PauseAnimations();
        }
        return PauseAnimations.instance;
    }

    apply() {
        this._wanted = true;
        this._teardownQueued = false;
        this._activate();
    }

    /**
     * Stop scripted motion straight away when the page head already paused it from
     * the saved choice. The toolbar only mounts once the whole page has loaded, which
     * on a heavy page can be seconds later — and entrance effects keep their content
     * hidden until they are finished — so waiting for it left the page blank.
     */
    startFromBoot() {
        if (this._bootHold) this._activate();
    }

    _activate() {
        if (this._active) return;
        this._active = true;

        document.documentElement.classList.add(PAUSED_CLASS);
        attempt(() => this._patchScrolling());
        attempt(() => this._patchWebAnimations());
        attempt(() => this._markFixedBackgrounds(document.documentElement));
        this._sweep();
        this._watchLoad();

        this._observer = new window.MutationObserver(this._onMutations);
        this._observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["src", "srcset"],
        });
        this._styleObserver = new window.MutationObserver(this._onStyleMutations);
        this._styleObserver.observe(document.documentElement, {
            subtree: true,
            attributes: true,
            attributeFilter: ["style"],
        });
        this._interval = window.setInterval(this._sweep, SWEEP_INTERVAL_MS);
        // Animation libraries typically build their effects on DOMContentLoaded.
        document.addEventListener("DOMContentLoaded", this._sweep);
        window.addEventListener("load", this._sweep);
        document.addEventListener("play", this._onPlay, true);
        GESTURE_EVENTS.forEach((type) => document.addEventListener(type, this._onGesture, true));

        this._announce(true);
    }

    remove() {
        this._wanted = false;
        if (this._bootHold || this._teardownQueued) return;
        if (!this._active && !document.documentElement.classList.contains(PAUSED_CLASS)) return;

        // init() re-applies every enabled feature by removing it first. Tearing down at
        // once would restart every video and animation only to stop them again.
        this._teardownQueued = true;
        queueMicrotask(() => {
            if (this._teardownQueued) this._teardown();
        });
    }

    /**
     * Called once the toolbar has applied the visitor's saved settings: from here on
     * the feature's own state decides, including undoing the early pause if the saved
     * choice turned out not to include it.
     */
    releaseBoot() {
        if (!this._bootHold) return;
        this._bootHold = false;
        if (!this._wanted) this._teardown();
    }

    _resetState() {
        this._resumers = [];
        this._handled = new WeakSet();
        this._stills = new WeakMap();
        this._waitingImages = new WeakSet();
        this._corsTried = new WeakSet();
        this._pausedVideos = new Set();
        this._animePaused = new Set();
        this._watchFrame = null;
        this._finishes = new WeakMap();
        this._queue = new Set();
        this._queueTimer = null;
        this._observer = null;
        this._styleObserver = null;
        this._motion = new WeakMap();
        this._motionIgnored = new WeakSet();
        this._held = new Map();
        this._holdSheet = null;
        this._holdCount = 0;
        this._interval = null;
        this._gsap = null;
        this._webAnimations = { paused: new Set(), timelines: new Map() };
        this._scrollPatches = [];
        this._animatePatch = null;
        this._jqueryPatches = [];
        this._inJqueryCompletion = false;
    }

    _teardown() {
        this._teardownQueued = false;
        const wasActive = this._active;
        this._active = false;

        this._observer?.disconnect();
        this._styleObserver?.disconnect();
        this._releaseHolds();
        window.clearInterval(this._interval);
        window.clearTimeout(this._queueTimer);
        window.cancelAnimationFrame(this._watchFrame);
        document.removeEventListener("DOMContentLoaded", this._sweep);
        window.removeEventListener("load", this._sweep);
        window.removeEventListener("scroll", this._gsapTick);
        document.removeEventListener("play", this._onPlay, true);
        GESTURE_EVENTS.forEach((type) => document.removeEventListener(type, this._onGesture, true));

        this._restoreScrolling();
        this._restoreWebAnimations();
        this._resumeGsap();
        this._jqueryPatches.forEach(({ fn, original, patched }) => {
            if (fn.animate === patched) fn.animate = original;
        });
        this._pausedVideos.forEach((video) => {
            if (video.paused) video.play()?.catch?.(() => {});
        });
        this._animePaused.forEach((instance) => attempt(() => instance.play()));
        this._resumers.forEach((resume) => {
            try {
                resume();
            } catch (error) {
                // The library instance was destroyed while paused; nothing to resume.
            }
        });

        document.documentElement.classList.remove(PAUSED_CLASS);
        document.querySelectorAll(`[${FIXED_BACKGROUND_ATTR}]`).forEach((element) => element.removeAttribute(FIXED_BACKGROUND_ATTR));

        this._resetState();
        if (wasActive) this._announce(false);
    }

    /** Lets themes and other plugins follow along (e.g. to stop their own effects). */
    _announce(paused) {
        document.dispatchEvent(new CustomEvent("websac-pause-animations", { detail: { paused } }));
    }

    _onGesture(event) {
        this._lastGesture = performance.now();
        this._gestureScroll = window.scrollY;
        if (event?.type === "pointerdown") this._pointerDown = true;
        else if (event?.type === "pointerup" || event?.type === "pointercancel") this._pointerDown = false;
    }

    _sweep() {
        if (!this._active) return;

        attempt(() => this._settleGsap());
        attempt(() => this._settleWebAnimations());
        attempt(() => this._patchJquery());
        this._stopScriptedEffects();
        attempt(() => this._stopCanvasAnimations());
        document.querySelectorAll(MEDIA_SELECTOR).forEach((node) => this._stopMedia(node));
    }

    /** The effects libraries typically start as the page loads (see _watchLoad). */
    _stopScriptedEffects() {
        attempt(() => this._settleAnime());
        attempt(() => this._stopUikit());
        attempt(() => this._stopSliders());
        attempt(() => this._settleOtherLibraries());
        // Settling rewrites styles; that is not a script animating them.
        this._styleObserver?.takeRecords();
    }

    /** Libraries with their own switch for this. */
    _settleOtherLibraries() {
        // Velocity: `mock` makes every animation land on its end at once.
        [window.Velocity, window.jQuery?.Velocity].forEach((velocity) => {
            if (!velocity || velocity.mock || this._handled.has(velocity)) return;
            this._handled.add(velocity);
            velocity.mock = true;
            this._resumers.push(() => {
                velocity.mock = false;
            });
        });

        // jarallax (background parallax in many themes) pins its picture to the screen;
        // destroying the instance puts the element's own background back.
        if (typeof window.jarallax === "function") {
            document.querySelectorAll("[data-jarallax-original-styles]").forEach((element) => {
                const instance = element.jarallax;
                if (!instance || this._handled.has(element)) return;
                this._handled.add(element);
                const options = { ...instance.options };
                window.jarallax(element, "destroy");
                this._resumers.push(() => window.jarallax(element, options));
            });
        }

        // Lenis smooth scrolling, when the site exposes its instance.
        const lenis = window.lenis;
        if (lenis?.options && !this._handled.has(lenis)) {
            this._handled.add(lenis);
            const { smoothWheel, syncTouch } = lenis.options;
            lenis.options.smoothWheel = false;
            lenis.options.syncTouch = false;
            this._resumers.push(() => {
                lenis.options.smoothWheel = smoothWheel;
                lenis.options.syncTouch = syncTouch;
            });
        }
    }

    /**
     * Look for newly started effects on every frame while the page is loading, so an
     * effect a builder starts on DOMContentLoaded or load stops before it visibly moves
     * instead of up to a second later.
     */
    _watchLoad() {
        const until = performance.now() + LOAD_WATCH_MS;
        const frame = () => {
            this._watchFrame = null;
            if (!this._active) return;
            this._stopScriptedEffects();
            if (performance.now() < until) this._watchFrame = window.requestAnimationFrame(frame);
        };
        this._watchFrame = window.requestAnimationFrame(frame);
    }

    _onMutations(records) {
        if (!this._active) return;

        records.forEach((record) => {
            if (record.type === "attributes") {
                this._queue.add(record.target);
                return;
            }
            record.addedNodes.forEach((node) => node.nodeType === 1 && this._queue.add(node));
        });

        if (this._queue.size && !this._queueTimer) {
            this._queueTimer = window.setTimeout(this._flushQueue, 50);
        }
    }

    _flushQueue() {
        this._queueTimer = null;
        const roots = [...this._queue];
        this._queue.clear();
        if (!this._active) return;

        roots.forEach((root) => {
            if (!root.isConnected) return;
            this._stopMedia(root);
            root.querySelectorAll(MEDIA_SELECTOR).forEach((node) => this._stopMedia(node));
            this._markFixedBackgrounds(root);
        });
    }

    // The motion safety net (see MOTION_* above).

    _onStyleMutations(records) {
        if (!this._active) return;

        const now = performance.now();
        const interacting =
            (this._pointerDown || now - this._lastGesture < INTERACTION_GRACE_MS) &&
            Math.abs(window.scrollY - this._gestureScroll) < 20;

        records.forEach((record) => {
            const element = record.target;
            if (this._held.has(element) || this._motionIgnored.has(element)) return;
            attempt(() => this._noteRewrite(element, now, interacting));
        });
    }

    _noteRewrite(element, now, interacting) {
        const look = lookOf(element.style);
        const entry = this._motion.get(element);
        if (!entry) {
            this._motion.set(element, { look, changed: new Set(), times: [] });
            return;
        }

        const changed = Object.keys(look).filter((name) => look[name] !== entry.look[name]);
        entry.look = look;
        // Width, height, position and the like: layout, not motion.
        if (!changed.length) return;
        if (interacting) {
            entry.times = [];
            return;
        }

        changed.forEach((name) => entry.changed.add(name));
        entry.times = entry.times.filter((time) => now - time < MOTION_WINDOW_MS);
        entry.times.push(now);
        if (entry.times.length >= MOTION_REWRITES) this._hold(element, entry);
    }

    /**
     * Some elements are moved by script as part of how the page works: popups that
     * follow what they point at, a smooth-scroll wrapper carrying the whole page, a
     * slider track far wider than its frame, and anything fixed — a cursor follower
     * (often hiding the real cursor), a bar, a picture a parallax library pins to the
     * screen (its own look would be stuck to the viewport). Holding those would break
     * the page; the libraries that pin pictures are stopped through their own API.
     */
    _canHold(element) {
        if (element === document.documentElement || element === document.body) return false;
        if (isOwnUi(element) || element.closest(POPUP_SELECTOR)) return false;
        if (window.getComputedStyle(element).position === "fixed") return false;

        // Layout size, not the transformed box: a zoom effect is still motion to hold.
        const width = element.offsetWidth || 0;
        const height = element.offsetHeight || 0;
        if (height > window.innerHeight * 3 || width > window.innerWidth * 1.5) return false;
        const frame = element.parentElement?.clientWidth || 0;
        return !(frame > 0 && width > frame * 1.4);
    }

    /** Hold an element on its own look — what the stylesheet gives it — while paused. */
    _hold(element, entry) {
        this._motion.delete(element);
        if (!this._canHold(element)) {
            this._motionIgnored.add(element);
            return;
        }

        const names = entry.changed.has("custom") ? MOTION_PROPS : MOTION_PROPS.filter((name) => entry.changed.has(name));
        const computed = window.getComputedStyle(element);
        const currentOpacity = parseFloat(computed.opacity) || 0;

        // Set the script's inline motion aside for a moment and read the element's own
        // look — with transitions off: paused, every element transitions for 1ms, and
        // getComputedStyle would still report the value from before the change.
        const saved = element.getAttribute("style");
        element.style.setProperty("transition", "none", "important");
        names.forEach((name) => element.style.removeProperty(name));
        if (entry.changed.has("custom")) customPropertyNames(element.style).forEach((name) => element.style.removeProperty(name));
        const look = {};
        names.forEach((name) => {
            look[name] = computed.getPropertyValue(name);
        });
        if (saved === null) element.removeAttribute("style");
        else element.setAttribute("style", saved);
        this._styleObserver?.takeRecords();

        // A script raising the opacity above the element's own is revealing it: hold it
        // fully shown. One lowering it is fading or blinking it: hold its own value.
        if ("opacity" in look) {
            const own = parseFloat(look.opacity) || 0;
            look.opacity = String(currentOpacity > own ? 1 : own);
        }

        const declarations = Object.entries(look)
            .filter(([, value]) => value !== "")
            .map(([name, value]) => `${name}: ${value} !important;`)
            .join(" ");
        if (!declarations) return;

        this._holdCount += 1;
        const id = String(this._holdCount);
        element.setAttribute(HOLD_ATTR, id);
        this._held.set(element, id);

        const sheet = this._holdStylesheet();
        sheet.insertRule(`html.${PAUSED_CLASS} [${HOLD_ATTR}="${id}"] { ${declarations} }`, sheet.cssRules.length);
    }

    /** A stylesheet of its own: it outranks inline styles, and goes when the feature does. */
    _holdStylesheet() {
        if (!this._holdSheet?.isConnected) {
            this._holdSheet = document.createElement("style");
            this._holdSheet.id = "websac-pause-animations-holds";
            document.head.appendChild(this._holdSheet);
        }
        return this._holdSheet.sheet;
    }

    _releaseHolds() {
        this._held.forEach((id, element) => {
            if (element.getAttribute(HOLD_ATTR) === id) element.removeAttribute(HOLD_ATTR);
        });
        this._held.clear();
        this._holdSheet?.remove();
        this._holdSheet = null;
    }

    // Chain detection (see CHAIN_* above), shared by GSAP and the Web Animations API.

    _frameTime() {
        return document.timeline?.currentTime ?? Math.floor(performance.now() / 16);
    }

    _noteFinished(keys) {
        const now = performance.now();
        const frame = this._frameTime();

        keys.forEach((key) => {
            const entry = this._finishes.get(key);
            if (!entry || now - entry.at > CHAIN_GAP_MS) {
                this._finishes.set(key, { at: now, frame, frames: 1, burst: 1 });
                return;
            }
            if (entry.frame === frame) {
                entry.burst += 1;
            } else {
                entry.frame = frame;
                entry.frames += 1;
                entry.burst = 1;
            }
            entry.at = now;
        });
    }

    _isChained(keys) {
        const now = performance.now();
        return keys.some((key) => {
            const entry = this._finishes.get(key);
            return !!entry && now - entry.at <= CHAIN_GAP_MS && (entry.frames >= CHAIN_FRAMES || entry.burst >= CHAIN_BURST);
        });
    }

    // GSAP (with ScrollTrigger / ScrollSmoother). Its animations write inline styles
    // every frame, which no stylesheet can override.

    _settleGsap() {
        const gsap = window.gsap;
        if (!gsap?.globalTimeline || !gsap.ticker) return;

        if (!this._gsap) {
            this._gsap = { gsap, triggers: new Set(), animations: new Set(), seen: new WeakSet() };
            gsap.ticker.add(this._gsapTick);
            // ScrollTrigger updates straight from scroll, even while GSAP's ticker is idle.
            window.addEventListener("scroll", this._gsapTick, { passive: true });
        }

        const smoother = window.ScrollSmoother?.get?.();
        if (smoother && typeof smoother.smooth === "function" && !this._handled.has(smoother)) {
            this._handled.add(smoother);
            const smooth = smoother.smooth();
            smoother.smooth(0);
            this._resumers.push(() => smoother.smooth(smooth));
        }

        this._gsapTick();
    }

    _gsapTick() {
        const state = this._gsap;
        if (!this._active || !state) return;

        // Runs from GSAP's ticker and from scroll, so each animation is settled on its own:
        // one that throws (killed half-way, a plugin GSAP does not know) must not break
        // every frame after it.
        const ScrollTrigger = window.ScrollTrigger;
        if (typeof ScrollTrigger?.getAll === "function") {
            const fresh = ScrollTrigger.getAll().filter((trigger) => trigger.enabled && !state.seen.has(trigger));
            // Loops first: an entrance that finishes on the same element may clear its
            // inline styles, and that clean state should be the one left standing.
            fresh.sort((a, b) => isEndless(b.animation) - isEndless(a.animation));
            fresh.forEach((trigger) => attempt(() => this._settleTrigger(trigger)));
        }

        state.gsap.globalTimeline.getChildren(false, true, true).forEach((animation) => attempt(() => this._settleTimed(animation)));
        // Settling rewrites styles; that is not a script animating them.
        this._styleObserver?.takeRecords();
    }

    _settleTrigger(trigger) {
        const state = this._gsap;
        state.seen.add(trigger);

        const animation = trigger.animation;
        // Triggers that only toggle classes or run callbacks may be what reveals the
        // content, so they keep working.
        if (!animation) return;

        const wasRunning = !animation.paused();
        // Pinned sections are released; everything else stays where it stands.
        trigger.disable(!!trigger.pin);
        state.triggers.add(trigger);

        if (isEndless(animation)) {
            restLoop(animation);
        } else if (isFromOnly(animation)) {
            // With callbacks: they often complete the reveal (classes, clearProps).
            animation.totalProgress(1);
        } else {
            const elements = elementTargets(animation);
            const releaseTransitions = holdTransitions(elements);
            try {
                const current = animation.totalProgress();
                const end = restingEnd(animation, elements);
                // Back to where it really was, so callbacks fire only for the move made
                // now: finishing a reveal runs its onComplete (classes, clearProps) once.
                animation.totalProgress(current, true);
                if (end === 1) animation.totalProgress(1);
                else animation.totalProgress(0, true);
            } finally {
                releaseTransitions();
            }
        }
        animation.pause();

        if (wasRunning) state.animations.add(animation);
    }

    _settleTimed(animation) {
        const state = this._gsap;
        if (!animation.isActive() || hasScrollTrigger(animation)) return;

        if (isEndless(animation)) {
            restLoop(animation);
            animation.pause();
            state.animations.add(animation);
            return;
        }

        const keys = chainKeys(allTargets(animation));
        if (this._isChained(keys)) {
            animation.pause();
            state.animations.add(animation);
            return;
        }

        // Land where it was heading: an intro shows its content, an exit is gone.
        animation.totalProgress(animation.reversed() ? 0 : 1);
        this._noteFinished(keys);
    }

    _resumeGsap() {
        const state = this._gsap;
        if (!state) return;

        state.gsap.ticker.remove(this._gsapTick);
        state.triggers.forEach((trigger) => {
            try {
                trigger.enable();
            } catch (error) {
                // Killed by the page in the meantime.
            }
        });
        state.animations.forEach((animation) => {
            try {
                animation.resume();
            } catch (error) {
                // Killed by the page in the meantime.
            }
        });

        if (!state.triggers.size) return;
        try {
            window.ScrollTrigger?.refresh?.();
        } catch (error) {
            // Each trigger already refreshed itself when it was enabled.
        }
    }

    // Web Animations API: element.animate() and libraries built on it (Motion and others).

    _patchWebAnimations() {
        const proto = window.Element?.prototype;
        if (typeof proto?.animate !== "function") return;

        const self = this;
        const original = proto.animate;
        const patched = function (...args) {
            const animation = original.apply(this, args);
            // A microtask later, so a caller that pauses or scrubs it by hand gets to first.
            if (self._active && animation) queueMicrotask(() => self._settleWebAnimation(animation));
            return animation;
        };

        proto.animate = patched;
        this._animatePatch = { proto, original, patched };
    }

    _restoreWebAnimations() {
        const patch = this._animatePatch;
        if (patch && patch.proto.animate === patch.patched) patch.proto.animate = patch.original;

        const { paused, timelines } = this._webAnimations;
        timelines.forEach((timeline, animation) => {
            try {
                animation.timeline = timeline;
            } catch (error) {
                // Cancelled in the meantime.
            }
        });
        paused.forEach((animation) => {
            try {
                animation.play();
            } catch (error) {
                // Cancelled in the meantime.
            }
        });
    }

    _settleWebAnimations() {
        if (typeof document.getAnimations !== "function") return;
        document.getAnimations().forEach((animation) => this._settleWebAnimation(animation));
    }

    _settleWebAnimation(animation) {
        const state = this._webAnimations;
        // Paused or scrubbed by the page itself: that is its own business. One the page
        // starts again is running again, and is settled again.
        if (!this._active || animation.playState !== "running" || isStylesheetAnimation(animation)) return;

        const target = animation.effect?.target;
        if (target && isOwnUi(target)) return;
        const keys = chainKeys([target]);

        try {
            // A scroll-linked animation cannot be finished; move it onto the clock first.
            if (animation.timeline && typeof window.DocumentTimeline === "function" && !(animation.timeline instanceof window.DocumentTimeline)) {
                state.timelines.set(animation, animation.timeline);
                animation.timeline = document.timeline;
            }

            const endless = animation.effect?.getComputedTiming?.().endTime === Infinity;
            if (endless || this._isChained(keys)) {
                animation.pause();
                if (endless) animation.currentTime = 0;
                state.paused.add(animation);
            } else {
                animation.finish();
                this._noteFinished(keys);
            }
        } catch (error) {
            // An animation that refuses to be finished or paused is left as it is.
        }
    }

    // Scripted smooth scrolling. CSS `scroll-behavior` is handled by the stylesheet.

    _patchScrolling() {
        const self = this;
        const owners = [
            [window, ["scroll", "scrollTo", "scrollBy"]],
            [window.Element?.prototype, ["scroll", "scrollTo", "scrollBy", "scrollIntoView"]],
        ];

        owners.forEach(([owner, names]) => names.forEach((name) => {
            const original = owner?.[name];
            if (typeof original !== "function") return;

            const patched = function (...args) {
                const [options] = args;
                if (self._active && options && typeof options === "object" && options.behavior === "smooth") {
                    args[0] = { ...options, behavior: "auto" };
                }
                return original.apply(this, args);
            };

            const own = Object.prototype.hasOwnProperty.call(owner, name);
            attempt(() => {
                owner[name] = patched;
                this._scrollPatches.push({ owner, name, original, patched, own });
            });
        }));
    }

    _restoreScrolling() {
        this._scrollPatches.forEach(({ owner, name, original, patched, own }) => {
            if (owner[name] !== patched) return;
            if (own) owner[name] = original;
            else delete owner[name];
        });
    }

    /**
     * jQuery effects (animate, fade*, slide*, show/hide with a speed, animated scrolling)
     * all go through $.fn.animate; they run with no duration, so they land at once.
     * `jQuery.fx.off` would do the same but cannot tell a script looping its own
     * animation from the completion callback, which would then flip between states
     * every frame; such a loop is let go quiet here on the state its last round left.
     */
    _patchJquery() {
        [window.jQuery, window.$].forEach((jq) => {
            const fn = jq?.fn;
            if (typeof fn?.animate !== "function" || !fn.jquery || this._handled.has(fn)) return;
            this._handled.add(fn);

            const self = this;
            const original = fn.animate;
            const fromCompletion = (complete) => function (...args) {
                const outer = self._inJqueryCompletion;
                self._inJqueryCompletion = true;
                try {
                    return complete.apply(this, args);
                } finally {
                    self._inJqueryCompletion = outer;
                }
            };

            const patched = function (props, speed, easing, callback) {
                if (!self._active || !props || typeof props !== "object") return original.apply(this, arguments);

                if (self._inJqueryCompletion) {
                    const keys = chainKeys(this.toArray());
                    if (self._isChained(keys)) return this;
                    self._noteFinished(keys);
                }

                const options = speed && typeof speed === "object"
                    ? { ...speed }
                    : { complete: [callback, easing, speed].find((value) => typeof value === "function") };
                options.duration = 0;
                if (typeof options.complete === "function") options.complete = fromCompletion(options.complete);
                return original.call(this, props, options);
            };

            fn.animate = patched;
            this._jqueryPatches.push({ fn, original, patched });

            // Effects already running when the feature was switched on.
            try {
                jq(":animated").finish();
            } catch (error) {
                // Selector or .finish() unavailable in a very old jQuery.
            }
        });
    }

    // anime.js (e.g. Element Pack's floating effects) runs on its own frame loop.

    _settleAnime() {
        const running = window.anime?.running;
        if (!Array.isArray(running)) return;
        [...running].forEach((instance) => attempt(() => this._settleAnimeInstance(instance)));
    }

    _settleAnimeInstance(instance) {
        if (instance.paused) return;
        const targets = (instance.animatables || []).map((animatable) => animatable.target);
        if (targets.some((target) => isOwnUi(target))) return;

        const keys = chainKeys(targets);
        const endless = instance.loop === true || instance.loop === Infinity;
        if (endless || this._isChained(keys)) {
            instance.pause();
            // A loop rests on the start of its cycle, like the GSAP loops.
            if (endless) instance.seek(0);
            this._animePaused.add(instance);
            return;
        }

        // Land where it was heading.
        instance.seek(instance.duration);
        instance.pause();
        this._noteFinished(keys);
    }

    // UIkit components: Element Pack's parallax effects run on its bundled copy (bdtUIkit).

    _stopUikit() {
        const kits = [window.bdtUIkit, window.UIkit].filter(
            (kit, index, all) => typeof kit?.getComponent === "function" && all.indexOf(kit) === index
        );

        kits.forEach((kit) => {
            document.querySelectorAll(UIKIT_PARALLAX).forEach((element) => {
                const parallax = kit.getComponent(element, "parallax");
                // Checked on every sweep: UIkit turns it back on when a media query flips.
                if (!parallax?.matchMedia) return;
                // UIkit's own "media query does not match" state: it clears the styles it
                // set and stops following the scroll.
                parallax.matchMedia = false;
                parallax.$emit?.("resize");
                this._resumeOnce(parallax, () => {
                    parallax.matchMedia = parallax.mediaObj ? parallax.mediaObj.matches : true;
                    parallax.$emit?.("resize");
                });
            });

            document.querySelectorAll(UIKIT_SLIDERS).forEach((element) => {
                ["slideshow", "slider"].forEach((name) => {
                    const slider = kit.getComponent(element, name);
                    if (!slider?.autoplay || typeof slider.stopAutoplay !== "function") return;
                    slider.stopAutoplay();
                    this._resumeOnce(slider, () => slider.startAutoplay?.());
                });
            });
        });
    }

    // Autoplaying sliders. Manual navigation keeps working; it just no longer glides.

    _resumeOnce(key, resume) {
        if (this._handled.has(key)) return;
        this._handled.add(key);
        this._resumers.push(resume);
    }

    _stopSliders() {
        document.querySelectorAll(".swiper, .swiper-container, swiper-container").forEach((element) => {
            const swiper = element.swiper;
            if (!swiper?.params || swiper.destroyed) return;

            if (!this._handled.has(swiper)) {
                // Swiper waits for transitionend before it takes another slide, and in
                // loop mode that event may never come once transitions are cut short.
                // At speed 0 it changes slides at once and does not wait.
                const speed = swiper.params.speed;
                swiper.params.speed = 0;
                if (swiper.animating && typeof swiper.transitionEnd === "function") swiper.transitionEnd();
                this._resumeOnce(swiper, () => {
                    if (!swiper.destroyed) swiper.params.speed = speed;
                });
            }

            if (swiper.autoplay?.running) {
                swiper.autoplay.stop();
                this._resumeOnce(swiper.autoplay, () => !swiper.destroyed && swiper.autoplay.start());
            }
        });

        const Flickity = window.Flickity;
        if (typeof Flickity?.data === "function") {
            document.querySelectorAll(".flickity-enabled").forEach((element) => {
                const flickity = Flickity.data(element);
                if (flickity?.player?.state !== "playing") return;
                flickity.stopPlayer();
                this._resumeOnce(flickity, () => flickity.playPlayer());
            });
        }

        const jq = window.jQuery;
        if (typeof jq !== "function") return;

        document.querySelectorAll(".slick-initialized").forEach((element) => {
            const slick = element.slick;
            if (!slick?.options) return;

            if (!this._handled.has(slick)) {
                // Slick holds every further slide change back for `speed` ms.
                const speed = slick.options.speed;
                slick.options.speed = 0;
                this._resumeOnce(slick, () => {
                    slick.options.speed = speed;
                });
            }

            if (!slick.options.autoplay || slick.paused) return;
            jq(element).slick("slickPause");
            this._resumeOnce(slick.options, () => !slick.unslicked && jq(element).slick("slickPlay"));
        });

        document.querySelectorAll(".owl-carousel").forEach((element) => {
            const owl = jq(element).data("owl.carousel");
            if (!owl?.settings?.autoplay) return;
            jq(element).trigger("stop.owl.autoplay");
            this._resumeOnce(owl, () => jq(element).trigger("play.owl.autoplay", [owl.settings.autoplayTimeout]));
        });

        document.querySelectorAll(".flexslider").forEach((element) => {
            const slider = jq(element).data("flexslider");
            if (!slider?.playing || typeof slider.pause !== "function") return;
            slider.pause();
            this._resumeOnce(slider, () => slider.play());
        });

        // Slider Revolution keeps a paused slider paused (hover included), so once is enough.
        document.querySelectorAll("rs-module, .rev_slider").forEach((element) => {
            const $slider = jq(element);
            if (this._handled.has(element) || typeof $slider.revpause !== "function") return;
            $slider.revpause();
            this._resumeOnce(element, () => $slider.revresume());
        });
    }

    // Lottie and particle backgrounds draw on their own loop.

    _stopCanvasAnimations() {
        const lottie = window.lottie || window.bodymovin;
        if (typeof lottie?.freeze === "function" && !this._handled.has(lottie)) {
            this._handled.add(lottie);
            lottie.freeze();
            this._resumers.push(() => lottie.unfreeze());
        }

        const tsParticles = window.tsParticles;
        const containers = typeof tsParticles?.dom === "function" ? tsParticles.dom() : [];
        (containers || []).forEach((container) => {
            if (typeof container?.pause !== "function") return;
            if (typeof container.getAnimationStatus === "function" && !container.getAnimationStatus()) return;
            container.pause();
            this._resumeOnce(container, () => container.play());
        });

        (window.pJSDom || []).forEach((entry) => {
            const move = entry?.pJS?.particles?.move;
            if (!move?.enable) return;
            move.enable = false;
            this._resumeOnce(move, () => {
                move.enable = true;
            });
        });
    }

    // Media.

    _stopMedia(node) {
        if (!this._active || isOwnUi(node)) return;

        try {
            switch (node.localName) {
                case "img":
                    this._freezeImage(node);
                    break;
                case "video":
                    this._pauseVideo(node);
                    break;
                case "iframe":
                    this._pauseEmbed(node);
                    break;
                case "svg":
                    this._pauseSvg(node);
                    break;
                case "marquee":
                    this._stopMarquee(node);
                    break;
                case "lottie-player":
                case "dotlottie-player":
                case "dotlottie-wc":
                    this._pauseLottiePlayer(node);
                    break;
            }
        } catch (error) {
            // A player that is not ready yet is picked up on the next sweep.
        }
    }

    _freezeImage(image) {
        const still = this._stills.get(image);
        if (still && image.getAttribute("src") === still) return;
        // The page swapped the picture since (lazy loading): freeze the new one.
        if (still) this._stills.delete(image);

        const url = image.currentSrc || image.src || "";
        if (!isGif(url) || this._waitingImages.has(image)) return;

        if (!image.complete || !image.naturalWidth) {
            this._waitingImages.add(image);
            image.addEventListener("load", () => {
                this._waitingImages.delete(image);
                this._stopMedia(image);
            }, { once: true });
            return;
        }

        // Tracking pixels.
        if (image.naturalWidth < 2 && image.naturalHeight < 2) return;

        const frame = drawStill(image);
        if (frame) {
            this._showStill(image, frame);
            return;
        }

        // Asking again with CORS works when the other host allows it; if it does not,
        // there is no way to read the frame and the GIF is left as it is.
        if (this._corsTried.has(image)) return;
        this._corsTried.add(image);

        const probe = new window.Image();
        probe.crossOrigin = "anonymous";
        probe.onload = () => {
            const corsFrame = drawStill(probe);
            if (corsFrame && this._active && (image.currentSrc || image.src) === url) this._showStill(image, corsFrame);
        };
        probe.src = url;
    }

    /** Show the current frame in place of the GIF, on the same element so layout and styling stay. */
    _showStill(image, frame) {
        const picture = image.parentElement?.localName === "picture" ? image.parentElement : null;
        const sources = picture ? [...picture.querySelectorAll("source[srcset]")] : [];
        const saved = {
            src: image.getAttribute("src"),
            srcset: image.getAttribute("srcset"),
            sizes: image.getAttribute("sizes"),
            sources: sources.map((source) => [source, source.getAttribute("srcset")]),
        };

        sources.forEach((source) => source.removeAttribute("srcset"));
        image.removeAttribute("srcset");
        image.removeAttribute("sizes");
        image.setAttribute("src", frame);
        this._stills.set(image, frame);

        this._resumers.push(() => {
            // Replaced by the page while paused: the new picture wins.
            if (image.getAttribute("src") !== frame) return;
            saved.sources.forEach(([source, srcset]) => restoreAttribute(source, "srcset", srcset));
            restoreAttribute(image, "srcset", saved.srcset);
            restoreAttribute(image, "sizes", saved.sizes);
            restoreAttribute(image, "src", saved.src);
        });
    }

    _pauseVideo(video) {
        if (video.paused || !isAmbientVideo(video)) return;
        video.pause();
        this._pausedVideos.add(video);
    }

    _onPlay(event) {
        const video = event.target;
        if (!this._active || video?.localName !== "video" || isOwnUi(video)) return;

        if (performance.now() - this._lastGesture < GESTURE_WINDOW_MS) {
            // The visitor pressed play: that video is theirs to watch.
            this._pausedVideos.delete(video);
            return;
        }

        this._pauseVideo(video);
    }

    _pauseEmbed(iframe) {
        if (this._handled.has(iframe)) return;
        const commands = embedCommands(iframe.getAttribute("src") || "");
        if (!commands) return;
        this._handled.add(iframe);

        const send = (message) => {
            try {
                iframe.contentWindow?.postMessage(message, commands.origin);
            } catch (error) {
                // Navigated away or not loaded yet.
            }
        };
        const pause = () => this._active && send(commands.pause);

        // The player only listens once it has loaded, and YouTube's a moment after that.
        pause();
        iframe.addEventListener("load", pause, { once: true });
        [1000, 3000].forEach((delay) => window.setTimeout(pause, delay));
        this._resumers.push(() => send(commands.play));
    }

    _pauseSvg(svg) {
        if (svg.ownerSVGElement || typeof svg.pauseAnimations !== "function" || svg.animationsPaused()) return;
        if (!svg.querySelector("animate, animateMotion, animateTransform, set")) return;
        svg.pauseAnimations();
        this._resumers.push(() => svg.unpauseAnimations());
    }

    _stopMarquee(marquee) {
        if (this._handled.has(marquee) || typeof marquee.stop !== "function") return;
        this._handled.add(marquee);
        marquee.stop();
        this._resumers.push(() => marquee.start());
    }

    _pauseLottiePlayer(element) {
        const player = element.dotLottie || element;
        const playing = element.dotLottie ? element.dotLottie.isPlaying : element.currentState === "playing";
        if (!playing || typeof player.pause !== "function") return;
        player.pause();
        this._resumeOnce(element, () => player.play());
    }

    /**
     * `background-attachment: fixed` scrolls the page over a still picture, which reads
     * as parallax. Only elements that actually use it are marked; `local` backgrounds
     * (scroll shadows) keep working.
     */
    _markFixedBackgrounds(root) {
        const elements = root === document.documentElement
            ? document.querySelectorAll("*")
            : [root, ...root.querySelectorAll("*")];

        elements.forEach((element) => {
            if (window.getComputedStyle(element).backgroundAttachment.includes("fixed")) {
                element.setAttribute(FIXED_BACKGROUND_ATTR, "");
            }
        });
    }
}

// Singleton helper
const pauseAnimations = () => PauseAnimations.getInstance();
export default pauseAnimations;
