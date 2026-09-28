import {Component, ErrorInfo, ReactNode} from 'react';
import * as Sentry from '@sentry/react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
  /** Changer cette clé réinitialise l'erreur (ex: nouvelle configuration). */
  resetKey?: string;
  onError?: (error: unknown) => void;
};

type ErrorBoundaryState = {
  error: unknown;
  resetKey?: string;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {error: null, resetKey: this.props.resetKey};

  static getDerivedStateFromError(error: unknown) {
    return {error};
  }

  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState,
  ) {
    if (props.resetKey !== state.resetKey) {
      return {error: null, resetKey: props.resetKey};
    }
    return null;
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    Sentry.captureException(error, {
      extra: {componentStack: info.componentStack},
    });
    this.props.onError?.(error);
  }

  render() {
    if (this.state.error) return this.props.fallback;
    return this.props.children;
  }
}
