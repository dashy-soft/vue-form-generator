<template>
	<div class="slider"
		:disabled="disabled"
		:class="{ 'contain-pips': containPips, 'contain-tooltip': containTooltip }"></div>
</template>

<script lang="ts">
import abstractField from "../abstractField";

export default {
	name: "field-noUiSlider",
	mixins: [abstractField],

	data() {
		return {
			slider: null
		};
	},

	watch: {
		model: function() {
			if ((window as any).noUiSlider && this.slider && this.slider.noUiSlider) {
				this.slider.noUiSlider.set(this.value);
			}
		}
	},

	computed: {
		containPips() {
			return typeof this.fieldOptions.pips !== "undefined";
		},
		containTooltip() {
			return typeof this.fieldOptions.tooltips !== "undefined";
		}
	},

	methods: {
		onChange(value: any) {
			if (Array.isArray(value)) {
				// Array (range)
				this.value = [parseFloat(value[0]), parseFloat(value[1])];
			} else {
				// Single value
				this.value = parseFloat(value);
			}
		},
		formatValueToField(value: any) {
			if (this.slider !== null && typeof this.slider.noUiSlider !== "undefined") {
				this.slider.noUiSlider.set(value);
			}
		},
		formatValueToModel(val: any) {
			if (typeof this.slider.noUiSlider !== "undefined") {
				if (val instanceof Array) {
					return [Number(val[0]), Number(val[1])];
				} else {
					return Number(val);
				}
			}
		},
		getStartValue() {
			if (this.value != null) {
				return this.value;
			} else {
				if (typeof this.fieldOptions.double !== "undefined") {
					return [this.fieldOptions.min, this.fieldOptions.min];
				} else {
					return this.fieldOptions.min;
				}
			}
		}
	},

	mounted() {
		this.$nextTick(() => {
			if ((window as any).noUiSlider) {
				this.slider = this.$el;
				const opts = {
					start: this.getStartValue(),
					range: {
						min: this.fieldOptions.min,
						max: this.fieldOptions.max
					},
					...this.fieldOptions,
				};
				(window as any).noUiSlider.create(this.slider, opts);
				this.slider.noUiSlider.on("change", this.onChange.bind(this));
			} else {
				console.warn(
					"noUiSlider is missing. Please download from https://github.com/leongersen/noUiSlider and load the script and CSS in the HTML head section!"
				);
			}
		});
	},

	beforeDestroy() {
		if (this.slider) this.slider.noUiSlider.off("change");
	}
};
</script>

<style scoped>
.field-wrap {
	display: block;
}
.contain-pips {
	margin-bottom: 30px;
}
.contain-tooltip {
	margin-top: 30px;
}
.noUi-vertical {
	height: 200px;
	margin: 10px 0;
}
</style>
