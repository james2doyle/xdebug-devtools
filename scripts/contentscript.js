(function() {
  const blocks = document.querySelectorAll('.xdebug-error');
  if (blocks.length > 0) {
    const plural = (blocks.length == 1) ? 'Error' : 'Errors';
    const div = document.createElement('div');
    div.className = 'xdebug-error-notification';
    div.innerHTML = `<strong>Xdebug</strong>: <em>${blocks.length}</em> ${plural} Detected`;
    console.info('Xdebug: Page errors have been plucked from the DOM and put in the Xdebug panel.');
    document.body.appendChild(div);
    setTimeout(() => {
      div.classList.add('showing');
    }, 100);
    setTimeout(() => {
      div.classList.add('hidden');
      setTimeout(() => {
        div.parentNode.removeChild(div);
      }, 100);
    }, 3000);
  }
})();