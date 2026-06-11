// Prevent React from crashing when browser extensions or translation tools modify the DOM
if (typeof window !== 'undefined') {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    try {
      return originalRemoveChild.call(this, child);
    } catch (error) {
      if (error.name === 'NotFoundError') {
        console.warn('Prevented React removeChild crash:', error);
        return child;
      }
      throw error;
    }
  };
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    try {
      return originalInsertBefore.call(this, newNode, referenceNode);
    } catch (error) {
      if (error.name === 'NotFoundError') {
        console.warn('Prevented React insertBefore crash:', error);
        return newNode;
      }
      throw error;
    }
  };
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename="/">
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
