import { boolean, storyFilters } from "../../../.storybook/helpers";
import { placeholderImage } from "../../../.storybook/placeholderImage";
import readme from "./readme.md";
import { html } from "../../../support/formatting";
import { text } from "@storybook/addon-knobs";

export default {
  title: "Components/Navigation/Navigation Logo",
  parameters: {
    notes: readme,
  },
  ...storyFilters(),
};

export const simple = (): string =>
  html`<calcite-navigation-logo
    description="${text("description", "City of AcmeCo")}"
    heading="${text("heading", "ArcGIS Online")}"
    thumbnail="${placeholderImage({ width: 50, height: 50 })}"
    ${boolean("active", false)}
  />`;

export const heading_TestOnly = (): string => html`<calcite-navigation-logo heading="ArcGIS Online" />`;

export const description_TestOnly = (): string =>
  html`<calcite-navigation-logo
    description="City of AcmeCo"
    thumbnail="${placeholderImage({ width: 50, height: 50 })}"
  />`;

export const thumbnail_TestOnly = (): string =>
  html`<calcite-navigation-logo thumbnail="${placeholderImage({ width: 50, height: 50 })}" />`;

export const headingAndThumbnail_TestOnly = (): string => html`<calcite-navigation-logo
  heading="ArcGIS Online"
  thumbnail="${placeholderImage({ width: 50, height: 50 })}"
/>`;

export const descriptionAndThumbnail_TestOnly = (): string => html`<calcite-navigation-logo
  description="City of AcmeCo"
  thumbnail="${placeholderImage({ width: 50, height: 50 })}"
/>`;

export const All_TestOnly = (): string => html`<calcite-navigation-logo
  heading="ArcGIS Online"
  description="City of AcmeCo"
  thumbnail="${placeholderImage({ width: 50, height: 50 })}"
/>`;

export const slottedInNav_TestOnly = (): string =>
  html`
    <calcite-navigation style="--calcite-ui-brand: #bf390f">
      <calcite-navigation-logo
        heading="ArcGIS Online"
        description="City of AcmeCo"
        thumbnail="${placeholderImage({ width: 50, height: 50 })}"
        slot="logo"
      />
    </calcite-navigation>
  `;
