import { useCatch } from "@remix-run/react";
import { MetaFunction } from "@remix-run/server-runtime";
export const meta: MetaFunction = () => {
  return {
    title: "Results",
  };
};
export default function ResultsTable() {
  return <div>Result Table</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
