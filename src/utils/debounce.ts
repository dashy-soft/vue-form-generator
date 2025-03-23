export default (func: Function, wait: number) => {
	let timeout: number | undefined;
	return function (...args: any[]) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
};
