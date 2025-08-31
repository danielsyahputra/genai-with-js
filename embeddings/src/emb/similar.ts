import { DataWithEmbeddings, generateEmbeddings, loadJSONData } from "./main";

export function dotProduct(a: number[], b: number[]) {
  return a.map((value, index) => value * b[index]).reduce((a, b) => a + b, 0);
}

function cosineSimilarity(a: number[], b: number[]) {
  const product = dotProduct(a, b);
  const aMagnitude = Math.sqrt(dotProduct(a, a));
  const bMagnitude = Math.sqrt(dotProduct(b, b));
  return product / (aMagnitude * bMagnitude);
}

async function main() {
  const dataWithEmbeddings: DataWithEmbeddings[] = loadJSONData<
    DataWithEmbeddings[]
  >("dataWithEmbeddings.json");
  const input = "animal";
  const embResponse = await generateEmbeddings(input);
  const inputEmbedding = embResponse.data[0].embedding;
  const similarities: {
    input: string;
    similarity: number;
  }[] = [];
  for (const entry of dataWithEmbeddings) {
    const similarity = cosineSimilarity(entry.embedding, inputEmbedding);
    similarities.push({
      input: entry.input,
      similarity: similarity,
    });
  }
  console.log(`Similarity of ${input} with:`);
  const sortedSimilarities = similarities.sort(
    (a, b) => b.similarity - a.similarity,
  );
  sortedSimilarities.forEach((similarity) => {
    console.log(`${similarity.input}: ${similarity.similarity}`);
  });
}

main();
