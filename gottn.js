// Gottn version 1.6.1

let Gottn = function (blueprint) {
	const _DEBUG = false;

	if (typeof blueprint != 'object' || blueprint == null) {
		throw new Error('TypeError: Gottn argument type is wrong.');
	}

	if ('name' in blueprint) {
		if (typeof blueprint.name != 'string') {
			throw new Error('TypeError: The type of member name of blueprint is not a string.');
		}
	} else {
		blueprint.name = '';
	}
	if ('data' in blueprint) {
		if (typeof blueprint.data != 'object') {
			throw new Error('TypeError: The type of member data of blueprint is not an object.');
		}
	} else {
		blueprint.data = {};
	}
	if ('contractor' in blueprint) {
		if (typeof blueprint.contractor != 'function') {
			throw new Error('TypeError: The type of member contractor of blueprint is not a function.');
		}
	} else {
		blueprint.contractor = function () {};
	}
	if ('render' in blueprint) {
		if (typeof blueprint.render != 'function') {
			throw new Error('TypeError: The type of member render of blueprint is not a function.');
		}
	} else {
		blueprint.render = function () { return '<span></span>'; };
	}
	if ('rendered' in blueprint) {
		if (typeof blueprint.rendered != 'function') {
			throw new Error('TypeError: The type of member rendered of blueprint is not a function.');
		}
	} else {
		blueprint.rendered = function () {};
	}

	let id   = (blueprint.name ? blueprint.name + '-' : '') + _uuid4();
	let data = { ...blueprint.data };
	let html = '';

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
		// blueprint.render
		html = blueprint.render.call(this);
		html = html.trim().replace(/^(<[a-zA-Z]+)/, `$1 data-gottn-id="${id}"`);

		// replace html
		let is_embedded = false;
		if (element === null) {
			throw new Error('TypeError: Cannot read an element.');
		} else if (typeof element == 'string' && element.toLowerCase() === 'here') {
			// Create the entity of the embedded element.
			is_embedded       = true;
			element           = document.createElement('template');
			element.innerHTML = html;
			document.body.insertBefore(element, document.body.firstElementChild);
			element           = elementSelector(`[data-gottn-id="${id}"]`);
		} else {
			// If no element is specified, render at the same place.
			if (!element) {
				element = document.querySelector(`[data-gottn-id="${id}"]`);
				if (!element) {
					throw new Error('No element: Check the arguments of render.');
				}
			}

			element.outerHTML = html;
			element           = document.querySelector(`[data-gottn-id="${id}"]`);
		}

		// assign GlobalEventHander
		let event_element_list = Array.from(element.querySelectorAll(`[data-gottn-event]`));
		if (element.getAttribute('data-gottn-event')) {
			event_element_list.push(element);
		}
		event_element_list.forEach(event_element => {
			let [gottn_id, on_name, function_name] = event_element.getAttribute(`data-gottn-event`).split(' ', 3);

			if (gottn_id == id) {
				if (!blueprint[function_name]) {
					throw new Error(`"${function_name}" is not defined in "${blueprint.name || 'blueprint'}"`);
				}
				event_element[on_name] = blueprint[function_name].bind(this);
			}
		});

		// post-processing
		this.rendered();

		// Return the location of the embedded element.
		if (is_embedded) {
			return `<template data-location-element-gottn-id="${id}"></template>`;
		}

		// Move the entity of the embedded element to the location of the embedded element.
		while (true) {
			let location_element_list = Array.from(element.querySelectorAll(`[data-location-element-gottn-id]`));
			if (location_element_list.length == 0) {
				break;
			}
			location_element_list.forEach(location_element => {
				let location_gottn_id = location_element.getAttribute(`data-location-element-gottn-id`);
				let entity_template   = templateSelector(`[data-gottn-id="${location_gottn_id}"]`);
				location_element.parentNode.replaceChild(entity_template.content.firstElementChild, location_element);
				entity_template.remove();
			});
		}
		
		return this;
	}

	function element () {
		return elementSelector(`[data-gottn-id="${id}"]`);
	}

	function elementSelector (query) {
		let element = document.querySelector(query);

		if (!element) {
			template = templateSelector(query);
			if ('content' in template) {
				element = template.content.firstElementChild;
			}
		}

		return element;
	}

	function templateSelector (query) {
		return Array.from(document.querySelectorAll(`template`)).find(
			documentFragment => documentFragment.content.querySelector(query)
		);
	}

	let gottn = {
		get id       () { return id;   },
		get name     () { return blueprint.name; },
		get data     () { return data; },
		get html     () { return html; },
		get rendered () { return blueprint.rendered; },
		get element  () { return element(); },
		store : store,
		render: render
	};

	// add $function to 'this'(Gottn object)
	// bind 'this'(Gottn object) to function
	for (let function_name in blueprint) {
		if (!function_name.match(/^\$.*/)) {
			continue;
		}
		if (typeof blueprint[function_name] == 'function') {
			gottn[function_name] = blueprint[function_name].bind(gottn);
		// } else {
		// 	gottn[function_name] = blueprint[function_name];
		}
	};
	
	// prepare to assign GlobalEventHander
	on_name_list.forEach(function (on_name) {
		gottn[on_name] = function (function_name) {
			return `data-gottn-event="${gottn.id} ${on_name} ${function_name}"`;
		};
	});

	// contractor
	blueprint.contractor.call(gottn);

	return gottn;
};