import {
  Form,
  Link,
  useCatch,
  useLoaderData,
  useLocation,
  useParams,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import dayjs from "dayjs";
import { type } from "os";
import { useState } from "react";
import { Table } from "react-bootstrap";
import invariant from "tiny-invariant";
import { Button } from "~/components/reUsableComponents/reusableFormComp";
import { levelId } from "~/components/state_management/zustand";
import {
  buttonStyle,
  tableCap,
  tableHeadStyle,
  tableStyle,
  tableThStyle,
  tableTrStyle,
  td,
} from "~/components/utils/utils";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
export const meta: MetaFunction = () => {
  return {
    title: "Fees Paid",
  };
};
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url).searchParams;
  let levelId = url.get("levelId") as string;
  let academic_year_id = url.get("acadYrId") as string;
  invariant(userId);
  const acadYr1 = await prisma.academicYear.findMany({
    where: { isCurrent: true },
  });

  const levId = await prisma.level.findMany({
    where: {
      levelName: "NURSERY_1",
      academic_year: { some: { isCurrent: true } },
    },
  });

  levelId = levelId ? levelId : levId[0].id;
  academic_year_id = academic_year_id ? academic_year_id : acadYr1[0].id;

  const users = await prisma.user.findMany({
    where: {
      payment: { some: { levelId, academic_year_id } },
      role: "PUPIL",
    },
    include: {
      profile: true,
      level: { where: { levelId } },
      payment: { where: { levelId } },
    },
  });

  const level = await prisma.level.findMany({
    orderBy: { levelName: "asc" },
  });
  const acadYr = await prisma.academicYear.findMany({});
  return [users, level, acadYr];
};
export type PayItem = {
  profile: {
    firstname: string;
    other_name: string;
    lastname: string;
    gender: string;
  };
  payment: [{}];

  amount: number;
  userId: string;
  levelName: string;
  academic_year: string;
  id: string;

  level: [{ feesBalance: number }];
};
type CurrentValue = {
  amount: number;
};
export default function () {
  const loaderData = useLoaderData();
  const { submission } = useTransition();
  const setLevelId = levelId((state) => state.getLevelId);

  const returnedData = loaderData[0]
    ? loaderData[0].map((item: PayItem, index: number) => {
        const {
          amount,
          payment,
          profile: { firstname, other_name, lastname },
          id,
          level: [{ feesBalance }],
        } = item;
        const feesPaid = payment.reduce((accumulator: number, currentValue) => {
          return accumulator + currentValue.amount;
        }, 0);

        return (
          <tr key={index} className="divide-x-8 divide-y-8">
            <td className={td}>{index + 1}</td>
            <td className={td}>
              <span>{firstname} </span> <span>{other_name}</span>{" "}
              <span>{lastname}</span>
            </td>
            <td className={td + " text-right"}>{feesPaid.toLocaleString()}</td>
            <td className={td + " text-right"}>
              {feesBalance.toLocaleString()}
            </td>
            <td className={td}>
              <Link prefetch="intent" to={id}>
                View
              </Link>
            </td>
          </tr>
        );
      })
    : "";

  return (
    <div className="mx-5">
      <Form className="flex w-full my-5 space-x-4" method="get">
        <label htmlFor="levelId" className="w-fit">
          <span className="font-bold">Select Level: </span>
          <br />
          <select
            name="levelId"
            id=""
            className="w-fit rounded border-2 bg-gray-200 py-2.5 px-2 outline outline-1"
            onChange={(e) => setLevelId(e.target.value)}
          >
            <option value="" selected>
              --Select level--
            </option>
            {loaderData[1].map((item: PayItem, index: number) => (
              <option key={index} value={item.id}>
                {item.levelName}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="levelId">
          <span className="font-bold">Select Academic Year: </span>
          <br />
          <select
            name="acadYrId"
            id=""
            className="w-fit rounded border-2 bg-gray-200 py-2.5 px-2 outline outline-1"
          >
            <option value="" selected>
              --Select Academic Year--
            </option>
            {loaderData[2].map((item: PayItem, index: number) => (
              <option key={index} value={item.id}>
                {item.academic_year}
              </option>
            ))}
          </select>
        </label>

        <Button
          value={["Search", "Searching"]}
          transition={!!submission}
          type="submit"
          style={buttonStyle + " self-end"}
        />
      </Form>
      <Table striped bordered hover className="caption-top">
        <caption className={tableCap}>Payments</caption>
        <thead className={tableHeadStyle}>
          <tr className={tableTrStyle}>
            <th className={tableThStyle + " border-1"}>No.</th>
            <th className={tableThStyle + " border-1"}>Name</th>
            <th className={tableThStyle + " border-1"}>Total Payment (SLe)</th>
            <th className={tableThStyle + " border-1"}>Fees Balance (SLe)</th>
            <th className={tableThStyle + " border-1"}>View</th>
          </tr>
        </thead>
        <tbody>{returnedData}</tbody>
      </Table>
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
