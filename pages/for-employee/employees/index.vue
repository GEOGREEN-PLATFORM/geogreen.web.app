<template>
    <main class="employees-page">
        <section class="employees-page__header">
            <h1 class="employees-page__title gg-h1">Сотрудники</h1>
            <div class="employees-page__actions-wrapper">
                <GGButton @click="openDialogEmployeeAdd" class="employees-page__add-employee" label="Добавить сотрудника" size="medium"></GGButton>
                <KTInput class="employees-page__search-employee" v-model="searchEmployee" label="Поиск сотрудника" hideBottomSpace height="48px" :required="false">
                    <template #append>
                        <q-icon
                            :name="mdiMagnify"
                        />
                    </template>
                </KTInput>
            </div>
        </section>
        <section class="employees-page__content">
            <div class="filter-container">
                <CFilter v-model="filters"></CFilter>
            </div>
            <div class="table-container">
              <CTable :columns="tableHeaders" :rows="tableRows" row-key="name" :slots="['status']">
                <template v-slot:body-cell-status="slotProps">
                  <div class="status-wrapper">
                  <div class="account-status gg-t-small" :class="{
                    'account-status--active': slotProps.row.status === 'Активен',
                    'account-status--blocked': slotProps.row.status === 'Заблокирован',
                  }">{{slotProps.row.status}}</div>
                  </div>
                </template>
              </CTable>
            </div>
        </section>
        <GGDialog v-model="dialogEmployeeAdd.isOpened">
          <div class="dialog-employee-add">
            <header class="dialog-employee-add__title">
              <h1 class="gg-h1">Создание сотрудника</h1>
              <div class="sub-title">{{ dialogEmployeeAdd.currentSubTitle }}</div>
            </header>
            <div v-if="dialogEmployeeAdd.currentStep === 1">
            <section class="block">
              <h2 class="block__name gg-h3">Личные данные</h2>
              <div class="block__content">
                <div class="block__row-fields">
                  <KTInput v-model="dialogEmployeeAdd.form.personalData.lastName" label="Фамилия" required class="block__field"></KTInput>
                  <KTInput v-model="dialogEmployeeAdd.form.personalData.firstName" label="Имя" required class="block__field"></KTInput>
                  <KTInput v-model="dialogEmployeeAdd.form.personalData.secondName" label="Отчество" required class="block__field"></KTInput>
                </div>
                  <KTInputDate v-model="dialogEmployeeAdd.form.personalData.dateOfBirth" label="Дата рождения" class="block__field"></KTInputDate>
              </div>
            </section>
            <section class="block">
              <h2 class="gg-h3 block__name">Контакты</h2>
                  <KTInput v-model="dialogEmployeeAdd.form.contacts.email" label="Email" class="block__field" hint="Электронная почта сотрудника для входа в систему."></KTInput>
                  <KTInput v-model="dialogEmployeeAdd.form.contacts.phoneNumber" label="Номер телефона" class="block__field" :required="false"></KTInput>
            </section>
            <section class="block">
              <h2 class="gg-h3 block__name">Авторизация</h2>
              <KTInputSelect v-model="dialogEmployeeAdd.form.auth.role" label="Роль" :options="roleOptions" class="block__field" required></KTInputSelect>
            </section>
          </div>
          <div v-else-if="dialogEmployeeAdd.currentStep === 2">
            <section class="block">
              <h2 class="block__name gg-h3">Личные данные</h2>
              <div class="block__content">
                <div>
                <span>ФИО:</span>
                <span>{{ `${dialogEmployeeAdd.form.personalData.lastName} ${dialogEmployeeAdd.form.personalData.firstName} ${dialogEmployeeAdd.form.personalData.secondName}` }}</span>
              </div>
              <div>
                <span>Дата рождения:</span>
                <span>{{ dialogEmployeeAdd.form.personalData.dateOfBirth }}</span>
              </div>
              </div>
            </section>
            <section class="block">
              <h2 class="gg-h3 block__name">Контакты</h2>
              <div>
                <span>Email:</span>
                <span>{{ dialogEmployeeAdd.form.contacts.email }}</span>
              </div>
              <div>
                <span>Номер телефона:</span>
                <span>{{ dialogEmployeeAdd.form.contacts.phoneNumber }}</span>
              </div>
            </section>
            <section class="block">
              <h2 class="gg-h3 block__name">Авторизация</h2>
              <div>
                <span>Роль:</span>
                <span>{{ dialogEmployeeAdd.form.auth.role }}</span>
              </div>
            </section>
          </div>
          <div v-else-if="dialogEmployeeAdd.currentStep === 3">
            <div class="password-container">
              <div class="gg-h2">Пароль</div>
              <div class="with-copy">              <div class="password">{{ dialogEmployeeAdd.password }}</div>
              <q-icon :name="mdiContentCopy" size="32px"></q-icon></div>

            </div>
            </div>
            <footer class="dialog-employee-add__footer-buttons">
              <GGButton @click="stepBackDialogEmployeeAdd" design-type="tertiary" :label="dialogEmployeeAdd.buttons.cancel"></GGButton>
              <GGButton @click="stepForwardDialogEmployeeAdd"  :label="dialogEmployeeAdd.buttons.apply"></GGButton>
            </footer>
          </div>
        </GGDialog>
    </main>
</template>

<script setup lang="ts">
import { mdiContentCopy, mdiMagnify } from "@quasar/extras/mdi-v6";
const statusOptions = [
  {
    name: "Активен",
    value: "active",
  },
  {
    name: "Заблокирован",
    value: "blocked",
  },
];
const roleOptions = [
  {
    name: "Оператор",
    value: "operator",
  },
  {
    name: "Администратор",
    value: "administrator",
  },
];
const dialogEmployeeAdd = reactive({
  isOpened: false,
  form: {
    personalData: {
      firstName: "",
      secondName: "",
      lastName: "",
      dateOfBirth: "",
    },
    contacts: {
      email: "",
      phoneNumber: "",
    },
    auth: {
      role: "",
    },
  },
  buttons: {
    cancel: "Отмена",
    apply: "Далее",
  },
  currentSubTitle: "",
  password: "",
  currentStep: 1,
});
function stepBackDialogEmployeeAdd() {
  switch (dialogEmployeeAdd.currentStep) {
    case 1:
      dialogEmployeeAdd.isOpened = false;
      dialogEmployeeAdd.form = {
        personalData: {
          firstName: "",
          secondName: "",
          lastName: "",
          dateOfBirth: "",
        },
        contacts: {
          email: "",
          phoneNumber: "",
        },
        auth: {
          role: "",
        },
      };
      break;
    case 2:
      dialogEmployeeAdd.currentStep--;
      break;
    case 3:
      dialogEmployeeAdd.currentStep--;
      break;
  }
}
function stepForwardDialogEmployeeAdd() {
  switch (dialogEmployeeAdd.currentStep) {
    case 1:
      dialogEmployeeAdd.currentStep++;
      dialogEmployeeAdd.currentSubTitle =
        "Проверьте корректность введённых данных";
      dialogEmployeeAdd.buttons.cancel = "Назад";
      break;
    case 2:
      dialogEmployeeAdd.currentStep++;
      dialogEmployeeAdd.currentSubTitle =
        "Сохраните пароль для сотрудника. Утерянные пароли не восстанавливаются в системе!";
      dialogEmployeeAdd.buttons.apply = "Создать";
      dialogEmployeeAdd.password = generatePassword();
      break;
    case 3:
      dialogEmployeeAdd.currentStep--;
      break;
  }
}
function generatePassword() {
  const specialChars = "@#$%&*";
  const passwordArr = Math.random()
    .toString(36)
    .slice(-10)
    .split("")
    .map((char) => {
      return Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase();
    });
  const index = Math.floor(Math.random() * passwordArr.length);
  passwordArr[index] =
    specialChars[Math.floor(Math.random() * specialChars.length)];
  return passwordArr.join("");
}

const filters = reactive<FilterItem[]>([
  {
    type: "select",
    key: "role",
    label: "Роль",
    selected: "",
    data: roleOptions,
  },
  {
    type: "select",
    key: "status",
    selected: "",
    label: "Статус аккаунта",
    data: statusOptions,
  },
  {
    type: "date-range",
    key: "status",
    selected: ["", ""],
    label: "Дата создания",
  },
]);
const searchEmployee = ref("");
const tableHeaders = [
  {
    name: "initials",
    align: "left",
    label: "ФИО",
    field: "initials",
    sortable: true,
  },
  {
    name: "role",
    align: "center",
    label: "Роль",
    field: "role",
    sortable: true,
  },
  {
    name: "status",
    align: "center",
    label: "Статус аккаунта",
    field: "status",
    sortable: true,
  },
  {
    name: "dateCreated",
    align: "right",
    label: "Дата создания",
    field: "dateCreated",
    sortable: true,
  },
];
const tableRows = [
  {
    initials: "Иванов Иван Иванович",
    role: "Оператор",
    status: "Активен",
    dateCreated: "23.02.2025",
  },
];
function openDialogEmployeeAdd() {
  dialogEmployeeAdd.isOpened = true;
}
</script>

<style scoped lang="scss">
.employees-page {
$app-desktop: 1294px;
$app-laptop: 960px;
$app-mobile: 600px;
$app-narrow-mobile: 364px;

    padding: 0px 32px;
    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 0px;
        .employees-page__actions-wrapper {
            display: flex;
            align-items: center;
            width: 728px;
            gap: 32px;
            .employees-page__add-employee {
                width: 40%;
            }
            .employees-page__search-employee {
                width: 60%;
            }
        }
    }
    .status-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      .account-status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: max-content;
    height: 32px;
    padding: 4px 16px;
    border-radius: 16px;
    color: var(--app-white);
    &--active {
      background-color: var(--app-green-300);
    }
    &--blocked {
      background-color: var(--app-grey-300);
    }
  }
    }

}
.dialog-employee-add {
  display: flex;
  flex-direction: column;
  width: 80%;
  max-width: 784px;
  height: max-content;
  background-color: var(--app-white);
  border-radius: 12px;
  padding: 24px 32px;
  &__title {
    padding: 16px 0px 20px 0px;
    .sub-title {
      font-size: 18px;
      color: var(--app-grey-300);
      margin-top: 10px;
    }
  }
  .block {
    padding-top: 20px;
    &__name {
      margin-bottom: 12px;
    }
    &__row-fields {
      display: flex;
      gap: 12px;
    }
    &__field {
      padding-top: 12px;
      max-width: 434px;
    }
  }
  .password-container {
    display: flex;
    gap: 32px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .with-copy {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
  }
  .password {
    font-size: 32px;
    font-weight: bold;
  }
  &__footer-buttons {
    display: flex;
    gap: 16px;
    margin-top: 32px;
  }
}
</style>