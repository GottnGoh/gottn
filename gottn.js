// Gottn version 1.0.0

let Gottn = function (blueprint) {
	const _DEBUG = false;
	
	if (!('name' in blueprint)) {
		throw new Error('"name" is not defined in "blueprint"');
	}
	if (!('render' in blueprint)) {
		throw new Error('"render" is not defined in "blueprint"');
	}
	if (typeof blueprint.render != 'function') {
		throw new Error('"render" is not a function in "blueprint"');
	}
	if ('rendered' in blueprint) {
		if (typeof blueprint.rendered != 'function') {
			throw new Error('"rendered" is not a function in "blueprint"');
		}
	}

	let id         = _uuid4();
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

	function _overwrite_hash (base, overwrite) {
		if (!is_empty(overwrite)) {
			for (var key in base) {
				if (key in overwrite) {
					base[key] = overwrite[key];
				}
			}
		}
	
		return base;
	}

	function store (new_data) {
		_overwrite_hash(data, new_data);
		if (_DEBUG) console.log(id, blueprint.name + '.store', data);
		return this;
	}

	function render (element) {
		child_list = [];

		// blueprint.render
		html = blueprint.render.call(this);
		html = html.trim().replace(/^(<[a-zA-Z]+)/, `$1 data-gottn-id="${id}" data-gottn-name="${blueprint.name}"`);

		// replace html
		if (is_empty(element)) {
			element = document.querySelector(`[data-gottn-id="${id}"]`);
		}
		element.outerHTML = html;
		element = document.querySelector(`[data-gottn-id="${id}"][data-gottn-name="${blueprint.name}"]`);

		// assign GlobalEventHander
		let element_list = document.querySelectorAll(`[data-gottn-id="${id}"][data-gottn-action]`);
		if (element_list) {
			for (let index = 0; index < element_list.length; index++) {
				let on_name_action_key = element_list[index].getAttribute(`data-gottn-action`).split(',', 2);
				let on_name            = on_name_action_key[0];
				let action_key         = on_name_action_key[1];

				element_list[index][on_name] = blueprint.actions[action_key].bind(this);
			}
		}

		// child elements
		child_list.forEach( function (child) {
			if (typeof child.render == 'function') {
				child.render(document.querySelector(`[data-gottn-id="${child.id}"][data-gottn-name="${child.name}"]`));
			}
		});

		// post-processing
		if (typeof this.rendered == 'function') {
			this.rendered();
		}

		return this;
	}

	function children (child) {
		if (_DEBUG) console.log(id, blueprint.name + '.children', child);
		child_list.push(child);
		return `<template data-gottn-id="${child.id}" data-gottn-name="${child.name}"></template>`;
	}

	function _element () {
		return document.querySelector(`[data-gottn-id="${id}"][data-gottn-name="${blueprint.name}"]`);
	}

	let gottn = {
		get id       () { return id;   },
		get name     () { return blueprint.name; },
		get data     () { return data; },
		get html     () { return html; },
		get rendered () { return blueprint.rendered; },
		get actions  () { return blueprint.actions;  },
		get element  () { return _element(); },
		store   : store,
		render  : render,
		children: children
	};
	
	// prepare to assign GlobalEventHander
	on_name_list.forEach(function (on_name) {
		gottn[on_name] = function (action_key) {
			return `data-gottn-id="${id}" data-gottn-action="${on_name},${action_key}"`;
		};
	});

	return gottn;
};