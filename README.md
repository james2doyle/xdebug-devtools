# Xdebug DevTools (Work In Progress)

> A Chrome extension for showing your Xdebug errors inside devtools instead of inline in your page.

![logo.png](https://raw.githubusercontent.com/james2doyle/xdebug-devtools/master/images/logo.png)

This extension plucks xdebug errors from the DOM, and places them in a nice panel, or the console, in the Chrome DevTools. This extension will also parse the HTML output of the xdebug error table and do some nice things like link to documentation and allow you to copy file links to your clipboard.

### Demo

![xdebug-chrome-demo.gif](https://raw.githubusercontent.com/james2doyle/xdebug-devtools/master/xdebug-chrome-demo.gif)

### How It Works

This Chrome extension works in a couple ways. First, the extension injects a stylesheet to hide any `.xdebug-error` elements. Then, it basically check your page to see if any `.xdebug-error` elements actually exist. If they do, it will push those elements to the dev tools interface, where they can be seen.

### Options

![options.png](https://raw.githubusercontent.com/james2doyle/xdebug-devtools/master/options.png)
