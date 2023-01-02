import { buttonStyle, formStyle } from "~/components/utils/utils";
import {
  Button,
  FormInput,
  Select,
} from "~/components/reUsableComponents/reusableFormComp";
import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { ActionFunction, redirect } from "@remix-run/node";
import { prisma } from "~/db.server";
import { Level, User } from "@prisma/client";
import { json, LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { requireUser } from "~/session.server";
import { createUser } from "~/models/user.server";

export const meta: MetaFunction = () => {
  return {
    title: "Add User",
  };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as User["email"];
  const role = formData.get("role") as User["role"];
  const levelId = formData.get("level") as Level["levelName"];
  const acadYr = formData.get("acadYr") as Level["levelName"];
  try {
    const userRet = await createUser(email, role);

    return redirect("/super-admin/add_user"), json({ success: true });
  } catch (errors) {
    if (errors instanceof Error)
      throw new Error("Some went wrong" + " " + errors.message);
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  if (user?.role !== "SUPER_ADMIN") return redirect("/");
  return null;
};
export default function Add_user() {
  const roleList = ["ADMIN", "SUPER_ADMIN", "PUPIL", "TEACHER"];
  const classList = [
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
  const transition = useTransition();
  const actionData = useActionData();

  return (
    <div className={"mt-"}>

      <Form
        reloadDocument
        method={"post"}
        className={
          "flex sm:justify-items-start  sm:flex-col flex-wrap space-y-4"
        }
      >
        <fieldset className={formStyle}>
          <legend className={"capitalize text-3xl text-gray-500 px-2"}>
            Add User
          </legend>
          <FormInput
            required={false}
            min={""}
            value=""
            max={""}
            id={"email"}
            type={"text"}
            name={"email"}
            label={"Email"}
          />
          <Select
            defaultValue=""
            label={"Role"}
            id={"role"}
            name={"role"}
            option={roleList}
          />
        </fieldset>
        <Button
          transition={!!transition.submission}
          style={buttonStyle}
          type={"submit"}
          value={["Save", "saving"]}
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
