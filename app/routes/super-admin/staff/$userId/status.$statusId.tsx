import { Button } from "~/components/reUsableComponents/reusableFormComp";
import { buttonStyle } from "~/components/utils/utils";
import { Form, useCatch, useParams, useTransition } from "@remix-run/react";
import { ActionFunction, MetaFunction, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { editUserStatus } from "~/models/user.server";
import { User } from "@prisma/client";
export const meta: MetaFunction = () => {
  return {
    title: "User Status",
  };
};
export const action: ActionFunction = async ({ request, params }) => {
  // invariant(params.statusId, ()=>"No staff ID found");
  const id = params.statusId as User["id"];
  const formData = await request.formData();
  let isActive: boolean;
  const status = formData.get("status");
  if (status === "active") {
    isActive = true;
  } else {
    isActive = false;
  }
  const statusId = formData.get("statusId");
  if (typeof status === "string") await editUserStatus(id, isActive);

  return redirect(`/super-admin/staff/${id}/status/${statusId}`);
};
export default function () {
  const { submission } = useTransition();
  const { statusId } = useParams();
  return (
    <div>
      <Form className={""} method={"post"}>
        <fieldset className={"border-2 px-3 pb-2 rounded "}>
          <legend className={"font-bold"}>Edit Status</legend>
          <div className={"space-x-7 justify-items-start flex flex-wrap"}>
            <label htmlFor="active" className={"space-x-2 font-semibold"}>
              <span>Active</span>
              <input
                type={"radio"}
                name={"status"}
                id={"active"}
                defaultValue={"active"}
              />
            </label>
            <br />
            <label htmlFor="inactive" className={"space-x-2 font-semibold"}>
              <span>Inactive</span>
              <input
                type={"radio"}
                name={"status"}
                id={"inactive"}
                defaultValue={"inactive"}
              />
            </label>
          </div>
        </fieldset>
        <br />
        <input type={"text"} name={"statusId"} defaultValue={statusId} hidden />
        <Button
          transition={!!submission}
          style={buttonStyle}
          type={"submit"}
          value={["Update", "Updating"]}
        />
      </Form>
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
