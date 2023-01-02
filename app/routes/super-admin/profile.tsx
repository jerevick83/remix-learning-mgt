import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { json, LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { ActionFunction, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireUserId } from "~/session.server";
import { ValidatedForm, validationError } from "remix-validated-form";
import { buttonStyle, formStyle } from "~/components/utils/utils";
import {
  Button,
  FormInput,
  Select,
  SelectOptions,
} from "~/components/reUsableComponents/reusableFormComp";
import { countries } from "~/components/reUsableComponents/countryList";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { ProfileProps, updateProfile } from "~/models/user.server";
import { Profile, User } from "@prisma/client";
import { prisma } from "~/db.server";
import bcrypt from "bcryptjs";
import { useState } from "react";
export const meta: MetaFunction = () => {
  return {
    title: "Profile",
  };
};
const validator = withZod(
  z.object({
    dob: z.string(),
    pob: z.string().min(3, "Place of Birth is required"),
    phone: z
      .string({ required_error: "phone contact id required" })
      .min(9, "Contact must be at least 9 characters long")
      .trim(),
    nationality: z
      .string({ required_error: "select your nationality" })
      .trim()
      .min(1, "select your nationality"),
    address: z.string().min(10, "Give your complete address").trim(),
    password: z.string().trim(),
    fname: z.string().trim(),
    oname: z.string().trim(),
    lname: z.string().trim(),
    repeat_password: z.string(),
    gender: z.string().trim(),
  })
);
const validatePassword = withZod(
  z.object({
    password: z.string().trim(),
    repeat_password: z.string(),
  })
);
export const action: ActionFunction = async ({ request }) => {
  const userId = (await requireUserId(request)) as User["id"];
  const formData = await request.formData();
  invariant(userId, "User ID is missing");
  const changePassword = formData.get("changePassword");

  const dob = new Date(formData.get("dob")) ,
    pob = formData.get("pob") as ProfileProps["pob"],
    address = formData.get("address") as ProfileProps["address"],
    phone = formData.get("phone") as ProfileProps["phone"],
    nationality = formData.get("nationality") as ProfileProps["nationality"],
    gender = formData.get("gender") as ProfileProps["gender"],
    firstname = formData.get("fname") as ProfileProps["gender"],
    other_name = formData.get("oname") as ProfileProps["other_name"],
    profileId = formData.get("profileId") as Profile["id"],
    lastname = formData.get("lname") as string,
    repeat_password = formData.get("repeat_password"),
    password = formData.get("password") as string;

  if (password !== repeat_password) {
    return json(
      { errors: { password: "passwords do not match" } },
      { status: 400 }
    );
  }

  try {
    if (profileId.length > 7) {
      await prisma.profile.update({
        where: { id: profileId },
        data: {
          nationality,
          dob,
          pob,
          address,
          phone,
          userId,
          gender,
          firstname,
          other_name,
          lastname,
        },
      });
    } else {
      await updateProfile({
        nationality,
        dob,
        pob,
        address,
        phone,
        userId,
        gender,
        firstname,
        other_name,
        lastname,
      });
    }

    if (changePassword === "true" && password.length > 0) {
      const hash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: { update: { hash } } },
      });
    }
    return redirect("/pupil");
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
  }
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  invariant(userId, "User ID is missing");

  return await prisma.profile.findUnique({ where: { userId: userId } });
};

export default function Profile() {
  const [change, setChange] = useState({
    password: false,
    profile: false,
  });
  const changePswdFxn = () => {
    if (change.password) return setChange({ ...change, password: false });
    setChange({ ...change, password: true });
  };
  const changeProfFxn = () => {
    if (change.profile) return setChange({ ...change, profile: false });
    setChange({ ...change, profile: true });
  };
  const transition = useTransition();
  const country = countries.map((item, index) => {
    return <SelectOptions value={item} index={index} defaultValue="" />;
  });
  const loaderData = useLoaderData();
  const {
    firstname,
    other_name,
    lastname,
    dob,
    pob,
    address,
    gender,
    id,
    nationality,
  } = loaderData
    ? loaderData
    : {
        firstname: "",
        nationality: "",
        other_name: "",
        lastname: "",
        dob: "",
        pob: "",
        address: "",
        gender: "",
        id: "",
      };

  const [inputValues, setInputValues] = useState({
    firstname,
    other_name,
    lastname,
    dob,
    pob,
    address,
    gender,
    nationality,
  });
  const passwordError = useActionData();
  return (
    <div className={"mt-"}>
      <div className="flex flex-row space-x-4 ">
        <button onClick={changeProfFxn}>Edit Profile</button>
        <button onClick={changePswdFxn}>Change Password</button>{" "}
      </div>
      <ValidatedForm
        reloadDocument
        validator={validator}
        method={"post"}
        className={
          "flex sm:justify-items-start sm:flex-col flex-wrap space-y-4"
        }
      >
        <input type="text" value={id} hidden name="profileId" />
        <fieldset className={formStyle}>
          <legend className={"capitalize text-3xl text-gray-500 px-2"}>
            Edit Profile
          </legend>

          <FormInput
            required
            min={2}
            max={20}
            id={"fname"}
            type={"text"}
            value={firstname}
            name={"fname"}
            label={"firstname"}
          />
          <FormInput
            required={false}
            min={2}
            max={50}
            id={"oname"}
            type={"text"}
            value={other_name}
            name={"oname"}
            label={"Other Name(s)"}
          />
          <FormInput
            required
            min={""}
            max={""}
            id={"lname"}
            type={"text"}
            value={lastname}
            name={"lname"}
            label={"Lastname"}
          />
          <Select
            label={"Gender"}
            id={"gender"}
            defaultValue={""}
            name={"gender"}
            option={
              gender === "FEMALE"
                ? ["FEMALE", "MALE", "OTHER"]
                : gender === "MALE"
                ? ["MALE", "FEMALE", "OTHER"]
                : ["OTHER", "FEMALE", "MALE"]
            }
          />
          <FormInput
            required={true}
            min={""}
            max={""}
            id={"dob"}
            type={"date"}
            value={loaderData ? dob : ""}
            name={"dob"}
            label={"Date of Birth"}
          />
          <FormInput
            value={loaderData ? pob : ""}
            required={true}
            min={""}
            max={""}
            id={"pob"}
            type={"text"}
            name={"pob"}
            label={"Place of Birth"}
          />
          <FormInput
            value={loaderData ? loaderData?.phone : ""}
            required={true}
            min={""}
            max={""}
            id={"phone"}
            type={"text"}
            name={"phone"}
            label={"Contact"}
          />
          <FormInput
            value={loaderData ? address : ""}
            required={true}
            min={""}
            max={""}
            id={"address"}
            type={"text"}
            name={"address"}
            label={"Current Address"}
          />
          <Select
            defaultValue={loaderData ? nationality : ""}
            name="nationality"
            id="nationality"
            label={"Nationality"}
            option={countries}
          />

          {change.password ? (
            <fieldset className={"w-full"}>
              <input
                type="text"
                defaultValue={change.password ? "true" : "false"}
                name="changePassword"
                hidden
              />
              <legend className={"capitalize text-3xl text-gray-500 px-2"}>
                Change Password
              </legend>
              <label htmlFor="password">
                <span>Password</span>
                <br />
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="w-10/12 px-2 py-1 bg-gray-200 rounded outline outline-1"
                />
              </label>
              <br />
              <label htmlFor="rpassword">
                <span>Repeat Password</span>
                <br />
                <input
                  type="password"
                  name="repeat_password"
                  id="rpassword"
                  className="w-10/12 px-2 py-1 bg-gray-200 rounded outline outline-1"
                />
                <br />
                {passwordError?.errors?.password && (
                  <div className="pt-1 text-red-700" id="password-error">
                    {passwordError.errors.password}
                  </div>
                )}
              </label>
            </fieldset>
          ) : (
            <p>Click "Change Password Button" above to change your password</p>
          )}
        </fieldset>
        <Button
          transition={!!transition.submission}
          style={buttonStyle}
          type={"submit"}
          value={["Save", "saving"]}
        />
      </ValidatedForm>
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
