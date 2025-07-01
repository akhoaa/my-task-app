import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Root element with id 'root' not found");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
); 