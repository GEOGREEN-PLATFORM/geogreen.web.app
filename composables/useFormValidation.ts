import type { QField, QForm, QInput, QSelect } from "quasar";
import { uid } from "quasar";

// intersection type of known Quasar form components
export type FormValidationComponent = QInput | QSelect | QField;

/**
 * adds form validation aware for form components
 * @formRef = template ref of QForm container
 * @formComponents = ref that will hold array of form components
 * @formIsDirty = ref sets state of a form component if its value was changed
 * @formHasError = computed ref sets if one of the form component has error
 */
export function useFormValidation() {
  // assign this in the consumer's QForm template ref
  const formRef = ref<QForm>();
  const formComponents =
    ref<
      {
        uid: string;
        validationComponent: FormValidationComponent;
        origModel: unknown;
      }[]
    >();
  const formIsDirty = computed(() =>
    formComponents.value
      ? formComponents.value.some(
          (v) => v.origModel !== v.validationComponent.modelValue,
        )
      : false,
  );

  // Quasar form components has internal value called hasError
  // check if the components is in error state
  const formHasError = computed(
    () =>
      formComponents.value?.some(
        (v) => v.validationComponent.hasError,
      ) as boolean,
  );

  async function formBindValidation() {
    // wait for vue nextTick before binding in case data are being updated
    await nextTick();
    if (formRef.value === undefined) {
      throw new Error(
        "Failed to bind validation as formRef is not assigned to a QForm in the current page!",
      );
    }
    // get all form components that has internal validations
    formComponents.value = (
      formRef.value.getValidationComponents() as FormValidationComponent[]
    ).map((v) => ({
      uid: uid(),
      validationComponent: v,
      origModel: v.modelValue,
    }));
  }

  function formReset() {
    formRef.value?.resetValidation();
    // rebind form to refresh original values if it was updated
    formBindValidation();
  }

  // watchEffect(() => {
  //   console.log('Form is dirty? ', formIsDirty.value);
  //   console.log('Form has error? ', formHasError.value);
  // });

  return {
    /**
     * must use it in your QForm to make use of validation status
     */
    formRef,
    /**
     * see form dirty status
     */
    formIsDirty,
    /**
     * see form error status
     */
    formHasError,
    /**
     * bind validations to form, must call it in your component's onMounted hook
     */
    formBindValidation,
    /**
     * resets form and re-bind validation
     */
    formReset,
  };
}
