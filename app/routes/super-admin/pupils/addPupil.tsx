import { Button, FormInput, Select } from "~/components/reUsableComponents/reusableFormComp";
import { countries } from "~/components/reUsableComponents/countryList";
import { useActionData, useCatch, useTransition } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { ActionFunction, MetaFunction, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireUserId } from "~/session.server";
import { ValidatedForm, validationError } from "remix-validated-form";
import { buttonStyle, formStyle } from "~/components/utils/utils";
export const meta: MetaFunction = () => {
  return {
    title: "Add User",
  };
};
const validator = withZod(
  z.object({
    firstname: z.string({ required_error: "Firstname is required" }).trim().min(2, "firstname must be two or more characters"),
    other_name: z.string().trim().nullish(),
    lastname: z.string({ required_error: "lastname is required" }).trim().min(2, "lastname must be two or more characters").trim(),
    gender: z.string({ required_error: "Select an option", description: "" }).min(1, "Select at least one option"),
    dob: z.date(),
    pob: z.string().min(3, "Place of Birth is required"),
    email: z.string().email({ message: "the email should be in email format" }).trim().min(5, "must be above five characters").trim(),
    phone: z.string({ required_error: "phone contact id required" }).min(9, "Contact must be at least 9 characters long").trim(),
    nationality: z.string({ required_error: "select your nationality" }).trim().min(1, "select your nationality"),
    address: z.string().min(10, "Give your complete address").trim()
  })
);

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(userId);
  const { data, error } = await validator.validate(await request.formData());
  if (error) return validationError(error);
  console.log("ibgjoaifgsfndugsiafdghigudsff ghdfiusfffgdginjfgdfjngfdhjnfgdhf" + userId);
  const firstname = data?.firstname as string;
  const lastname = data?.lastname as string;
  const other_name = data?.other_name as string;
  const nationality = data?.nationality as string;
  const address = data?.address as string;
  const pob = data?.pob as string;
  const dob = String(data?.dob);
  // const gender = data?.gender as ProfileProp["gender"];
  const phone = data?.phone as string;

  // const createdUser = await createPupil({
  //   firstname,
  //   other_name,
  //   lastname,
  //   nationality,
  //   pob,
  //   dob,
  //   phone,
  //   gender,
  //   address,
  //   userId
  // });
  // if (!createdUser) throw new Error("djdkf fjsjdhjfdf fjkdfkfd")
  return redirect("/super-admin/pupils");
};
const genderList = ["Female", "Male", "Other"];

export default function AddPupil() {
  const actionData = useActionData();
  const transition = useTransition();

  return (
    <div className={"mt-"}>
      <ValidatedForm validator={validator} method={"post"}
                     className={"flex sm:justify-items-start sm:flex-col flex-wrap space-y-4"}>
        <fieldset className={formStyle}>
          <legend className={"capitalize text-3xl text-gray-500 px-2"}>Add User</legend>
          <FormInput required={true} min={""} max={""} id={"fName"} type={"text"} name={"firstname"}
                     label={"Firstname"} />
          <FormInput required={false} min={""} max={""} id={"oName"} type={"text"} name={"other_name"}
                     label={"Other Name(s)"} />
          <FormInput required={true} min={""} max={""} id={"lName"} type={"text"} name={"lastname"}
                     label={"Lastname"} />
          <Select label={"Gender"} id={"gender"} name={"gender"} option={genderList} />
          <FormInput required={true} min={""} max={""} id={"dob"} type={"date"} name={"dob"} label={"Date of Birth"} />
          <FormInput required={true} min={""} max={""} id={"pob"} type={"text"} name={"pob"} label={"Place of Birth"} />
          <FormInput required={true} min={""} max={""} id={"email"} type={"text"} name={"email"} label={"Email"} />
          <FormInput required={true} min={""} max={""} id={"phone"} type={"text"} name={"phone"} label={"Contact"} />
          <FormInput required={true} min={""} max={""} id={"address"} type={"text"} name={"address"}
                     label={"Current Address"} />
          <Select name="nationality" id="nationality" label={"Nationality"} option={countries} />
        </fieldset>
        <Button transition={!!transition.submission} style={buttonStyle} type={"submit"} value={["Save", "saving"]} />
      </ValidatedForm>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div className={"text-red-600"}>{error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`${caught.status}`);
}
