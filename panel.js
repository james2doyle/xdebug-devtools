// Utilities
//
function log(...s) {
  var string = JSON.stringify(s);
  chrome.devtools.inspectedWindow.eval('console.log(' + string + ')');
}

function collectErrors(callback) {
  chrome.devtools.inspectedWindow.eval(
    `Array.from(document.querySelectorAll('.xdebug-error'))
      .map((el) => {
        // remove the inject br tags
        let br = el.parentNode.previousElementSibling;
        if (br.tagName == 'BR') {
          br.parentNode.removeChild(br);
        }
        const output = el.outerHTML;
        el.parentNode.parentNode.removeChild(el.parentNode);
        return output;
      })`,
    function(result, isException) {
      callback(result);
    }
  );
};

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

function stringFormatting(string) {
  // http://php.net/manual/en/function.${slugifiedFunctionName}.php
  const matches = string.match(/(require.*|include)\({1}\s?\'(.+)\'\s?\){1}?/);
  const fns = string.match(/(\w+[_]\w+)\s?/);

  // is this a function that is showing args?
  if (matches && matches.length > 2) {
    // links to the PHP docs for this function
    // TODO: add copy-to-clipboard for the file paths
    string = `<a href="http://php.net/manual/en/function.${matches[1].replace(/\_/gi, '-')}.php" target="_blank" title="View ${matches[1]} on PHP.net" class="php-function">${matches[1]}</a>(<a href="file://${matches[2]}" title="${matches[2]}" target="_top" class="php-file"><em>"${matches[2]}"</em></a>)`;
  } else if (fns) {
    // this is some plain function with no args - link to doc search
    string = `<a href="http://php.net/manual-lookup.php?pattern=${fns[1]}&scope=quickref" target="_blank" title="Search ${fns[1]} on PHP.net">${string}</a>`;
  }

  return string;
}

function formatMessage(string) {
  // message without title or line \:+\s?(\w.+)\.php
  const matches = string.match(/^[\(\s\!\s\)]+([\w\s])+[^\:]/i);
  if (matches) {
    string = string.replace(matches[0], `<strong>${matches[0].replace('( ! )', '').trim()}</strong>`);
  }

  // filename match in message [^\w\:+\s+](\w.+\.php)
  // line number in message (\d+)$

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
    collection[chunkCount].message = formatMessage(message.innerText);
    chunk.forEach((el, index) => {
      collection[chunkCount][tableHeaderMap[index]] = (tableHeaderTypeMap[index] === 'number') ? parseFloat(el.innerText) : stringFormatting(el.innerText);
    })
  });
  return collection;
}

function init() {
  // where we store the errors from the DOM
  const errorList = document.getElementById('error-list');
  // nuke the info
  errorList.innerHTML = null;
  collectErrors(function(res) {
    // damn - something happened
    if (!res) {
      errorList.innerHTML = `<p class="error-message">There was an error interacting with the DOM.</p>`;
      return;
    }
    // puts the tables from the DOM into the devtools panel.html
    errorList.innerHTML = res.join("\n");
    // decorate the new HTML with additional features
    let items = document.querySelectorAll('table tr:nth-child(n+4) td');
    for (let i = 0; i < items.length; i++) {
      items[i].innerHTML = stringFormatting(items[i].innerText);
    }
    // const tables = Array.from(errorList.querySelectorAll('table'));
    // const data = tables.map(objectify);
    // console.log(data);
  });
}

init();
chrome.devtools.network.onNavigated.addListener(init);