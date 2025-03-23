import Emitter from 'pico-emitter';

class CustomEmitter {
	emitter: Emitter;
	constructor() {
		this.emitter = new Emitter();
	}

	$on(...args: any[]) {
		this.emitter.on(...args);
	}

	$once(...args: any[]) {
		this.emitter.once(...args);
	}

	$off(...args: any[]) {
		this.emitter.off(...args);
	}

	$emit(...args: any[]) {
		this.emitter.emit(...args);
	}
}

export default CustomEmitter;
