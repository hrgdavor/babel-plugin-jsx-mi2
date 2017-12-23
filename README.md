# babel-plugin-jsx-mi2 [![CircleCI](https://img.shields.io/circleci/project/hrgdavor/babel-plugin-jsx-mi2.svg?maxAge=2592005)](https://circleci.com/gh/hrgdavor/babel-plugin-jsx-mi2)

> Babel plugin for JSX to JS transformation for [mi2js](https://github.com/hrgdavor/mi2js) library.

Based on [babel-plugin-transform-simple](https://github.com/hrgdavor/babel-plugin-jsx-mi2)

### What is JSX all about(the basic idea)

You want to write code that combines HTML and JS and do it sometimes inside a JS file too.

``` js
// state: {name:'Somebody', city: 'Mordor'}

proto.initTemplate = function(h,t,state){
  return <div>
    <div class="name"><b>Name: </b>{state.name}</div>
    <div class="city"><b>City: </b>{state.city}</div>
  </div>
}

```

The JSX is tranformed to function calls and then the code looks like this

``` js

proto.initTemplate = function(h,t,state){
  return h('div', null,
    h('div', {'class':'name'}, h('b', null, 'Name: '), ()=>person.name),
    h('div', {'class':'city'}, h('b', null, 'City: '), ()=>person.city),
  )
}

```

the function `h` is implemented in such way that these calls to `h` result in `def` being: 

```js
{
  "tag": "div",
  "attr": null,
  "children": [
    {
      "tag": "div",
      "attr": { "class": "name" },
      "children": [
        { "tag": "b", "attr": null,  "children": [ "Name: " ] },
        ()=>person.name
      ]
    },
    {
      "tag": "div",
      "attr": { "class": "city" },
      "children": [
        { "tag": "b", "attr": null,  "children": [ "City: " ] },
        ()=>person.city
      ]
    }
  ]
}
```

the library will use returned structure and call `mi2js.insertHtml` function to generate(eventually) HTML based on data structured like that
so the final result in HTML is:

```html
<div>
  <div class="name"><b>Name: </b>Somebody</div>
  <div class="city"><b>City: </b>Mordor</div>
</div>
```

quick explanation: the JS expressions are wrapped in arrow function so they can be reevaluated later when state changes
(form more details check the explanation in the library).