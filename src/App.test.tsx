import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from './App';

// 包装组件，提供Router上下文
function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="*" element={<App />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('App', () => {
  it(' should render the App component', () => {
    renderWithRouter();
    // 检查Logo文字（唯一）
    const logoText = screen.getByText('地道甄选');
    expect(logoText).toBeInTheDocument();
  });

  it(' should have navigation links', () => {
    renderWithRouter();
    // 检查是否有多个首页链接（桌面+移动端）
    const homeLinks = screen.getAllByText('首页');
    expect(homeLinks.length).toBeGreaterThan(0);
    
    // 检查是否有地域甄选链接
    const regionLinks = screen.getAllByText('地域甄选');
    expect(regionLinks.length).toBeGreaterThan(0);
  });
});
