
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// For debugging: add a way to reset onboarding
// Uncomment this line and refresh the page to reset onboarding
// localStorage.removeItem('kontrola-onboarding-dismissed');

createRoot(document.getElementById("root")!).render(<App />);
