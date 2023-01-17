import { ActionFunction, json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useCatch, useLoaderData, useTransition } from "@remix-run/react";
import invariant from "tiny-invariant";
import { optional } from "zod";
import { Button } from "~/components/reUsableComponents/reusableFormComp";
import { buttonStyle, formStyle } from "~/components/utils/utils";
import { prisma } from "~/db.server";
export const meta: MetaFunction = () => {
  return {
    title: "Test",
  };
};
export const action: ActionFunction = async ({ request, params }) => {
  const levelId = params.levelsId;
  // invariant(levelId, ()=>"No levels Id specified");
  const formData = await request.formData();
  const testName = formData.get("test") as Level["name"];
  try {
    const tested = await prisma.test.findMany({
      where: { testName, level: { some: { id: levelId } } },
    });

    if (tested.length) {
      return json({error:"This level has been assigned"})
    } else {
      await prisma.test.upsert({
        where: { testName },
        create: { testName},
        update: { level: { connect: { id: levelId } } },
      });
    }
    return redirect(`/super-admin/forms/levels/${levelId}/test`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("A similar test already exists in the database");
    }
  }
};

export const loader: LoaderFunction = async ({}) => {
  try {
    const level = await prisma.level.findMany({
      where: {
        academic_year: { some: { isCurrent: true } },
      },
      orderBy: { levelName: "asc" },
    });
    return level;
  } catch (error) {}
};

type Level = {
  id: string;
  name: string;
};
export default function () {
  const loaderData = useLoaderData();
  const actionData = useActionData()
  const { submission } = useTransition();
  return (
    <div className="mt-3">
      <h1 className="p-1 bg-pink-50">Create Test</h1>
      <Form reloadDocument method="post" className={formStyle}>
        <div>
          { actionData ? <p>{actionData.error }</p>:""}
          <label htmlFor="test">
            <span>Term</span>
            <br />
            <select
              name="test"
              id="test"
              className="w-full rounded border-2 bg-gray-200 py-2.5 px-2 outline outline-1 "
            >
              <option value="test 1">Test 1</option>
              <option value="test 2">Test 2</option>
              <option value="test 3">Test 3</option>
              <option value="test 4">Test 4</option>
              <option value="test 5">Test 5</option>
              <option value="test 6">Test 6</option>
            </select>
          </label>
          <br />
          <br />
          <Button
            type="submit"
            value={["Submit", "Submiting"]}
            style={buttonStyle}
            transition={!!submission}
          />{" "}
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
