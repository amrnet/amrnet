import './App.css';
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import reportWebVitals from './reportWebVitals';
import { createTheme, ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { AdminPage } from './components/Admin';
import { DashboardPage } from './components/Dashboard';
import { AboutPage } from './components/About';
import { DatabasePage } from './components/Database';
import { DocumentationPage } from './components/Documentation';
import { ContactPage } from './components/Contact';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { store } from './stores/store.ts';
import { IndexedDBProvider } from './context/IndexedDBContext';
import { HomePage } from './components/Home';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1fbbd3',
    },
  },
  typography: {
    fontFamily: [
      'Montserrat',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Roboto"',
      '"Oxygen"',
      '"Ubuntu"',
      '"Cantarell"',
      '"Fira Sans"',
      '"Droid Sans"',
      '"Helvetica Neue"',
      'sans-serif',
    ].join(','),
  },
});

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <IndexedDBProvider>
            <div className="App">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/database" element={<DatabasePage />} />
                <Route path="/documentation" element={<DocumentationPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Routes>
            </div>
          </IndexedDBProvider>
        </ThemeProvider>
      </Provider>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);

registerServiceWorker();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
