import { E2EPage, newE2EPage } from "@stencil/core/testing";
import { accessible, defaults, focusable, hidden, reflects, renders } from "../../tests/commonTests";
import { CSS } from "./resources";

describe("calcite-filter", () => {
  it("renders", async () => renders("calcite-filter", { display: "flex" }));

  it("honors hidden attribute", async () => hidden("calcite-filter"));

  it("is accessible", async () => accessible("calcite-filter"));

  it("is focusable", async () => focusable("calcite-filter"));

  it("reflects", async () =>
    reflects("calcite-filter", [
      {
        propertyName: "disabled",
        value: true
      },
      {
        propertyName: "scale",
        value: "s"
      }
    ]));

  it("has defaults", async () =>
    defaults("calcite-filter", [
      {
        propertyName: "disabled",
        defaultValue: false
      },
      {
        propertyName: "filteredItems",
        defaultValue: []
      },
      {
        propertyName: "scale",
        defaultValue: "m"
      }
    ]));

  it("sets scale on the input", async () => {
    const scale = "s";
    const page = await newE2EPage();
    await page.setContent(`<calcite-filter scale="${scale}"></calcite-filter>`);

    const input = await page.find(`calcite-filter >>> calcite-input`);
    expect(await input.getProperty("scale")).toBe(scale);
  });

  describe("strings", () => {
    it("should update the filter placeholder when a string is provided", async () => {
      const page = await newE2EPage();
      const placeholderText = "placeholder";
      await page.setContent(`<calcite-filter placeholder="${placeholderText}"></calcite-filter>`);

      const input = await page.find(`calcite-filter >>> calcite-input`);
      expect(await input.getProperty("placeholder")).toBe(placeholderText);
    });
  });

  describe("clear button", () => {
    let page;

    beforeEach(async () => {
      page = await newE2EPage();
      await page.setContent("<calcite-filter></calcite-filter>");
      await page.evaluate(() => {
        const filter = document.querySelector("calcite-filter");
        filter.items = [{ foo: "bar" }];
      });
    });

    it("should only display when the input has a value", async () => {
      let button = await page.find(`calcite-filter >>> .${CSS.clearButton}`);

      expect(button).toBeNull();

      const filter = await page.find("calcite-filter");
      await filter.callMethod("setFocus");

      await page.keyboard.type("developer");
      await page.waitForChanges();

      button = await page.find(`calcite-filter >>> .${CSS.clearButton}`);

      expect(button).not.toBeNull();
      expect(await filter.getProperty("value")).toBe("developer");
    });

    describe("clearing value", () => {
      const filterIsFocused = async (): Promise<boolean> =>
        page.evaluate(() => document.querySelector("calcite-filter") === document.activeElement);

      it("should clear the value in the input when pressed", async () => {
        const filter = await page.find("calcite-filter");
        await filter.callMethod("setFocus");

        await page.keyboard.type("developer");
        await page.waitForChanges();

        expect(await filter.getProperty("value")).toBe("developer");

        const button = await page.find(`calcite-filter >>> .${CSS.clearButton}`);

        await button.click();
        await page.waitForChanges();

        expect(await filter.getProperty("value")).toBe("");
        expect(await filterIsFocused()).toBe(true);
      });

      it("should clear the value in the input when the Escape key is pressed", async () => {
        const filter = await page.find("calcite-filter");
        await filter.callMethod("setFocus");

        await page.keyboard.type("developer");
        await page.waitForChanges();

        await page.keyboard.press("Escape");
        await page.waitForChanges();

        expect(await filter.getProperty("value")).toBe("");
        expect(await filterIsFocused()).toBe(true);
      });
    });
  });

  describe("filter behavior", () => {
    let page: E2EPage;

    beforeEach(async () => {
      page = await newE2EPage();
      await page.setContent("<calcite-filter></calcite-filter>");
      await page.evaluate(() => {
        const filter = document.querySelector("calcite-filter");
        filter.items = [
          {
            name: "Harry",
            description: "developer",
            value: "harry",
            metadata: { haircolor: "red", favoriteBand: "MetallicA" }
          },
          {
            name: "Matt",
            description: "developer",
            value: "matt",
            metadata: { haircolor: "black", favoriteBand: "unknown" }
          },
          {
            name: "Franco",
            description: "developer",
            value: "franco",
            metadata: { haircolor: "black", favoriteBand: "The Mars Volta" }
          },
          {
            name: "Katy",
            description: "engineer",
            value: "katy",
            metadata: { haircolor: "red", favoriteBand: "unknown" }
          },
          {
            name: "Jon",
            description: "developer",
            value: "jon",
            metadata: { haircolor: "brown", favoriteBand: "Hippity Hops" }
          },
          {
            name: "regex",
            description: "regex",
            value: "regex",
            metadata: { haircolor: "rainbow", favoriteBand: "regex()" }
          }
        ];
      });
    });

    function assertMatchingItems(filtered: any[], values: string[]): void {
      expect(filtered).toHaveLength(values.length);
      values.forEach((value) => expect(filtered.find((element) => element.value === value)).toBeDefined());
    }

    it("updates filtered items after filtering", async () => {
      const filterChangeSpy = await page.spyOnEvent("calciteFilterChange");
      let waitForEvent = page.waitForEvent("calciteFilterChange");
      const filter = await page.find("calcite-filter");
      await filter.callMethod("setFocus");
      await filter.type("developer");
      await waitForEvent;

      expect(filterChangeSpy).toHaveReceivedEventTimes(1);

      assertMatchingItems(await filter.getProperty("filteredItems"), ["harry", "matt", "franco", "jon"]);

      waitForEvent = page.waitForEvent("calciteFilterChange");
      await page.evaluate(() => {
        const filter = document.querySelector("calcite-filter");
        filter.items = filter.items.slice(3);
      });
      await waitForEvent;

      expect(filterChangeSpy).toHaveReceivedEventTimes(2);

      assertMatchingItems(await filter.getProperty("filteredItems"), ["jon"]);
    });

    it("searches recursively in items and works and matches on a partial string ignoring case", async () => {
      const waitForEvent = page.waitForEvent("calciteFilterChange");
      const filter = await page.find("calcite-filter");

      await filter.callMethod("setFocus");
      await filter.type("volt");
      await waitForEvent;

      assertMatchingItems(await filter.getProperty("filteredItems"), ["franco"]);
    });

    it("should escape regex", async () => {
      const waitForEvent = page.waitForEvent("calciteFilterChange");
      const filter = await page.find("calcite-filter");

      await filter.callMethod("setFocus");
      await filter.type("regex()");
      await waitForEvent;

      assertMatchingItems(await filter.getProperty("filteredItems"), ["regex"]);
    });
  });
});