
export default {
	methods: {
		getStyleClasses(field, baseClasses) {
			let styleClasses = field.styleClasses;

			if (Array.isArray(styleClasses)) {
				styleClasses.forEach((c) => {
					baseClasses[c] = true;
				});
			} else if (typeof styleClasses === 'string' && styleClasses !== '') {
				baseClasses[styleClasses] = true;
			}
			return baseClasses;
		}
	}
};
