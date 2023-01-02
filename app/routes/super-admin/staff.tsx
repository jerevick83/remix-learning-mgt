import { Form, Link, Outlet, useCatch, useLoaderData } from "@remix-run/react";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { deleteUserByEmail, getAllUsers } from "~/models/user.server";
import {
  actionTd,
  deleteButton,
  modulo,
  noModulo,
  tableCap,
  tableHeadStyle,
  tableStyle,
  tableThStyle,
  tableTrStyle,
  td,
  viewLink,
} from "~/components/utils/utils";
import { ActionFunction, redirect } from "@remix-run/node";
export const meta: MetaFunction = () => {
  return {
    title: "Staff",
  };
};
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("deleteUser") as string;
  await deleteUserByEmail(email);
  return redirect("/super-admin/users");
};
export const loader: LoaderFunction = async () => {
  return await getAllUsers();
};

export default function Users({}) {
  const users = useLoaderData();
  const userD = users.map((user: any, index: any) => {
    const { role, profile, id, isActive, email } = user;
    return (
      <tr key={id} className={index % 2 === 1 ? modulo : noModulo}>
        <td className={td}>{profile?.firstname}</td>
        <td className={td}>{profile?.other_name}</td>
        <td className={td}>{profile?.lastname}</td>
        <td className={td}>{role}</td>
        <td className={td}>{isActive ? "Active" : "Inactive"}</td>
        <td className={actionTd + " justify-between align-middle"}>
          <span className="mt-0.5">
            <Link prefetch={"intent"} to={id} className={viewLink}>
              View{" "}
            </Link>
          </span>
          <span className={deleteButton}>
            <Form method={"post"}>
              <input
                type="text"
                name={"deleteUser"}
                defaultValue={email}
                hidden
              />
              <button className={"deleteButton"}>Delete</button>
            </Form>
          </span>
        </td>
      </tr>
    );
  });

  return (
    <>
      <div className={"flex space-x-2 flex-wrap overflow-auto"}>
        <div className={"flex-1 mr-2 p-2 "}>
          <table className={tableStyle}>
            <caption className={tableCap}>Administrative Staff</caption>
            <thead className={tableHeadStyle}>
              <tr className={tableTrStyle}>
                <th className={tableThStyle}>Firstname</th>
                <th className={tableThStyle}>Other Name(s)</th>
                <th className={tableThStyle}>Lastname</th>
                <th className={tableThStyle}>Role</th>
                <th className={tableThStyle}>Status</th>
                <th className={tableThStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>{userD}</tbody>
          </table>
        </div>
        <main className={"flex-1 mb-5"}>
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
    return <div>Note not found</div>;
  }

  throw new Error(`${caught.status}`);
}
