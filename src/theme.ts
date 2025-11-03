import { createTheme, MantineTheme, NumberInput } from "@mantine/core";

export const label = {
  fontSize: 'var(--mantine-font-size-xs)',
  fontFamily: 'Akrobat Bold',
  letterSpacing: '0.05em',
  textTransform: 'uppercase', 
};
export const error = {
  fontSize: 'var(--mantine-font-size-xs)',
  fontFamily: 'Akrobat Regular',
};

const theme = createTheme({
  primaryColor: "dirk",
  primaryShade: 9,
  defaultRadius: "xs",
  fontFamily: "Akrobat Regular, sans-serif",

  radius:{
    xxs: '0.2vh',
    xs: '0.4vh',
    sm: '0.75vh',
    md: '1vh',
    lg: '1.5vh',
    xl: '2vh',
    xxl: '3vh',
  },

  fontSizes: {
    xxs: '1.2vh',
    xs: '1.5vh',
    sm: '1.8vh',
    md: '2.2vh',
    lg: '2.8vh',
    xl: '3.3vh',
    xxl: '3.8vh',
  },

  lineHeights: {
    xxs: '1.4vh',
    xs: '1.8vh',
    sm: '2.2vh',
    md: '2.8vh',
    lg: '3.3vh',
    xl: '3.8vh',
  },

  spacing:{
    xxs: '0.5vh',
    xs: '0.75vh',
    sm: '1.5vh',
    md: '2vh',
    lg: '3vh',
    xl: '4vh',
    xxl: '5vh',
  },

  components:{
    Progress:{
      styles:{
        label: {
          fontFamily: 'Akrobat Bold',
          letterSpacing: '0.05em',
          textTransform: 'uppercase', 
          
        },
        root:{
          backgroundColor: 'rgba(77, 77, 77, 0.4)',
        },
        
      }
    },
    Textarea: {
      styles:{
        label: label,
        error: error,
      },
    },

    Button:{
      styles:{
        root:{
          fontSize: 'var(--mantine-font-size-xs)',
        },
      },
    },

    Select:{
      styles:{
        input:{
          padding: 'var(--mantine-spacing-sm)',
        },
      }
    },

    Pill: {
      styles: (theme: MantineTheme) => ({
        root: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(76, 76, 76, 0.3)',
          height: 'fit-content',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontFamily: 'Akrobat Bold',
          fontSize: theme.fontSizes.xs,
          borderRadius: theme.defaultRadius,
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        }
      })
    },

    Input:{
      styles: {
        label: label,
        error: error,

        input:{
          padding: 'var(--mantine-spacing-sm)',
          backgroundColor: 'rgba(76, 76, 76, 0.3)', 
        },
      },
    },
    ColorInput:{
      styles: {
        label: label,
        input:{
          padding: 'var(--mantine-spacing-sm)',
        },
      },
    },
    TextInput:{
      styles:{
        label: label,
        wrapper:{
        
        },
        section:{
          marginRight: '0.2vh',
        },

        input:{
          padding: 'var(--mantine-spacing-sm)',
          
          
        },
      }
    },
    NumberInput:{
      
      styles:{
        label: label,
        input:{
          padding: 'var(--mantine-spacing-sm)',
        },
        section:{
          pointerEvents: 'all',
        },
      }
    }
  },

  colors: {

    dirk:[
      "#ffffff",
      "#f3fce9",
      "#dbf5bd",
      "#c3ee91",
      "#ace765",
      "#94e039",
      "#7ac61f",
      "#5f9a18",
      "#29420a",
      "#446e11",
    ],
  },
});


export default theme;