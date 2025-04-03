<template>
  <KTInput
    type="text"
    :model-value="formattedDate"
    placeholder="01.01.2024"
    :required="false"
    :label="label"
    :maska="!range ? '##.##.####' : ''"
    :rules="dateRules"
    @update:model-value="updateDate"
    :readonly="range"
  >
    <template #append>
      <q-icon :name="mdiCalendarMonthOutline" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            mask="DD.MM.YYYY"
            :model-value="props.modelValue"
            :locale="myLocale"
            color="green-500"
            @update:model-value="updateDate"
            :range="range"
          >
            <div class="row items-center justify-end">
              <GGButton
                v-close-popup
                label="Закрыть"
                size="small"
                design-type="tertiary"
                stretch="hug"
              ></GGButton>
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
  modelValue: string | DateRange;
  label: string;
  range?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);

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

const formattedDate = computed(() => {
  if (!props.modelValue) return "";
  if (typeof props.modelValue === "string") return props.modelValue;
  if (typeof props.modelValue === "object" && props.range) {
    return `${props.modelValue.from} - ${props.modelValue.to}`;
  }
  return "";
});

function isValidDate(dateStr: string): boolean {
  const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  if (!regex.test(dateStr)) return false;
  const [day, month, year] = dateStr.split(".").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

const dateRules = [
  (val: string) => {
    if (!val || val.length < 10) return true;
    return isValidDate(val) || "Используйте формат ДД.ММ.ГГГГ";
  },
];

function updateDate(val: string | number | DateRange) {
  emit("update:modelValue", val);
}
</script>

<style></style>
