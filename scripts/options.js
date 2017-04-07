// Saves options to chrome.storage
function save_options(event) {
  event.preventDefault();
  const items = document.querySelectorAll('.form-checkbox input');
  const data = {};
  Array.from(items).forEach(item => data[item.name] = item.checked);
  chrome.storage.sync.set(data, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';
    status.style.display = 'block';
    setTimeout(() => {
      status.textContent = '';
      status.style.display = 'none';
    }, 2000);
  });
  return false;
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    panel: true,
    remove: true,
    notify: true,
    restyle: true,
    console: false,
    console_deep: false,
  }, (items) => {
    for (let item in items) {
      document.getElementById(item).checked = items[item];
    }
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('the-form').addEventListener('submit',
  save_options);