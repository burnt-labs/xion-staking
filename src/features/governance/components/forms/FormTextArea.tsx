import type { UseFormRegister } from "react-hook-form";

interface FormTextAreaProps {
  error?: string;
  id: string;
  label: string;
  register: UseFormRegister<any>;
  required?: boolean;
}

export const FormTextArea = ({
  error,
  id,
  label,
  register,
  required = false,
}: FormTextAreaProps) => (
  <div className="flex w-full flex-col">
    <label
      className="font-['Akkurat LL'] text-xs font-bold uppercase leading-[14px] tracking-wide text-[#949494]"
      htmlFor={id}
    >
      {label}
    </label>
    <div className="mt-[26px] flex flex-grow">
      <div className="flex h-[120px] w-full border border-[#6b6969]">
        <textarea
          className="font-['Akkurat LL'] m-3 flex-grow resize-none bg-transparent text-sm font-normal leading-tight text-white"
          id={id}
          {...register(id, {
            required: required ? `${label} is required` : false,
          })}
        />
      </div>
    </div>
    {error && (
      <div className="flex flex-col">
        <p className="mt-2 text-sm text-red-500">{error}</p>
      </div>
    )}
  </div>
);
