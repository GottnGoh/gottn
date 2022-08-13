[日本語](README.jp.md)

# gottn

- Gottn is a JavaScript library for building user interfaces.
- No need for other libraries such as jQuery or node.js.
- It works if you only this one.
- It is very simple and there is not much to learn.

# Installation

```html
	<script type='text/javascript' src='js/gottn.min.js'></script>
```

# Usage

## Contents
### [Step 1: Create a Gottn object from a blueprint](#step-1-create-a-gottn-object-from-a-blueprint-1)
### [Step 2: Members of the Gottn object](#step-2-members-of-the-gottn-object-1)
### [Step 3: re-render](#step-3-re-render-1)
### [Step 4: Add a method to the Gottn object](#step-4-add-a-method-to-the-gottn-object-1)
### [Step 5: event processing](#step-5-event-processing-1)
### [Step 6: Nesting of Gottn objects](#step-6-nesting-of-gottn-objects-1)
### [Step 7: Post-render processing](#step-7-post-render-processing-1)
### [Step 8: Access Gottn members in callback functions](#step-8-access-gottn-members-in-callback-functions-1)
<br />

## Step 1: Create a Gottn object from a blueprint
1. Prepare name, data, and render as members of the blueprint.
   - name: Names of blueprints and Gottn objects
   - data: Storage area for data used in Gottn objects
   - render: Process to generate html for rendering
      - Returns html text, but at this time there should be only one HTMLElement at the top level.
         - Example:<br>
         〇 return `<div></div>`;<br>
         ✕ return `<div></div><div></div>`;
2. Create a Gottn object based on the blueprint.
3. The store method updates the value of the data member.
4. Render with the render method.
   - Specify the rendering position (html element) as an argument.
### Example
[example1.html](examples/example1.html)
```javascript
let Message = {
   name: 'Message',
   data: {
      message: '',
   },
   render: function () {
      return `<div>${this.data.message}</div>`;
   }
}

let message = Gottn(Message);

message
   .store({ message: 'Hello Gottn!' })
   .render(document.getElementById('message'));
```
#### Result
```
Hello Gottn!
```

## Step 2: Members of the Gottn object
- Properties (read-only)
   - name: Name of the object
   - id: identifier prefixed with name
   - data: Area of the data used in the Gottn object
   - html: The rendered html (text data)
   - element: The rendered HTMLElement
- Methods
   - store: Update the value of the data member
   - render: Execute render on the blueprint to generate html
### Example
[example2.html](examples/example2.html)
```javascript
let message = Gottn({
   name: 'Message',
   data: {
      message: '',
   },
   render: function () {
      return `<div>${this.data.message}</div>`;
   }
});

message
   .store({ message: 'Hello Gottn!' })
   .render(document.getElementById('message'));

console.log('name', message.name);
console.log('id', message.id);
console.log('data', message.data);
console.log('html', message.html);
console.log('element', message.element);
```
#### Result
```
name Message
id Message-84d85839-0dc4-4df5-9cda-6a3a7e8a132c
html <div data-gottn-id="Message-84d85839-0dc4-4df5-9cda-6a3a7e8a132c">Hello Gottn!</div>
data {
   message: 'Hello Gottn!'
}
element (HTMLElement)
```

## Step 3: re-render
- When re-rendering with the render method, the HTMLElement argument is not required.
- If the render method is used without an HTMLElement argument, the same HTMLElement will be re-rendered.
- An error will result if the HTMLElement is not specified the first time it is rendered.
### Example
[example3.html](examples/example3.html)
```javascript
let Message = {
   name: 'Message',
   data: {
      message: '',
   },
   render: function () {
      return `<div>${this.data.message}</div>`;
   }
}

let message = Gottn(Message);

message
   .store({ message: 'Hello Gottn!' })
   .render(document.getElementById('message'));

message
   .store({ message: 'Good-bye Gottn!' })
   .render();
```
#### Result
```
Good-bye Gottn!
```

## Step 4: Add a method to the Gottn object
- When adding a method to a Gottn object, prefix the method name with $.
   - Example: $method
- Arrow functions are deprecated.
   - Because you cannot access Gottn object members with "this" in the method.
### Example
[example4.html](examples/example4.html)
```javascript
let message = Gottn({
   name: 'Message',
   data: {
      message: '',
      repeat : 0
   },
   render: function () {
      return `<div>${this.$repeat(this.data.repeat)}</div>`;
   },
   $repeat: function (repeat) {
      let result = '';
      for (let i=0; i < repeat; i++) {
         result += `<div>${this.data.message}</div>`;
      }
      return result;
   }
});

message
   .store({
      message: 'Hello Gottn!',
      repeat : 3
   })
   .render(document.getElementById('message'));
```
#### Result
```
Hello Gottn!
Hello Gottn!
Hello Gottn!
```

## Step 5: event processing
- Connect Javascript on-event handling to Gottn object methods.
- Add ${this.onXXX('method name')} to the HTMLElement.
	- Example: `<div ${this.onclick('$test')}></div>`
	- onXXX specifies the Javascript on-event name.
		- Examples: `this.onclick('$test1')`, `this.onchange('$test2')`, etc...
- Prepare one argument for the event object in the method.
	- Example: `$test: function (event) {...} `
### Example
[example5.html](examples/example5.html)
```javascript
let message = Gottn({
   name: 'Message',
   data: {
      message: '',
      repeat : 0
   },
   render: function () {
      return `<div>${this.$repeat(this.data.repeat)}</div>`;
   },
   $repeat: function (repeat) {
      let result = '';
      for (let i=0; i < repeat; i++) {
         result += `<div>${this.data.message}</div>`;
      }
      return result;
   }
});

message
   .store({
      message: 'Hello Gottn!',
      repeat : 1
   })
   .render(document.getElementById('message'));

let form = Gottn({
   name: 'Form',
   render: function () {
      return `
         <form>
            <div>
               <label>repeat</label>
               <select ${this.onchange('$changeRepeat')}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
               </select>
            </div>
         </form>`;
   },
   $changeRepeat: function (event) {
      message.store({
         repeat: event.currentTarget.value
      }).render();
   }
}).render(document.getElementById('form'));
```
#### Result
```
repeat 2▼

Hello Gottn!
Hello Gottn!
```

## Step 6: Nesting of Gottn objects
- It is possible to include other Gottn objects within a Gottn object.
- In this case, specify 'here' when specifying the rendering position (HTMLElement) in the render method.
   - Example: `gottnObject.render('here')`
- When re-rendering, the render method is executed with no arguments as in normal re-rendering.
### Example
[example6.html](examples/example6.html)
```javascript
let Message = {
   name: 'Message',
   data: {
      message: ''
   },
   render: function () {
      return `<div>${this.data.message}</div>`;
   }
};

let frame = Gottn({
   name: 'Frame',
   data: {
      message: Gottn(Message)
   },
   render: function () {
      this.data.message
         .store({
            message: 'Hello Gottn!'
         });
      return `<div style="border: 1px black solid;">${this.data.message.render('here')}</div>`;
   }
}).render(document.getElementById('frame'));
```
#### Result
```
+------------------------------------------+
|Hello Gottn!                              |
+------------------------------------------+
```

## Step 7: Post-render processing
- If you want to perform some processing after drawing with the render method, either make the processing into a function ($function) and call it after drawing, or prepare a function ($function) that summarizes the series of processing.
### Example
[example7-1.html](examples/example7-1.html)
```javascript
let message = Gottn({
   name: 'Message',
   data: {
      message: '',
      color  : ''
   },
   render: function () {
      return `<div>${this.data.message}</div>`;
   },
   $rendered: function () {
      this.element.style.textTransform = 'uppercase';
      return this;
   }
});

message
   .store({
      message: 'Hello Gottn!',
      color  : 'red'
   })
   .render(document.getElementById('message'))
   .$rendered();
```
#### Result
```
HELLO GOTTN!
```
[example7-2.html](examples/example7-2.html)
```javascript
let message = Gottn({
   name: 'Message',
   data: {
      message: '',
      color  : ''
   },
   render: function () {
      return `<div>${this.data.message}</div>`;
   },
   $render: function (element) {
      this.render(element);
      this.element.style.textTransform = 'uppercase';
      return this;
   }
});

message
   .store({
      message: 'Hello Gottn!',
      color  : 'red'
   })
   .$render(document.getElementById('message'));
```
#### Result
```
HELLO GOTTN!
```

## Step 8: Access Gottn members in callback functions
- "this" is used to access Gottn objects, but care must be taken when using "this" in callback functions.
- When "this" is accessed in an anonymous function, "this" refers to the caller, so it is necessary to explicitly specify the Gottn object.
- There are several ways to explicitly specify "this", such as thisArg, bind(), and call().
   - "this" is a standard Javascript function, so please refer to the Javascript documentation for details.
### Example
```javascript
// thisArg
[1,2,3].forEach(function(){
   this.data;
}, this);

// bind()
let test = (function () {
   this.data;
}).bind(this);
test();

// call()
let test = function () {
   this.data;
};
test.call(this);
```

# Other Uses
[example.html](examples/example.html)
