import {
  Form,
  Link,
  NavLink,
  Outlet,
  useCatch,
  useLoaderData,
} from "@remix-run/react";
import {
  actionTd,
  active,
  dashboardMain,
  inactive,
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
import { BsFillPersonPlusFill } from "react-icons/bs";
import { requireUserId } from "~/session.server";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { getAllPupils } from "~/models/pupils.server";
import { ActionFunction, redirect } from "@remix-run/node";
import { deletePupilById } from "~/models/user.server";
import { Profile, User } from "@prisma/client";

export const meta: MetaFunction = () => {
  return {
    title: "Pupils",
  };
};
export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  console.log(data.get("deleteRec"));
  const id = data.get("deleteRec") as string;

  return redirect("/super-admin/pupils");
};
export const loader: LoaderFunction = async ({ request }) => {
  const id = await requireUserId(request);

  return await getAllPupils();
};
export default function Pupils() {
  const loaderData = useLoaderData();
  const retData = loaderData.map((pupil: any, index: number) => {
    const {
      profile: { firstname, lastname, other_name, dob },
    } = pupil
      ? pupil
      : { profile: { firstname: "", lastname: "", other_name: "", dob: "" } };
    return (
      <tr key={index} className={index % 2 === 1 ? modulo : noModulo}>
        <td className={td}>{firstname}</td>
        <td className={td}>{other_name}</td>
        <td className={td}>{lastname}</td>
        <td className={actionTd}>
          <span>
            <Link
              prefetch="intent"
              to={`details/${pupil?.id}`}
              className={viewLink}
            >
              View
            </Link>
          </span>
          <span>
            <Form method={"post"}>
              <input
                type="text"
                name={"deleteRec"}
                hidden
                readOnly
                value={pupil?.id}
              />
              <button className={"bg-red-600 py-1 text-gray-300 px-2 rounded"}>
                Delete
              </button>
            </Form>
          </span>
        </td>
      </tr>
    );
  });
  return (
    <div className="relative mt-48">
      <nav className="static">
        <ul className={"space-x-5 flex w-full "}>
          <li className={"w-fit list-none"}>
            <NavLink
              className={(navData) => (navData.isActive ? active : inactive)}
              to={"/super-admin/add_user"}
            >
              <span>
                <BsFillPersonPlusFill size={26} />
              </span>
              <span className={"flex align-baseline"}>Add Pupil</span>
            </NavLink>
          </li>
          <li className={"w-fit list-none"}>
            <NavLink
              className={(navData) => (navData.isActive ? active : inactive)}
              to={"grades.tsx"}
            >
              <span>
                <BsFillPersonPlusFill size={26} />
              </span>
              <span className={"flex align-baseline"}>Grades</span>
            </NavLink>
          </li>
          <li className={"w-fit list-none"}>
            <NavLink
              className={(navData) => (navData.isActive ? active : inactive)}
              to={"$pupil"}
            >
              <span>
                <BsFillPersonPlusFill size={26} />
              </span>
              <span className={"flex align-baseline"}>Grades</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className={"flex flex-col"}>
        <table className={tableStyle}>
          <caption className={tableCap}>Pupils</caption>
          <thead className={tableHeadStyle}>
            <tr className={tableTrStyle}>
              <th className={tableThStyle}>Firstname</th>
              <th className={tableThStyle}>Other Name</th>
              <th className={tableThStyle}>Lastname</th>
              <th
                className={
                  tableThStyle +
                  " bg-orange-300 text-black text-base text-center"
                }
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>{retData}</tbody>
        </table>
        <hr />
      </div>
      <hr />
      <main className={dashboardMain}>
        <Outlet />
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
