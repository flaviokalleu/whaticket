import React, { useState } from "react";

import * as Yup from "yup";
import { useHistory, Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import {
  MessageSquare,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
} from "lucide-react";

import AuthLayout from "../../components/AuthLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Obrigatório"),
  password: Yup.string().min(5, "Muito curta!").max(50, "Muito longa!"),
  email: Yup.string().email("E-mail inválido").required("Obrigatório"),
});

const SignUp = () => {
  const history = useHistory();

  const initialState = { name: "", email: "", password: "" };
  const [showPassword, setShowPassword] = useState(false);
  const [user] = useState(initialState);

  const handleSignUp = async (values) => {
    try {
      await api.post("/auth/signup", values);
      toast.success(i18n.t("signup.toasts.success"));
      history.push("/login");
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <AuthLayout>
      {/* logo mobile */}
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
          <MessageSquare className="h-6 w-6 text-white" />
        </div>
        <p className="text-lg font-bold tracking-tight">WhaTicket</p>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Crie sua conta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Comece agora a organizar seu atendimento no WhatsApp.
        </p>
      </div>

      <Formik
        initialValues={user}
        enableReinitialize={true}
        validationSchema={UserSchema}
        onSubmit={(values, actions) => {
          setTimeout(() => {
            handleSignUp(values);
            actions.setSubmitting(false);
          }, 400);
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">{i18n.t("signup.form.name")}</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Field
                  as={Input}
                  id="name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  placeholder="Seu nome completo"
                  className="h-11 pl-10"
                />
              </div>
              {touched.name && errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{i18n.t("signup.form.email")}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Field
                  as={Input}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className="h-11 pl-10"
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{i18n.t("signup.form.password")}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Field
                  as={Input}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Mínimo de 5 caracteres"
                  className="h-11 pl-10 pr-11"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="h-11 w-full text-[15px] font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {i18n.t("signup.buttons.submit")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </Form>
        )}
      </Formik>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground">
            Já tem uma conta?
          </span>
        </div>
      </div>

      <RouterLink to="/login" className="block">
        <Button type="button" variant="outline" className="h-11 w-full">
          Entrar na minha conta
        </Button>
      </RouterLink>
    </AuthLayout>
  );
};

export default SignUp;
