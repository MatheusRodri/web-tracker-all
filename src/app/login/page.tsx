'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/context/AuthContext';

// Background glow animations for modern premium look
const floatGlow = keyframes`
  0% { transform: translateY(0px) scale(1); opacity: 0.4; }
  50% { transform: translateY(-20px) scale(1.1); opacity: 0.6; }
  100% { transform: translateY(0px) scale(1); opacity: 0.4; }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: #07070a;
  overflow: hidden;
  padding: 20px;
`;

const DecorativeCircle1 = styled.div`
  position: absolute;
  top: 15%;
  left: 10%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--primary) 0%, rgba(139, 92, 246, 0) 70%);
  filter: blur(50px);
  animation: ${floatGlow} 10s ease-in-out infinite;
  z-index: 1;
`;

const DecorativeCircle2 = styled.div`
  position: absolute;
  bottom: 15%;
  right: 10%;
  width: 350px;
  height: 350px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent) 0%, rgba(6, 182, 212, 0) 70%);
  filter: blur(60px);
  animation: ${floatGlow} 12s ease-in-out infinite alternate;
  z-index: 1;
`;

const GlassCard = styled.div`
  width: 100%;
  max-width: 440px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 15px 35px var(--card-shadow);
  z-index: 2;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6);
  }
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #ffffff 30%, var(--primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: var(--foreground-muted);
  text-align: center;
  margin-bottom: 32px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--foreground);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-glow);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const Button = styled.button`
  width: 100%;
  background: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
  border: none;
  border-radius: 8px;
  padding: 14px;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px var(--primary-glow);
  margin-top: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(139, 92, 246, 0.5);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const DividerContainer = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
  color: var(--foreground-muted);
  font-size: 0.85rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  &:not(:empty)::before {
    margin-right: .5em;
  }

  &:not(:empty)::after {
    margin-left: .5em;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const FooterText = styled.p`
  margin-top: 24px;
  font-size: 0.9rem;
  text-align: center;
  color: var(--foreground-muted);
`;

const ToggleLink = styled.button`
  background: none;
  border: none;
  color: var(--accent);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-left: 5px;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
    color: #0891b2;
  }
`;

const ErrorContainer = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fca5a5;
  font-size: 0.9rem;
  margin-bottom: 20px;
  line-height: 1.4;
`;

/**
 * Translates Firebase Authentication error codes to user-friendly messages in Portuguese.
 *
 * @param code - Firebase Auth error code string
 * @returns Human-readable Portuguese error message
 */
function translateFirebaseError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/user-disabled':
      return 'Este usuário foi desabilitado.';
    case 'auth/user-not-found':
      return 'Usuário não encontrado.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso.';
    case 'auth/weak-password':
      return 'A senha é muito fraca (mínimo de 6 caracteres).';
    case 'auth/invalid-credential':
      return 'Credenciais inválidas (e-mail ou senha incorretos).';
    default:
      return 'Ocorreu um erro ao autenticar. Tente novamente.';
  }
}

/**
 * Authentication Page component containing Login and Registration flows,
 * with options for Email/Password credentials and Google Auth.
 *
 * @returns The Authentication view container
 */
export default function AuthPage() {
  const { user, loginWithEmail, registerWithEmail, loginWithGoogle, loading } = useAuth();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  /**
   * Handle Login or Registration form submission.
   *
   * @param e - Form submit event
   */
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      if (isSignUp) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      router.push('/');
    } catch (err: any) {
      setError(translateFirebaseError(err.code || ''));
      setSubmitting(false);
    }
  };

  /**
   * Handle Google authentication sign in.
   */
  const handleGoogleAuth = async () => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
      router.push('/');
    } catch (err: any) {
      setError(translateFirebaseError(err.code || ''));
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <Container>
        <GlassCard style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Title style={{ fontSize: '1.5rem' }}>Carregando...</Title>
        </GlassCard>
      </Container>
    );
  }

  return (
    <Container>
      <DecorativeCircle1 />
      <DecorativeCircle2 />

      <GlassCard>
        <Title>Tracker Shows</Title>
        <Subtitle>
          {isSignUp
            ? 'Crie sua conta para começar a acompanhar séries e filmes'
            : 'Faça login para gerenciar o que já assistiu'}
        </Subtitle>

        {error && <ErrorContainer>{error}</ErrorContainer>}

        <Form onSubmit={handleAuthSubmit}>
          <InputGroup>
            <Label htmlFor="email">E-mail</Label>
            <Input
              type="email"
              id="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Senha</Label>
            <Input
              type="password"
              id="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
          </InputGroup>

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Aguarde...' : isSignUp ? 'Criar Conta' : 'Entrar'}
          </Button>
        </Form>

        <DividerContainer>ou continue com</DividerContainer>

        <GoogleButton onClick={handleGoogleAuth} disabled={submitting}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.23-.66-.36-1.37-.36-2.09z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Google
        </GoogleButton>

        <FooterText>
          {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
          <ToggleLink
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            disabled={submitting}
          >
            {isSignUp ? 'Faça login' : 'Cadastre-se'}
          </ToggleLink>
        </FooterText>
      </GlassCard>
    </Container>
  );
}
