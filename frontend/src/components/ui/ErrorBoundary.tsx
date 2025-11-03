// frontend/src/components/ui/ErrorBoundary.tsx
// (ARQUIVO NOVO)

import React, { Component, ErrorInfo, ReactNode } from "react";
import Button from "./Button"; // Vamos reusar seu botão

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Você pode logar o erro para um serviço (ex: Sentry) aqui
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    // Tenta resetar o estado e recarregar a página
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // A UI de fallback
      return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Oops! Algo deu errado.
            </h1>
            <p className="text-gray-700 mb-6">
              Nossa equipe foi notificada. Por favor, tente recarregar a página.
            </p>
            <Button onClick={this.handleReset}>
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;