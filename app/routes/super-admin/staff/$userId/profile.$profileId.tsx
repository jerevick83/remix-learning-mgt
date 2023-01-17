import { Form, useCatch, useLoaderData, useTransition } from "@remix-run/react";
import { Button } from "~/components/reUsableComponents/reusableFormComp";
import { buttonStyle } from "~/components/utils/utils";
import { ActionFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import { updateUserLevel } from "~/models/user.server";
import { Level } from "@prisma/client";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { prisma } from "~/db.server";
import { n } from "msw/lib/glossary-dc3fd077";
export const meta: MetaFunction = () => {
  return {
    title: "User Level",
  };
};
export const action: ActionFunction = async ({ request, params }) => {
  // invariant(params.profileId, ()=> "No staff ID found");
  const formData = await request.formData();
  const id = params.profileId;
  const status = formData.get("status");
  const level = formData.get("levelId") as Level["id"];

  await prisma.user.update({
    where: { id },
    data: {
      level: { create: { level: { connect: { id: level } } } },
    },
  });
  return null;
};
export const loader: LoaderFunction = async () => {
  const level = await prisma.level.findMany({
    where: { academic_year: { some: { isCurrent: true } } },
    orderBy: { levelName: "asc" },
  });

  return level;
};
export default function () {
  const { submission } = useTransition();
  const loaderData = useLoaderData();
  return (
    <div className={""}>
      <Form className={"mx-4"} method={"post"}>
        {!loaderData.length ? (
          <p>No level Available, please create one</p>
        ) : (
          <div>
            <label htmlFor="class">
              <span className={"font-bold"}>Assign Class:</span> <br />
              <select
                id={"assignClass"}
                name={"levelId"}
                className={"p-2 w-full rounded"}
              >
                {loaderData.map((item: any, index: number) => (
                  <option key={index} value={item.id}>
                    {item.levelName}
                  </option>
                ))}
              </select>
            </label>
            <br />
            <br />
            <Button
              transition={!!submission}
              style={buttonStyle}
              type={"submit"}
              value={["Update", "Updating"]}
            />
          </div>
        )}
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
