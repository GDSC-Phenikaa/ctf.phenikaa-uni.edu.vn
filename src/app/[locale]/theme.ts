"use client";

import { ActionIcon, Button, createTheme, Input, MantineColorsTuple } from "@mantine/core";

// Define a kawaii pastel color palette
const kawaiiColors: MantineColorsTuple = [
  '#ffe4e1', // Pastel pink
  '#ffb6c1', // Light pink
  '#ffc1cc', // Soft pink
  '#ffd1dc', // Blush pink
  '#ffe4f0', // Lavender blush
  '#fff0f5', // Light lavender
  '#f8d7ff', // Soft purple
  '#e0c3fc', // Pastel purple
  '#d8bfd8', // Thistle
  '#dda0dd', // Plum
];

export const theme = createTheme({
  primaryColor: 'kawaii',
  white: kawaiiColors[0],
  components: {
    Button: {
      defaultProps: {
        radius: 'xl',
        size: 'md',
      },
      styles: (theme: { colors: { kawaii: any[]; }; }) => ({
        root: {
          backgroundColor: theme.colors.kawaii[2],
          color: '#ffffff', // White text
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Soft shadow
          '&:hover': {
            backgroundColor: theme.colors.kawaii[5],
          },
        },
      }),
    },
    ActionIcon: {
      defaultProps: {
        radius: 'xl',
        size: 'lg',
      },
      styles: (theme: { colors: { kawaii: any[]; }; }) => ({
        root: {
          backgroundColor: theme.colors.kawaii[3],
          color: '#ffffff',
          '&:hover': {
            backgroundColor: theme.colors.kawaii[4],
          },
        },
      }),
    },
    Input: {
      defaultProps: {
        radius: 'xl',
        size: 'md',
        variant: 'filled',
      },
      styles: (theme: { colors: { kawaii: any[]; }; }) => ({
        input: {
          backgroundColor: theme.colors.kawaii[1],
          color: '#333333',
          '&:focus': {
            borderColor: theme.colors.kawaii[4],
            boxShadow: '0 0 0 2px rgba(255, 182, 193, 0.5)',
          },
        },
      }),
    },
  },
  colors: {
    kawaii: kawaiiColors,
  },
  fontFamily: "'SuperBubble', cursive, sans-serif",
});