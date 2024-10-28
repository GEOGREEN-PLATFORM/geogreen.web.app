<script setup lang="ts">
interface Props {
  type: 'login' | 'register'
}
interface UserData {
  login: string
  password: string
  email: string
}
const props = withDefaults(defineProps<Props>(), {
  type: 'login',
})
const { formRef, formBindValidation, formIsDirty, formHasError, formReset }
  = useFormValidation()
const userData = ref<UserData>({
  login: '',
  password: '',
  email: '',
})

function goToAlternateAuth(currentAuthType: 'login' | 'register') {
  const alternateAuthType = currentAuthType == 'login' ? 'register' : 'login'
  navigateTo({
    path: `/auth/${alternateAuthType}`,
  })
}
function checkFormValid() {
  formRef.value
    ?.validate()
    .then((success) => {
      if (success) {
        console.log('success')
      }
      else {
        console.log('failed')
      }
    })
}
onMounted(() => {
  formBindValidation()
})
</script>

<template>
  <q-form ref="formRef" greedy class="auth-form" @submit="checkFormValid">
    <div class="auth-form__input-fields">
      <KTInput
        v-if="type === 'register'"
        v-model="userData.email"
        label="Почта"
      />
      <KTInput v-model="userData.login" required label="Логин" />
      <KTInput
        v-model="userData.password"
        required
        label="Пароль"
        type="password"
      />
    </div>
    <div class="auth-form__action-buttons">
      <KTButton
        :disabled="formHasError"
        :label="type === 'login' ? 'Войти в аккаунт' : 'Далее'"
        type="submit"
      />
      <KTButton
        :label="type === 'login' ? 'У меня нет аккаунта' : 'У меня есть аккаунт'"
        design-type="secondary"
        @click="goToAlternateAuth(type)"
      />
    </div>
  </q-form>
</template>

<style scoped lang="scss">
.auth-form {
  width: 100%;
  &__input-fields {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 8px;
    margin-top: 84px;
    margin-bottom: 56px;
    padding: 0px 16px;
  }
  &__action-buttons {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 8px;
    padding: 0px 16px;
  }
}
</style>
