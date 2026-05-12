// @ts-nocheck
/// <reference types="vite/client" />
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  blog: create.doc("blog", import.meta.glob(["./**/*.{mdx,md}"], {
    "base": "./../content/blog",
    "query": {
      "collection": "blog"
    },
    "eager": false
  })),
};
export default browserCollections;