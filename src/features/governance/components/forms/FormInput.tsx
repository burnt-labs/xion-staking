import type { UseFormRegister } from "react-hook-form";

interface FormInputProps {
  error?: string;
  id: string;
  label: string;
  readOnly?: boolean;
  register: UseFormRegister<any>;
  required?: boolean;
  type?: "number" | "text";
}

export const FormInput = ({
  error,
  id,
  label,
  readOnly = false,
  register,
  required = false,
  type = "text",
}: FormInputProps) => (
  <div className="flex w-full flex-col">
    <label
      className="font-['Akkurat LL'] text-xs font-normal leading-tight text-[#949494]"
      htmlFor={id}
    >
      {label}
    </label>
    <div className="flex flex-grow flex-col">
      <input
        className="font-['Akkurat LL'] mt-2 w-full border-0 border-b border-[#949494] bg-transparent pb-2 text-sm font-normal leading-tight text-[#f2f2f2] focus:border-[#f2f2f2] focus:outline-none"
        id={id}
        readOnly={readOnly}
        type={type}
        {...register(id, {
          required: required ? `${label} is required` : false,
        })}
      />
    </div>
    <div className="flex flex-col">
      <p className="mt-2 text-sm text-red-500">{error}</p>
    </div>
  </div>
);
