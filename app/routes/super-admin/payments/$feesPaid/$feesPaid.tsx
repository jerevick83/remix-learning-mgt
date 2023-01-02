import { useCatch, useLoaderData } from "@remix-run/react";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import dayjs from "dayjs";
import { levelId } from "~/components/state_management/zustand";
import {
  Item,
  tableCap,
  tableHeadStyle,
  tableStyle,
  tableThStyle,
  tableTrStyle,
  td,
} from "~/components/utils/utils";
import { prisma } from "~/db.server";
export const meta: MetaFunction = () => {
  return {
    title: "Fees Paid",
  };
};
export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = params.feesPaid;
  const user = await prisma.profile.findUnique({ where: { userId } });

  const sumAmount = await prisma.paymentDetail.aggregate({
    _sum: { amount: true },
    where: { userId },
  });
  const levelPmt = await prisma.levelUser.aggregate({
    where: { userId },
    _sum: { feesBalance: true },
  });
  const paymentDet = await prisma.paymentDetail.findMany({
    where: { userId },
    include: { level: true },
    orderBy: { paymentDate: "asc" },
  });
  return [paymentDet, levelPmt, sumAmount, user];
};
export default function () {
  const loaderData = useLoaderData();
  const stateLevelId = levelId((state) => state.levelId);
  const retData = loaderData[0]
    .filter((item: Item) => item.level.id === stateLevelId)
    .map((item: Item, index: number) => (
      <tr key={index}>
        <td className={td}>{index + 1}</td>
        <td className={td}>{item.level.levelName}</td>
        <td className={td + " text-right"}>{item.amount.toLocaleString()}</td>
        <td className={td}>{item.payingSlipNumber}</td>
        <td className={td}>
          {dayjs(item.paymentDate).format("DD - MMM - YYYY")}
        </td>
      </tr>
    ));
  return (
    <div className="w-full my-5">
      <table className={tableStyle +""}>
        <caption className={tableCap}>
          <span className="capitalize">
            {" "}
            <span>{loaderData[3].firstname} </span>{" "}
            <span>{loaderData[3].other_name}</span>{" "}
            <span>{loaderData[3].lastname}</span>{" "}
            <span>Fees Payments history</span>
          </span>
          <br />
        </caption>
        <thead className={tableHeadStyle}>
          <tr className={tableTrStyle +""}>
            <th className={tableThStyle}>No.</th>
            <th className={tableThStyle}>Level</th>
            <th className={tableThStyle}>Amount (SLE)</th>
            <th className={tableThStyle}>Paying Slip No.</th>
            <th className={tableThStyle}>Payment Date</th>
          </tr>
        </thead>
        <tbody>{retData}</tbody>
      </table>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <div className={"text-red-600"}>
      {"This User Has not updated his/her status"}
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`${caught.status}`);
}
