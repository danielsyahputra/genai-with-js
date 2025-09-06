import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

type MyMetadata = {
  metadata1: number;
  metadata2: string;
};

async function createNamespace() {
  const index = await getIndex();
  const namespace = index.namespace("my-namespace-1");
}

async function getIndex() {
  const index = pc.index<MyMetadata>("my-index");
  return index;
}

async function listIndex() {
  const indexes = await pc.listIndexes();
  console.log(indexes);
}

function generateNumberArray(length: number) {
  return Array.from({ length }, () => Math.random());
}

async function upsertVectors() {
  const embedding = generateNumberArray(1536);
  const index = await getIndex();
  const upsertResult = await index.namespace("my-namespace-1").upsert([
    {
      id: "id-1",
      values: embedding,
      metadata: {
        metadata1: 3,
        metadata2: "abdc",
      },
    },
  ]);
  console.log(upsertResult);
}

async function queryVectors() {
  const index = await getIndex();
  const result = await index.namespace("my-namespace-1").query({
    id: "id-1",
    topK: 1,
  });
  console.log(result);
}

async function createIndex() {
  const indexName = "my-index";
  await pc.createIndex({
    name: indexName,
    dimension: 1536,
    metric: "cosine",
    spec: {
      serverless: {
        cloud: "aws",
        region: "us-east-1",
      },
    },
  });
}

async function main() {
  queryVectors();
  // upsertVectors();
  // createNamespace();
}

main();
