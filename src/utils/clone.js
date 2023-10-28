export default (value) {
	if (value === null || typeof value !== 'object') {
		return value;
	}

	if (Array.isArray(value)) {
		return value.slice();
	}

	if (typeof value === 'object') {
		const clonedObject = Object.create(Object.getPrototypeOf(value));

		for (const key in value) {
			if (value.hasOwnProperty(key)) {
				clonedObject[key] = clone(value[key]);
			}
		}

		return clonedObject;
	}
};
