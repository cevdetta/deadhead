---
ruleId: "element/keygen"
title: "keygen element"
description: "The form control that generated a keypair and submitted the public key for certificate enrollment, removed from the HTML Standard and inert in every engine."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: 'keygen'
fix: { op: "remove-element" }
replacement: "For certificate enrollment, generate the keypair with the Web Cryptography API and let the user install the certificate manually; for enterprise device management, use native on-device capabilities."
tags: ["legacy"]
impacts: ["interop", "maintainability"]
related: []
---

`<keygen>` was the form control that generated a keypair in the browser and
submitted the public key for certificate enrollment. It was removed from the
HTML Standard outright — only parser behavior was retained — and no browser
generates a key anymore.

## Why avoid

Entirely obsolete by spec. The HTML Standard removed `<keygen>` (WHATWG PR
#2221, closing issue #2079), keeping only parser behavior. The old
non-conforming entry splits the replacement by use case: native on-device
capabilities for enterprise device management, the Web Cryptography API plus
manual install for certificate enrollment.

No browser generates a key. Chromium neutered `<keygen>` to a plain
`HTMLUnknownElement` that is no longer form-associated, Firefox removed support
in version 69 (Bug 1315460), and Edge never implemented it at all.

What remains is a silent no-op. With all key types removed the element has no
UI and contributes nothing to form submission, so a form that looks like it
enrolls a certificate enrolls nothing.

The original was a security liability. Chrome's removal rationale documents
systemic risk: the element modified the device-wide store outside the browsers'
and origins' security models, which is why vendors chose removal over repair.

## Use instead

Generate the keypair in script and hand the certificate to the user for manual
install:

```html
<form action="/certs/enroll" method="post">
  <p>Generate a key in your browser, then upload the certificate signing request.</p>
  <p><button type="submit">Submit request</button></p>
</form>
```

```html
<script>
  const keys = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true, ["sign", "verify"]);
</script>
```

## Detectability

Fully detectable. The selector is the bare tag name `keygen`; no logic module
is needed.

The fix removes the element outright, which is safe here: `<keygen>` is void,
renders nothing, and submits nothing, so deleting the tag subtracts nothing
working.

## Resources

- [HTML Standard — Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features) — the obsolete `keygen` entry with the per-use-case replacement (native management / WebCrypto + manual install).
- [Chromium — Remove support for the keygen tag](https://chromium.googlesource.com/chromium/src/+/5d916f6c6b47472770e03cb483f06a18ca79a0c2) — neuters `<keygen>` to `HTMLUnknownElement`, drops form association and IPC, keeps parser behavior.
- [Bug 1315460 — Remove support for HTML Keygen](https://bugzilla.mozilla.org/show_bug.cgi?id=1315460) — RESOLVED FIXED in Firefox 69; removes the handler, keygen thread, and IDL.
- [WHATWG HTML — Remove `<keygen>` (PR #2221)](https://github.com/whatwg/html/pull/2221) — removes the element from the specification except parser behavior; records WebKit's willingness to drop it.
