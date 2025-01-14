interface Image {
  src: string;
  altText: string;
}

export interface ShowcaseContent {
  title: string;
  author: string;
  description: string;
  images: Image[];
  code: string;
}

const code = `
###------------------------------------
##   Window
#--------------------------------------
title = Ghostty
background-opacity = 0.6
background-blur-radius = 8
window-padding-x = 8
window-padding-y = 8
window-theme = dark
# Remove when TMUX proficient  
# window-decoration = false
window-padding-color = extend

###------------------------------------
##   Font
#--------------------------------------
font-family = Berkeley Mono
font-style = Regular
font-size = 16

font-family-bold = Berkeley Mono
font-family-italic = Berkeley Mono
`;
