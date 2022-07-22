<template>
	<div class="radio-list"
		:disabled="disabled"
		v-attributes="'wrapper'">
		<label v-for="item in items"
			:key="getItemValue(item)"
			:class="{'is-checked': isItemChecked(item)}"
			v-attributes="'label'">
			<input :id="fieldID"
				type="radio"
				:disabled="disabled"
				:name="id"
				@click="onSelection(item)"
				:value="getItemValue(item)"
				:checked="isItemChecked(item)"
				:class="fieldClasses"
				:required="required"
				v-attributes="'input'">{{ getItemName(item) }}
		</label>
	</div>

</template>

<script>
import abstractField from "../abstractField";

export default {
	name: "field-radios",
	mixins: [abstractField],

	computed: {
		items() {
			let values = this.schema.values;
			if (typeof values == "function") {
				return values.apply(this, [this.model, this.schema]);
			} else {
				return values;
			}
		},
		id() {
			return this.schema.model;
		}
	},

	methods: {
		getItemValue(item) {
			if (item instanceof Object) {
				if (typeof this.schema["value"] !== "undefined") {
					return item[this.schema.value];
				} else {
					if (typeof item["value"] !== "undefined") {
						return item.value;
					} else {
						throw "`value` is not defined. If you want to use another key name, add a `value` property under `schema` in the schema. https://icebob.gitbooks.io/vueformgenerator/content/fields/radios.html#radios-field-with-object-values";
					}
				}
			} else {
				return item;
			}
		},
		getItemName(item) {
			if (item instanceof Object) {
				if (typeof this.schema["name"] !== "undefined") {
					return item[this.schema.name];
				} else {
					if (typeof item["name"] !== "undefined") {
						return item.name;
					} else {
						throw "`name` is not defined. If you want to use another key name, add a `name` property under `schema` in the schema. https://icebob.gitbooks.io/vueformgenerator/content/fields/radios.html#radios-field-with-object-values";
					}
				}
			} else {
				return item;
			}
		},
		onSelection(item) {
			this.value = this.getItemValue(item);
		},
		isItemChecked(item) {
			let currentValue = this.getItemValue(item);
			return currentValue === this.value;
		},
	}
};
</script>

<style scoped>
label {
	display: block;
}
input[type="radio"] {
	margin-right: 5px;
}
</style>
