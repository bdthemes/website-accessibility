import View from "./view";
import "./styles/main.scss";
import { createRoot } from "@wordpress/element";
import AccessibilityContextProvider from "./context/provider";

window.addEventListener( "load", () => {
    const rootElement = document.getElementById( "website-accessibility-app" );
    if ( ! rootElement ) {
        return;
    }

    const root = createRoot( rootElement );
    root.render( 
        <AccessibilityContextProvider>
            <View />
        </AccessibilityContextProvider>
    );
});