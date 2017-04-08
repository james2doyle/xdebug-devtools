// this function is wrapped in an IIFE so we don't pollute the tab `window` object
(function() {
  // table headers
  const tableHeaderMap = [
    'number',
    'time',
    'memory',
    'function',
    'location'
  ];

  // type hinting for the table data
  const tableHeaderTypeMap = [
    'number',
    'number',
    'number',
    'string',
    'string'
  ];
  // the number of header elements in a xdebug dump
  const rowCount = 5;

  // helper for slicing the array
  function arrayChunk(arr, len) {
    let chunks = [],
      i = 0,
      n = arr.length;
    while (i < n) {
      chunks.push(arr.slice(i, i += len));
    }

    return chunks;
  }

  // filename match in message [^\w\:+\s+](\w.+\.php)
  function getFilename(string) {
    const matches = string.match(/[^\w\:+\s+](\w.+\.php)/i);
    if (matches) {
      return matches[0];
    }
    return string;
  }

  function formatMessage(string) {
    const matches = string.match(/^[\(\s\!\s\)]+([\w\s])+[^\:]/i);
    if (matches) {
      string = string.replace(matches[0], `<strong>${matches[0].replace('( ! )', '').trim()}</strong>`);
    }
    return string;
  }

  // line number in message (\d+)$
  function getLinenumber(string) {
    const matches = string.match(/(\d+)$/i);
    if (matches) {
      return matches[0];
    }
    return string;
  }

  function cleanupMessage(string) {
    const matches = string.match(/(\sin\s.*)/i);
    if (matches) {
      return string.replace(matches[0], '').trim();
    }
    return string;
  }

  // turns the xdebug HTML table into an object
  function objectify(table) {
    const info = table.querySelectorAll('tr:nth-child(n+4) td');
    const message = table.querySelector('th:first-child');
    const chunks = arrayChunk(Array.from(info), rowCount);
    const collection = [];
    chunks.forEach((chunk, chunkCount) => {
      collection[chunkCount] = {};
      collection[chunkCount].message = cleanupMessage(message.innerText.replace('( ! ) ', ''));
      collection[chunkCount].filename = getFilename(message.innerText);
      collection[chunkCount].linenumber = getLinenumber(message.innerText);
      chunk.forEach((el, index) => {
        collection[chunkCount][tableHeaderMap[index]] = (tableHeaderTypeMap[index] === 'number') ? parseFloat(el.innerText) : el.innerText;
      })
    });
    return collection;
  }
  // by default, xdebug outputs a table with this class
  const blocks = document.querySelectorAll('.xdebug-error');
  // if there are no elements - bail
  if (blocks.length > 0) {
    chrome.storage.sync.get('notify', function(item) {
      if (item.notify) {
        // create a notification
        const div = document.createElement('div');
        div.className = 'xdebug-error-notification';
        const plural = (blocks.length == 1) ? 'Error' : 'Errors';
        div.innerHTML = `<strong>Xdebug</strong>: <em>${blocks.length}</em> ${plural} Detected`;
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
        }, 3100);
      }
    });
    chrome.storage.sync.get('remove', function(item) {
      if (item.remove) {
        // tell the user why they see no errors in the DOM
        console.info('Xdebug: Page errors have been plucked from the DOM and put in the Xdebug panel.');
        Array.from(blocks)
          .map((el) => {
            // remove the inject br tags
            let br = el.parentNode.previousElementSibling;
            if (br.tagName == 'BR') {
              br.parentNode.removeChild(br);
            }
            el.parentNode.parentNode.removeChild(el.parentNode);
          });
      } else {
        console.info('Xdebug: Page errors have been detected.');
        chrome.storage.sync.get('restyle', function(item) {
          if (item.restyle) {
            Array.from(blocks).forEach(el => el.classList.add('xdebug-error-restyled'));
          }
        });

        Array.from(blocks).forEach(el => el.classList.add('xdebug-visible'));
      }
    });
    chrome.storage.sync.get('console', function(item) {
      if (item.console) {
        Array.from(blocks).forEach((el) => {
          const data = objectify(el);
          // console.error('Xdebug ' + data[0].message.replace('( ! ) ', ''), ...data);
          chrome.storage.sync.get('console_deep', function(item) {
            if (item.console_deep) {
              console.error(`Xdebug ${data[0].message}`, `at ${data[0].filename}:${data[0].linenumber}`, ...data);
            } else {
              console.error(`Xdebug ${data[0].message}`, `at ${data[0].filename}:${data[0].linenumber}`);
            }
          });
        });
      }
    });
  }
})();