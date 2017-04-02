// this function is wrapped in an IIFE so we don't pollute the tab `window` object
(function() {
  // by default, xdebug outputs a table with this class
  const blocks = document.querySelectorAll('.xdebug-error');
  // if there are no elements - bail
  if (blocks.length > 0) {
    const plural = (blocks.length == 1) ? 'Error' : 'Errors';
    // create a notification
    const div = document.createElement('div');
    div.className = 'xdebug-error-notification';
    div.innerHTML = `<strong>Xdebug</strong>: <em>${blocks.length}</em> ${plural} Detected`;
    // tell the user why they see no errors in the DOM
    console.info('Xdebug: Page errors have been plucked from the DOM and put in the Xdebug panel.');
    document.body.appendChild(div);
    // show our notification we injected - reminding the user this is enabled
    setTimeout(() => {
      div.classList.add('showing');
    }, 100);
    setTimeout(() => {
      // hide and then remove from DOM
      div.classList.add('hidden');
      setTimeout(() => {
        div.parentNode.removeChild(div);
      }, 100);
    }, 3000);
  }
})();