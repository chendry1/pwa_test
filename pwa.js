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
  }  
}

// resize event handling is added for case 
window.addEventListener("resize", function(event) {
  pwa_redirectIfNeeded();
});

window.addEventListener('appinstalled', (evt) => {
  console.log('INSTALL: Success');
  pwa_redirectIfNeeded();
});