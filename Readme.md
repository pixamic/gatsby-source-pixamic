# Gatsby Source Pixamic [closed alpha]

> 🚧 The Pixamic API is currently in closed alpha testing, and this Gatsby source plugin is a work in progress.

Source plugin for pulling images from your social media account(s) into Gatsby via the [Pixamic](https://pixamic.com/) API.

This plugin also supports the new [Gatsby Image plugin](https://www.gatsbyjs.com/plugins/gatsby-plugin-image/).

## Install

```
npm install -S gatsby-source-pixamic

or

yarn add gatsby-source-pixamic
```

## Features

### Instagram

- Fetches the latest images from your Instagram account

## How to use

First, you will need to obtain an access token by creating a [Pixamic](https://pixamic.com/) account, linking your social media account(s), and generating an access token.

Then in your `gatsby-config.js` add the following config to enable this plugin:

```js
//in your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-pixamic`,
    options: {
      pixamic_token: process.env.PIXAMIC_TOKEN,
    },
  },
]
```

## How to query

You can query nodes created by this plugin via GraphQL. You can discover all the available types and properties for your GraphQL model by browsing `http://localhost:8000/___graphql` while running `gatsby develop`.

### Instagram

```graphql
{
  allPixamicInstagramImage {
    nodes {
      media_url
      caption
      id
      timestamp
    }
  }
}
```

## Image processing

To use image processing and optimise your images, you will need to install `gatsby-transformer-sharp`, `gatsby-plugin-sharp`, `gatsby-plugin-image` and `gatsby-source-filesystem`.

```graphql
{
  allPixamicInstagramImage {
    nodes {
      media_url
      caption
      id
      timestamp
      localImage {
        childImageSharp {
          gatsbyImageData(width: 120)
        }
      }
    }
  }
}
```

You should read the [Gatsby Image documentation](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/) for more details on how to use the Gatsby Image plugin.
