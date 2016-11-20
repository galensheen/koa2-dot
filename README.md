# koa2-dot
![Galen Sheen](https://s.gravatar.com/avatar/d222ab15345dce06133c960db6489a71?size=200&default=retro)
> [**doT**](http://olado.github.io/doT/) for koa2 with support layouts, include function. It's friendly for front-end web libraries (Angular, Ember, Vue.js, React ...)
> [**example**](https://github.com/galensheen/koa2-dot/tree/master/example)

## Important
The default settings of doT has been change to use `[[]]` instead of `{{}}`. This to support client side templates (Angular, Ember, Vue ...)

* all the advantage of [**doT**](http://olado.github.io/doT/)
* layout and include support
* uses `[[ ]]` by default, not clashing with `{{ }}` (Angular, Ember...)
* custom helpers to your views
* conditional, array iterators, custom delimiters...
* render, renderString, getHtmlByFile, getHtmlByString support
* all template path based on the options.root

## Install
Install with npm

```sh
npm install koa2-dot --save
```

Then set add the middleware to koa2 app

```javascript
import * as doT from 'koa2-dot';

doT.helper.dateFormat = function (dateString) {
    let time = new Date(dateString);
    if (time === 'Invalid Date') {
        return time;
    }
    return `${time.getFullYear()}年${time.getMonth()}月${time.getDate()}日 ${time.getHours()}时${time.getMinutes()}分${time.getSeconds()}秒`;
};

app.use(doT.views({
    root: path.resolve(__dirname, 'views'),
    extension: 'server.html',
    cacheable: true
}));
```
## Layout
You can specify the layout using [**yaml**](http://yaml.org/) and refer to the section as you would from a model.

You can also define any extra configurations (like a page title) that are inherited to the master.

`views/layout/base.server.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>[[= layout.title ]]</title>
</head>
<body>
    <h1>From base.server.html</h1>
    <div>
        [[= layout.body ]]
    </div>
    [[# include('partials/footer') ]]
</body>
</html>
```

`views/layout/dot.server.html`

```html
---
layout: layout/base
title: The dot layout
---

[[## body:
    <h2>From the dot.server.html</h2>
    [[= layout.content ]]
##]]
```

`views/partials/footer.html`

```html
<footer>
    <div>This is footer.</div>
</footer>
```

`views/dot/index.server.html`

```html
---
layout: layout/dot
title: The example for koa2-dot
---

[[## content:
    <h3>From index.server.html</h3>
    <ul>
        <li>The engine of model: [[= model.engine]]</li>
        <li>The pkg of model: [[= model.pkg]]</li>
        <li>The name of app: [[= app.name]]</li>
        <li>The desc of app: [[= app.desc]]</li>
    </ul>
    <div>The dateFormat: [[# def.dateFormat(Date.now())]]</div>
##]]
```
#### Result

```html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>The example for koa2-dot</title>
</head>
<body>
    <h1>From base.server.html</h1>
    <div>
    	<h2>From the dot.server.html</h2>
    	<h3>From index.server.html</h3>
    	<ul>
       	<li>The engine of model: doT</li>
       	<li>The pkg of model: koa2-dot</li>
       	<li>The name of app: koa2-dot example</li>
       	<li>The desc of app: a example for koa2-dot</li>
    	</ul>
    	<div>The dateFormat: 2016年10月20日 16时55分18秒</div>
    </div>
    <footer>
    	<div>This is footer.</div>
	</footer>
</body>
</html>
```

## advance
> You can extend the render function to add app info automatically. You can refer to the [**example**](https://github.com/galensheen/koa2-dot/tree/master/example)

```javascript
app.use(async (ctx, next) => {
	const render = ctx.render;
	ctx.render = function (file, model = {}) {
		let app = ctx.app || {}; // custome by yourself
		return render.apply(ctx, [file, model, app]);
	};
	await next();
})
```
