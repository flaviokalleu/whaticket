import { promises as dns } from "dns";
import { URL } from "url";
import AppError from "../errors/AppError";

// Convert an IPv4 string to a 32-bit integer for CIDR range checks.
const ipv4ToInt = (ip: string): number => {
  return ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
};

const isIpv4InCidr = (ip: string, cidr: string): boolean => {
  const [range, bitsStr] = cidr.split("/");
  const bits = parseInt(bitsStr, 10);
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipv4ToInt(ip) & mask) === (ipv4ToInt(range) & mask);
};

const PRIVATE_IPV4_RANGES = [
  "10.0.0.0/8",
  "172.16.0.0/12",
  "192.168.0.0/16",
  "127.0.0.0/8",
  "169.254.0.0/16",
  "0.0.0.0/8"
];

const isPrivateOrLoopbackIp = (ip: string, family: number): boolean => {
  if (family === 4) {
    return PRIVATE_IPV4_RANGES.some(range => isIpv4InCidr(ip, range));
  }

  // IPv6 checks: loopback (::1) and link-local (fe80::/10) and unique local (fc00::/7)
  const normalized = ip.toLowerCase();
  if (normalized === "::1") return true;
  if (normalized.startsWith("fe80:")) return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  // IPv4-mapped IPv6 addresses like ::ffff:127.0.0.1
  const mappedMatch = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mappedMatch) {
    return PRIVATE_IPV4_RANGES.some(range =>
      isIpv4InCidr(mappedMatch[1], range)
    );
  }
  return false;
};

/**
 * Guards against Server-Side Request Forgery (SSRF) by validating that a
 * target URL uses http/https and resolves to a public, non-internal IP
 * address. Throws an AppError if the URL is unsafe.
 *
 * Intended to be reused by any feature that makes outbound HTTP requests to
 * user/tenant-supplied URLs (webhooks today, potentially other integrations
 * later).
 */
export const assertUrlIsSafe = async (url: string): Promise<void> => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch (err) {
    throw new AppError("ERR_WEBHOOK_INVALID_URL", 400);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AppError("ERR_WEBHOOK_INVALID_PROTOCOL", 400);
  }

  const hostname = parsed.hostname;

  let addresses: { address: string; family: number }[];
  try {
    const result = await dns.lookup(hostname, { all: true });
    addresses = result;
  } catch (err) {
    throw new AppError("ERR_WEBHOOK_UNRESOLVABLE_HOST", 400);
  }

  if (!addresses.length) {
    throw new AppError("ERR_WEBHOOK_UNRESOLVABLE_HOST", 400);
  }

  const hasUnsafeAddress = addresses.some(({ address, family }) =>
    isPrivateOrLoopbackIp(address, family)
  );

  if (hasUnsafeAddress) {
    throw new AppError("ERR_WEBHOOK_URL_NOT_ALLOWED", 400);
  }
};

export default assertUrlIsSafe;
