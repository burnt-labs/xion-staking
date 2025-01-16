import type { UseFormRegister } from "react-hook-form";

interface FormInputProps {
  error?: string;
  id: string;
  label: string;
  register: UseFormRegister<any>;
  required?: boolean;
  type?: "number" | "text";
}

export const FormInput = ({
  error,
  id,
  label,
  register,
  required = false,
  type = "text",
}: FormInputProps) => (
  <div className="flex w-[464px] flex-col">
    <label
      className="font-['Akkurat LL'] text-xs font-normal leading-tight text-[#949494]"
      htmlFor={id}
    >
      {label}
    </label>
    <div className="flex flex-grow flex-col">
      <input
        className="font-['Akkurat LL'] mt-2 w-full bg-transparent text-sm font-normal leading-tight text-[#f2f2f2]"
        id={id}
        type={type}
        {...register(id, {
          required: required ? `${label} is required` : false,
        })}
      />
      <div className="mt-2 h-[1px] w-full border-t border-[#949494]" />
    </div>
    <div className="flex flex-col">
      <p className="mt-2 text-sm text-red-500">{error}</p>
    </div>
  </div>
);
