<script setup lang="ts">
interface Props {
  type: 'login' | 'register'
}
interface UserData {
  login: string
  password: string
  email?: string
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
  <q-form ref="formRef" @submit="checkFormValid">
    <div class="page-content__auth-form">
      <KTInput
        v-if="type === 'register' && userData.email"
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
    <div class="page-content__action-buttons">
      <KTButton
        :disabled="formHasError"
        :label="type === 'login' ? 'Войти в аккаунт' : 'Далее'"
        type="submit"
      />
      <KTButton
        :label="type === 'login' ? 'У меня нет аккаунта' : 'Далее'"
        design-type="secondary"
      />
    </div>
  </q-form>
</template>

<style scoped>
.page-content__auth-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
  margin-top: 84px;
  margin-bottom: 56px;
  padding: 0px 16px;
}
.page-content__action-buttons {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
  padding: 0px 16px;
}
</style>
