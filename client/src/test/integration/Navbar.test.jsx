import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import * as api from "../../api";

vi.mock("../../api", () => ({
  authAPI: {
    me    : vi.fn(),
    login : vi.fn(),
    logout: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

function renderNavbar(user = null) {
  if (user) {
    localStorage.setItem("token", "fake-token");
    api.authAPI.me.mockResolvedValueOnce({ data: { data: user } });
  } else {
    api.authAPI.me.mockRejectedValueOnce(new Error("no token"));
  }
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("Navbar Component — Integration Tests", () => {

  // ── Guest user ──────────────────────────────────────────────────────────────
  describe("Guest (not logged in)", () => {

    it("shows Bazaar logo", async () => {
      renderNavbar();
      await waitFor(() => {
        expect(screen.getByText("Bazaar")).toBeInTheDocument();
      });
    });

    it("shows Login button", async () => {
      renderNavbar();
      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
      });
    });

    it("shows Sign up button", async () => {
      renderNavbar();
      await waitFor(() => {
        expect(screen.getByText("Sign up")).toBeInTheDocument();
      });
    });

    it("shows Shop link", async () => {
      renderNavbar();
      await waitFor(() => {
        expect(screen.getByText("Shop")).toBeInTheDocument();
      });
    });

    it("does not show Dashboard link for guest", async () => {
      renderNavbar();
      await waitFor(() => {
        expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      });
    });

    it("does not show Admin link for guest", async () => {
      renderNavbar();
      await waitFor(() => {
        expect(screen.queryByText("Admin")).not.toBeInTheDocument();
      });
    });

  });

  // ── Customer ────────────────────────────────────────────────────────────────
  describe("Customer user", () => {

    it("shows customer name", async () => {
      renderNavbar({ name: "John Customer", role: "customer", email: "j@j.com" });
      await waitFor(() => {
        expect(screen.getByText("John Customer")).toBeInTheDocument();
      });
    });

    it("shows My Orders link", async () => {
      renderNavbar({ name: "John", role: "customer", email: "j@j.com" });
      await waitFor(() => {
        expect(screen.getByText("My Orders")).toBeInTheDocument();
      });
    });

    it("shows Logout button", async () => {
      renderNavbar({ name: "John", role: "customer", email: "j@j.com" });
      await waitFor(() => {
        expect(screen.getByText("Logout")).toBeInTheDocument();
      });
    });

    it("does not show Login button when logged in", async () => {
      renderNavbar({ name: "John", role: "customer", email: "j@j.com" });
      await waitFor(() => {
        expect(screen.queryByText("Login")).not.toBeInTheDocument();
      });
    });

    it("does not show Admin link for customer", async () => {
      renderNavbar({ name: "John", role: "customer", email: "j@j.com" });
      await waitFor(() => {
        expect(screen.queryByText("Admin")).not.toBeInTheDocument();
      });
    });

  });

  // ── Vendor ──────────────────────────────────────────────────────────────────
  describe("Vendor user", () => {

    it("shows Dashboard link for vendor", async () => {
      renderNavbar({ name: "Jane Vendor", role: "vendor", email: "v@v.com" });
      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });
    });

    it("does not show My Orders for vendor", async () => {
      renderNavbar({ name: "Jane Vendor", role: "vendor", email: "v@v.com" });
      await waitFor(() => {
        expect(screen.queryByText("My Orders")).not.toBeInTheDocument();
      });
    });

    it("does not show Admin link for vendor", async () => {
      renderNavbar({ name: "Jane Vendor", role: "vendor", email: "v@v.com" });
      await waitFor(() => {
        expect(screen.queryByText("Admin")).not.toBeInTheDocument();
      });
    });

  });

  // ── Admin ───────────────────────────────────────────────────────────────────
  describe("Admin user", () => {

    it("shows Admin link for admin", async () => {
      renderNavbar({ name: "Super Admin", role: "admin", email: "a@a.com" });
      await waitFor(() => {
        expect(screen.getByText("Super Admin")).toBeInTheDocument();
      });
      // Check admin nav link exists
      const adminLink = screen.queryByText("Admin");
      if (!adminLink) {
        // Admin link text may differ — check by href
        const link = document.querySelector('a[href="/admin"]');
        expect(link).toBeInTheDocument();
      } else {
        expect(adminLink).toBeInTheDocument();
      }
    });

    it("does not show My Orders for admin", async () => {
      renderNavbar({ name: "Super Admin", role: "admin", email: "a@a.com" });
      await waitFor(() => {
        expect(screen.queryByText("My Orders")).not.toBeInTheDocument();
      });
    });

    it("does not show Dashboard for admin", async () => {
      renderNavbar({ name: "Super Admin", role: "admin", email: "a@a.com" });
      await waitFor(() => {
        expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      });
    });

  });

});