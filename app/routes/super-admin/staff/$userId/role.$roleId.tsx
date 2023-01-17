import {
  Button,
  Select,
  SelectOptions,
} from "~/components/reUsableComponents/reusableFormComp";
import { buttonStyle } from "~/components/utils/utils";
import { useCatch, useParams, useTransition } from "@remix-run/react";
import { ActionFunction, MetaFunction, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { User } from "@prisma/client";
import { ValidatedForm, validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
export const meta: MetaFunction = () => {
  return {
    title: "User Role",
  };
};
const validator = withZod(
  z.object({
    role: z.string().min(1, "select an option"),
  })
);
export const action: ActionFunction = async ({ request, params }) => {
  // invariant(params.roleId,()=> "No staff ID found");
  const formData = await request.formData();
  const id = params.roleId;
  const { data, error } = await validator.validate(formData);
  if (error) return validationError(error);
  const role = data?.role as User["role"];
  await prisma.user.update({ where: { id }, data: { role } });

  return redirect(`/super-admin/users/users/${id}/role/${id}`);
};

export default function () {
  const { submission } = useTransition();
  const { statusId } = useParams();
  return (
    <div>
      <ValidatedForm validator={validator} className={""} method={"post"}>
        <fieldset className={"border-2 px-3 pb-2 rounded "}>
          <legend className={"font-bold"}>Edit Role</legend>
          <Select
            label={"Role"}
            id={"role"}
            name={"role"}
            defaultValue={""}
            option={["ADMIN", "SUPER_ADMIN", "PUPIL", "TEACHER"]}
          />
        </fieldset>
        <br />
        <Button
          transition={!!submission}
          style={buttonStyle}
          type={"submit"}
          value={["Update", "Updating"]}
        />
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
