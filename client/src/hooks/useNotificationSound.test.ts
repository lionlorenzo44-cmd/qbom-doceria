import { renderHook, act } from '@testing-library/react';
import { useNotificationSound } from './useNotificationSound';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useNotificationSound', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve inicializar com som ativado por padrão', () => {
    const { result } = renderHook(() => useNotificationSound());
    expect(result.current.soundEnabled).toBe(true);
  });

  it('deve ler estado de som do localStorage', () => {
    localStorage.setItem('notificationSoundEnabled', 'false');
    const { result } = renderHook(() => useNotificationSound());
    expect(result.current.soundEnabled).toBe(false);
  });

  it('deve alternar estado de som', () => {
    const { result } = renderHook(() => useNotificationSound());

    expect(result.current.soundEnabled).toBe(true);

    act(() => {
      result.current.toggleSound();
    });

    expect(result.current.soundEnabled).toBe(false);

    act(() => {
      result.current.toggleSound();
    });

    expect(result.current.soundEnabled).toBe(true);
  });

  it('deve salvar estado de som no localStorage', () => {
    const { result } = renderHook(() => useNotificationSound());

    act(() => {
      result.current.toggleSound();
    });

    const saved = JSON.parse(localStorage.getItem('notificationSoundEnabled') || 'true');
    expect(saved).toBe(false);
  });

  it('deve ter função playSound', () => {
    const { result } = renderHook(() => useNotificationSound());
    expect(typeof result.current.playSound).toBe('function');
  });

  it('playSound deve ser seguro mesmo se AudioContext não estiver disponível', () => {
    const { result } = renderHook(() => useNotificationSound());

    expect(() => {
      act(() => {
        result.current.playSound();
      });
    }).not.toThrow();
  });
});
