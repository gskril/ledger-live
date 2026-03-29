import { getRegistriesForAddress, getRegistriesForDomain } from "../../registries";

// Test names sourced from https://github.com/ensdomains/resolution-tests
describe("Domain Service", () => {
  describe("Registries", () => {
    describe("getRegistriesForDomain", () => {
      it("should return a registry for an onchain .eth name", async () => {
        expect(await getRegistriesForDomain("ur.integration-tests.eth")).toHaveLength(1);
      });

      it("should return a registry for an offchain .eth name (CCIP-Read)", async () => {
        expect(await getRegistriesForDomain("test.offchaindemo.eth")).toHaveLength(1);
      });

      it("should return a registry for a DNS name imported into ENS", async () => {
        expect(await getRegistriesForDomain("pokersback.com")).toHaveLength(1);
      });

      it("should return an empty array for a string without a dot", async () => {
        expect(await getRegistriesForDomain("vitaliketh")).toHaveLength(0);
      });
    });

    describe("getRegistriesForAddress", () => {
      it("should return a registry for a valid ETH address", async () => {
        expect(
          await getRegistriesForAddress("0xeE9eeaAB0Bb7D9B969D701f6f8212609EDeA252E"),
        ).toHaveLength(1);
      });

      it("should return an empty array for an unsupported address", async () => {
        expect(await getRegistriesForAddress("0x123")).toHaveLength(0);
      });
    });
  });
});
