import { LoaderFunction } from "@remix-run/server-runtime";
import { getAllUsers } from "~/models/user.server";
import { useLoaderData } from "@remix-run/react";


export const loader: LoaderFunction = async () => {
  return await getAllUsers();
};
export const UserTable = (input: string[]) => {
  const users: string[] = useLoaderData();
  console.log(typeof users);
  return (
    <div className={""}>
      <table>
        <thead>
        <tr>
          <th>Firstname</th>
          <th>Other Name</th>
          <th>Lastname</th>
          <th>Gender</th>
          <th>Date of Birth</th>
        </tr>
        </thead>
        <tbody>
        {users.map((item, index) => {
          return <tr>
            <td>{item}</td>
          </tr>;
        })}
        </tbody>
      </table>
    </div>
  );
};