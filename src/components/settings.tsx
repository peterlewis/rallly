export const FormField: React.VoidFunctionComponent<
  React.PropsWithChildren<{
    name: string;
    error?: string;
    help?: React.ReactNode;
  }>
> = ({ name, children, help, error }) => {
  return (
    <div className="py-4 sm:flex sm:space-x-3">
      <div className="mb-2 sm:w-48">
        <label className="font-medium">{name}</label>
      </div>
      <div className="grow">
        <div>{children}</div>
        {help ? (
          <div className="mt-2 text-sm text-slate-400">{help}</div>
        ) : null}
        {error ? (
          <div className="mt-1 text-sm text-rose-500">{error}</div>
        ) : null}
      </div>
    </div>
  );
};
