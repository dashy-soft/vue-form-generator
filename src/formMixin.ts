
export default {
	methods: {
		getStyleClasses(field: Record<string, any>, baseClasses: Record<string, any>) {
			let styleClasses = field.styleClasses;

			if (Array.isArray(styleClasses)) {
				styleClasses.forEach((c: string) => {
					baseClasses[c] = true;
				});
			} else if (typeof styleClasses === 'string' && styleClasses !== '') {
				baseClasses[styleClasses] = true;
			}
			return baseClasses;
		}
	}
};
