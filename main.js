window.onload = () => {  
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js', {scope: './'})
  .then((reg) => {
    // регистрация сработала
    console.log('Registration succeeded. Scope is ' + reg.scope);
  }).catch((error) => {
    // регистрация прошла неудачно
    console.log('Registration failed with ' + error);
  });
}
}