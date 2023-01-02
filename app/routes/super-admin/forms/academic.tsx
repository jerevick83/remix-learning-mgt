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
  actionTd,
  buttonStyle,
  modulo,
  noModulo,
  tableHeadStyle,
  tableStyle,
  tableThStyle,
  tableTrStyle,
  td,
} from "~/components/utils/utils";
import { ActionFunction, redirect } from "@remix-run/node";
import { prisma } from "~/db.server";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import academic from "~/routes/super-admin/forms/academic";
export const meta: MetaFunction = () => {
  return {
    title: "Academic Year",
  };
};
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const academic_year = formData.get("name") as string;
  try {
    await prisma.academicYear.create({ data: { academic_year } });
    return redirect("/super-admin/forms/academic");
  } catch (e) {
    throw new Error("A similar academic year already exists");
  }
};

export const loader: LoaderFunction = async () => {
  return await prisma.academicYear.findMany({ orderBy: { academic_year: "desc" } });
};

export default function () {
  const { submission } = useTransition();
  const data = useLoaderData();

  return (
    <div className={"flex flex-row justify-start divide-x-8 gap-5"}>
      <section>
        <Form
          reloadDocument
          className={"p-3 space-y-5 border-4"}
          method={"post"}
        >
          <fieldset className={"border-4 p-3"}>
            <legend className={""}>Create Academic Year</legend>
            <div className={"flex flex-col my-5 gap-y-3"}>
              <label htmlFor="name">
                <span className={"font-bold"}>Academic Year:</span>
                <br />
                <input
                  type="text"
                  id={"name"}
                  name={"name"}
                  className={"p-2 border-2 rounded"}
                  required
                  placeholder={"Enter the academic year"}
                />
              </label>
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
      <main className={"pl-4"}>
        <table className={tableStyle}>
          <thead className={tableHeadStyle}>
            <tr className={tableTrStyle}>
              <th className={tableThStyle}>No.</th>
              <th className={tableThStyle}>Academic Year</th>
              <th className={tableThStyle}>Status</th>
              <th className={actionTd}>Actions</th>
            </tr>
          </thead>
          <tbody>
            { data.map((item: string | any, index: number) => {
              const isCurrent = item?.isCurrent?"Current":"Past";
              return<tr className={ index % 2 ? modulo : noModulo } key={ index }>
                <td className={ td }>{ index + 1 }</td>
                <td className={ td }>{ item?.academic_year }</td>
                <td className={ td }>{ isCurrent }</td>
                <td className={ actionTd }>
                  <span className={ "hover:bg-amber-200 hover:px-2" }>
                    <Link prefetch={ "render" } to={ `state/${item.id}` }>
                      change status
                    </Link>
                  </span>
                  <span className={ "hover:bg-amber-200 hover:px-2" }>
                    <Link to={ `level/${item.id}` }>assign level</Link>
                  </span>
                </td>
              </tr>
            })}
          </tbody>
        </table>

        <div className={""}>
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
