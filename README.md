# #codebarrierefrei Challenge 6

Die in diesem Repository enthaltenen Experimente sind im Rahmen des #codebarrierefrei-Hackathons am 19. und 20. Juni
2021 entstanden. Live-Demo
siehe [https://tollwerk.github.io/universal-kbd-control/index.html](https://tollwerk.github.io/universal-kbd-control/index.html)
.

Mögliches, späteres Bookmarklet:

```js
javascript:(function () {
    document.body.appendChild(document.createElement('script')).src = 'https://cdn.jsdelivr.net/gh/tollwerk/universal-kbd-control/universal-keyboard-control.js?' + (new Date).getTime();
})(); 
```
