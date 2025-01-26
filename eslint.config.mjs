// @ts-check
import antfu from "@antfu/eslint-config";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(antfu({}), eslintPluginPrettierRecommended, {
  rules: {
    "vue/block-order": ["error", { order: ["template", "script", "style"] }],
    "ts/no-unsafe-function-type": "warn",
    "vue/html-self-closing": [
      "error",
      {
        html: {
          void: "always",
          normal: "always",
          component: "always",
        },
        svg: "always",
        math: "always",
      },
    ],
    "prettier/prettier": [
      "warn",
      {
        endOfLine: "auto",
      },
    ],
    "style/member-delimiter-style": [
      "error",
      {
        multiline: {
          delimiter: "semi",
          requireLast: true,
        },
        singleline: {
          delimiter: "semi",
          requireLast: false,
        },
        multilineDetection: "brackets",
      },
    ],
    "style/html-indent": ["off"],
    "style/indent": ["off"],
    "style/semi": ["error", "always"],
    "style/quotes": ["error", "double"],
    "style/arrow-parens": ["error", "always"],
    "style/brace-style": ["error", "1tbs"],
    "antfu/if-newline": ["off"],
    "style/operator-linebreak": ["off"],
    "vue/singleline-html-element-content-newline": "off",
  },
});
