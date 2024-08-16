// src/index.jsx or src/main.jsx

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { syncData } from './services/sync';  // Correct import

const Main = () => {
  useEffect(() => {
    syncData();
  }, []);

  return <App />;
};

ReactDOM.render(<Main />, document.getElementById('root'));
