'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/context/AuthContext';

const Container = styled.div`
  min-height: 100vh;
  background-color: #07070a;
  display: flex;
  flex-direction: column;
  color: #ffffff;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(20, 20, 25, 0.4);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const Logo = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 30%, var(--primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const UserEmail = styled.span`
  color: var(--foreground-muted);
  font-size: 0.95rem;
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--danger);
    border-color: var(--danger);
  }
`;

const Content = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const WelcomeCard = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 16px;
`;

const Description = styled.p`
  color: var(--foreground-muted);
  line-height: 1.6;
  margin-bottom: 30px;
`;

/**
 * Main application dashboard / route controller.
 * Displays the main dashboard to authenticated users, redirects unauthenticated users to /login.
 *
 * @returns The dashboard view or loading container
 */
export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Route protection logic
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  /**
   * Handle user logout process.
   */
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  if (loading || !user) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2>Carregando...</h2>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Logo>Tracker Shows</Logo>
        <UserMenu>
          <UserEmail>{user.email || 'Usuário logado'}</UserEmail>
          <LogoutButton onClick={handleLogout}>Sair</LogoutButton>
        </UserMenu>
      </Header>
      
      <Content>
        <WelcomeCard>
          <Title>Bem-vindo ao seu Tracker!</Title>
          <Description>
            Parabéns! Você está logado na aplicação. Em breve, você poderá buscar seus filmes e séries favoritos integrados com a API OMDB e gerenciar seu progresso de visualização.
          </Description>
        </WelcomeCard>
      </Content>
    </Container>
  );
}
