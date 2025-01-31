import type { UseFormRegister } from "react-hook-form";

interface FormTextAreaProps {
  error?: string;
  height?: number;
  id: string;
  label: string;
  register: UseFormRegister<any>;
  required?: boolean;
}

export const FormTextArea = ({
  error,
  height = 120,
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
      <textarea
        className={`font-['Akkurat LL'] w-full resize-none border border-[#6b6969] bg-transparent p-3 text-sm font-normal leading-tight text-white`}
        id={id}
        style={{ height: `${height}px` }}
        {...register(id, {
          required: required ? `${label} is required` : false,
        })}
      />
    </div>
    {error && (
      <div className="flex flex-col">
        <p className="mt-2 text-sm text-red-500">{error}</p>
      </div>
    )}
  </div>
);
