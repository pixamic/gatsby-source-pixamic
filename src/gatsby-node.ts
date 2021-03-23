import * as crypto from "crypto"
import axios from "axios"
import { createRemoteFileNode } from "gatsby-source-filesystem"
import { CreateNodeArgs, SourceNodesArgs } from "gatsby"

interface GramicOptions {
  gramic_token: string
  host?: string
  plugins: any[]
}

interface InstagramMedia {
  id: string
  caption: string
  media_type: string
  media_url: string
  thumbnail_url: string
  permalink: string
  timestamp: string
}

export interface InstagramMediaResponse {
  data: InstagramMedia[]
}

const defaultHost = "https://alpha-api.gramic.io/me"

export const sourceNodes = async (
  { actions, createNodeId, reporter }: SourceNodesArgs,
  pluginOptions: GramicOptions
) => {
  const { createNode } = actions

  reporter.info("Initializing Gramic API")

  if (!pluginOptions.gramic_token) {
    reporter.panic("gramic_token is missing in the plugin configuration")
  }

  const { gramic_token, host = defaultHost } = pluginOptions

  const createImageNode = (image: InstagramMedia) => {
    const nodeId = createNodeId(`gramic-instagram-${image.id}`)
    const nodeContent = JSON.stringify(image)
    const nodeContentDigest = crypto
      .createHash("md5")
      .update(nodeContent)
      .digest("hex")

    const nodeData = {
      ...image,
      media_url: ["IMAGE", "CAROUSEL_ALBUM"].includes(image.media_type)
        ? image.media_url
        : image.thumbnail_url,
      id: nodeId,
      media_id: image.id,
      parent: null,
      children: [],
      internal: {
        type: "GramicInstagramImage",
        content: nodeContent,
        contentDigest: nodeContentDigest,
      },
    }
    createNode(nodeData)
  }
  const timer = reporter.activityTimer(`Retrieving Instagram feed via Gramic`)
  return axios
    .get<InstagramMedia[]>(host, {
      headers: {
        Authorization: `Bearer ${gramic_token}`,
      },
    })
    .then(({ data: media }) => {
      timer.end()
      reporter.success(`retrieved ${media.length} images from Instagram`)
      media.map(createImageNode)
    })
}

export const onCreateNode = async ({
  node,
  cache,
  actions,
  store,
  createNodeId,
  reporter,
}: CreateNodeArgs<InstagramMedia>) => {
  let fileNode
  const { createNode } = actions
  if (node.internal.type === "GramicInstagramImage") {
    try {
      fileNode = await createRemoteFileNode({
        url: node.media_url,
        parentNodeId: node.id,
        store,
        cache,
        createNode,
        createNodeId,
        reporter,
      })
    } catch (e) {
      console.log("ERROR: ", e)
      reporter.error(e)
    }
  }
  if (fileNode) {
    node.localImage___NODE = fileNode.id
  }
}
