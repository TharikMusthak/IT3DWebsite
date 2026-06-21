let _threeLoadPromise = null;

export default function loadThree() {
  if (window.THREE) return Promise.resolve();
  if (_threeLoadPromise) return _threeLoadPromise;
  
  _threeLoadPromise = new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload = resolve;
    document.head.appendChild(s);
  });
  
  return _threeLoadPromise;
}