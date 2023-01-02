import * as yup from "yup";

export const validateForm = async (formData: FormData) => {

  const getValidationErrors = (err: any) => {
    const validationErrors = {} as any;

    err.inner.forEach((error: any) => {
      if (error.path) {
        validationErrors[error.path] = error.message;
      }
    });

    return validationErrors;
  };

  // convert form into JSON object
  const formJSON: { [key: string]: any } = {};
  for (const key of formData.keys()) {
    formJSON[key] = formData.get(key);
  }

  // Yup schema for the object that I am trying to validate

  const validator = yup.object().shape({
      firstname: yup.string().lowercase().required("Firstname is required").min(2, "firstname is too short").trim().typeError("firstname must be two or more characters"),
      other_name: yup.string().lowercase().notRequired(),
      lastname: yup.string().lowercase().required("Lastname is required").trim().typeError("lastname must be two or more characters").min(2, "lastname is too short"),
      email: yup.string().required("Email is required").email({ message: "the email should be in email format" }).trim().lowercase(),
      role: yup.string().required("Role is required").min(1, "select an option"),
      class: yup.string().required("Class is required").min(1, "select an option")
    }
  );

  // validate the object and throw error if not valid
  try {
    return await validator.validate(formData, { abortEarly: false });
  } catch (error) {
    throw getValidationErrors(error);
  }
};