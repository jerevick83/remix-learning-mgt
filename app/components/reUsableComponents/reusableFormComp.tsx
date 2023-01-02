import { viewLink } from "~/components/utils/utils";
import { Link } from "@remix-run/react";
import { optional } from "zod";

type InputProps = {
  id: string;
  name: string;
  type: string;
  label: string;
  required: boolean;
  max: number | string;
  min: number | string;
  // actionData: string | any,
  value: string;
};
type OptionProps = {
  value: string;
  index: number;
  defaultValue: string;
};

export const FormInput = (inputs: InputProps) => {
  // const { error, getInputProps } = useField(inputs.name);
  return (
    <>
      {" "}
      <label htmlFor={inputs?.id} className={""}>
        <span className={"capitalize "}>{inputs?.label}</span>
        <br />
        <input
          required={inputs.required}
          max={inputs.max}
          min={inputs.min}
          title={inputs?.id}
          id={inputs?.id}
          defaultValue={inputs?.value}
          type={inputs?.type}
          name={inputs?.name}
          placeholder={`enter ${inputs?.label.toLowerCase()}`}
          className={
            //  inputs?.actionData?.errors[inputs?.name] ?
            "border-2 w-10/12 rounded py-1 px-2 rounded w-10/12  bg-gray-200 outline outline-1 border border-2  py-1 px-2"
          }
        />
        {/* <br /> {inputs?.actionData?<p style={{ color: "red" }}>{inputs?.actionData?.errors[inputs?.name]}</p>:""} */}
      </label>
    </>
  );
};

export const SelectOptions = (inputs: OptionProps) => {
  return (
    <option
      key={inputs.index}
      defaultValue={inputs.defaultValue}
      value={inputs?.value.toUpperCase()}
    >
      {inputs?.value}
    </option>
  );
};

export type SelectProp = {
  name: string;
  id: string;
  option: string[];
  label: InputProps["label"];

  // actionData: InputProps["actionData"]
  defaultValue: string;
};

export const LinkButton = (value: string, to: string) => {
  return (
    <div>
      <Link prefetch={"render"} to={to} className={viewLink}>
        {value}
      </Link>
    </div>
  );
};

export const Select = (inputs: SelectProp) => {
  // const { error, getInputProps } = useField(inputs.name);

  return (
    <label htmlFor={inputs.id} className={""}>
      {inputs.label} <br />
      <select
        className={
          // inputs?.actionData?.errors[inputs?.name] ?
          "py-1 w-10/12  outline outline-1 px-2 bg-gray-200 border-2 rounded"
        }
        name={inputs.name}
        id={inputs.id}
      >
        {/* <option value={inputs?.defaultValue}></option> */}
        {inputs?.option.map((item, index) => (
          <option value={item} key={index}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
};

type Button = {
  transition: boolean;
  style: string;
  type: "submit" | "reset" | "button";
  value: string[];
};
export const Button = (inputs: Button) => {
  return (
    <button className={inputs.style} type={inputs.type}>
      {!inputs.transition ? inputs.value[0] : inputs.value[1]}
    </button>
  );
};

export const classList = [
  "NURSERY_1",
  "NURSERY_2",
  "NURSERY_3",
  "CLASS_1",
  "CLASS_2",
  "NONE",
  "CLASS_3",
  "CLASS_4",
  "CLASS_5",
  "CLASS_6",
].sort();
