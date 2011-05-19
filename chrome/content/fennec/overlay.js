// When Firefox finishes loading, load the DeveloperProfile module
window.addEventListener('load',function() {
    Components.utils.import('chrome://DeveloperProfile/content/DeveloperProfile.jsm');
},false);