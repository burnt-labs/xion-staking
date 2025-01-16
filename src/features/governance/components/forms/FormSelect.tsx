import type { UseFormRegister } from "react-hook-form";

interface FormSelectOption {
  label: string;
  value: string;
}

interface FormSelectProps {
  error?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  register: UseFormRegister<any>;
  required?: boolean;
  value: string;
}

export const FormSelect = ({
  error,
  id,
  label,
  onChange,
  options,
  register,
  required = false,
  value,
}: FormSelectProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex w-full flex-col">
      <label
        className="font-['Akkurat LL'] text-xs font-normal leading-tight text-[#949494]"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="flex flex-grow flex-col">
        <select
          className="font-['Akkurat LL'] mt-2 w-full bg-transparent text-sm font-normal leading-tight text-[#f2f2f2]"
          id={id}
          value={value}
          {...register(id, {
            onChange: handleChange,
            required: required ? `${label} is required` : false,
          })}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="mt-2 h-[1px] w-full border-t border-[#949494]" />
      </div>
      <div className="flex flex-col">
        <p className="mt-2 text-sm text-red-500">{error}</p>
      </div>
    </div>
  );
};
