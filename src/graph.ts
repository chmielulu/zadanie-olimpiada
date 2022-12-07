// Typ nazwy węzła. Nazwa węzła może być liczbą lub stringiem.
type NodeName = string | number;

export class Graph {
  private nodes: { [key: string]: Node } = {};

  // Dodaje nowy węzeł do grafu
  addNode(node: Node) {
    this.nodes[node.name] = node;
  }

  // Dodaje nową krawędź do grafu
  addEdge(node1: NodeName, node2: NodeName, distance: number) {
    node1 = node1.toString();
    node2 = node2.toString();

    // Upewnij się, że oba węzły istnieją w grafie
    if (this.nodes[node1] && this.nodes[node2]) {
      // Dodaj nową krawędź do każdego z węzłów
      this.nodes[node1].addEdge(this.nodes[node2], distance);
      this.nodes[node2].addEdge(this.nodes[node1], distance);
    }
  }

  // Znajduje najkrótszą drogę pomiędzy dwoma węzłami w grafie
  // używając algorytmu Dijkstry
  findShortestPath(startNodeName: NodeName, endNodeName: NodeName): string[] {
    startNodeName = startNodeName.toString();
    endNodeName = endNodeName.toString();

    // Tablica, w której przechowywane będą odwiedzone węzły
    const visitedNodes: { [key: string]: Node } = {};

    // Obiekt przechowujący dystans od początkowego węzła do każdego innego węzła
    const distances: { [key: string]: number } = {};

    // Obiekt, w którym przechowywana jest informacja o poprzedniku każdego węzła
    // w najkrótszej ścieżce od początkowego węzła
    const predecessors: { [key: string]: Node } = {};

    // Zbiór węzłów, które jeszcze nie zostały odwiedzone
    const unvisitedNodes = new Set(Object.keys(this.nodes));

    // Inicjalizuj dystanse do wszystkich węzłów jako nieskończone
    // oraz ustaw początkowy węzeł jako odwiedzony
    for (const nodeName of unvisitedNodes) {
      distances[nodeName] = Infinity;
    }
    distances[startNodeName] = 0;
    visitedNodes[startNodeName] = this.nodes[startNodeName];

    // Dopóki w zbiorze węzłów, które jeszcze nie zostały odwiedzone,
    // znajdują się jakieś węzły...
    while (unvisitedNodes.size > 0) {
      // Znajdź węzeł, który jeszcze nie został odwiedzony
      // i ma najmniejszy dystans od początkowego węzła
      let currentNodeName = "";
      let currentNodeShortestDistance = Infinity;
      for (const nodeName of unvisitedNodes) {
        if (distances[nodeName] < currentNodeShortestDistance) {
          currentNodeName = nodeName;
          currentNodeShortestDistance = distances[nodeName];
        }
      }

      // Jeśli nie znaleziono takiego węzła, to znaczy, że nie ma
      // możliwej drogi do końcowego węzła, więc zakończ działanie pętli
      if (currentNodeName === "") {
        break;
      }

      // Odwiedź węzeł z najmniejszym dystansem i usuń go z zbioru
      // węzłów, które jeszcze nie zostały odwiedzone
      const currentNode = this.nodes[currentNodeName];
      visitedNodes[currentNodeName] = currentNode;
      unvisitedNodes.delete(currentNodeName);

      // Dla każdego sąsiada aktualnie odwiedzanego węzła...
      for (const neighbor of currentNode.neighbors) {
        // Jeśli węzeł sąsiadujący już został odwiedzony, to pomiń go
        if (visitedNodes[neighbor.node.name]) {
          continue;
        }

        // Oblicz dystans od początkowego węzła do węzła sąsiadującego
        // przez aktualnie odwiedzany węzeł i porównaj go z dotychczas
        // obliczonym dystansem do węzła sąsiadującego
        const distanceThroughCurrentNode =
          distances[currentNodeName] + neighbor.distance;
        if (distanceThroughCurrentNode < distances[neighbor.node.name]) {
          // Jeśli obliczony dystans jest mniejszy, to zapisz go
          // jako dystans do węzła sąsiadującego oraz zapisz
          // aktualnie odwiedzany węzeł jako poprzednika
          // węzła sąsiadującego w najkrótszej ścieżce
          distances[neighbor.node.name] = distanceThroughCurrentNode;
          predecessors[neighbor.node.name] = currentNode;
        }
      }
    }

    // Jeśli nie znaleziono drogi do końcowego węzła, to zwróć pustą tablicę
    if (!predecessors[endNodeName]) {
      return [];
    }

    // Utwórz tablicę z węzłami w najkrótszej ścieżce od początkowego
    // do końcowego węzła, dodając węzły w odwrotnej kolejności
    const shortestPath = [endNodeName];
    let predecessor = predecessors[endNodeName];
    while (predecessor) {
      shortestPath.unshift(predecessor.name);
      predecessor = predecessors[predecessor.name];
    }

    // Zwróć najkrótszą ścieżkę jako tablicę nazw węzłów
    return shortestPath;
  }

  getPathLength(startNodeName: NodeName, endNodeName: NodeName): number {
    // Znajdź najkrótszą drogę pomiędzy węzłami
    const path = this.findShortestPath(startNodeName, endNodeName);

    // Jeśli nie znaleziono drogi, zwróć nieskończoność
    if (path.length === 0) {
      return Infinity;
    }

    // Zsumuj dystanse krawędzi pomiędzy wszystkimi kolejnymi węzłami na drodze
    let length = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const node1 = this.nodes[path[i]];
      const node2 = this.nodes[path[i + 1]];
      const edge = node1.getEdge(node2);
      if (edge) {
        length += edge.distance;
      } else {
        return Infinity;
      }
    }

    // Zwróć ostateczny dystans
    return length;
  }
}

// Klasa reprezentująca węzeł w grafie
export class Node {
  name: string;
  neighbors: Edge[] = [];

  constructor(name: NodeName) {
    this.name = name.toString();
  }

  // Dodaje nową krawędź do węzła
  addEdge(node: Node, distance: number) {
    this.neighbors.push(new Edge(node, distance));
  }

  getEdge(node: Node): Edge | undefined {
    return this.neighbors.find((edge) => edge.node === node);
  }
}

// Klasa reprezentująca krawędź w grafie
class Edge {
  node: Node;
  distance: number;

  constructor(node: Node, distance: number) {
    this.node = node;
    this.distance = distance;
  }
}
