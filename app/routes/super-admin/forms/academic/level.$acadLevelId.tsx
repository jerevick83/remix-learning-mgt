import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import {
  Button,
  classList,
  Select,
} from "~/components/reUsableComponents/reusableFormComp";
import { buttonStyle, Item } from "~/components/utils/utils";
import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { Level } from "@prisma/client";
import { prisma } from "~/db.server";
import invariant from "tiny-invariant";
export const meta: MetaFunction = () => {
  return {
    title: "Academic Level",
  };
};
export const action: ActionFunction = async ({ request, params }) => {
  const acadId = params.acadLevelId;
  // invariant(acadId, ()=>"id is missing");
  const formData = await request.formData();
  const levelId = formData.get("levelId") as Level["id"];

  try {
    const searchLevel = await prisma.academicYear.findMany({
      where: { id: acadId, level: { some: { id: levelId } } },
    });
    console.log('====================================');
    console.log(searchLevel);
    console.log('====================================');
    if (searchLevel.length) {
      return json({ errors: "Similar level has been assigned" });
    }
     await prisma.academicYear.update({
      where: { id: acadId },
      data: { level: { connect: { id: levelId } } },
    });
    return redirect("/super-admin/forms/academic/level/" + acadId);
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

export const loader: LoaderFunction = async () => {
  return await prisma.level.findMany({orderBy:{levelName:"asc"}});
};

export default function () {
  const { submission } = useTransition();
  const data = useLoaderData();
  const actionData = useActionData();
  return (
    <div>
      {actionData ? <p className="text-red-700">{actionData.errors}</p> : ""}
      <Form method={"post"}>
        <label htmlFor="level">
          <span>
            Assign Level <br />
          </span>
          <select
            name="levelId"
            id="level"
            className={actionData?"py-2 px-3 w-full border-2 rounded outline-red-700 outline":"py-2 px-3 w-full border-2 rounded "}
          >
            {data.map((item: Item, index: number) => {
              return (
                <option value={item.id} key={index}>
                  {item.levelName}
                </option>
              );
            })}
          </select>
        </label>{" "}
        <br /> <br />
        <Button
          transition={!!submission}
          style={buttonStyle}
          type={"submit"}
          value={["Add", "Adding"]}
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
