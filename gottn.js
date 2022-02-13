// Gottn version 1.1.1

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
		let element_list = Array.from(element.querySelectorAll(`[data-gottn-action]`));
		if (element.getAttribute('data-gottn-action')) {
			element_list.push(element);
		}
		element_list.forEach(action_element => {
			let [on_name, action_key] = action_element.getAttribute(`data-gottn-action`).split(' ', 2);
			if (!blueprint.actions[action_key]) {
				throw new Error(`"${action_key}" is not defined in "blueprint.actions"`);
			}
			action_element[on_name] = blueprint.actions[action_key].bind(this);
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
		get actions  () { return blueprint.actions;  },
		get element  () { return _element(); },
		store : store,
		render: render,
		embed : embed
	};
	
	// prepare to assign GlobalEventHander
	on_name_list.forEach(function (on_name) {
		gottn[on_name] = function (action_key) {
			return `data-gottn-action="${on_name} ${action_key}"`;
		};
	});

	return gottn;
};