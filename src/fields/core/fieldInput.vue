<template>
	<div class="wrapper"
		v-attributes="'wrapper'">
		<input class="form-control"
			:id="fieldUID"
			:type="inputType"
			:value="value"
			@input="onInput"
			@blur="onBlur"
			:class="fieldClasses"
			@change="schema.onChange || null"
			:disabled="disabled"
			:accept="schema.accept"
			:alt="schema.alt"
			:autocomplete="schema.autocomplete"
			:checked="schema.checked"
			:dirname="schema.dirname"
			:formaction="schema.formaction"
			:formenctype="schema.formenctype"
			:formmethod="schema.formmethod"
			:formnovalidate="schema.formnovalidate"
			:formtarget="schema.formtarget"
			:height="schema.height"
			:list="schema.list"
			:max="schema.max"
			:maxlength="schema.maxlength"
			:min="schema.min"
			:minlength="schema.minlength"
			:multiple="schema.multiple"
			:name="inputName"
			:pattern="schema.pattern"
			:placeholder="placeholder"
			:readonly="readonly"
			:required="schema.required"
			:size="schema.size"
			:src="schema.src"
			:step="schema.step"
			:width="schema.width"
			:files="schema.files"
			v-attributes="'input'">
		<span class="helper"
			v-if="inputType === 'color' || inputType === 'range'"
			v-text="value"></span>
	</div>
</template>

<script lang="ts">
import abstractField from "../abstractField";
import debounce from "../../utils/debounce";
import isNumber from "../../utils/isNumber";
import fecha from "fecha";

const DATETIME_FORMATS = {
	date: "YYYY-MM-DD",
	datetime: "YYYY-MM-DD HH:mm:ss",
	"datetime-local": "YYYY-MM-DDTHH:mm:ss"
};

export default {
	name: "field-input",
	mixins: [abstractField],
	computed: {
		inputType() {
			if (typeof this.schema.inputType !== "undefined") {
				return this.schema.inputType.toLowerCase();
			} else {
				console.warn("Missing inputType", this.schema, this.schema.inputType);
			}
		}
	},
	methods: {
		formatValueToModel(value: any) {
			if (value != null) {
				switch (this.inputType) {
					case "date":
					case "datetime":
					case "datetime-local":
					case "number":
					case "range":
						// debounce
						return (newValue: any, oldValue: any) => {
							this.debouncedFormatFunc(value, oldValue);
						};
				}
			}

			return value;
		},
		formatDatetimeToModel(newValue: any, oldValue: any) {
			let defaultFormat = DATETIME_FORMATS[this.inputType];
			let m = fecha.parse(newValue, defaultFormat);
			if (m) {
				if (this.schema.format) {
					newValue = fecha.format(m, this.schema.format);
				} else {
					newValue = m.valueOf();
				}
			}
			this.updateModelValue(newValue, oldValue);
		},
		formatNumberToModel(newValue: any, oldValue: any) {
			if (!isNumber(newValue)) {
				newValue = NaN;
			}
			this.updateModelValue(newValue, oldValue);
		},
		onInput($event: InputEvent) {
			let value: any = ($event.target as HTMLInputElement)?.value;
			switch (this.inputType) {
				case "number":
				case "range":
					if (isNumber(parseFloat(($event.target as HTMLInputElement).value))) {
						value = parseFloat(($event.target as HTMLInputElement).value);
					}
					break;
			}
			this.value = value;
		},
		onBlur() {
			if (typeof this.debouncedFormatFunc === "function") {
				this.debouncedFormatFunc.flush();
			}
		}
	},

	mounted() {
		switch (this.inputType) {
			case "number":
			case "range":
				this.debouncedFormatFunc = debounce(
					(newValue: any, oldValue: any) => {
						this.formatNumberToModel(newValue, oldValue);
					},
					parseInt(this.schema.debounceFormatTimeout || 1000),
					{
						trailing: true,
						leading: false
					}
				);
				break;
			case "date":
			case "datetime":
			case "datetime-local":
				// wait 1s before calling 'formatDatetimeToModel' to allow user to input data
				this.debouncedFormatFunc = debounce(
					(newValue, oldValue) => {
						this.formatDatetimeToModel(newValue, oldValue);
					},
					parseInt(this.schema.debounceFormatTimeout || 1000),
					{
						trailing: true,
						leading: false
					}
				);
				break;
		}
	},

	created() {
		if (this.inputType === "file") {
			console.warn("The 'file' type in input field is deprecated. Use 'file' field instead.");
		}
	}
};
</script>

<style scoped>
.wrapper {
	width: 100%;
}
input[type="radio"] {
	width: 100%;
}
input[type="color"] {
	width: 60px;
}
input[type="range"] {
	padding: 0;
}

.helper {
	margin: auto 0.5em;
}
</style>
