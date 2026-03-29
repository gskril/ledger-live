import axios from "axios";
import { resolveAddress, resolveDomain } from "../../resolvers";

jest.mock("axios");
const mockedAxios = jest.mocked(axios);

// Test names and addresses sourced from https://github.com/ensdomains/resolution-tests
describe("Domain Service", () => {
  describe("Resolvers", () => {
    describe("resolveDomain", () => {
      beforeEach(() => {
        jest.restoreAllMocks();
        jest.spyOn(mockedAxios, "request").mockImplementation(async ({ url }: { url: string }) => {
          if (url?.endsWith("ur.integration-tests.eth")) {
            return { data: "0x2222222222222222222222222222222222222222" } as any;
          }
          if (url?.endsWith("test.offchaindemo.eth")) {
            return { data: "0x779981590E7Ccc0CFAe8040Ce7151324747cDb97" } as any;
          }
          if (url?.endsWith("pokersback.com")) {
            return { data: "0x534631Bcf33BDb069fB20A93d2fdb9e4D4dD42CF" } as any;
          }
          return Promise.reject({ response: { status: 404 } }) as any;
        });
      });

      it("should resolve an onchain .eth name by inferring the registries", async () => {
        const resolutions = await resolveDomain("ur.integration-tests.eth");
        expect(resolutions).toEqual([
          {
            registry: "ens",
            address: "0x2222222222222222222222222222222222222222",
            domain: "ur.integration-tests.eth",
            type: "forward",
          },
        ]);
      });

      it("should resolve an onchain .eth name by specifying the registry", async () => {
        const resolutions = await resolveDomain("ur.integration-tests.eth", "ens");
        expect(resolutions).toEqual([
          {
            registry: "ens",
            address: "0x2222222222222222222222222222222222222222",
            domain: "ur.integration-tests.eth",
            type: "forward",
          },
        ]);
      });

      it("should resolve an offchain .eth name via CCIP-Read", async () => {
        const resolutions = await resolveDomain("test.offchaindemo.eth");
        expect(resolutions).toEqual([
          {
            registry: "ens",
            address: "0x779981590E7Ccc0CFAe8040Ce7151324747cDb97",
            domain: "test.offchaindemo.eth",
            type: "forward",
          },
        ]);
      });

      it("should resolve a DNS name imported into ENS", async () => {
        const resolutions = await resolveDomain("pokersback.com");
        expect(resolutions).toEqual([
          {
            registry: "ens",
            address: "0x534631Bcf33BDb069fB20A93d2fdb9e4D4dD42CF",
            domain: "pokersback.com",
            type: "forward",
          },
        ]);
      });

      it("should fail at resolving a non existing ENS domain", async () => {
        const resolutions = await resolveDomain("anything.eth");
        expect(resolutions).toEqual([]);
      });
    });

    describe("resolveAddress", () => {
      beforeEach(() => {
        jest.restoreAllMocks();
        jest.spyOn(mockedAxios, "request").mockImplementation(async ({ url }: { url: string }) => {
          if (url?.endsWith("0xee9eeaab0bb7d9b969d701f6f8212609edea252e")) {
            return { data: "devrel.enslabs.eth" } as any;
          }
          return Promise.reject({ response: { status: 404 } }) as any;
        });
      });

      it("should reverse resolve an ETH address by inferring registries", async () => {
        const resolutions = await resolveAddress("0xee9eeaab0bb7d9b969d701f6f8212609edea252e");
        expect(resolutions).toEqual([
          {
            registry: "ens",
            domain: "devrel.enslabs.eth",
            address: "0xeE9eeaAB0Bb7D9B969D701f6f8212609EDeA252E",
            type: "reverse",
          },
        ]);
      });

      it("should reverse resolve an ETH address by specifying registry", async () => {
        const resolutions = await resolveAddress(
          "0xee9eeaab0bb7d9b969d701f6f8212609edea252e",
          "ens",
        );
        expect(resolutions).toEqual([
          {
            registry: "ens",
            domain: "devrel.enslabs.eth",
            address: "0xeE9eeaAB0Bb7D9B969D701f6f8212609EDeA252E",
            type: "reverse",
          },
        ]);
      });

      it("should fail at resolving an address without reverse record", async () => {
        const resolutions = await resolveAddress("0x123");
        expect(resolutions).toEqual([]);
      });
    });
  });
});
