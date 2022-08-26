export interface PollFormProps<T> {
  onSubmit: (data: T) => void;
  onChange?: (data: Partial<T>) => void;
  defaultValues?: Partial<T>;
  name?: string;
  className?: string;
  formId?: string;
}
