import { ChromaClient } from "chromadb";
import { OpenAIEmbeddingFunction } from "@chroma-core/openai";

const client = new ChromaClient({
  host: "localhost",
  port: 8000,
});

const embeddingFunction = new OpenAIEmbeddingFunction({
  modelName: "text-embedding-3-small",
});

async function main() {
  const collections = await client.listCollections();
  const exists = collections.some(
    (collection) => collection.name == "data-test",
  );
  if (exists) {
    console.log(`collection with name data-test is already created`);
  } else {
    const response = await client.createCollection({
      name: "data-test",
    });
    console.log(response);
  }
}

async function addData() {
  const collection = await client.getCollection({
    name: "data-test",
    embeddingFunction: embeddingFunction,
  });
  await collection.add({
    ids: ["id1"],
    documents: ["Here is my second document"],
  });
}

main();
addData();
