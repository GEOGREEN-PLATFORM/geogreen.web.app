<template>
    <div
      class="theme-toggle"
      :class="{ 'theme-toggle--dark': isDark }"
      @click="toggleTheme"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
    <div
      class="theme-toggle__circle"
      :class="{ 'theme-toggle__circle--hover-left': isHovered && isDark, 'theme-toggle__circle--hover-right': isHovered && !isDark }"
    ></div>
      <div class="theme-toggle__icons">
        <div class="icon-wrapper">
            <NuxtImg src="/icons/sun.svg" width="24px"></NuxtImg>
        </div>
        <div class="icon-wrapper">
            <NuxtImg src="/icons/moon.svg" width="24px"></NuxtImg>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
const isDark = ref(false);
const isHovered = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
};

const handleMouseEnter = () => {
  isHovered.value = true;
};

const handleMouseLeave = () => {
  isHovered.value = false;
};
</script>
  
  <style scoped lang="scss">
  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 80px;
    height: 40px;
    padding: 5px;
    border-radius: 20px;
    background-color: var(--app-grey-050);
    transition: background-color 0.4s ease;
    cursor: pointer;
    position: relative;
  }
  
  .theme-toggle--dark {
    background-color: #333;
  }
  
  .theme-toggle__circle {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 32px;  
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(180deg, #FCCB94, #E77B0C);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    transition: transform 0.4s ease, background-color 0.4s ease, width 0.2s ease;
  }
  
  .theme-toggle--dark .theme-toggle__circle {
    transform: translate(40px, -50%);
    background: linear-gradient(180deg, #ACACAC, #2F2F2F);
  }
  
  .theme-toggle__circle--hover-left {
  width: 34px;
  transform: translate(-36px, 50%);
}

.theme-toggle__circle--hover-right {
  width: 34px;
  transform: translate(0px, -50%);
}

  
  .theme-toggle__icons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    position: relative;
    z-index: 1;
    color: #333;
    .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
    }
  }
  
  .theme-toggle--dark .theme-toggle__icons {
    color: #fff;
  }
  
  .theme-toggle__icon {
    width: 16px;
    height: 16px;
  }
  </style>
  