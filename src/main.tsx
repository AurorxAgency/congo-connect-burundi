import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/pwabuilder-sw.js')
      .then((registration) => {
        console.log('PWABuilder SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('PWABuilder SW registration failed: ', registrationError);
      });
  });
}
