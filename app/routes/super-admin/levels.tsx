import {
  Form,
  Outlet,
  useActionData,
  useCatch,
  useTransition,
} from "@remix-run/react";
import {
  Button,
  classList,
  Select,
  SelectOptions,
} from "~/components/reUsableComponents/reusableFormComp";
import { ValidatedForm, validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { active, buttonStyle } from "~/components/utils/utils";
import { ActionFunction, json, MetaFunction, redirect } from "@remix-run/node";
import { levelCreate } from "~/models/user.server";
import { prisma } from "~/db.server";
export const meta: MetaFunction = () => {
  return {
    title: "Levels",
  };
};
const validate = withZod(
  z.object({
    name: z.string().min(1, "Select an option"),
  })
);

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const levelName = formData.get("name") as string;
  const searchLevel = await prisma.level.findMany({ where: { levelName } });

  if (searchLevel.length) {
    return json({ error: "Similar level has been created" });
  }
  await levelCreate(levelName);

  return redirect("/super-admin/levels");
};
export default function Course() {
  const transition = useTransition();
  const actionData = useActionData();
  const option = [
    "NURSERY_1",
    "NURSERY_2",
    "NURSERY_3",
    "CLASS_1",
    "CLASS_2",
    "CLASS_3",
    "CLASS_4",
    "CLASS_5",
    "CLASS_6",
  ].sort();

  return (
    <>
      <div className={"flex"}>
        <div className={"flex-1"}>
          {actionData ? <p className="text-red-700">{actionData.error}</p> : ""}
          <Form className={"space-x-4 flex"} method={"post"}>
            <label htmlFor="name">
              <span>Choose Level</span>
              <select
                name="name"
                id="name"
                className="w-10/12 px-2 py-1 bg-gray-200 border-2 rounded outline outline-1"
              >
                {option.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <Button
              transition={!!transition?.submission}
              style={buttonStyle + " self-end"}
              type={"submit"}
              value={["Save", "Saving"]}
            />
          </Form>
        </div>
        <main className={"flex-1"}>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div className={"text-red-600"}>{error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Page not found</div>;
  }

  throw new Error(`${caught.status}`);
}
