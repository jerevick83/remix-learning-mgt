import { Form, useCatch, useLoaderData, useTransition } from "@remix-run/react";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import { Button } from "~/components/reUsableComponents/reusableFormComp";
import {
  buttonStyle,
  Item,
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
    title: "Payment",
  };
};
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url).searchParams;
  // invariant(userId,()=>"Not logged in user");
  let levelId = url.get("levelId") as string;

  levelId = levelId ? levelId : "";
  const level = await prisma.levelUser.findMany({
    where: { userId },
    select: { level: true },
    orderBy: { level: { levelName: "asc" } },
  });
  const invPmt = await prisma.level.findUnique({
    where: { id: levelId },
    select: { invoice: true },
  });

  const sumAmount = await prisma.paymentDetail.aggregate({
    _sum: { amount: true },
    where: { userId, levelId },
  });
  const levelPmt = await prisma.levelUser.findMany({
    where: { userId, levelId },
  });

  const sumAmt = sumAmount?._sum?.amount ? sumAmount?._sum?.amount! : 0;
  const invAmt = invPmt?.invoice.length ? invPmt.invoice[0].amount! : 0;
  const balance = invAmt - sumAmt;
  if (levelId) {
    const updateFeesBal = await prisma.levelUser.update({
      where: { levelId_userId: { levelId, userId } },
      data: { feesBalance: balance },
    });
    if (updateFeesBal.feesBalance > 0) {
      await prisma.levelUser.update({
        where: { levelId_userId: { levelId, userId } },
        data: { paymentStatus: "INCOMPLETE" },
      });
    } else {
      await prisma.levelUser.update({
        where: { levelId_userId: { levelId, userId } },
        data: { paymentStatus: "COMPLETED" },
      });
    }
    const payment = await prisma.payment.findMany({
      where: { paymentDetails: { some: { userId, levelId } } },
      include: {
        paymentDetails: {
          include: {
            level: { include: { payment: { where: { userId } } } },
            academic_year: true,
            user: { include: { level: { where: { levelId } } } },
          },
        },
      },
    });

    return [
      payment,
      level,
      updateFeesBal.feesBalance,
      sumAmount?._sum?.amount!,
    ];
  }

  return [[], level,0,0];
};

export type PaymentDetails = {
  paymentDetails: [
    {
      level: { levelName: string };
      academic_year: { academic_year: string };
      bankName: string;
      payingSlipNumber: string;
      amount: number;
      paymentDate: Date;
      createdAt: Date;
    }
  ];
};
export default function () {
  const loaderData = useLoaderData();
  const { submission } = useTransition();

  const finalRet = loaderData[0].flatMap(
    (item: PaymentDetails, index: number) => {
      console.log("====================================");
      console.log(item);
      console.log("====================================");
      const {
        level: { levelName },
        academic_year: { academic_year },
        bankName,
        payingSlipNumber,
        paymentDate,
        amount,
        createdAt,
      } = item.paymentDetails[0]
        ? item.paymentDetails[0]
        : {
            level: { levelName: "" },
            academic_year: { academic_year: "" },
            bankName: "",
            payingSlipNumber: "",
            paymentDate: "",
            amount: "",
            createdAt: "",
          };

      return (
        <tr key={index} className="divide-x-8 divide-y-8">
          <td className={td}>{index + 1}.</td>
          <td className={td}>{bankName}</td>
          <td className={td}>{payingSlipNumber}</td>
          <td className={td + " text-right"}>
            {amount.toLocaleString("en-US")}
          </td>
          <td className={td}>{academic_year}</td>
          <td className={td}>{levelName}</td>
          <td className={td}>
            {dayjs(paymentDate).format("ddd   DD-MMM-YYYY")}
          </td>
          <td className={td}>{dayjs(createdAt).format("ddd   DD-MM-YYYY")}</td>
        </tr>
      );
    }
  );

  return (
    <div className="mx-5">
      <Form className="my-5 space-x-4" method="get">
        <label htmlFor="levelId">
          <span className="font-bold">Select Level: </span>
          <br />
          <select
            name="levelId"
            id=""
            className="w-6/12 rounded border-2 bg-gray-200 py-2.5 px-2 outline outline-1"
          >
            {loaderData[1].map((item: Item, index: number) => {
              const { levelName, id } = item.level;
              return (
                <option value={id} key={index}>
                  {levelName}
                </option>
              );
            })}
          </select>
        </label>

        <Button
          value={["Search", "Searching"]}
          transition={!!submission}
          type="submit"
          style={buttonStyle}
        />
      </Form>
      <table className={tableStyle}>
        <thead className={tableHeadStyle}>
          <tr className={tableTrStyle}>
            <th className={tableThStyle + " border-1"}>No.</th>
            <th className={tableThStyle + " border-1"}>Bank Name</th>
            <th className={tableThStyle + " border-1"}>Paying-Slip Number</th>
            <th className={tableThStyle + " border-1"}>Amount Paid (SLE)</th>
            <th className={tableThStyle + " border-1"}>Academic Year</th>
            <th className={tableThStyle + " border-1"}>Level</th>
            <th className={tableThStyle + " border-1"}>Payment Date</th>
            <th className={tableThStyle + " border-1"}>Posted At</th>
          </tr>
        </thead>
        <tbody>
          {finalRet}
          <tr className="border border-black border-1 w-fit">
            <td className=" whitespace-nowrap">Total Payment</td>
            <td></td>
            <td></td>
            <td
              className={"text-right font-bold text-xl underline pr-4"}
              style={{ textDecorationStyle: "double" }}
            >
              {loaderData[3] ? loaderData[3].toLocaleString() : ""}
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr className="border border-black border-1 w-fit">
            <td className=" whitespace-nowrap">Fees Balance</td>
            <td></td>
            <td></td>
            <td>
              {loaderData[2] != 0 ? (
                <p
                  className={"text-right font-bold text-xl underline pr-4"}
                  style={{ textDecorationStyle: "double" }}
                >
                  {loaderData[2].toLocaleString()}
                </p>
              ) : (
                <p className="pr-4 text-xl font-light text-right no-underline">
                  Nill
                </p>
              )}
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
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
