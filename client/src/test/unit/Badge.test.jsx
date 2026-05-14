import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "../../components/Badge";

describe("Badge Component — Unit Tests", () => {

  it("renders the status text", () => {
    render(<Badge status="active" />);
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("renders pending status", () => {
    render(<Badge status="pending" />);
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("renders approved status", () => {
    render(<Badge status="approved" />);
    expect(screen.getByText("approved")).toBeInTheDocument();
  });

  it("renders rejected status", () => {
    render(<Badge status="rejected" />);
    expect(screen.getByText("rejected")).toBeInTheDocument();
  });

  it("renders cancelled status", () => {
    render(<Badge status="cancelled" />);
    expect(screen.getByText("cancelled")).toBeInTheDocument();
  });

  it("renders shipped status", () => {
    render(<Badge status="shipped" />);
    expect(screen.getByText("shipped")).toBeInTheDocument();
  });

  it("renders delivered status", () => {
    render(<Badge status="delivered" />);
    expect(screen.getByText("delivered")).toBeInTheDocument();
  });

  it("renders unknown status with fallback style", () => {
    render(<Badge status="unknown" />);
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });

  it("renders empty string status without crashing", () => {
    const { container } = render(<Badge status="" />);
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
  });

  it("renders as a span element", () => {
    const { container } = render(<Badge status="active" />);
    expect(container.querySelector("span")).toBeInTheDocument();
  });

  it("has uppercase styling class", () => {
    const { container } = render(<Badge status="active" />);
    const span = container.querySelector("span");
    expect(span.className).toContain("uppercase");
  });

  it("renders vendor badge", () => {
    render(<Badge status="vendor" />);
    expect(screen.getByText("vendor")).toBeInTheDocument();
  });

  it("renders admin badge", () => {
    render(<Badge status="admin" />);
    expect(screen.getByText("admin")).toBeInTheDocument();
  });

  it("renders customer badge", () => {
    render(<Badge status="customer" />);
    expect(screen.getByText("customer")).toBeInTheDocument();
  });

  it("renders paid badge", () => {
    render(<Badge status="paid" />);
    expect(screen.getByText("paid")).toBeInTheDocument();
  });

  it("renders failed badge", () => {
    render(<Badge status="failed" />);
    expect(screen.getByText("failed")).toBeInTheDocument();
  });

  it("renders draft badge", () => {
    render(<Badge status="draft" />);
    expect(screen.getByText("draft")).toBeInTheDocument();
  });

  it("renders inactive badge", () => {
    render(<Badge status="inactive" />);
    expect(screen.getByText("inactive")).toBeInTheDocument();
  });

});