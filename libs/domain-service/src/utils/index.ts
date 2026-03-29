import { PromiseResult } from "../types";

/**
 * Needed polyfill for Promise.allSettled as it doesn't exist on RN.
 */
export const allSettled = <T>(promises: Promise<T>[]): Promise<PromiseResult<T>[]> => {
  return Promise.all(
    promises.map(p => {
      return p
        .then(value => {
          return {
            status: "fulfilled" as const,
            value,
          };
        })
        .catch((reason: unknown) => {
          return {
            status: "rejected" as const,
            reason,
          };
        });
    }),
  );
};

/**
 * Check if a string looks like a domain name (contains at least one dot with
 * characters on both sides). This is intentionally broad to support both .eth
 * names and DNS names imported into ENS (e.g. ensfairy.xyz, ses.fkey.id).
 *
 * @param input string to check
 * @returns {Boolean}
 */
export const isDomainLike = (input: string | undefined): boolean => {
  if (typeof input !== "string") {
    return false;
  }

  return input.includes(".") && input.length > 2;
};

/**
 * Helper to know in advance if a domain is compatible with the nano.
 * This checks for ASCII-only characters and a max length of 29 characters,
 * which are hardware wallet display constraints.
 *
 * @param domain string representing the domain
 * @returns {Boolean}
 */
export const validateDomain = (domain: string | undefined): boolean => {
  if (typeof domain !== "string") {
    return false;
  }

  const lengthIsValid = domain.length > 0 && Number(domain.length) < 30;
  const containsOnlyValidChars = new RegExp("^[a-zA-Z0-9\\-\\_\\.]+$").test(domain);

  return lengthIsValid && containsOnlyValidChars;
};
