import fecha from "fecha";
let inputFormat = "YYYY-MM-DD HH:mm:ss";

export default {
	getDefaultInputFormat() {
		return inputFormat;
	},
	getDateFormat() {
		if (typeof this.fieldOptions.format !== "undefined") {
			return this.fieldOptions.format;
		} else {
			return this.getDefaultInputFormat();
		}
	},
	formatValueToField(value: any) {
		if (value != null) {
			let dt: Date | null;
			if (typeof this.fieldOptions.format !== "undefined") {
				dt = fecha.parse(value, this.fieldOptions.format);
			} else {
				dt = new Date(value);
			}
			if(dt === null) return;

			return fecha.format(dt, this.getDateFormat());
		}

		return value;
	},

	formatValueToModel(value: any) {
		if (value != null) {
			let m = fecha.parse(value, this.getDateFormat());

			if(m === null) return;

			if (typeof this.fieldOptions.format !== "undefined") {
				value = fecha.format(m, this.fieldOptions.format);
			} else {
				value = m.valueOf();
			}
		}

		return value;
	}
} as Record<string, any>;
