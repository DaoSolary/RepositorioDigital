"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@/lib/validators/auth";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";

type ProfileForm = {
  nome: string;
  bio: string;
  instituicao: string;
  curso: string;
};

type PasswordForm = z.infer<typeof changePasswordSchema>;

export function ProfileClient() {
  const [loading, setLoading] = React.useState(true);
  const [saved, setSaved] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [emailConfirmed, setEmailConfirmed] = React.useState(false);
  const [favoritesCount, setFavoritesCount] = React.useState(0);
  const [pwdError, setPwdError] = React.useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = React.useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<ProfileForm>();

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    formState: { errors: pwdErrors, isSubmitting: pwdSubmitting },
    reset: resetPwd,
  } = useForm<PasswordForm>({ resolver: zodResolver(changePasswordSchema) });

  React.useEffect(() => {
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setEmail(data.user.email ?? "");
          setEmailConfirmed(!!data.user.email_confirmed);
        }
        setFavoritesCount(data.favoritesCount ?? 0);
        reset({
          nome: data.profile?.nome ?? "",
          bio: data.profile?.bio ?? "",
          instituicao: data.profile?.instituicao ?? "Universidade Kimpa Vita",
          curso: data.profile?.curso ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [reset]);

  async function onSubmit(values: ProfileForm) {
    setSaved(false);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) setSaved(true);
  }

  async function onChangePassword(values: PasswordForm) {
    setPwdError(null);
    setPwdSuccess(null);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPwdError(json.error || "Falha ao alterar senha.");
      return;
    }
    setPwdSuccess("Senha alterada com sucesso.");
    resetPwd();
  }

  if (loading) return <div className="text-sm text-zinc-500">Carregando perfil…</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-1">
        <div className="text-xs uppercase tracking-wider text-zinc-500">Conta</div>
        <div className="mt-2 font-medium">{email}</div>
        <div className="mt-1 text-sm text-zinc-500">
          Email {emailConfirmed ? "verificado" : "pendente de verificação"}
        </div>
        <div className="mt-4 text-sm">
          <span className="font-medium">{favoritesCount}</span> favorito(s)
        </div>
      </Card>

      <div className="space-y-6 lg:col-span-2">
        <Card className="p-5">
          <h2 className="section-title text-base font-semibold">Dados do perfil</h2>
          <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input className="mt-1" {...register("nome")} />
            </div>
            <div>
              <label className="text-sm font-medium">Instituição</label>
              <Input className="mt-1" {...register("instituicao")} />
            </div>
            <div>
              <label className="text-sm font-medium">Curso</label>
              <Input className="mt-1" {...register("curso")} />
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea className="mt-1" rows={4} {...register("bio")} />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit">Salvar perfil</Button>
              {saved ? <span className="text-sm text-emerald-600">Salvo!</span> : null}
            </div>
          </form>
        </Card>

        <Card className="p-5" id="senha">
          <h2 className="section-title text-base font-semibold">Alterar senha</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Disponível apenas enquanto você estiver logado.
          </p>
          <form className="mt-4 space-y-3" onSubmit={handleSubmitPwd(onChangePassword)}>
            <div>
              <label className="text-sm font-medium">Senha atual</label>
              <Input type="password" autoComplete="current-password" className="mt-1" {...registerPwd("currentPassword")} />
              {pwdErrors.currentPassword ? (
                <div className="mt-1 text-xs text-red-600">{pwdErrors.currentPassword.message}</div>
              ) : null}
            </div>
            <div>
              <label className="text-sm font-medium">Nova senha</label>
              <Input type="password" autoComplete="new-password" className="mt-1" {...registerPwd("newPassword")} />
              {pwdErrors.newPassword ? (
                <div className="mt-1 text-xs text-red-600">{pwdErrors.newPassword.message}</div>
              ) : null}
            </div>
            {pwdError ? <FeedbackMessage type="error" message={pwdError} onDismiss={() => setPwdError(null)} /> : null}
            {pwdSuccess ? <FeedbackMessage type="success" message={pwdSuccess} onDismiss={() => setPwdSuccess(null)} /> : null}
            <Button type="submit" disabled={pwdSubmitting}>
              {pwdSubmitting ? "Salvando..." : "Alterar senha"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
