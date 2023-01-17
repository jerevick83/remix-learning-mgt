import {
  Form,
  Link,
  Outlet,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { Button } from "~/components/reUsableComponents/reusableFormComp";
import {
  buttonStyle,
  modulo,
  noModulo,
  tableCap,
  tableHeadStyle,
  tableStyle,
  tableThStyle,
  tableTrStyle,
  td,
} from "~/components/utils/utils";
import { ActionFunction, redirect } from "@remix-run/node";
import { prisma } from "~/db.server";
import { Level } from "@prisma/client";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { create } from "domain";
import invariant from "tiny-invariant";
import { nullable } from "zod";
import { useState } from "react";
export const meta: MetaFunction = () => {
  return {
    title: "Subjects",
  };
};
export const action: ActionFunction = async ({ request, params }) => {
  const levelId = params.levelsId;
  // invariant(levelId, ()=>"No levels Id specified");
  const formData = await request.formData();
  const subjectName = formData.get("name") as string;
  const code = formData.get("code") as string;
  const subjectId = formData.get("subjectId") as string;
  const delSubjId = formData.get("subjectDelId") as string;

  if (!subjectId && !delSubjId) {
    await prisma.subject.create({
      data: {
        subjectName,
        code,
        level: {
          connect: { id: levelId },
        },
      },
    });
  } else if (subjectId && !delSubjId) {
    await prisma.subject.update({
      where: {
        id: subjectId,
      },
      data: {
        subjectName,
        code,
      },
    });
  } else {
    await prisma.subject.delete({
      where: { id: delSubjId! },
    });
  }

  return redirect(`/super-admin/forms/levels/${levelId}/`);
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const levelId = params.levelsId;
  invariant(levelId);
  const url = new URL(request.url).searchParams;
  const subjectId = url.get("subjectId");
  try {
    let searchSubject;
    if (subjectId?.length) {
      searchSubject = await prisma.subject.findUnique({
        where: {
          id: subjectId!,
        },
      });
    } else {
      searchSubject = {};
    }

    const subj = await prisma.subject.findMany({
      where: { level: { some: { id: levelId } } },
      include: {
        level: true,
      },
      orderBy: { subjectName: "asc" },
    });
    return [subj, searchSubject];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
export default function () {
  const { submission } = useTransition();
  const [delState, setDelState] = useState(false);
  const delFunc = () => {
    if (delState) return setDelState(false);
    setDelState(true);
  };
  const data = useLoaderData();
  const { subjectName, id, code } = data[1]
    ? data[1]
    : { subjectName: "", id: "", code: "" };
  return (
    <div className="flex flex-row space-x-4">
      <section className="">
        <h1>Subjects</h1>
        <Form
          reloadDocument
          className={"p-3 space-y-5 w-full border-4 fle"}
          method={"post"}
        >
          <fieldset className={"border-4 p-3"}>
            <legend className={""}>Create Subject</legend>
            <div className={"flex flex-col my-5 w-fit gap-y-3"}>
              <label htmlFor="subjCode" className="w-full">
                <span className={"font-bold whitespace-normal"}>
                  Subject Code:
                </span>
                <br />
                <input
                  type="text"
                  id={"subjCode"}
                  defaultValue={code}
                  name={"code"}
                  className={"p-2 border-2 w-fit rounded"}
                  required
                  placeholder={"Enter the subject code"}
                />
              </label>
              <br />
              <label htmlFor="subjName" className="w-12/12">
                <span className={"font-bold w-full whitespace-nowrap"}>
                  Subject Name:
                </span>
                <br />
                <input
                  type="text"
                  id={"subjName"}
                  defaultValue={subjectName}
                  name={"name"}
                  className={"p-2 border-2 rounded w-full"}
                  required
                  placeholder={"Enter the subject name"}
                />
              </label>
              <input type="text" value={id} hidden readOnly name="subjectId" />
            </div>
          </fieldset>
          <Button
            transition={!!submission}
            style={buttonStyle}
            type={"submit"}
            value={["Create", "Creating"]}
          />
        </Form>
      </section>
      <main className="flex-1">
        <table className={tableStyle}>
          <caption className={tableCap}>Subjects</caption>
          <thead className={tableHeadStyle}>
            <tr className={tableTrStyle}>
              <th className={tableThStyle}>No.</th>
              <th className={tableThStyle}>Code</th>
              <th className={tableThStyle}>Name</th>
              <th className={tableThStyle}>Level</th>
              <th className={tableThStyle + " bg-yellow-400"}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data[0].map((item: string | any, index: number) => {
              const {
                id,
                subjectName,
                code,
                level: [{ levelName }],
              } = item;

              // const lev = level.map((level: string | any) => {
              //   return level;
              // });

              return (
                <tr className={index % 2 ? modulo : noModulo} key={index}>
                  <td className={td}>{index + 1}</td>
                  <td className={td}>{code}</td>
                  <td className={td}>{subjectName}</td>
                  <td className={td}>{levelName}</td>
                  <td
                    className={td + " flex flex-row justify-between space-x-2"}
                  >
                    <Form reloadDocument method="get">
                      <input
                        type="text"
                        readOnly
                        hidden
                        value={id}
                        name={"subjectId"}
                      />
                      <button
                        onClick={() => setDelState(false)}
                        className="underline"
                      >
                        Edit
                      </button>
                    </Form>
                    <Form reloadDocument method="post">
                      <input
                        type="text"
                        readOnly
                        hidden
                        value={delState ? id : ""}
                        name={"subjectDelId"}
                      />
                      <button
                        onClick={() => setDelState(true)}
                        className="underline"
                      >
                        Delete
                      </button>
                    </Form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div>
          <Outlet />
        </div>
      </main>
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
