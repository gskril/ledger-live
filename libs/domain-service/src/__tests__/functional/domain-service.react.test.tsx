import React from "react";
import "@testing-library/jest-dom";
import { renderHook } from "@testing-library/react";
import { render, screen, waitFor } from "@testing-library/react";
import { DomainEmpty, NoResolution } from "../../errors";
import { resolveAddress, resolveDomain } from "../../resolvers";
import { DomainServiceProvider, useDomain } from "../../hooks";
import { DomainServiceResolution } from "../../types";

jest.mock("axios");
jest.mock("../../resolvers");

const mockedResolvedDomain = jest.mocked(resolveDomain);
const mockedResolvedAddress = jest.mocked(resolveAddress);

const resolutionKeys: (keyof DomainServiceResolution)[] = ["registry", "address", "domain", "type"];

const CustomTest = ({ str }: { str: string }) => {
  const result = useDomain(str);
  const { status } = result;

  return (
    <div>
      <div data-testid="status">{status}</div>
      {status === "error" && <div data-testid="error-name">{result.error.name}</div>}
      {status === "loaded" && (
        <div data-testid="resolutions">
          {result.resolutions.map((resolution, index) => (
            <React.Fragment key={index}>
              <div data-testid={`${index}-registry`}>{resolution.registry}</div>
              <div data-testid={`${index}-address`}>{resolution.address}</div>
              <div data-testid={`${index}-domain`}>{resolution.domain}</div>
              <div data-testid={`${index}-type`}>{resolution.type}</div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

const wrapper: React.ComponentType<{ children?: React.ReactNode }> = ({ children }) => (
  <DomainServiceProvider>{children}</DomainServiceProvider>
);

describe("useDomain", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedResolvedDomain.mockImplementation(async () => {
      return [];
    });
    mockedResolvedAddress.mockImplementation(async () => {
      return [];
    });
  });

  // Test names sourced from https://github.com/ensdomains/resolution-tests
  it("should be queued", async () => {
    const { result } = renderHook(useDomain, {
      initialProps: "ur.integration-tests.eth",
    });

    expect(result.current.status).toBe("queued");
  });

  it("should return an error when no resolution is found", async () => {
    const { result } = renderHook(useDomain, {
      initialProps: "",
      wrapper,
    });

    expect(result.current.status).toBe("error");
    // @ts-expect-error no type guard
    expect(result.current.error).toBeInstanceOf(DomainEmpty);
  });

  it("should return an error when no resolution is found", async () => {
    const { result } = renderHook(useDomain, {
      initialProps: "404-Not-Found.eth",
      wrapper,
    });

    await waitFor(() => result.current.status === "error");
    // @ts-expect-error no type guard
    await waitFor(() => expect(result.current.error).toBeInstanceOf(NoResolution));
  });

  it("should attempt resolution for domains with unicode or special chars", async () => {
    const { result } = renderHook(useDomain, {
      initialProps: "not|valid|👋.eth",
      wrapper,
    });

    await waitFor(() => result.current.status === "error");
    // resolution is attempted but no result is found from the backend
    // @ts-expect-error no type guard
    await waitFor(() => expect(result.current.error).toBeInstanceOf(NoResolution));
  });

  it("should return a successful forward resolution for an onchain .eth name", async () => {
    const resolutions: DomainServiceResolution[] = [
      {
        address: "0x2222222222222222222222222222222222222222",
        registry: "ens",
        domain: "ur.integration-tests.eth",
        type: "forward",
      },
    ];
    mockedResolvedDomain.mockImplementationOnce(async () => resolutions);

    render(
      <DomainServiceProvider>
        <CustomTest str="ur.integration-tests.eth" />
      </DomainServiceProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByTestId("status").textContent).toBe("loaded");
      },
      { timeout: 5000 },
    );

    expect(screen.getByTestId("status").textContent).toBe("loaded");
    expect(screen.getByTestId("resolutions")).toBeInTheDocument();
    resolutions.forEach((resolution, index) => {
      resolutionKeys.forEach(field => {
        expect(screen.getByTestId("resolutions")).toContainElement(
          screen.getByTestId(`${index}-${field}`),
        );
        expect(screen.getByTestId(`${index}-${field}`).textContent).toBe(resolution[field]);
      });
    });
  });

  it("should return a successful forward resolution for a DNS name", async () => {
    const resolutions: DomainServiceResolution[] = [
      {
        address: "0x534631Bcf33BDb069fB20A93d2fdb9e4D4dD42CF",
        registry: "ens",
        domain: "pokersback.com",
        type: "forward",
      },
    ];
    mockedResolvedDomain.mockImplementationOnce(async () => resolutions);

    render(
      <DomainServiceProvider>
        <CustomTest str="pokersback.com" />
      </DomainServiceProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByTestId("status").textContent).toBe("loaded");
      },
      { timeout: 5000 },
    );

    expect(screen.getByTestId("status").textContent).toBe("loaded");
    expect(screen.getByTestId("resolutions")).toBeInTheDocument();
    resolutions.forEach((resolution, index) => {
      resolutionKeys.forEach(field => {
        expect(screen.getByTestId("resolutions")).toContainElement(
          screen.getByTestId(`${index}-${field}`),
        );
        expect(screen.getByTestId(`${index}-${field}`).textContent).toBe(resolution[field]);
      });
    });
  });

  it("should return a successful reverse resolution", async () => {
    const reverseResolutions: DomainServiceResolution[] = [
      {
        domain: "devrel.enslabs.eth",
        registry: "ens",
        address: "0xeE9eeaAB0Bb7D9B969D701f6f8212609EDeA252E",
        type: "reverse",
      },
    ];
    mockedResolvedAddress.mockImplementationOnce(async () => reverseResolutions);

    render(
      <DomainServiceProvider>
        <CustomTest str="0xeE9eeaAB0Bb7D9B969D701f6f8212609EDeA252E" />
      </DomainServiceProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("loaded");
    });

    expect(screen.getByTestId("status").textContent).toBe("loaded");
    expect(screen.getByTestId("resolutions")).toBeInTheDocument();
    reverseResolutions.forEach((resolution, index) => {
      resolutionKeys.forEach(field => {
        expect(screen.getByTestId("resolutions")).toContainElement(
          screen.getByTestId(`${index}-${field}`),
        );
        expect(screen.getByTestId(`${index}-${field}`).textContent).toBe(resolution[field]);
      });
    });
  });
});
