import { createWriteStream, existsSync, promises as fs } from "fs";
import * as path from "path";
import { Node, Graph } from "./graph";

interface Road {
  from: number;
  to: number;
  distance: number;
}

// początek programu
async function main() {
  const data = await getRoadsCastlesAndVillages();
  if (!data) return;
  const { castles, roads, villages } = data;

  const graph = new Graph();

  villages.forEach((village) => {
    graph.addNode(new Node(village));
  });

  roads.forEach(({ from, to, distance }) => {
    graph.addEdge(from, to, distance);
  });

  let allCombinations: number[][] = [];

  castles.forEach((castle, index) => {
    allCombinations[index] = [
      ...(allCombinations[index - 1] ? allCombinations[index - 1] : []),
      castle,
    ];
  });
  allCombinations.shift();

  if (existsSync(path.join(process.cwd(), "data", "output.txt"))) {
    await fs.rm(path.join(process.cwd(), "data", "output.txt"));
  }
  
  fs.unlink
  const outputFile = createWriteStream(
    path.join(process.cwd(), "data", "output.txt"),
    {
      flags: "a",
    }
  );

  allCombinations.forEach((castles) => {
    outputFile.write(`${calculateTotalDistance(graph, castles)}\n`);
  });

  outputFile.end();

  console.log("Sprawdź rozwiązanie w pliku data/output.txt");
}

async function getRoadsCastlesAndVillages(): Promise<{
  roads: Road[];
  castles: number[];
  villages: number[];
} | null> {
  const file = await fs.readFile(
    path.join(process.cwd(), "data", "input.txt"),
    "utf-8"
  );

  const rows = file.split(/\r?\n/);

  const n = Number(rows[0][0]);
  const k = Number(rows[0][2]);

  if (k < 1 || n <= k || n > 100000 || isNaN(n) || isNaN(k)) {
    console.log("Złe dane wejściowe!");
    return null;
  }

  let roads: Road[] = [];

  for (let i = 1; i <= n - 1; i++) {
    const row = rows[i];
    const a = Number(row[0]);
    const b = Number(row[2]);
    const c = Number(row[4]);

    if (
      isNaN(a) ||
      isNaN(b) ||
      isNaN(c) ||
      a > n ||
      b > n ||
      a < 1 ||
      b < 1 ||
      c > 1000 ||
      c < 1
    ) {
      console.log("Złe dane wejściowe");
      return null;
    }

    roads.push({
      from: a,
      to: b,
      distance: c,
    });
  }

  let castles = new Set([1]);

  for (let i = n; i < n + k; i++) {
    const row = rows[i];
    const d = Number(row[0]);

    if (isNaN(d) || castles.has(d)) {
      console.log("Złe dane wejściowe");
      return null;
    }

    castles.add(d);
  }

  return {
    castles: Array.from(castles),
    roads,
    villages: new Array(n).fill(0).map((_, index) => index + 1),
  };
}

function calculateTotalDistance(graph: Graph, castles: number[]) {
  let totalDistance = 0;

  for (let i = 0; i < castles.length; i++) {
    for (let j = i + 1; j < castles.length; j++) {
      totalDistance += graph.getPathLength(castles[i], castles[j]);
    }
  }

  return totalDistance * 2;
}

main();
