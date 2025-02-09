<template>
    <main class="report-form">
      <section class="report-form__header">
        <h1 class="report-form__title gg-h1">Сообщите о проблеме</h1>
        <p class="report-form__sub-info">Вы зафиксировали 5 проблем за последний месяц</p>
      </section>
  
      <section class="report-form__content">
        <q-form
            ref="formRef"
            novalidate
            greedy
            class="report-form__form"
            @submit=""
        >
          <fieldset class="report-form__fieldset">
            <legend class="report-form__legend gg-h3 report-form__legend--required">Тип</legend>
            <div class="report-form__types">
              <button
                v-for="type in types"
                :key="type.value"
                :class="[
                  'report-form__type-button',
                  { 'report-form__type-button--active': selectedType === type.value }
                ]"
                type="button"
                @click="() => (selectedType = type.value)"
              >
                {{ type.label }}
              </button>
            </div>
          </fieldset>
          <fieldset class="report-form__fieldset">
            <legend class="report-form__legend gg-h3 report-form__legend--required">Локация</legend>
            <p class="report-form__sub-info">
              Оставьте точку на карте, соответствующую расположению проблемы
            </p>
            <article class="report-form__map-container">
                <Map :markers="[]"></Map>
            </article>
          </fieldset>
          <fieldset class="report-form__fieldset">
            <legend class="report-form__legend gg-h3">Комментарий</legend>
            <KTInputTextarea
              class="report-form__comment"
              placeholder="Кратко опишите проблему"
              v-model="comment"
            ></KTInputTextarea>
          </fieldset>
          <fieldset class="report-form__fieldset">
            <legend class="report-form__legend gg-h3">Фотографии</legend>
            <DragDrop class="report-form__images"></DragDrop>
          </fieldset>
           <GGButton class="report-form__submit-button" label="Отправить"></GGButton>
        </q-form>
      </section>
    </main>
  </template>
  
  <script setup lang="ts">
import { ref } from "vue";
//   import MapComponent from '@/components/MapComponent.vue';

const types = [
  { value: "hogweed", label: "Борщевик" },
  { value: "fire", label: "Пожар" },
  { value: "landfill", label: "Свалка" },
];
const selectedType = ref<string | null>(null);
const comment = ref<string>("");
const files = ref<File[]>([]);

const onFilesUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    files.value = Array.from(input.files);
  }
};

const triggerFileInput = () => {
  const input = document.getElementById("file-upload") as HTMLInputElement;
  input.click();
};

const onSubmit = () => {
  console.log("Submitted:", {
    type: selectedType.value,
    comment: comment.value,
    files: files.value,
  });
};
</script>
<style scoped lang="scss">
.report-form {
  max-width: 75vw;
  margin: 0 auto;
  padding-bottom: 24px;
  &__header {
    display: flex;
    flex-direction: column;
    margin-top: 48px;
    gap: 12px;
    justify-content: center;
    align-items: center;
  }
  &__sub-info {
    font-size: 14px;
    color: var(--app-green-700);
    margin: 4px 0px;
  }
  &__content {
    padding: 16px;
  }
  &__fieldset {
    margin-top: 16px;
    padding-bottom: 12px;
  }
  &__legend {
    }
    &__legend--required {
        &::after {
            content: "*";
            color: var(--app-red-500);
        }
    }

  &__types {
    display: flex;
    gap: 12px;
    margin-top: 12px;
    .report-form__type-button {
      padding: 8px 16px;
      background: var(--app-green-050);
      border-radius: 12px;
      cursor: pointer;
    }
    .report-form__type-button--active {
        background: var(--app-green-500);
        color: var(--app-white);
    }
    .report-form__type-button--disabled {
        background: var(--app-grey-050);
        color: var(--app-white);
    }
  }
  &__map-container {
    width: 100%;
    height: 410px;
    border-radius: 12px;
    overflow: hidden;
    margin-top: 12px;
  }

  &__comment {
    margin-top: 12px;
    width: 560px;
  }
  &__images {
    width: 100%;
    max-width: 928px;
    margin: 0 auto;
    margin-top: 12px;
  }
  &__submit-button {
    width: 364px;
    margin: 0 auto;
    margin-top: 32px;
  }
}
</style>
