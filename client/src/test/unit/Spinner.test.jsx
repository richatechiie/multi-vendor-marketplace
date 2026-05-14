import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Spinner from "../../components/Spinner";

describe("Spinner Component — Unit Tests", () => {

  it("renders default loading text", () => {
    render(<Spinner />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders custom text when provided", () => {
    render(<Spinner text="Fetching products…" />);
    expect(screen.getByText("Fetching products…")).toBeInTheDocument();
  });

  it("does not render default text when custom text given", () => {
    render(<Spinner text="Please wait" />);
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
  });

  it("renders the spinner container div", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders animate-spin element", () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("renders with different text each time", () => {
    const { rerender } = render(<Spinner text="Loading users…" />);
    expect(screen.getByText("Loading users…")).toBeInTheDocument();
    rerender(<Spinner text="Loading orders…" />);
    expect(screen.getByText("Loading orders…")).toBeInTheDocument();
    expect(screen.queryByText("Loading users…")).not.toBeInTheDocument();
  });

});