import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app.css'
import App from './App.tsx'

// Fix React 19 + browser extensions (Migaku, translators, etc.)
// Extensions modify the DOM and React 19 crashes on insertBefore/removeChild.
// This patches those methods to silently handle the mismatch.
const originalInsertBefore = Node.prototype.insertBefore;
Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
  try {
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'NotFoundError') {
      return originalInsertBefore.call(this, newNode, null) as T;
    }
    throw e;
  }
};

const originalRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function <T extends Node>(child: T): T {
  try {
    return originalRemoveChild.call(this, child) as T;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'NotFoundError') {
      return child;
    }
    throw e;
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
