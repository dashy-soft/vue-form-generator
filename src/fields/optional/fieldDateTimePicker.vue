<template>
  <div class="input-group date">
    <input class="form-control"
      type="text"
      v-model="value"
      :autocomplete="fieldOptions.autocomplete"
      :disabled="disabled"
      :placeholder="placeholder"
      :readonly="readonly"
      :name="inputName"
      :id="fieldID">

    <span class="input-group-addon">
      <span class="glyphicon glyphicon-calendar"></span>
    </span>
  </div>
</template>

<script>
/* global $ */
import abstractField from "../abstractField";
import defaults from "../../utils/defaults";
import dateFieldHelper from "../../utils/dateFieldHelper";

export default {
  name: "field-dateTimePicker",
  mixins: [abstractField],

  methods: {
    ...dateFieldHelper
  },

  mounted() {
    this.$nextTick(() => {
      if (window.$ && window.$.fn.datetimepicker) {
        let input = this.$el.querySelector(".form-control");
        const opts = {
          format: this.getDefaultInputFormat(),
          ...this.fieldOptions,
        };
        $(this.$el)
          .datetimepicker(opts)
          .on("dp.change", () => {
            this.value = input.value;
          });
      } else {
        console.warn(
          "Bootstrap datetimepicker library is missing. Please download from https://eonasdan.github.io/bootstrap-datetimepicker/ and load the script and CSS in the HTML head section!"
        );
      }
    });
  },

  beforeDestroy() {
    if (window.$ && window.$.fn.datetimepicker) {
      $(this.$el)
        .data("DateTimePicker")
        .destroy();
    }
  }
};
</script>
