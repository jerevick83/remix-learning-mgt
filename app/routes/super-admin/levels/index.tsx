import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { getAllCourses } from "~/models/user.server";
import { useCatch, useLoaderData } from "@remix-run/react";
export const meta: MetaFunction = () => {
  return {
    title: "Level",
  };
};
export const loader: LoaderFunction = async () => {
  return await getAllCourses();
};

export default function Index() {
  const levels = useLoaderData();

  const courseList = levels.map((course: string | any, index: number) => {
    return (
      <li key={index} className={"space-x-5"}>
        <span className={"font-bold"}>{index + 1}:</span>
        <span>{course?.levelName}</span>
      </li>
    );
  });
  return (
    <>
      <div>
        <h1>Class Levels</h1>
        <ol className={"list-item"}>{courseList}</ol>
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
    return <div>Page not found</div>;
  }

  throw new Error(`${caught.status}`);
}
