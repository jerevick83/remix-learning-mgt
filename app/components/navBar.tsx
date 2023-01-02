import { Form, Link } from "@remix-run/react";
import { useOptionalUser } from "~/utils";
import { useState } from "react";
import { BsPersonFill } from "react-icons/bs";

export const NavBar = () => {
  const user = useOptionalUser();
  const [imageState, setImageState] = useState(false);

  function handleImageState() {
    if (imageState) return setImageState(false);
    setImageState(true);
  }

  setTimeout(() => setImageState(false), 10000);
  return (
    <div className="fixed top-0 z-30 w-full">
      <nav
        className={
          "bg-blue-900 text-white flex text-xl justify-between py-2 px-4"
        }
      >
        <ul className={"list-none flex space-x-5 flex-1 self-end"}>
          <li>
            <Link to={"/"} className="text-white">
              Home
            </Link>
          </li>
          <li>
            <Link to={"about"} className="text-white">
              About
            </Link>
          </li>
        </ul>
        <ul
          className={"list-none flex  self-end justify-end space-x-5  flex-1"}
        >
          {user ? (
            <li className="flex self-end">
              <Link
                to={
                  user?.role === "PUPIL"
                    ? "pupil"
                    : user?.role === "TEACHER"
                    ? "teacher"
                    : user?.role === "ADMIN"
                    ? "admin"
                    : user?.role === "SUPER_ADMIN"
                    ? "super-admin"
                    : "login"
                }
                className="text-white"
              >
                Dashboard
              </Link>
            </li>
          ) : (
            ""
          )}
          {!user ? (
            <li className="text-white">
              <Link to={"login"}>Login</Link>
            </li>
          ) : (
            ""
          )}
          {user ? (
            <div className={"relative"}>
              <button
                className={
                  "align-middle rounded-3xl p-1 border flex justify-center"
                }
                onClick={handleImageState}
              >
                <BsPersonFill size={26} />
                <img src={""} alt="" />
              </button>
              {imageState && (
                <div
                  className={
                    "absolute align-middle space-y-3 text-black -ml-10 h-40 w-fit p-2 bg-white z-50"
                  }
                >
                  <ul className={"space-y-1 divide-y-4"}>
                    <li className={"text-sm p-1 text-black hover:bg-gray-400"}>
                      <Link
                        to={
                          user?.role == "PUPIL"
                            ? "/pupil/profile"
                            : user?.role === "SUPER_ADMIN"
                            ? "/super-admin/profile"
                            : user?.role === "TEACHER"
                            ? "/teacher/profile"
                            : user?.role === "ADMIN"
                            ? "/admin/profile"
                            : ""
                        }
                      >
                        Profile
                      </Link>
                    </li>
                    <li className={"p-1 hover:bg-gray-400"}>
                      <Form action="/logout" method="post">
                        <button type="submit" className="text-sm">
                          Logout
                        </button>
                      </Form>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            ""
          )}
        </ul>
      </nav>
    </div>
  );
};
