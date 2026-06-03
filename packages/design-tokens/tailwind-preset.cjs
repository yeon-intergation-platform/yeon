const yeonTailwindPreset = {
  theme: {
    extend: {
      colors: {
        yeon: {
          white: "#ffffff",
          black: "#111",
          neutral: {
            50: "#fafafa",
            100: "#e5e5e5",
            400: "#aaa",
            600: "#666",
            900: "#111",
          },
          mobile: {
            accent: "#111",
            error: "#111",
            border: "#e5e5e5",
          },
          auth: {
            background: "#080808",
            surface: "#111318",
            text: "#f8f7f3",
            cta: "#f8f7f3",
            ctaText: "#080808",
          },
        },
      },
      borderRadius: {
        "yeon-sm": "6px",
        yeon: "10px",
        "yeon-lg": "14px",
        "yeon-xl": "18px",
        "yeon-2xl": "22px",
      },
      boxShadow: {
        "yeon-sm": "0 1px 2px rgba(17, 17, 17, 0.06)",
        yeon: "0 8px 24px rgba(17, 17, 17, 0.08)",
        "yeon-lg": "0 18px 48px rgba(17, 17, 17, 0.12)",
      },
      spacing: {
        "yeon-1": "4px",
        "yeon-2": "8px",
        "yeon-3": "12px",
        "yeon-4": "16px",
        "yeon-5": "20px",
        "yeon-6": "24px",
        "yeon-8": "32px",
        "yeon-10": "40px",
        "yeon-12": "48px",
        "yeon-16": "64px",
      },
      fontSize: {
        "yeon-xs": "12px",
        "yeon-sm": "13px",
        yeon: "15px",
        "yeon-lg": "17px",
        "yeon-xl": "20px",
        "yeon-2xl": "24px",
        "yeon-3xl": "32px",
      },
    },
  },
};

module.exports = { yeonTailwindPreset };
