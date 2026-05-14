import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import Login from "../../pages/Login";
import * as api from "../../api";

vi.mock("../../api", () => ({
  authAPI: {
    me    : vi.fn(),
    login : vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLogin() {
  api.authAPI.me.mockRejectedValue(new Error("no token"));
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  mockNavigate.mockClear();
});

describe("Login Page — Integration Tests", () => {

  // ── Rendering ───────────────────────────────────────────────────────────────
  describe("Rendering", () => {

    it("renders the login heading", async () => {
      renderLogin();
      await waitFor(() => {
        expect(screen.getByText("Welcome back")).toBeInTheDocument();
      });
    });

    it("renders email input", async () => {
      renderLogin();
      await waitFor(() => {
        expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
      });
    });

    it("renders password input", async () => {
      renderLogin();
      await waitFor(() => {
        expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
      });
    });

    it("renders sign in button", async () => {
      renderLogin();
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
      });
    });

    it("renders demo login buttons", async () => {
      renderLogin();
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /admin/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /vendor/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /customer/i })).toBeInTheDocument();
      });
    });

    it("renders link to register page", async () => {
      renderLogin();
      await waitFor(() => {
        expect(screen.getByText(/create one/i)).toBeInTheDocument();
      });
    });

  });

  // ── Demo buttons ────────────────────────────────────────────────────────────
  describe("Demo login buttons", () => {

    it("fills admin credentials when Admin button clicked", async () => {
      renderLogin();
      await waitFor(() => screen.getByRole("button", { name: /admin/i }));
      await userEvent.click(screen.getByRole("button", { name: /admin/i }));
      expect(screen.getByPlaceholderText("you@example.com").value)
        .toBe("admin@marketplace.com");
    });

    it("fills vendor credentials when Vendor button clicked", async () => {
      renderLogin();
      await waitFor(() => screen.getByRole("button", { name: /vendor/i }));
      await userEvent.click(screen.getByRole("button", { name: /vendor/i }));
      expect(screen.getByPlaceholderText("you@example.com").value)
        .toBe("vendor@marketplace.com");
    });

    it("fills customer credentials when Customer button clicked", async () => {
      renderLogin();
      await waitFor(() => screen.getByRole("button", { name: /customer/i }));
      await userEvent.click(screen.getByRole("button", { name: /customer/i }));
      expect(screen.getByPlaceholderText("you@example.com").value)
        .toBe("customer@marketplace.com");
    });

  });

  // ── Form submission ─────────────────────────────────────────────────────────
  describe("Form submission", () => {

    it("shows loading state while submitting", async () => {
      api.authAPI.login.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 500))
      );
      renderLogin();
      await waitFor(() => screen.getByPlaceholderText("you@example.com"));

      await userEvent.type(screen.getByPlaceholderText("you@example.com"), "test@test.com");
      await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123");
      await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });

    it("navigates to /admin after admin login", async () => {
      api.authAPI.login.mockResolvedValueOnce({
        data: {
          data: {
            accessToken: "token",
            user: { name: "Admin", role: "admin", email: "admin@test.com" }
          }
        }
      });
      renderLogin();
      await waitFor(() => screen.getByPlaceholderText("you@example.com"));

      await userEvent.type(screen.getByPlaceholderText("you@example.com"), "admin@marketplace.com");
      await userEvent.type(screen.getByPlaceholderText("••••••••"), "Admin@123");
      await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/admin");
      });
    });

    it("navigates to /vendor after vendor login", async () => {
      api.authAPI.login.mockResolvedValueOnce({
        data: {
          data: {
            accessToken: "token",
            user: { name: "Vendor", role: "vendor", email: "v@test.com" }
          }
        }
      });
      renderLogin();
      await waitFor(() => screen.getByPlaceholderText("you@example.com"));

      await userEvent.type(screen.getByPlaceholderText("you@example.com"), "vendor@marketplace.com");
      await userEvent.type(screen.getByPlaceholderText("••••••••"), "Vendor@123");
      await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/vendor");
      });
    });

    it("navigates to /shop after customer login", async () => {
      api.authAPI.login.mockResolvedValueOnce({
        data: {
          data: {
            accessToken: "token",
            user: { name: "Customer", role: "customer", email: "c@test.com" }
          }
        }
      });
      renderLogin();
      await waitFor(() => screen.getByPlaceholderText("you@example.com"));

      await userEvent.type(screen.getByPlaceholderText("you@example.com"), "customer@marketplace.com");
      await userEvent.type(screen.getByPlaceholderText("••••••••"), "Customer@123");
      await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/shop");
      });
    });

    it("shows error message on failed login", async () => {
      api.authAPI.login.mockRejectedValueOnce({
        response: { data: { message: "Invalid email or password" } }
      });
      renderLogin();
      await waitFor(() => screen.getByPlaceholderText("you@example.com"));

      await userEvent.type(screen.getByPlaceholderText("you@example.com"), "wrong@test.com");
      await userEvent.type(screen.getByPlaceholderText("••••••••"), "wrongpass");
      await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
      });
    });

    it("clears error when resubmitting", async () => {
      api.authAPI.login
        .mockRejectedValueOnce({ response: { data: { message: "Invalid email or password" } } })
        .mockResolvedValueOnce({
          data: { data: { accessToken: "t", user: { name: "John", role: "customer" } } }
        });

      renderLogin();
      await waitFor(() => screen.getByPlaceholderText("you@example.com"));

      await userEvent.type(screen.getByPlaceholderText("you@example.com"), "t@t.com");
      await userEvent.type(screen.getByPlaceholderText("••••••••"), "wrong");
      await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
      await waitFor(() => screen.getByText("Invalid email or password"));

      await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
      await waitFor(() => {
        expect(screen.queryByText("Invalid email or password")).not.toBeInTheDocument();
      });
    });

  });

});