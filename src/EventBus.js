import { EventEmitter } from 'tiny-emitter'

class CustomEmitter {
	constructor() {
		this.emitter = new EventEmitter();
	}

	$on(...args) {
		this.emitter.on(...args);
	}

	$once(...args) {
		this.emitter.once(...args);
	}

	$off(...args) {
		this.emitter.off(...args);
	}

	$emit(...args) {
		this.emitter.emit(...args);
	}
}

export default CustomEmitter;
