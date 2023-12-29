import { Heap } from "heap-js";
import type { Node, Point } from "../types";

/** A min-heap of {@link Node} types with custom comparator. */
export class NodeHeap extends Heap<Node> {
  constructor(elems: Node[] = []) {
    super(compareNode);
    if (elems.length !== 0) {
      super.addAll(elems);
    }
  }
}

/** Comparator for {@link Node} type, compares their distances. */
export function compareNode(a: Node, b: Node) {
  return a[0] - b[0];
}

/** Dot-product of two vectors. */
export function dot_product(a: Point, b: Point): number {
  return a.reduce((sum, val, idx) => sum + val * b[idx], 0);
}

/** Norm a vector. */
export function norm(a: Point): number {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}

/** Cosine distance between two vectors, as 1 - cosine similarity. */
export function cosine_distance(a: Point, b: Point): number {
  return 1 - dot_product(a, b) / (norm(a) * norm(b));
}

/** Inner product (alias dot product) of two vectors. */
export function inner_product(a: Point, b: Point): number {
  return dot_product(a, b);
}

/** Euclidean distance between two vectors. */
export function l2_distance(a: Point, b: Point): number {
  return Math.sqrt(a.reduce((sum, val, idx) => sum + Math.pow(val - b[idx], 2), 0));
}
