import type { LoginInput, RegisterInput } from "./types";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(values: LoginInput): Partial<LoginInput> {
  const errors: Partial<LoginInput> = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  }

  return errors;
}

export const passwordRules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "At least 1 uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "At least 1 lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "At least 1 number", test: (value: string) => /\d/.test(value) },
  { label: "At least 1 special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export function isPasswordValid(password: string): boolean {
  return passwordRules.every((rule) => rule.test(password));
}

export function validateRegister(values: RegisterInput): Partial<RegisterInput> {
  const errors: Partial<RegisterInput> = {};
  const email = values.email.trim();

  if (!values.name.trim()) {
    errors.name = "Name is required";
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (!isPasswordValid(values.password)) {
    errors.password = "Password does not meet the rules below";
  }

  if (!values.gender) {
    errors.gender = "Gender is required" as any;
  }

  return errors;
}
