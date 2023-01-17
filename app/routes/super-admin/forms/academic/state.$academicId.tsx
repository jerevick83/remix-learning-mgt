import { Form, useCatch, useTransition } from "@remix-run/react";
import { Button } from "~/components/reUsableComponents/reusableFormComp";
import { buttonStyle } from "~/components/utils/utils";
import { ActionFunction, MetaFunction, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { Academic_Year } from "@prisma/client";
import { prisma } from "~/db.server";
export const meta: MetaFunction = () => {
  return {
    title: "Academic Year",
  };
};
export const action: ActionFunction = async ({ request, params }) => {
  const id = await params.academicId;
  // invariant(id, ()=>"ID is missing");
  const formData = await request.formData();
  const acadState = formData.get("acadState") as Academic_Year["type"];
  await prisma.academicYear.update({
    where: { id },
    data: { isCurrent: acadState==="current"?true:false },
  });
  return redirect("/super-admin/forms/academic");
};
export default function () {
  const { submission } = useTransition();
  return (
    <div>
      <Form method={"post"} className={"border-4 p-2 "}>
        <label htmlFor="state">
          {" "}
          <span>Select State </span> <br />
          <select
            name="acadState"
            id="state"
            className={"py-2 px-3 w-full border-2 rounded "}
          >
            <option value={"current"}>Current</option>
            <option value="past">Past</option>
          </select>
        </label>
        <br />
        <br />

        <Button
          transition={!!submission}
          style={buttonStyle}
          type={"submit"}
          value={["Save Changes", "Saving"]}
        />
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <div className={"text-red-600"}>
      {"This User Has not updated his/her status"}
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`${caught.status}`);
}
