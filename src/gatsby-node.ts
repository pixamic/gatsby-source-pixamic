import * as crypto from "crypto"
import axios from "axios"
import { createRemoteFileNode } from "gatsby-source-filesystem"
import { CreateNodeArgs, SourceNodesArgs } from "gatsby"

interface PixamicOptions {
  pixamic_token: string
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

const defaultHost = "https://alpha-api.pixamic.com/me"

export const sourceNodes = async (
  { actions, createNodeId, reporter }: SourceNodesArgs,
  pluginOptions: PixamicOptions
) => {
  const { createNode } = actions

  reporter.info("Initializing Pixamic API")

  if (!pluginOptions.pixamic_token) {
    reporter.panic("pixamic_token is missing in the plugin configuration")
  }

  const { pixamic_token, host = defaultHost } = pluginOptions

  const createImageNode = (image: InstagramMedia) => {
    const nodeId = createNodeId(`pixamic-instagram-${image.id}`)
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
        type: "PixamicInstagramImage",
        content: nodeContent,
        contentDigest: nodeContentDigest,
      },
    }
    createNode(nodeData)
  }
  const timer = reporter.activityTimer(`Fetching Pixamic data`)
  timer.start()
  return axios
    .get<InstagramMedia[]>(host, {
      headers: {
        Authorization: `Bearer ${pixamic_token}`,
      },
    })
    .then(({ data: media }) => {
      timer.end()
      reporter.info(`Creating ${media.length} Pixamic Instagram nodes`)
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
  if (node.internal.type === "PixamicInstagramImage") {
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
