<template>
	<input class="form-control"
		type="text"
		v-model="value"
		:autocomplete="fieldOptions.autocomplete"
		:disabled="disabled"
		:placeholder="placeholder"
		:readonly="readonly"
		:name="inputName"
		:id="fieldUID">
</template>

<script lang="ts">
/* global $ */
import abstractField from "../abstractField";

export default {
	name: "field-masked",
	mixins: [abstractField],

	mounted() {
		this.$nextTick(function() {
			const $ = (window as any)?.$;
			if ((window as any)?.$?.fn?.mask) {
				$(this.$el)
					.unmask()
					.mask(this.fieldOptions.mask, this.fieldOptions.maskOptions);
			} else {
				console.warn(
					"JQuery MaskedInput library is missing. Please download from https://github.com/digitalBush/jquery.maskedinput and load the script in the HTML head section!"
				);
			}
		});
	},

	beforeDestroy() {
		const $ = (window as any)?.$;

		if ((window as any)?.$?.fn?.mask) $(this.$el).unmask();
	}
};
</script>
