import { useCatch } from "@remix-run/react";
import { MetaFunction } from "@remix-run/server-runtime";
export const meta: MetaFunction = () => {
  return {
    title: "Grades",
  };
};
export default function Grades() {
  return <>
    <div>Grades</div>
  </>;
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