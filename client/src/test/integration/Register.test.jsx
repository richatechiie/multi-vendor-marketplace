import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import Register from "../../pages/Register";
import * as api from "../../api";

vi.mock("../../api", () => ({
  authAPI: {
    me      : vi.fn(),
    register: vi.fn(),
    login   : vi.fn(),
    logout  : vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderRegister() {
  api.authAPI.me.mockRejectedValue(new Error("no token"));
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("Register Page — Integration Tests", () => {

  describe("Rendering", () => {

    it("renders the create account heading", async () => {
      renderRegister();
      await waitFor(() => {
        expect(screen.getByText("Create account")).toBeInTheDocument();
      });
    });

    it("renders name input", async () => {
      renderRegister();
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
      });
    });

    it("renders email input", async () => {
      renderRegister();
      await waitFor(() => {
        expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
      });
    });

    it("renders password input", async () => {
      renderRegister();
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Min 6 characters")).toBeInTheDocument();
      });
    });

    it("renders Customer role button", async () => {
      renderRegister();
      await waitFor(() => {
        expect(screen.getByText("Customer")).toBeInTheDocument();
      });
    });

    it("renders Vendor role button", async () => {
      renderRegister();
      await waitFor(() => {
        expect(screen.getByText("Vendor")).toBeInTheDocument();
      });
    });

    it("renders create account submit button", async () => {
      renderRegister();
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
      });
    });

  });

  describe("Form submission", () => {

    it("shows success screen after successful customer registration", async () => {
      api.authAPI.register.mockResolvedValueOnce({
        data: { data: { uuid: "abc", role: "customer" }, message: "Registration successful" }
      });
      renderRegister();
      await waitFor(() => screen.getByPlaceholderText("Your name"));

      await userEvent.type(screen.getByPlaceholderText("Your name"), "John Doe");
      await userEvent.type(screen.getByPlaceholderText("you@example.com"), "john@test.com");
      await userEvent.type(screen.getByPlaceholderText("Min 6 characters"), "password123");
      await userEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText("Account Created!")).toBeInTheDocument();
      });
    });

    it("shows vendor approval message for vendor registration", async () => {
      api.authAPI.register.mockResolvedValueOnce({
        data: { data: { uuid: "abc", role: "vendor" } }
      });
      renderRegister();
      await waitFor(() => screen.getByPlaceholderText("Your name"));

      await userEvent.type(screen.getByPlaceholderText("Your name"), "Vendor Jane");
      await userEvent.type(screen.getByPlaceholderText("you@example.com"), "jane@vendor.com");
      await userEvent.type(screen.getByPlaceholderText("Min 6 characters"), "password123");

      // Click the Vendor button by its text content
      await userEvent.click(screen.getByText("Vendor"));
      await userEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText("Account Created!")).toBeInTheDocument();
      });
    });

    it("shows error message on failed registration", async () => {
      api.authAPI.register.mockRejectedValueOnce({
        response: { data: { message: "Email already registered" } }
      });
      renderRegister();
      await waitFor(() => screen.getByPlaceholderText("Your name"));

      await userEvent.type(screen.getByPlaceholderText("Your name"), "John");
      await userEvent.type(screen.getByPlaceholderText("you@example.com"), "existing@test.com");
      await userEvent.type(screen.getByPlaceholderText("Min 6 characters"), "password123");
      await userEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText("Email already registered")).toBeInTheDocument();
      });
    });

    it("shows loading state during submission", async () => {
      let resolveRegister;
      api.authAPI.register.mockImplementation(
        () => new Promise(resolve => { resolveRegister = resolve; })
      );
      renderRegister();
      await waitFor(() => screen.getByPlaceholderText("Your name"));

      await userEvent.type(screen.getByPlaceholderText("Your name"), "John");
      await userEvent.type(screen.getByPlaceholderText("you@example.com"), "john@test.com");
      await userEvent.type(screen.getByPlaceholderText("Min 6 characters"), "pass123");

      // Click submit and immediately check loading state
      userEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /create account/i })).toBeDisabled();
      });
    });

  });

});