<template>
	<input class="form-control"
		type="text"
		:value="value"
		:autocomplete="fieldOptions.autocomplete"
		:disabled="disabled"
		:placeholder="placeholder"
		:readonly="readonly"
		:name="inputName"
		:id="fieldID">
</template>

<script>
import abstractField from "../abstractField";

export default {
	name: "field-cleave",
	mixins: [abstractField],

	data() {
		return {
			cleave: null
		};
	},

	mounted() {
		this.$nextTick(function() {
			if (window.Cleave) {
				const opts = {
					// Credit Card
					creditCard: false,
					// onCreditCardTypeChanged: onCreditCardTypeChanged.bind(this),
					// Phone
					phone: false,
					phoneRegionCode: "AU",
					// Date
					date: false,
					datePattern: ["d", "m", "Y"],
					// Numerals
					numeral: false,
					numeralThousandsGroupStyle: "thousand",
					numeralDecimalScale: 2,
					numeralDecimalMark: ".",
					// General
					blocks: [],
					delimiter: " ",
					prefix: null,
					numericOnly: false,
					uppercase: false,
					lowercase: false,
					maxLength: 0,
					...this.fieldOptions,
				}
				this.cleave = new window.Cleave(this.$el, opts);

				if (this.cleave.properties && this.cleave.properties.hasOwnProperty("result")) {
					this.$watch("cleave.properties.result", () => {
						this.value = this.cleave.properties.result;
					});
				} else {
					this.$el.addEventListener("input", this.inputChange);
				}
			} else {
				console.warn(
					"Cleave is missing. Please download from https://github.com/nosir/cleave.js/ and load the script in the HTML head section!"
				);
			}
		});
	},

	methods: {
		inputChange() {
			this.value = this.$el.value;
		}
	},

	beforeDestroy() {
		if (this.cleave) {
			this.cleave.destroy();
			this.$el.removeEventListener("input", this.inputChange);
		}
	}
};
</script>
