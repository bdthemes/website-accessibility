import View from "./view";
import "./styles/main.scss";
import { createRoot } from "@wordpress/element";
import AccessibilityContextProvider from "./context/provider";
import pauseAnimations from "../classes/pause-animations";

// The toolbar mounts on `load`. If the page head already paused motion from the
// visitor's saved choice, stop scripted motion now instead of waiting for that.
pauseAnimations().startFromBoot();

const mount = () => {
    const rootElement = document.getElementById( "website-accessibility-app" );
    if ( ! rootElement ) {
        return;
    }

    // The root may hold the launcher placeholder (src/launcher): rendering replaces it.
    const root = createRoot( rootElement );
    root.render(
        <AccessibilityContextProvider>
            <View />
        </AccessibilityContextProvider>
    );
};

// Loaded on demand (src/launcher) the page may have finished loading already.
if ( document.readyState === "complete" ) {
    mount();
} else {
    window.addEventListener( "load", mount, { once: true } );
}
