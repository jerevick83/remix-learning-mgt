import { ActionFunction, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData, useTransition } from "@remix-run/react";
import { optional } from "zod";
import { Button } from "~/components/reUsableComponents/reusableFormComp";
import { buttonStyle, formStyle } from "~/components/utils/utils";
import { prisma } from "~/db.server";
export const meta: MetaFunction = () => {
  return {
    title: "Test",
  };
};
export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();

    const test = formData.get("test") as string;

    try {
        await prisma.test.create({
            data: {
                name: test,
            },
        });
        return redirect("/super-admin/forms/test");
    } catch (error) {
        if (error instanceof Error) {
            throw new Error( "Similar subject alread exists")
        }
    };
}
export default function () {
  const loaderData = useLoaderData();
  const { submission } = useTransition();
  return (
    <div>
      <h1>Create Test</h1>
      <Form reloadDocument method="post" className={formStyle}>
        <div>
          <label htmlFor="test">
            <span>Test</span>
            <br />
            <select
              name="test"
              id="test"
              className="w-10/12 rounded border-2 bg-gray-200 py-2.5 px-2 outline outline-1 "
            >
              <option value="test 1">Test 1</option>
              <option value="test 2">Test 2</option>
              <option value="test 3">Test 3</option>
            </select>
          </label>
          <br />
          <br />
          <Button
            type="submit"
            value={["Submit", "Submiting"]}
            style={buttonStyle}
            transition={!!submission}
          />
        </div>
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