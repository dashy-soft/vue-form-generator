export default (object, path, value) => {
	const keys = Array.isArray(path) ? path : path.split('.');
	let current = object;
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (i === keys.length - 1) {
			current[key] = value;
		} else {
			if (!current[key] || typeof current[key] !== 'object') {
				current[key] = {};
			}
			current = current[key];
		}
	}
}
