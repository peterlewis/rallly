export interface PollFormProps<T extends Record<string, unknown>> {
  onSubmit: (data: T) => void;
  onChange?: (data: Partial<T>) => void;
  defaultValues?: Partial<T>;
  name?: string;
  className?: string;
  formId?: string;
}
