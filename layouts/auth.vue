<template>
  <div class="page-container">
    <div class="page-content">
      <div class="logo">
        <div class="logo__main">
          TONIGHT
        </div>
        <div class="logo__slogan">
          watch. meet. enjoy
        </div>
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  width: 100vw;
  position: relative;
  padding: 16px;
  display: flex;
  align-items: center;
  background: linear-gradient(
      0deg,
      rgba(249, 249, 241, 0.6),
      rgba(249, 249, 241, 0.6)
    ),
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.48) 24.38%,
      rgba(255, 255, 255, 0.8) 79.95%
    ), url("/images/login_bg.png") center / cover no-repeat;
  box-shadow: 0px 0px 30px 0px #ffffff08;
  &::before {
  position: absolute;
  content: '';
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(0deg, rgba(8, 8, 8, 0.8), rgba(18, 18, 18, 0.8)),
      linear-gradient(180deg, rgba(8, 8, 8, 0.24) 0%, rgba(8, 8, 8, 0.48) 44.64%, rgba(8, 8, 8, 0.7) 74.65%), url("/images/login_bg.png") center / cover no-repeat;
  z-index: -1;
  transition: opacity 0.5s linear;
  opacity: 0;
}
  .page-content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    min-height: 100%;
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      &__main {
        font-size: 40px;
        font-weight: 900;
        line-height: 48.76px;
        background: rgb(249, 87, 57);
        background: linear-gradient(
          90deg,
          rgba(249, 87, 57, 1) 0%,
          rgba(99, 105, 209, 1) 100%
        );
        -webkit-background-clip: text;
        color: transparent;
      }
      &__slogan {
        font-size: 24px;
        font-weight: 500;
        line-height: 29.26px;
        color: var(--app-black-10);
      }
    }
  }
}

.dark-mode {
  .page-container {
    &::before {
    opacity: 1;
  }
  }
}
</style>
