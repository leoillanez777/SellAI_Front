<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "VueWriter",
  props: {
    array: {
      type: Array,
      required: true,
    },
    eraseSpeed: {
      type: Number,
      default: 100, // Reduce the default erasing speed
    },
    typeSpeed: {
      type: Number,
      default: 200, // Reduce the default typing speed
    },
    delay: {
      type: Number,
      default: 2000,
    },
    intervals: {
      type: Number,
      default: 500,
    },
    start: {
      type: Number,
      default: 0,
    },
    caret: {
      type: Boolean,
      default: true,
    },
    iterations: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      typeValue: "",
      count: 0,
      typeStatus: false,
      arrayIndex: 0,
      charIndex: 0,
    };
  },
  methods: {
    typewriter() {
      let loop = 0;
      if (this.charIndex < this.array[this.arrayIndex].length) {
        if (!this.typeStatus) {
          this.typeStatus = true;
        }

        this.typeValue += this.array[this.arrayIndex].charAt(this.charIndex);
        this.charIndex += 1;
        setTimeout(this.typewriter, this.typeSpeed);
      } else {
        this.count += 1;

        if (this.count === this.array.length) {
          loop += 1;
          if (loop === this.iterations) {
            this.$emit('finish');
            return (this.typeStatus = false);
          }
        }

        this.typeStatus = false;

        setTimeout(this.eraser, this.delay);
      }
    },
    eraser() {
      if (this.charIndex > 0) {
        if (!this.typeStatus) this.typeStatus = true;
        this.typeValue = this.array[this.arrayIndex].substring(
          0,
          this.charIndex - 1
        );
        this.charIndex -= 1;
        setTimeout(this.eraser, this.eraseSpeed);
      } else {
        this.typeStatus = false;
        this.arrayIndex += 1;
        if (this.arrayIndex >= this.array.length) this.arrayIndex = 0;
        setTimeout(this.typewriter, this.typeSpeed + this.intervals);
      }
    },
  },
  created() {
    setTimeout(this.typewriter, this.start);
  },
});
</script>

<template>
  <div :class="{'cursor-progress': typeStatus}">
    <slot />
    <span v-html="typeValue" class="whitespace-pre-line" :class="{'cursor-progress': typeStatus, 'cursor-text': !typeStatus}"></span>
    <span :class="{typing: typeStatus }">&nbsp;</span>
  </div>
</template>
