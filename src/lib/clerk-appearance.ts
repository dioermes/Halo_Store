const sage = "#C5CEBC";
const sageSoft = "#B7C2B0";
const wine = "#3F1521";
const wineSoft = "#5C2432";

const visibleBorder = `2px solid ${wine}`;

export const clerkAppearance = {
  variables: {
    colorPrimary: wine,
    colorBackground: sageSoft,
    colorInputBackground: sage,
    colorInputText: wine,
    colorText: wine,
    colorTextSecondary: wineSoft,
    colorDanger: wine,
    colorNeutral: wine,
    borderRadius: "0.9rem",
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    card: {
      border: visibleBorder,
      backgroundColor: sageSoft,
      boxShadow: "none",
    },
    headerTitle: "font-display text-ivory",
    headerSubtitle: "text-ivory-dim",
    socialButtonsBlockButton: {
      border: visibleBorder,
      backgroundColor: sage,
      color: wine,
    },
    socialButtonsIconButton: {
      border: visibleBorder,
      backgroundColor: sage,
      color: wine,
    },
    alternativeMethodsBlockButton: {
      border: visibleBorder,
      backgroundColor: sage,
      color: wine,
    },
    formFieldInput: {
      border: visibleBorder,
      backgroundColor: sage,
      color: wine,
    },
    formButtonPrimary: {
      border: visibleBorder,
      backgroundColor: wine,
      color: sage,
      boxShadow: "none",
    },
    formFieldInputShowPasswordButton: "text-halo-bright",
    footerActionLink: "text-halo-bright hover:text-halo",
    identityPreviewEditButton: "text-halo-bright",
    userButtonPopoverCard: {
      border: visibleBorder,
      backgroundColor: sageSoft,
    },
    userButtonPopoverActionButton: {
      border: visibleBorder,
    },
  },
};
