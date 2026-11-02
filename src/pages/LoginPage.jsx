import { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import logoImg from "../assets/Logo.png";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage({ onForgotPassword }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await login(email, password);

      console.log("Resposta do login: ", response);

      if(response && response.error) {
        setErrorMessage("E-mail ou senha inválidos: " + response.error.message);
        return;
      }
    } catch (err) {
        console.error("Erro detalhado do catch", err);
        setErrorMessage("Erro ao tentar realizar login: " + (err.message || "Erro desconhecido"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!onForgotPassword) {
      setErrorMessage("A recuperação de senha ainda não está configurada.");
      return;
    }

    try {
      const { error } =
        (await onForgotPassword(email.trim())) ?? {};

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "Se esse e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.",
      );
    } catch (error) {
      setErrorMessage(
        error?.message || "Não foi possível enviar as instruções. Tente novamente.",
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10 text-neutral-900">
      <section className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-md sm:p-9">
        <header className="mb-8">
          <img
            alt="Perucca Pugesi"
            className="mb-8 h-auto m-auto w-24 object-contain"
            src={logoImg}
          />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Acesse sua conta
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Entre para acompanhar e gerenciar os lançamentos da sua empresa.
          </p>
        </header>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="login-email"
            >
              E-mail
            </label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                autoComplete="email"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                id="login-email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@empresa.com"
                required
                type="email"
                value={email}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="login-password"
            >
              Senha
            </label>
            <div className="relative">
              <Lock
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                autoComplete="current-password"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                id="login-password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" size={18} />
                ) : (
                  <Eye aria-hidden="true" size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-gray-600">
              <input
                checked={rememberMe}
                className="h-4 w-4 rounded border-gray-300 accent-primary-600 focus:ring-2 focus:ring-primary-500/40"
                onChange={(event) => setRememberMe(event.target.checked)}
                type="checkbox"
              />
              Lembrar de mim
            </label>
            <button
              className="font-medium text-purple-900 transition hover:text-purple-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              onClick={handleForgotPassword}
              type="button"
            >
              Esqueceu a senha?
            </button>
          </div>

          {errorMessage && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm leading-5 text-green-700"
              role="status"
            >
              {successMessage}
            </div>
          )}

          <button
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-medium text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <>
                <Loader2 aria-hidden="true" className="animate-spin" size={18} />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <p className="mt-7 border-t border-gray-100 pt-5 text-center text-xs text-gray-400">
          Sistema de gestão financeira
        </p>
      </section>
    </main>
  );
}