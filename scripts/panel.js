// Utilities
//
function log(...s) {
  var string = JSON.stringify(s);
  chrome.devtools.inspectedWindow.eval('console.log(' + string + ')');
}

function collectErrors(callback) {
  chrome.storage.sync.get('remove', function(item) {
    let template = `Array.from(document.querySelectorAll('.xdebug-error'))
      .map((el) => {
        return el.outerHTML;
      })`;
    if (item.remove) {
      template = `Array.from(document.querySelectorAll('.xdebug-error'))
        .map((el) => {
          // remove the inject br tags
          let br = el.parentNode.previousElementSibling;
          if (br.tagName == 'BR') {
            br.parentNode.removeChild(br);
          }
          const output = el.outerHTML;
          el.parentNode.parentNode.removeChild(el.parentNode);
          return output;
        })`;
    }

    chrome.devtools.inspectedWindow.eval(template, (result, isException) => {
      callback(result);
    });
  });
};

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
    chrome.storage.sync.get('restyle', function(item) {
      if (item.restyle) {
        let tables = document.querySelectorAll('table');
        Array.from(tables).forEach(el => el.classList.add('xdebug-error-restyled'));
      }
    });
    // decorate the new HTML with additional features
    let items = document.querySelectorAll('table tr:nth-child(n+4) td');
    for (let i = 0; i < items.length; i++) {
      items[i].innerHTML = stringFormatting(items[i].innerText);
    }
  });
}

init();
chrome.devtools.network.onNavigated.addListener(init);