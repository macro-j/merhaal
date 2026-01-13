import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './Home';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

const queryClient = new QueryClient();

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
    }),
  ],
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" switchable>
          {component}
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

describe('Home Page', () => {
  it('renders hero section with title', () => {
    renderWithProviders(<Home />);
    const elements = screen.getAllByText(/مرحال/);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('renders all four destinations', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/الرياض/)).toBeDefined();
    expect(screen.getByText(/جدة/)).toBeDefined();
    expect(screen.getByText(/العلا/)).toBeDefined();
    expect(screen.getByText(/أبها/)).toBeDefined();
  });

  it('renders features section', () => {
    renderWithProviders(<Home />);
    const elements = screen.getAllByText(/مميزات مرحال/);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('renders navigation menu', () => {
    renderWithProviders(<Home />);
    const homeLinks = screen.getAllByText(/الرئيسية/);
    const featuresLinks = screen.getAllByText(/المميزات/);
    const destinationsLinks = screen.getAllByText(/الوجهات/);
    expect(homeLinks.length).toBeGreaterThan(0);
    expect(featuresLinks.length).toBeGreaterThan(0);
    expect(destinationsLinks.length).toBeGreaterThan(0);
  });
});
