const sage = "#A2B29F";
const sageBright = "#C4D1C0";
const wine = "#3F1521";
const wineSoft = "#4C1C28";
const ivory = "#F4F2EE";

const visibleBorder = `2px solid ${sage}`;

export const clerkAppearance = {
  variables: {
    colorPrimary: sage,
    colorBackground: wineSoft,
    colorInputBackground: wine,
    colorInputText: ivory,
    colorText: ivory,
    colorTextSecondary: sageBright,
    colorDanger: sage,
    colorNeutral: sage,
    borderRadius: "0.9rem",
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    card: "bg-ink-soft shadow-none",
    headerTitle: "font-display text-ivory",
    headerSubtitle: "text-ivory-dim",
    socialButtonsBlockButton: {
      border: visibleBorder,
      backgroundColor: wine,
      color: ivory,
    },
    socialButtonsIconButton: {
      border: visibleBorder,
      backgroundColor: wine,
      color: ivory,
    },
    alternativeMethodsBlockButton: {
      border: visibleBorder,
      backgroundColor: wine,
      color: ivory,
    },
    formFieldInput: {
      border: visibleBorder,
      backgroundColor: wine,
      color: ivory,
    },
    formButtonPrimary: {
      border: visibleBorder,
      backgroundColor: sage,
      color: wine,
      boxShadow: "none",
    },
    formFieldInputShowPasswordButton: "text-halo-bright",
    footerActionLink: "text-halo-bright hover:text-halo",
    identityPreviewEditButton: "text-halo-bright",
    userButtonPopoverCard: {
      border: visibleBorder,
      backgroundColor: wineSoft,
    },
    userButtonPopoverActionButton: {
      border: visibleBorder,
    },
  },
};
