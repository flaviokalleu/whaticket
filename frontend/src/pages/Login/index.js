import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import { MessageSquare, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

import AuthLayout from "../../components/AuthLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

const Login = () => {
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { handleLogin } = useContext(AuthContext);

  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
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
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo de volta
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acesse sua central de atendimento e continue de onde parou.
        </p>
      </div>

      <form onSubmit={handlSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">{i18n.t("login.form.email")}</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              value={user.email}
              onChange={handleChangeInput}
              placeholder="seu@email.com"
              className="h-11 pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{i18n.t("login.form.password")}</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={user.password}
              onChange={handleChangeInput}
              placeholder="Sua senha"
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
        </div>

        <Button type="submit" className="h-11 w-full text-[15px] font-semibold">
          {i18n.t("login.buttons.submit")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground">
            Novo por aqui?
          </span>
        </div>
      </div>

      <RouterLink to="/signup" className="block">
        <Button type="button" variant="outline" className="h-11 w-full">
          Criar uma conta gratuita
        </Button>
      </RouterLink>
    </AuthLayout>
  );
};

export default Login;
