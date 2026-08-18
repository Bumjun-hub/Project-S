"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { login, LoginApiError } from "@/features/auth/api";
import { isDemoMode } from "@/lib/demo-mode";
import { useFlowBootstrapStore } from "@/stores/flowBootstrapStore";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import styles from "./LoginForm.module.css";

type FormValues = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const ACCESS_TOKEN_STORAGE_KEY = "project-s-access-token";
const TOKEN_TYPE_STORAGE_KEY = "project-s-token-type";
const MEMBER_EMAIL_STORAGE_KEY = "project-s-member-email";
const MEMBER_NICKNAME_STORAGE_KEY = "project-s-member-nickname";
const AUTH_CHANGED_EVENT = "project-s-auth-changed";
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
          if (isDemoMode) useFlowBootstrapStore.getState().acknowledgeIntro();
          window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, data.accessToken);
          window.localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, data.tokenType);
          window.localStorage.setItem(MEMBER_EMAIL_STORAGE_KEY, data.email);
          window.localStorage.setItem(MEMBER_NICKNAME_STORAGE_KEY, data.nickname);
          window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
          router.push("/");
        },
      },
    );
  };

  const requestError = mutation.error instanceof LoginApiError ? mutation.error.message : "로그인에 실패했습니다.";

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {mutation.isSuccess && <p className={`${styles.message} ${styles.success}`}>로그인이 완료되었습니다.</p>}
      {mutation.isError && <p className={`${styles.message} ${styles.failure}`}>{requestError}</p>}

      <label className={styles.field}>
        <span className={styles.label}>이메일</span>
        <Input
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => updateValue("email", event.target.value)}
          aria-invalid={Boolean(errors.email)}
          disabled={mutation.isPending}
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>비밀번호</span>
        <Input
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) => updateValue("password", event.target.value)}
          aria-invalid={Boolean(errors.password)}
          disabled={mutation.isPending}
        />
        {errors.password && <span className={styles.error}>{errors.password}</span>}
      </label>

      <Button className={styles.submit} type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
