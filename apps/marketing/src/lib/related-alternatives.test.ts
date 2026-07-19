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

  return registry.properties.map((property) => {
    if (!ts.isPropertyAssignment(property)) {
      throw new Error(
        `Unsupported ALTERNATIVES property: ${property.getText(sourceFile)}`,
      );
    }

    if (!ts.isIdentifier(property.name) && !ts.isStringLiteral(property.name)) {
      throw new Error(
        `Could not extract ALTERNATIVES key: ${property.name.getText(sourceFile)}`,
      );
    }

    const registryKey = property.name.text;
    if (!ts.isObjectLiteralExpression(property.initializer)) {
      throw new Error(`ALTERNATIVES.${registryKey} is not an object literal`);
    }

    const slugProperty = property.initializer.properties.find(
      (nestedProperty) =>
        ts.isPropertyAssignment(nestedProperty) &&
        (ts.isIdentifier(nestedProperty.name) ||
          ts.isStringLiteral(nestedProperty.name)) &&
        nestedProperty.name.text === "slug",
    );
    if (
      !slugProperty ||
      !ts.isPropertyAssignment(slugProperty) ||
      !ts.isStringLiteral(slugProperty.initializer)
    ) {
      throw new Error(`ALTERNATIVES.${registryKey} has no string slug`);
    }

    if (slugProperty.initializer.text !== registryKey) {
      throw new Error(
        `ALTERNATIVES.${registryKey} declares slug ${slugProperty.initializer.text}`,
      );
    }

    return registryKey;
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

    expect(registrySlugs.length).toBeGreaterThan(0);
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
