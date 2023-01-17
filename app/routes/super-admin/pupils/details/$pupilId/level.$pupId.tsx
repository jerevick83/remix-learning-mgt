import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { useCatch } from "@remix-run/react/dist/errorBoundaries";
import { ActionFunction, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { prisma } from "~/db.server";
import { Button } from "~/components/reUsableComponents/reusableFormComp";
import { buttonStyle } from "~/components/utils/utils";
import invariant from "tiny-invariant";
export const meta: MetaFunction = () => {
  return {
    title: "Level",
  };
};
export const action: ActionFunction = async ({ request, params }) => {
  const pupilId = params.pupilId;
  // invariant(pupilId,()=> "ID cannot be empty");
  const formData = await request.formData();
  const levelId = formData.get("level") as string;

  try {
    await prisma.user.update({
      where: { id: pupilId },
      data: { level: { create: { level: { connect: { id: levelId } } } } },
    });
    return redirect(`super-admin/pupils/details/${pupilId}/level/${pupilId}`);
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
  }
  return redirect(`super-admin/pupils/details/${pupilId}/level/${pupilId}`);
};
export const loader: LoaderFunction = async () => {
  try {
    return await prisma.level.findMany({
      where: {
        academic_year: { some:  { isCurrent: true }  },
      },
      orderBy: { levelName: "asc" },
    });
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
  }
};

export default function () {
  const loaderData = useLoaderData();
  const { submission } = useTransition();
  return (
    <div>
      <Form method="post">
        <label htmlFor="level">
          <span className="font-bold">
            Assign Level <br />
          </span>
          <select name="level" id="level" className="px-3 py-2 rounded">
            {loaderData.map((item: string | any, index: number) => (
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
          type="submit"
          value={["save", "saving"]}
          style={buttonStyle}
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
