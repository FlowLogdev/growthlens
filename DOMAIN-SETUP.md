# Domain / DNS setup status (usegrowthlens.com)

Ongoing work moving DNS for `usegrowthlens.com` off GoDaddy's default config and
onto Vercel + (in progress) Cloudflare. Picks up from a chat session on
2026-07-07.

## Vercel project

- Project: `growthlens` (`prj_csdxV2IA30VJl5hBOziQ5gjJgrKm`), team `flowlogdev-s-projects`
  (`team_I4t7GBam4YQ4WK8Urw0I1me5`) — see `.vercel/project.json`.
- Both `usegrowthlens.com` (apex) and `www.usegrowthlens.com` are added and
  connected to the `growthlens` project in Vercel's dashboard.

## What was fixed so far (in GoDaddy DNS, before moving to Cloudflare)

- GoDaddy had a default parked `CNAME www -> usegrowthlens.com` record that
  conflicted when trying to add the www record Vercel needs. Fixed by
  **editing** that record in place to `CNAME www -> cname.vercel-dns.com`
  (do not add a second record with the same name — GoDaddy/DNS won't allow
  two records with the same name+different type).
- There were **two A records for `@`**: one correct (`A @ 76.76.21.21`,
  Vercel's IP) and one leftover from GoDaddy's Website Builder/Airo product
  (`A @ WebsiteBuilder Site`) pointing the apex domain at GoDaddy's own
  "Launching Soon" parked page. The WebsiteBuilder one was deleted, keeping
  only `A @ 76.76.21.21`.
- Final known-good record set (GoDaddy-managed, before Cloudflare move):
  - `A @ 76.76.21.21`
  - `CNAME www -> cname.vercel-dns.com.`
  - `NS @ ns25.domaincontrol.com.` / `ns26.domaincontrol.com.` (GoDaddy's own, untouched)
  - `SOA @` (untouched)
  - `CNAME _domainconnect -> _domainconnect.gd.domaincontrol.com.` (untouched, harmless)
  - `TXT _dmarc -> v=DMARC1; p=quarantine; ...` (untouched)
  - **No MX record** — confirmed with the user that no email is hosted on
    this domain, so nameserver changes are safe re: email deliverability.

## Cert issue encountered

After fixing the DNS records, `usegrowthlens.com` (apex) showed
`NET::ERR_CERT_COMMON_NAME_INVALID` in Chrome even though DNS resolved
correctly to `76.76.21.21` (verified via `nslookup` and `openssl s_client`).
Root cause: Vercel's Let's Encrypt cert only had `www.usegrowthlens.com` in
its SAN list, not the apex — cert for apex hadn't finished
issuing/reissuing yet after the DNS cleanup. Expected to resolve on its own
once Vercel detects the clean DNS state (up to ~1 hour); re-check with:

```
openssl s_client -connect usegrowthlens.com:443 -servername usegrowthlens.com </dev/null 2>/dev/null \
  | openssl x509 -noout -text | grep -A2 "Subject Alternative Name"
```

Once `usegrowthlens.com` (not just `www.usegrowthlens.com`) shows up in the
SAN list, the browser error should clear.

## In progress: moving DNS management to Cloudflare

Decision: move DNS hosting from GoDaddy to Cloudflare (better tooling), but
keep Vercel for actual hosting — i.e. Cloudflare will hold the same records
(`A @ 76.76.21.21`, `CNAME www -> cname.vercel-dns.com`, `TXT _dmarc`, etc.)
rather than proxying traffic.

Plan / next steps:
1. Create the site in Cloudflare (Free plan) for `usegrowthlens.com`, let it
   auto-scan/import the existing GoDaddy records.
2. **Verify the imported record list** matches the known-good set above
   before doing anything else (esp. double-check no MX records appear that
   we didn't expect, and that the A/CNAME values are correct).
3. Set the `A` and `CNAME` records to **"DNS only" (grey cloud)**, not
   Proxied (orange cloud) — Vercel handles its own TLS/CDN; proxying through
   Cloudflare on top adds complexity we don't need yet. Can reconsider later.
4. Get the two Cloudflare-assigned nameservers.
5. In GoDaddy, change the domain's nameservers from GoDaddy default to
   **Custom**, entering Cloudflare's two nameservers.
6. Wait for propagation (Cloudflare emails when detected; can take up to
   24-48h worst case, often much faster).
7. Once Cloudflare shows the zone **Active**, re-verify domain status in
   Vercel's dashboard and re-check the cert (same openssl command as above).

**Status as of end of last session:** user was about to create the
Cloudflare site and was going to paste back the auto-imported record list
and assigned nameservers for review before touching GoDaddy's nameserver
settings. Nothing has been changed in Cloudflare or GoDaddy's nameservers
yet.
