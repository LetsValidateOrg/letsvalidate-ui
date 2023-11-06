<template>
  <div
    class="modal fade"
    :class="{ show: show, 'd-block': show }"
    :aria-hidden="show"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header border-0 d-flex justify-content-end">
          <slot name="header"></slot>
          <button
            type="button"
            class="btn btn-primary"
            data-dismiss="modal"
            aria-label="Close"
            @click="close"
          >
            <span :aria-hidden="show">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <slot name="body"></slot>
        </div>
        <div class="modal-footer border-0">
          <button
            type="button"
            class="btn btn-secondary"
            data-dismiss="modal"
            aria-label="Close"
            @click="close"
          >
            Cancel
          </button>
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>
