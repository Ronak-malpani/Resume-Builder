import { ClerkProvider } from '@clerk/clerk-react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App.jsx';
import { store } from './app/store.js';
import './index.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <ClerkProvider
        frontendApi={import.meta.env.VITE_CLERK_FRONTEND_API} 
        publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      >
        <App />
      </ClerkProvider>
    </Provider>
  </BrowserRouter>
);
