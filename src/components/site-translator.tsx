"use client";

import { useEffect } from "react";
import { useLocale } from "@/components/locale-provider";
import { hasTranslation, translate } from "@/lib/i18n";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA", "OPTION"]);
const originalTextNodes = new WeakMap<Text, string>();
const remoteTranslations = new Map<string, string>();
const attemptedTranslations = new Set<string>();

function cacheKey(locale: ReturnType<typeof useLocale>["locale"], source: string) {
  return `${locale}:${source}`;
}

function isRemoteCandidate(source: string) {
  if (source.length < 2 || source.length > 1_200) return false;
  if (!/\p{L}/u.test(source)) return false;
  if (/^(?:https?:\/\/|mailto:)/i.test(source) || /^\S+@\S+\.\S+$/.test(source)) return false;
  return true;
}

function remoteScope(parent: HTMLElement) {
  return parent.closest("[data-auto-translate]") && !parent.closest("[data-no-translate]");
}

function replaceText(node: Node, raw: string, trimmed: string, value: string) {
  const next = raw.replace(trimmed, value);
  if (node.textContent !== next) node.textContent = next;
}

function translateElement(
  root: ParentNode,
  locale: ReturnType<typeof useLocale>["locale"],
  pending: Set<string>,
) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    if (parent && !SKIP_TAGS.has(parent.tagName) && !parent.closest("[data-no-translate]")) {
      const raw = node.textContent ?? "";
      const trimmed = raw.trim();
      if (trimmed) {
        const textNode = node as Text;
        const source = originalTextNodes.get(textNode) ?? trimmed;
        if (!originalTextNodes.has(textNode)) originalTextNodes.set(textNode, source);
        if (hasTranslation(locale, source)) {
          replaceText(node, raw, trimmed, translate(locale, source));
        } else if (locale !== "en-US" && remoteScope(parent) && isRemoteCandidate(source)) {
          const cached = remoteTranslations.get(cacheKey(locale, source));
          if (cached) replaceText(node, raw, trimmed, cached);
          else if (!attemptedTranslations.has(cacheKey(locale, source))) pending.add(source);
        } else if (locale === "en-US") {
          replaceText(node, raw, trimmed, source);
        }
      }
    }
    node = walker.nextNode();
  }

  root.querySelectorAll?.<HTMLElement>("[placeholder], [title], [aria-label]").forEach((element) => {
    for (const attribute of ["placeholder", "title", "aria-label"]) {
      const current = element.getAttribute(attribute);
      if (!current) continue;
      const key = `glOriginal${attribute.replace("-", "")}`;
      const source = element.dataset[key] ?? current;
      if (!element.dataset[key]) element.dataset[key] = current;
      if (hasTranslation(locale, source)) {
        element.setAttribute(attribute, translate(locale, source));
      } else if (locale !== "en-US" && remoteScope(element) && isRemoteCandidate(source)) {
        const cached = remoteTranslations.get(cacheKey(locale, source));
        if (cached) element.setAttribute(attribute, cached);
        else if (!attemptedTranslations.has(cacheKey(locale, source))) pending.add(source);
      } else if (locale === "en-US") {
        element.setAttribute(attribute, source);
      }
    }
  });
}

export function SiteTranslator() {
  const { locale } = useLocale();

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();

    function scan(root: ParentNode = document.body) {
      const pending = new Set<string>();
      translateElement(root, locale, pending);
      if (!pending.size || locale === "en-US") return;
      const items = [...pending].slice(0, 40);
      items.forEach((source) => attemptedTranslations.add(cacheKey(locale, source)));
      void fetch("/api/localize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, texts: items }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(`Localization failed with ${response.status}`);
          return response.json() as Promise<{ translations: string[] }>;
        })
        .then((payload) => {
          if (stopped) return;
          items.forEach((source, index) => {
            const value = payload.translations[index];
            if (value) remoteTranslations.set(cacheKey(locale, source), value);
          });
          scan(document.body);
        })
        .catch((error) => {
          if ((error as Error).name !== "AbortError") {
            items.forEach((source) => attemptedTranslations.delete(cacheKey(locale, source)));
            console.error("Localization request failed");
          }
        });
    }

    function scheduleScan(root: ParentNode = document.body) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => scan(root), 40);
    }

    scan();
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) scheduleScan(node);
          else if (node.parentElement) scheduleScan(node.parentElement);
        });
        if (mutation.type === "characterData" && mutation.target.parentElement) {
          scheduleScan(mutation.target.parentElement);
        }
      }
    });
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => {
      stopped = true;
      controller.abort();
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [locale]);

  return null;
}
