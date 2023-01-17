import { useCatch, useParams, useTransition } from "@remix-run/react";
import { Button, FormInput, Select } from "~/components/reUsableComponents/reusableFormComp";
import { buttonStyle, formStyle } from "~/components/utils/utils";
import { ValidatedForm, validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { ActionFunction, MetaFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireUserId } from "~/session.server";
// import { createGradeById, GradeProps } from "~/models/pupils.server";
export const meta: MetaFunction = () => {
  return {
    title: "Grade",
  };
};
const validator = withZod(
  z.object({
    subject: z.string().min(3),
    acad_yr: z.string().min(1, "academic year must not be empty"),
    level: z.string().min(1, "select one option")
  })
);

export const action: ActionFunction = async ({ request, params }) => {
  // invariant([requireUserId(request),params?.pupilId],()=> "No id is provided");
  // invariant(, "No id is provided");

  const pupilId = params.pupilId;
  const assignedBy = await requireUserId(request);
  const formData = await request.formData();
  const { data, error } = await validator.validate(formData);

  if (error) return validationError(error);
  let subject = data?.subject;
  const level = data?.level;
  const acad_yr = data?.acad_yr;
  const term = String(formData.get("term"));
  const test = String(formData.get("test"));
  const grade = Number(formData.get("grade"));
  // await createGradeById(level, subject, term, test, grade, assignedBy, acad_yr, $pupilId)
  return null;
};
export default function Grade() {
  const transition = useTransition();
  const { pupilId } = useParams();
  return <>
    <div>
      <h1>ID: {pupilId}</h1>
      <ValidatedForm validator={validator} className={"space-y-5 "} method={"post"}>
        <fieldset className={formStyle}>
          <legend className={"capitalize text-3xl text-gray-500 px-2"}>Enter Grade for...</legend>
          <FormInput required={ true } max={ "" } min={ "" } name={ "subject" } type={ "text" } id={ "subject" }
            label={ "Subject Name" } value={ ""}/>
          <FormInput required={true} max={3} min={1} name={"term"} type={"number"} id={"term"} label={"Term"} />
          <FormInput required={true} max={3} min={1} name={"test"} type={"number"} id={"test"} label={"Test Number"} />
          <FormInput required={true} max={100} min={0} name={"grade"} type={"number"} id={"grade"}
                     label={"Marks Scored"} />
          <FormInput required={true} max={""} min={""} name={"acad_yr"} type={"text"} id={"acad year"}
                     label={"Academic Year"} />
          <Select name={"level"} id={"level"}
                  option={["nursery 1", "nursery 2", "nursery 3", "class 1", "class 2", "class 3", "class 4", "class 5", "class 6"]}
                  label={"Level"} />
        </fieldset>
        <Button style={buttonStyle} type={"submit"} transition={!!transition.submission} value={["Save", "Saving"]} />
      </ValidatedForm>

    </div>
  </>;
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div> {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(` ${caught.status}`);
}
