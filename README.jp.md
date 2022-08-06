[English](README.md)

# gottn
- Gottnは、ユーザーインターフェイスを構築するためのJavaScriptライブラリです。
- jQueryやnode.jsなどの他のライブラリは必要ありません。
- これだけがあれば動きます。
- とてもシンプルで覚える事は少ないです。

# インストール
```html
	<script type='text/javascript' src='js/gottn.min.js'></script>
```

# 使い方

## 目次
### [Step 1: 設計図からGottnオブジェクトを作る。](#step-1-設計図からgottnオブジェクトを作る-1)
### [Step 2: Gottnオブジェクトのメンバ](#step-2-gottnオブジェクトのメンバ-1)
### [Step 3: 再描画](#step-3-再描画-1)
### [Step 4: Gottnオブジェクトにメソッドを追加する。](#step-4-gottnオブジェクトにメソッドを追加する-1)
### [Step 5: イベント処理](#step-5-イベント処理-1)
### [Step 6: Gottnオブジェクトの入れ子](#step-6-gottnオブジェクトの入れ子-1)
### [Step 7: 描画後の処理](#step-7-描画後の処理-1)
### [Step 8: コールバック関数内などでGottnオブジェクトメンバにアクセスする。](#step-8-コールバック関数内などでgottnオブジェクトメンバにアクセスする-1)
<br />

## Step 1: 設計図からGottnオブジェクトを作る。
1. 設計図のメンバとして name, data, render を用意します。
   - name: 設計図およびGottnオブジェクトの名前
   - data: Gottnオブジェクト内で使用するデータの格納場所
   - render: 描画するhtmlを生成する処理
      - htmlテキストを返しますが、この時トップ階層のHTMLElementは１つにしてください。
         - 例:<br>
         〇 return `<div></div>`;<br>
         ✕ return `<div></div><div></div>`;
2. 設計図を元にGottnオブジェクトを作ります。
3. storeメソッドでdataメンバの値を更新します。
4. renderメソッドで描画します。
   - 引数に描画位置(html要素)を指定します。
### 例
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
#### 実行結果
```
Hello Gottn!
```

## Step 2: Gottnオブジェクトのメンバ
- プロパティ(読み取り専用)
   - name: オブジェクトの名前
   - id: nameを接頭辞にした識別子
   - data: Gottnオブジェクト内で使用するデータを格納場所
   - html: 描画したhtml(テキストデータ)
   - element: 描画したHTMLElement
- メソッド
   - store: dataメンバを値を更新
   - render: 設計図のrenderを実行してhtmlを生成
### 例
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
#### 実行結果
```
name Message
id Message-84d85839-0dc4-4df5-9cda-6a3a7e8a132c
data {
   message: 'Hello Gottn!'
}
html <div data-gottn-id="Message-84d85839-0dc4-4df5-9cda-6a3a7e8a132c">Hello Gottn!</div>
element (HTMLElement)
```

## Step 3: 再描画
- renderメソッドで再描画する時はHTMLElement引数は不要です。
- 引数なしで描画した場合は同じHTMLElementに再描画します。
- 最初の描画時にHTMLElementを指定しないとエラーになります。
### 例
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
#### 実行結果
```
Good-bye Gottn!
```

## Step 4: Gottnオブジェクトにメソッドを追加する。
- Gottnオブジェク にメソッドを追加する時はメソッド名の先頭に $ を付けます。
   - 例: $method
- アロー関数 は 非推奨 です。
   - メソッド内でthisでGottnオブジェクトのメンバ にアクセス出来ない為
### 例
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
#### 実行結果
```
Hello Gottn!
Hello Gottn!
Hello Gottn!
```

## Step 5: イベント処理
- Javascript の onイベント処理 と Gottnオブジェクトメソッド を紐づけます。
- HTMLElement に ${this.onXXX('メソッド名')} を追加します。
   - 例: `<div ${this.onclick('$test')}></div>`
   - onXXX は Javascript の onイベント名 を指定します。
      - 例: `this.onclick('$test1')`, `this.onchange('$test2')`, etc...
- メッソド には eventオブジェクト用引数 を１つ用意します。
   - 例: `$test: function (event) {...}`
### 例
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
#### 実行結果
```
repeat 2▼

Hello Gottn!
Hello Gottn!
```

## Step 6: Gottnオブジェクトの入れ子
- Gottnオブジェクト内に他のGottnオブジェクトを含めることが可能です。
- この時、renderメソッドで描画位置(HTMLElement)を指定する時に'here'を指定します。
   - 例: `gottnObject.render('here')`
- 再描画する時は、通常の再描画と同様に引数なしでrenderメソッドを実行します。
### 例
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
#### 実行結果
```
+------------------------------------------+
|Hello Gottn!                              |
+------------------------------------------+
```

## Step 7: 描画後の処理
- renderメソッドで描画後に何か処理を実行したい時は、その処理を関数化($function)して描画後に呼び出します。
### 例
[example7.html](examples/example7.html)
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
      this.element.style.color = this.data.color;
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
#### 実行結果
```
Hello Gottn!
```

## Step 8: コールバック関数内などでGottnオブジェクトメンバにアクセスする。
- Gottnオブジェクトにアクセスする時に this を使用しますが、コールバック関数などで this を使用する時は注意が必要です。
- 普通に無名関数内などで this にアクセスすると this は呼び出し元を指しているので、明示的に Gottnオブジェクト を指定する必要があります。
- 明示する方法は thisArg, bind(), call() などがあります。
   - これはJavascript標準機能なので詳しくはJavascriptの資料を参考にしてください。
### 例
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

# その他使用例
[example.html](examples/example.html)
