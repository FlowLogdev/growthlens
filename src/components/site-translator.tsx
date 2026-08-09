"use client";

import { useEffect } from "react";
import { useLocale } from "@/components/locale-provider";
import { hasTranslation, translate } from "@/lib/i18n";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA", "OPTION"]);
const originalTextNodes = new WeakMap<Text, string>();

function translateElement(root: ParentNode, locale: ReturnType<typeof useLocale>["locale"]) {
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
          node.textContent = raw.replace(trimmed, translate(locale, source));
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
      if (!element.dataset[key] && hasTranslation(locale, current)) element.dataset[key] = current;
      if (hasTranslation(locale, source)) element.setAttribute(attribute, translate(locale, source));
    }
  });
}

export function SiteTranslator() {
  const { locale } = useLocale();

  useEffect(() => {
    translateElement(document.body, locale);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) translateElement(node, locale);
          else if (node.parentElement) translateElement(node.parentElement, locale);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);

  return null;
}
