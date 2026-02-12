import { renderHook, act } from '@testing-library/react';
import { useNotification } from './useNotification';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('deve adicionar uma notificação', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification('Teste', 'Mensagem de teste', 'info');
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].title).toBe('Teste');
    expect(result.current.notifications[0].message).toBe('Mensagem de teste');
    expect(result.current.notifications[0].type).toBe('info');
  });

  it('deve remover uma notificação automaticamente após duration', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification('Teste', 'Mensagem', 'success', 1000);
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('deve remover uma notificação manualmente', () => {
    const { result } = renderHook(() => useNotification());

    let id: string;
    act(() => {
      id = result.current.addNotification('Teste', 'Mensagem', 'info', 0);
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification(id!);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('deve suportar múltiplas notificações', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.addNotification('Teste 1', 'Mensagem 1', 'info', 0);
      result.current.addNotification('Teste 2', 'Mensagem 2', 'success', 0);
      result.current.addNotification('Teste 3', 'Mensagem 3', 'error', 0);
    });

    expect(result.current.notifications).toHaveLength(3);
  });

  it('deve retornar ID único para cada notificação', () => {
    const { result } = renderHook(() => useNotification());

    let id1: string, id2: string;
    act(() => {
      id1 = result.current.addNotification('Teste 1', 'Mensagem 1', 'info', 0);
      id2 = result.current.addNotification('Teste 2', 'Mensagem 2', 'info', 0);
    });

    expect(id1).not.toBe(id2);
  });
});
