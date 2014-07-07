function onDeviceReady() {
    if (parseFloat(window.device.version) === 7.0) {
          document.body.style.marginTop = "20px";
    }
    alert("here");
}
  
document.addEventListener('deviceready', onDeviceReady, false);
