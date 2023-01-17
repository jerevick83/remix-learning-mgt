
import {
  Form,
  NavLink,
  Outlet,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/server-runtime";
import { BsBank2, BsFillPiggyBankFill } from "react-icons/bs";
import invariant from "tiny-invariant";
import {
  Button,
  FormInput,
} from "~/components/reUsableComponents/reusableFormComp";
import {
  active,
  buttonStyle,
  formStyle,
  inactive,
  Item,
  size,
} from "~/components/utils/utils";
import { prisma } from "~/db.server";
import { ProfileProp } from "~/models/pupils.server";
import { requireUser, requireUserId } from "~/session.server";
export const meta: MetaFunction = () => {
  return {
    title: "Payments",
  };
};
export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  // invariant(userId, "no logged in user");
  const formData = await request.formData();
  const levelId = formData.get("levelId") as string;
  const acadYrId = formData.get("acadYrId") as string;
  const payingSlipNumber = formData.get("payingSlipNumber") as string;
  const amount = Number(formData.get("amount"));
  const bankName = formData.get("bankName") as string;
  const paymentDate = new Date(formData.get("paymentDate"));

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const payingSlip = await prisma.paymentDetail.findMany({
    where: { payingSlipNumber },
  });
  if (payingSlip.length > 0) {
    return json({
      error: "A similar paying-in slip number is already available",
    });
  }
const pupil = await prisma.payment.create({
      data: {
        paymentDetails: {
          create: {
            bankName,
            amount,
            paymentDate,
            payingSlipNumber,
            pupilName: `${profile?.firstname} ${profile?.other_name} ${profile?.lastname}`,
            level: { connect: { id: levelId! } },
            academic_year: { connect: { id: acadYrId! } },
            user: { connect: { id: userId! } },
          },
        },
      },
    });

  await prisma.$transaction(async (params) => {


    const invAmt = await params.invoice.findMany({
      where: {
        level: {
          some: { id: levelId, academic_year: { some: { id: acadYrId } } },
        },
      },
    });

    const payments = await params.paymentDetail.aggregate({
      where: { levelId, userId },
      _sum: { amount: true },
    });

    const feesBalance = await params.levelUser.update({
      where: {
        levelId_userId: { userId, levelId },
      },
      data: {
        feesBalance: invAmt[0].amount - payments._sum.amount!,
      },
    });

    if (feesBalance.feesBalance === 0 || feesBalance.feesBalance < 0) {
      await params.levelUser.update({
        where: {
          levelId_userId: { userId, levelId },
        },
        data: {
          paymentStatus: "COMPLETED",
        },
      });
    }
  });

  return redirect("/pupil/payment");
};
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  invariant(userId, "no logged in user");
  const academicYr = await prisma.academicYear.findMany({
    orderBy: { academic_year: "asc" },
    where: { level:{some:{user:{some:{userId}}}}},
  });
  const level = await prisma.levelUser.findMany({
    orderBy: { level: { levelName: "asc" } },
    where: { userId },
    include: { level: true },
  });

  return [academicYr, level];
};

export default function () {
  const actionData = useActionData();
  const loaderData = useLoaderData();
  const { submission } = useTransition();
  return (
    <div>
      <nav className="mb-5 w-fit">
        <NavLink
          className={(navData) =>
            navData.isActive ? active + " w-fit" : inactive + " w-fit"
          }
          to={"/pupil/payment/"}
        >
          <span>
            <BsBank2 size={size} />
          </span>
          <span className="base-end">View Payments</span>
        </NavLink>
      </nav>
      <Form method="post">
        <fieldset className={formStyle}>
          <legend>Payment Form</legend>
          <label htmlFor="bankName">
            <span>Bank Name</span>
            <br />
            <input
              type="text"
              name="bankName"
              id="bankName"
              className="w-10/12 px-2 py-1 bg-gray-200 rounded outline outline-1"
              required
              placeholder="Enter the bank name"
            />
          </label>
          <label htmlFor="payingSlipNumber">
            <span>Bank Paying-Slip Number</span>
            <br />
            <input
              type="text"
              name="payingSlipNumber"
              id="payingSlipNumber"
              className={
                actionData
                  ? "w-10/12 px-2 py-1 bg-gray-200 rounded outline outline-1 outline-red-700"
                  : "w-10/12 px-2 py-1 bg-gray-200 rounded outline outline-1 "
              }
              placeholder="Enter the payment slip number"
              required
            />{" "}
            <br />
            {actionData ? (
              <p className="text-red-700">{actionData.error}</p>
            ) : (
              ""
            )}
          </label>
          <label htmlFor="amount">
            <span>Amount Paid</span>
            <br />
            <input
              type="number"
              name="amount"
              id="amount"
              className="w-10/12 px-2 py-1 bg-gray-200 rounded outline outline-1"
              placeholder="Enter the total amount paid"
              required
            />
          </label>
          <label htmlFor="acadYr">
            <span>Academic Year</span>
            <br />
            <select
              name="acadYrId"
              id="acadYr"
              className="w-10/12 px-2 py-1 bg-gray-200 rounded outline outline-1"
              required
            >
              <option value="">--Select Level--</option>
              {loaderData[0]
                ? loaderData[0].map(
                    (
                      item: { academic_year: string; id: string },
                      index: number
                    ) => (
                      <option key={index} value={item.id}>
                        {item.academic_year}
                      </option>
                    )
                  )
                : ""}
            </select>
          </label>
          <label htmlFor="level">
            <span>Level</span>
            <br />
            <select
              name="levelId"
              id="level"
              className="w-10/12 px-2 py-1 bg-gray-200 rounded outline outline-1"
              required
            >
              <option value="">--Select Level--</option>
              {loaderData[1]
                ? loaderData[1].map((item: Item, index: number) => (
                    <option key={index} value={item.level.id}>
                      {item.level.levelName}
                    </option>
                  ))
                : ""}
            </select>
          </label>
          <label htmlFor="paymentDate">
            <span>Payment Date as per Bank Slip</span>
            <br />
            <input
              type="date"
              name="paymentDate"
              id="paymentDate"
              className="w-10/12 px-2 py-1 bg-gray-200 rounded outline outline-1"
              placeholder="Enter the payment slip number"
              required
            />
          </label>
        </fieldset>
        <Button
          value={["Save", "Saving"]}
          style={buttonStyle + " mt-2"}
          transition={!!submission}
          type={"submit"}
        />
      </Form>
      <main className="w-screen mt-5 overflow-scroll">
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
}
