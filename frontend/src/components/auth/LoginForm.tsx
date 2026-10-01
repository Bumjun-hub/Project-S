"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { login, LoginApiError } from "@/features/auth/api";
import { safeReturnTo, startSession } from "@/lib/auth-session";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import styles from "./LoginForm.module.css";

type FormValues = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = { email: "", password: "" };

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.email) errors.email = "이메일을 입력해 주세요.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "올바른 이메일 형식이 아닙니다.";

  if (!values.password) errors.password = "비밀번호를 입력해 주세요.";

  return errors;
}

export function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const mutation = useMutation({ mutationFn: login });

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    mutation.mutate(
      { email: values.email, password: values.password },
      {
        onSuccess: (data) => {
          startSession(data);
          router.push(safeReturnTo(new URLSearchParams(window.location.search).get("returnTo")));
        },
      },
    );
  };

  const requestError = mutation.error instanceof LoginApiError ? mutation.error.message : "로그인에 실패했습니다.";

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {mutation.isSuccess && <p className={`${styles.message} ${styles.success}`}>로그인이 완료되었습니다.</p>}
      {mutation.isError && <p role="alert" className={`${styles.message} ${styles.failure}`}>{requestError}</p>}

      <label className={styles.field}>
        <span className={styles.label}>이메일</span>
        <Input
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => updateValue("email", event.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          disabled={mutation.isPending}
        />
        {errors.email && <span id="login-email-error" className={styles.error}>{errors.email}</span>}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>비밀번호</span>
        <Input
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) => updateValue("password", event.target.value)}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "login-password-error" : undefined}
          disabled={mutation.isPending}
        />
        {errors.password && <span id="login-password-error" className={styles.error}>{errors.password}</span>}
      </label>

      <Button className={styles.submit} type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
