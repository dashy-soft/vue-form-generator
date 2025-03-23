<template>
	<input type="text"
		:autocomplete="fieldOptions.autocomplete"
		:data-disable="disabled"
		:data-max="fieldOptions.max"
		:data-min="fieldOptions.min"
		:data-step="fieldOptions.step"
		:placeholder="placeholder"
		:readonly="readonly"

		:name="inputName">
</template>

<script lang="ts">
/* global $ */
import abstractField from "../abstractField";

export default {
	name: "field-rangeSlider",
	mixins: [abstractField],

	data() {
		return {
			slider: null
		};
	},

	watch: {
		model: function() {
			if ((window as any).$ && (window as any).$.fn.ionRangeSlider) {
				let valueFrom, valueTo;
				if (Array.isArray(this.value)) {
					[valueFrom, valueTo] = this.value;
				} else valueFrom = this.value;

				if (this.slider) {
					this.slider.update({
						from: valueFrom,
						to: valueTo
					});
				}
			}
		}
	},

	mounted() {
		this.$nextTick(function() {
			if ((window as any).$ && (window as any).$.fn.ionRangeSlider) {
				const $ = (window as any).$;
				let valueFrom: any, valueTo: any;
				if (Array.isArray(this.value)) {
					[valueFrom, valueTo] = this.value;
				} else valueFrom = this.value;

				let self = this;
				const opts = {
					type: "single",
					grid: true,
					hide_min_max: true,
					from: valueFrom,
					to: valueTo,
					onChange(slider: any) {
						if (self.slider.options.type === "double") {
							self.value = [slider.from, slider.to];
						} else {
							self.value = slider.from;
						}
					},
					...this.fieldOptions,
				};
				$(this.$el).ionRangeSlider(opts);
				this.slider = $(this.$el).data("ionRangeSlider");
			} else {
				console.warn(
					"ion.rangeSlider library is missing. Please download from https://github.com/IonDen/ion.rangeSlider and load the script and CSS in the HTML head section!"
				);
			}
		});
	},

	beforeDestroy() {
		if (this.slider) this.slider.destroy();
	}
};
</script>


<style>
.vue-form-generator .field-rangeSlider .irs {
	width: 100%;
}
</style>
