// TO CONFIG
const PWA_WINDOW_WIDTH = 600;
const PWA_WINDOW_HEIGHT = 400;

window.onload = () => {  
  if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js', {scope: './'})
    .then((reg) => {
      console.log('Registration succeeded. Scope is ' + reg.scope);
    }).catch((error) => {
      console.log('Registration failed with ' + error);
    });
  }
}

function pwa_redirectIfNeeded()
{
  let displayMode = 'browser tab';
  if(navigator.standalone) {
    displayMode = 'standalone-ios';
  }
  
  if(window.matchMedia('(display-mode: standalone)').matches) {
    displayMode = 'standalone';
  }

  // redirect in case if launched in standalone mode
  console.log('DISPLAY_MODE_RESIZE:', displayMode);
  if(displayMode != "browser tab") {
    window.location.replace("standalone.html");
	window.resizeTo(PWA_WINDOW_WIDTH,PWA_WINDOW_HEIGHT); // it will cause fixed window size, probably this behavior should be changed for mobile platform
  }
}

// resize event handling is added for case when PWA standalone is opened with Google Chrome (it just moves browser to separate screen without reloading so that it causes window resize)
window.addEventListener("resize", function(event) {
  pwa_redirectIfNeeded();
});

window.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOM fully loaded and parsed');
  pwa_redirectIfNeeded();
});

window.addEventListener('appinstalled', (evt) => {
  console.log('INSTALL: Success');
  pwa_redirectIfNeeded();
});