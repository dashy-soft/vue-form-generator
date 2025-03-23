export default (value: any) => {
	return typeof value === 'number' && !isNaN(value);
}
