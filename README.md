# koa2-dot
> doT(http://olado.github.io/doT/) for koa2 with support layouts, include function. It's friendly for front-end web libraries (Angular, Ember, Vue.js, React ...)

## Important
The default settings of doT has been change to use `[[]]` instead of `{{}}` This to support client side templates (Angular...)

- extremely fast ([see jsperf](http://jsperf.com/dom-vs-innerhtml-based-templating/998))
- all the advantage of [doT](http://olado.github.io/doT/)
- layout and partial support
- uses `[[ ]]` by default, not clashing with `{{ }}` (Angular, Ember...)
- custom helpers to your views
- conditional, array iterators, custom delimiters...
- use it as logic-less or with logic, it is up to you
- use it also for your email (or anything) templates
- automatic caching in production
- all template path based on the options.root

## Install
Install with npm
```sh
npm install koa2-dot --save
```

Then set add the middleware to koa2 app
```javascript
const views = require('koa2-dot');
app.use(views({
    root: path.resolve(__dirname, 'views'),
    extension: 'html',
    cacheable: true
}));
```
## Layout
You can specify the layout using [yaml](http://yaml.org/) and refer to the section as you would from a model.

You can also define any extra configurations (like a page title) that are inherited to the master.


base.layout.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>[[= layout.title ]]</title>
</head>
<body>
Hello from layout.base <br/>
[[= layout.section ]]
</body>
</html>
```

`index.layout.html`

```html
---
layout: layout.base
title: layout.index page
---

[[##section:
[[# include('header') ]]
Hello from layout.index <br/>
[[= layout.section ]]
##]]
```

`user.html`

```html
---
layout: layout.index
title: index page
---
<!-- This is a test -->
[[## section:
Hello from index<br/>
The user name is [[=model.username]]

[[# include('footer') ]]
##]]
```

`footer.html`
```html
<footer>
    ===============================<br/>
    This is a footer.
    ===============================
</footer>
```

#### Result

```javascript
ctx.render('user', {username: 'foo'});

```
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>index page</title>
</head>
<body>
<h1>Hello from layout.base</h1> <br/>
Hello from layout.index <br/>
Hello from index<br/>
The user name is foo

<footer>
    ===============================<br/>
    This is a footer.
    ===============================
</footer>
</body>
</html>
```
