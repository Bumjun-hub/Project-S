"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { signup, SignupApiError } from "@/features/auth/api";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import styles from "./SignupForm.module.css";

type FormValues = {
  email: string;
  nickname: string;
  password: string;
  passwordConfirmation: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = { email: "", nickname: "", password: "", passwordConfirmation: "" };

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.email) errors.email = "이메일을 입력해 주세요.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "올바른 이메일 형식이 아닙니다.";
  if (!values.nickname) errors.nickname = "닉네임을 입력해 주세요.";
  if (!values.password) errors.password = "비밀번호를 입력해 주세요.";
  else if (values.password.length < 8) errors.password = "비밀번호는 8자 이상이어야 합니다.";
  if (!values.passwordConfirmation) errors.passwordConfirmation = "비밀번호 확인을 입력해 주세요.";
  else if (values.password !== values.passwordConfirmation) errors.passwordConfirmation = "비밀번호가 일치하지 않습니다.";
  return errors;
}

export function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const mutation = useMutation({ mutationFn: signup });

  useEffect(() => {
    if (!mutation.isSuccess) return;
    const redirectTimer = window.setTimeout(() => router.push("/login"), 1200);
    return () => window.clearTimeout(redirectTimer);
  }, [mutation.isSuccess, router]);

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    mutation.mutate({ email: values.email, nickname: values.nickname, password: values.password });
  };

  const requestError = mutation.error instanceof SignupApiError ? mutation.error.message : "회원가입에 실패했습니다.";

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {mutation.isSuccess && <p className={`${styles.message} ${styles.success}`}>{mutation.data.message} 로그인 페이지로 이동합니다.</p>}
      {mutation.isError && <p className={`${styles.message} ${styles.failure}`}>{requestError}</p>}
      {(["email", "nickname", "password", "passwordConfirmation"] as const).map((field) => {
        const labels = { email: "이메일", nickname: "닉네임", password: "비밀번호", passwordConfirmation: "비밀번호 확인" };
        const isPassword = field === "password" || field === "passwordConfirmation";
        return <label className={styles.field} key={field}><span className={styles.label}>{labels[field]}</span><Input type={isPassword ? "password" : field === "email" ? "email" : "text"} autoComplete={field === "passwordConfirmation" ? "new-password" : field === "password" ? "new-password" : field} value={values[field]} onChange={(event) => updateValue(field, event.target.value)} aria-invalid={Boolean(errors[field])} disabled={mutation.isPending} />{errors[field] && <span className={styles.error}>{errors[field]}</span>}</label>;
      })}
      <Button className={styles.submit} type="submit" disabled={mutation.isPending || mutation.isSuccess}>{mutation.isPending ? "가입 중..." : "회원가입"}</Button>
    </form>
  );
}
