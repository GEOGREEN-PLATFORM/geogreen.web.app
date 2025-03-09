<template>
    <KTInput
      type="text"
      :model-value="props.modelValue"
      placeholder="01.01.2024"
      :required="false"
      :label="label"
      hide-bottom-space
    >
      <template #append>
        <q-icon
          :name="mdiCalendarMonthOutline"
        >
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date
              mask="DD.MM.YYYY"
              :model-value="modelValue"
              :locale="myLocale"
              color="green-500"
              @update:model-value="updateDate"
            >
              <div class="row items-center justify-end">
                <GGButton v-close-popup label="Закрыть" size="small" design-type="tertiary" stretch="hug"></GGButton>
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </KTInput>
  </template>
  
  <script lang="ts" setup>
import { mdiCalendarMonthOutline } from "@quasar/extras/mdi-v6";
interface Props {
  modelValue: string;
  label: string;
}
const props = defineProps<Props>();
const myLocale: object = {
  days: "Воскресенье_Понедельник_Вторник_Среда_Четверг_Пятница_Суббота".split(
    "_",
  ),
  daysShort: "Вс_Пн_Вт_Ср_Чт_Пт_Сб".split("_"),
  months:
    "Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь".split(
      "_",
    ),
  monthsShort: "Янв_Фев_Мар_Апр_Май_Июн_Июл_Авг_Сен_Окт_Ноя_Дек".split("_"),
  firstDayOfWeek: 1,
  format24h: true,
  pluralDay: "дня",
};

const emit = defineEmits(["update:modelValue"]);
function updateDate(val: string) {
  emit("update:modelValue", val);
}
</script>
  
  <style></style>
  