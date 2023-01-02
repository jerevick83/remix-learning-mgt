import { Form, useCatch } from "@remix-run/react";
import { FormInput, Select } from "./reUsableComponents/reusableFormComp";
import { countries } from "~/components/reUsableComponents/countryList";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { ActionFunction, redirect } from "@remix-run/node";


const validator = withZod(
  z.object({
    firstname: z.string({ required_error: "Firstname is required" }).trim().min(2, "Firstname be two or more characters"),
    other_name: z.string().trim().nullish(),
    lastname: z.string({ required_error: "Firstname is required" }).trim().min(2, "Firstname be two or more characters").trim(),
    gender: z.enum(["Female", "Male", "Other"]),
    dob: z.date({ required_error: "Please select a date" }),
    pob: z.string().or(z.number()),
    email: z.string().email({ message: "the email should be in email format" }).trim().min(5, "must be above five characters").trim(),
    phone: z.string({ required_error: "phone contact id required" }).min(9).trim(),
    nationality: z.string({ required_error: "select your nationality" }).trim(),
    address: z.string().or(z.number())
  })
);

export const action: ActionFunction = async ({ request }) => {
  throw new Error();
  const formData = await request.formData();

  const fName = formData.get("firstname");

  console.log(fName);
  return redirect("app/super-admin/pupils/addPupil");
};
export const AddUserForm = () => {

  return (
    <div className={"w-full"}>
      <Form method={"post"} className={"flex flex-wrap space-y-4"}>
        <fieldset
          className={"lg:grid lg:grid-cols-4 sm:grid sm:grid-cols-1 md:grid md:grid-cols-3 justify-items-start border-2 p-2 gap-5"}>
          <legend className={"capitalize text-3xl text-gray-500 p-2"}>Add Pupil</legend>
          <FormInput id={"fName"} type={"text"} name={"firstname"} label={"Firstname"} required max={""}
                     min={""} />
          <FormInput id={"oName"} type={"text"} name={"other_name"} label={"Lastname"} max={""} min={""}
                     required={false} />
          <FormInput id={"lName"} type={"text"} name={"lastname"} label={"Other Name"} max={""} min={""} required />
          <Select label={"Gender"} option={["FEMALE", "MALE", "OTHER"]} name={"gender"} id={"gender"} />
          <FormInput id={"dob"} type={"date"} name={"dob"} label={"Date of Birth"} max={""} min={""} required />
          <FormInput id={"pob"} type={"text"} name={"pob"} label={"Place of Birth"} max={""} min={""} required />

          <FormInput id={"email"} type={"text"} name={"email"} label={"Email"} max={""} min={""} required />
          <FormInput id={"phone"} type={"text"} name={"phone"} label={"Contact"} max={""} min={""} required />
          <FormInput id={"address"} type={"text"} name={"address"} label={"Address"} max={""} min={""} required />
          <Select label={"Nationality"} option={countries} name={"nationality"} id={"nationality"} />
        </fieldset>
        <button type={"submit"}>Save</button>
      </Form>
    </div>
  );
};

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
