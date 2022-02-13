// Gottn version 1.2.0

let Gottn = function (blueprint) {
	const _DEBUG = false;
	
	if ('render' in blueprint) {
		if (typeof blueprint.render != 'function') {
			throw new Error('"render" is not a function in "blueprint"');
		}
	}
	if ('rendered' in blueprint) {
		if (typeof blueprint.rendered != 'function') {
			throw new Error('"rendered" is not a function in "blueprint"');
		}
	}

	let id         = (blueprint.name ? blueprint.name + '-' : '') + _uuid4();
	let data       = 'data' in blueprint ? Object.create(blueprint.data) : {};
	let html       = '';
	let child_list = [];

	// get GlobalEventHandler's names
	let on_name_list = [];
	for (key in document.createElement('div')) {
		if (key.match(/^on/)) {
			on_name_list.push(key);
		}
	}
	// console.log(on_name_list);

	function _uuid4 () {
		var uuid4 = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
	
		for (var index = 0, length = uuid4.length; index < length; index++) {
			switch (uuid4[index]) {
				case "x":
					uuid4[index] = Math.floor(Math.random() * 16).toString(16);
					break;
				case "y":
					uuid4[index] = (Math.floor(Math.random() * 4) + 8).toString(16);
					break;
			}
		}
	
		return uuid4.join("");
	}

	function store (new_data) {
		if (new_data) {
			for (var key in data) {
				if (key in new_data) {
					data[key] = new_data[key];
				}
			}
		}
		if (_DEBUG) console.log(id, blueprint.name + '.store', data);
		return this;
	}

	function render (element) {
		child_list = [];

		// blueprint.render
		html = blueprint.render.call(this);
		html = html.trim().replace(/^(<[a-zA-Z]+)/, `$1 data-gottn-id="${id}"`);

		// replace html
		if (!element) {
			element = document.querySelector(`[data-gottn-id="${id}"]`);
			if (!element) {
				throw new Error('No element: Check the arguments of render.');
			}
		}
		element.outerHTML = html;
		element = document.querySelector(`[data-gottn-id="${id}"]`);

		// assign GlobalEventHander
		let element_list = Array.from(element.querySelectorAll(`[data-gottn-event]`));
		if (element.getAttribute('data-gottn-event')) {
			element_list.push(element);
		}
		element_list.forEach(event_element => {
			let [on_name, function_name] = event_element.getAttribute(`data-gottn-event`).split(' ', 2);
			if (!blueprint.functions[function_name]) {
				throw new Error(`"${function_name}" is not defined in "blueprint.functions"`);
			}
			event_element[on_name] = blueprint.functions[function_name].bind(this);
		});

		// child elements
		child_list.forEach( function (child) {
			if (typeof child.render == 'function') {
				child.render(document.querySelector(`[data-gottn-id="${child.id}"]`));
			}
		});

		// post-processing
		if (typeof this.rendered == 'function') {
			this.rendered();
		}

		return this;
	}

	function embed (child) {
		if (_DEBUG) console.log(id, blueprint.name + '.children', child);
		child_list.push(child);
		return `<template data-gottn-id="${child.id}"></template>`;
	}

	function _element () {
		return document.querySelector(`[data-gottn-id="${id}"]`);
	}

	let gottn = {
		get id       () { return id;   },
		get name     () { return blueprint.name; },
		get data     () { return data; },
		get html     () { return html; },
		get rendered () { return blueprint.rendered; },
		get element  () { return _element(); },
		store : store,
		render: render,
		embed : embed,
		functions: {},
		get fs () { return this.functions; }
	};

	// bind 'this'(Gottn object) to function
	for (let function_name in blueprint.functions) {
		gottn.functions[function_name] = blueprint.functions[function_name].bind(gottn);
	};
	
	// prepare to assign GlobalEventHander
	on_name_list.forEach(function (on_name) {
		gottn[on_name] = function (function_name) {
			return `data-gottn-event="${on_name} ${function_name}"`;
		};
	});

	return gottn;
};