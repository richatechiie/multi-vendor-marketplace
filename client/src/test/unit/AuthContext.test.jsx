import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../context/AuthContext";
import * as api from "../../api";

vi.mock("../../api", () => ({
  authAPI: {
    me    : vi.fn(),
    login : vi.fn(),
    logout: vi.fn(),
  },
}));

function TestComponent() {
  const { user, loading } = useAuth();
  if (loading) return <div>loading</div>;
  return (
    <div>
      <div data-testid="user">{user ? user.name : "no user"}</div>
      <div data-testid="role">{user ? user.role : "no role"}</div>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("AuthContext — Unit Tests", () => {

  describe("Initial state", () => {

    it("shows no user when no token in localStorage", async () => {
      api.authAPI.me.mockRejectedValueOnce(new Error("no token"));
      render(<AuthProvider><TestComponent /></AuthProvider>);
      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("no user");
      });
    });

    it("shows loading initially when token exists", () => {
      localStorage.setItem("token", "fake-token");
      localStorage.removeItem("user");
      api.authAPI.me.mockResolvedValueOnce({
        data: { data: { name: "John", role: "customer" } }
      });
      render(<AuthProvider><TestComponent /></AuthProvider>);
      expect(screen.getByText("loading")).toBeInTheDocument();
    });

    it("loads user from API when token exists", async () => {
      localStorage.setItem("token", "valid-token");
      localStorage.removeItem("user");
      api.authAPI.me.mockResolvedValueOnce({
        data: { data: { name: "John", role: "customer", email: "john@test.com" } }
      });
      render(<AuthProvider><TestComponent /></AuthProvider>);
      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("John");
        expect(screen.getByTestId("role").textContent).toBe("customer");
      });
    });

    it("clears token when API returns unauthorized error", async () => {
      localStorage.setItem("token", "expired-token");
      localStorage.removeItem("user");
      api.authAPI.me.mockRejectedValueOnce(new Error("Unauthorized"));
      render(<AuthProvider><TestComponent /></AuthProvider>);
      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("no user");
      });
      expect(localStorage.getItem("token")).toBeNull();
    });

  });

  describe("login()", () => {

    function LoginTest() {
      const { user, login } = useAuth();
      return (
        <div>
          <div data-testid="user">{user ? user.name : "no user"}</div>
          <button onClick={() => login("john@test.com", "password123")}>Login</button>
        </div>
      );
    }

    it("sets user after successful login", async () => {
      api.authAPI.me.mockRejectedValueOnce(new Error("no token"));
      api.authAPI.login.mockResolvedValueOnce({
        data: {
          data: {
            accessToken : "new-access-token",
            refreshToken: "new-refresh-token",
            user: { name: "John", role: "customer", email: "john@test.com" }
          }
        }
      });

      render(<AuthProvider><LoginTest /></AuthProvider>);
      await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("no user"));

      await act(async () => { screen.getByRole("button").click(); });

      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("John");
      });
    });

    it("stores token in localStorage on login", async () => {
      api.authAPI.me.mockRejectedValueOnce(new Error("no token"));
      api.authAPI.login.mockResolvedValueOnce({
        data: {
          data: {
            accessToken: "stored-token",
            user: { name: "Jane", role: "vendor" }
          }
        }
      });

      render(<AuthProvider><LoginTest /></AuthProvider>);
      await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("no user"));
      await act(async () => { screen.getByRole("button").click(); });

      await waitFor(() => {
        expect(localStorage.getItem("token")).toBe("stored-token");
      });
    });

  });

  describe("logout()", () => {

    function LogoutTest() {
      const { user, logout } = useAuth();
      return (
        <div>
          <div data-testid="user">{user ? user.name : "no user"}</div>
          <button onClick={logout}>Logout</button>
        </div>
      );
    }

    it("clears user and token on logout", async () => {
      localStorage.setItem("token", "active-token");
      localStorage.removeItem("user");
      api.authAPI.me.mockResolvedValueOnce({
        data: { data: { name: "John", role: "customer" } }
      });
      api.authAPI.logout.mockResolvedValueOnce({});

      render(<AuthProvider><LogoutTest /></AuthProvider>);
      await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("John"));

      await act(async () => { screen.getByRole("button").click(); });

      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("no user");
        expect(localStorage.getItem("token")).toBeNull();
      });
    });

    it("clears cart from localStorage on logout", async () => {
      localStorage.setItem("token", "active-token");
      localStorage.setItem("cart", JSON.stringify([{ uuid: "p1", qty: 1 }]));
      localStorage.removeItem("user");
      api.authAPI.me.mockResolvedValueOnce({
        data: { data: { name: "John", role: "customer" } }
      });
      api.authAPI.logout.mockResolvedValueOnce({});

      render(<AuthProvider><LogoutTest /></AuthProvider>);
      await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("John"));
      await act(async () => { screen.getByRole("button").click(); });

      await waitFor(() => {
        expect(localStorage.getItem("cart")).toBeNull();
      });
    });

  });

});