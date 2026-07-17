import { describe, expect, test } from "vitest";
import ts from "typescript";
import { getRelatedAlternativeSlugs } from "./related-alternatives";
import { readMarketingSource } from "./source-test-utils";

function getAlternativeRegistrySlugs(): string[] {
  const sourceFile = ts.createSourceFile(
    "alternative-page.tsx",
    readMarketingSource("src/components/alternatives/alternative-page.tsx"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let registry: ts.ObjectLiteralExpression | undefined;

  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) {
      return;
    }

    for (const declaration of node.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === "ALTERNATIVES" &&
        declaration.initializer &&
        ts.isObjectLiteralExpression(declaration.initializer)
      ) {
        registry = declaration.initializer;
      }
    }
  });

  if (!registry) {
    throw new Error("Could not find the ALTERNATIVES registry");
  }

  return registry.properties.flatMap((property) => {
    if (!ts.isPropertyAssignment(property)) {
      return [];
    }

    return ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)
      ? [property.name.text]
      : [];
  });
}

describe("getRelatedAlternativeSlugs", () => {
  test("returns the curated comparisons for Churn Buster", () => {
    expect(getRelatedAlternativeSlugs("churn-buster")).toEqual([
      "churnkey",
      "retryfix",
      "stripe-customer-emails",
    ]);
  });

  test("falls back to three unique comparisons without linking to itself", () => {
    const relatedSlugs = getRelatedAlternativeSlugs(
      "stripe-customer-emails",
    );

    expect(relatedSlugs).toHaveLength(3);
    expect(new Set(relatedSlugs).size).toBe(3);
    expect(relatedSlugs).not.toContain("stripe-customer-emails");
  });

  test("returns three valid registry entries for every alternative", () => {
    const registrySlugs = getAlternativeRegistrySlugs();
    const registrySlugSet = new Set(registrySlugs);

    for (const slug of registrySlugs) {
      const relatedSlugs = getRelatedAlternativeSlugs(slug);

      expect(relatedSlugs, slug).toHaveLength(3);
      expect(new Set(relatedSlugs).size, slug).toBe(3);
      expect(relatedSlugs, slug).not.toContain(slug);
      for (const relatedSlug of relatedSlugs) {
        expect(registrySlugSet.has(relatedSlug), `${slug} -> ${relatedSlug}`).toBe(
          true,
        );
      }
    }
  });
});
